import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import {
  WORKS, KNOWN, THANK_YOU, liveKey, cartKey, signatureOf, centsOf, subsets,
  safeMessage, verifyPrices, stripe, linkItems, bareUrl, indexExisting
} from "./cart-link-stripe.mjs";

function auditKnown(bySignature) {
  const problems = [];
  for (const [key, url] of Object.entries(KNOWN)) {
    const group = key.split("\n").map(function (work) {
      return WORKS.find(function (item) { return item.work === work; });
    });
    const found = bySignature.get(signatureOf(group));
    if (!found) {
      problems.push(key.replace(/\n/g, " + ") + " was not found");
      continue;
    }
    if (found.url !== url) problems.push(key.replace(/\n/g, " + ") + " points at a different link");
    if (found.cents !== centsOf(group)) problems.push(key.replace(/\n/g, " + ") + " amount differs");
  }
  return problems;
}

async function createLink(key, group, redirect) {
  const params = {};
  group.forEach(function (item, index) {
    params["line_items[" + index + "][price]"] = item.price;
    params["line_items[" + index + "][quantity]"] = "1";
  });
  params["billing_address_collection"] = "auto";
  params["metadata[source]"] = "saho-print-cart";
  params["metadata[cart]"] = group.map(function (item) { return item.work; }).join(" | ");
  if (redirect) {
    params["after_completion[type]"] = "redirect";
    params["after_completion[redirect][url]"] = THANK_YOU;
  }
  const idempotency = "saho-cart-v1-" + createHash("sha256")
    .update(signatureOf(group) + (redirect ? ":redirect" : ":hosted"))
    .digest("hex");
  const created = await stripe(key, "POST", "/v1/payment_links", params, idempotency);
  const items = await linkItems(key, created.id);
  const actual = items.map(function (item) { return item.price; }).sort().join(",");
  const cents = items.reduce(function (sum, item) { return sum + (item.cents || 0); }, 0);
  if (
    actual !== signatureOf(group) ||
    cents !== centsOf(group) ||
    items.some(function (item) { return item.quantity !== 1; }) ||
    !bareUrl(created.url).startsWith("https://buy.stripe.com/")
  ) {
    await stripe(key, "POST", "/v1/payment_links/" + created.id, { active: "false" });
    throw new Error("Created link did not match " + cartKey(group).replace(/\n/g, " + "));
  }
  return { url: bareUrl(created.url), cents: cents, source: "saho-print-cart" };
}

function writeResult(result) {
  writeFileSync("cart-link-result.json", JSON.stringify(result, null, 2) + "\n");
  if (result.ok && result.links) {
    writeFileSync("public/data/cart-links.json", JSON.stringify(result.links, null, 2) + "\n");
  }
  if (!result.ok) process.exitCode = 1;
}

async function main() {
  const key = liveKey();
  if (!key) {
    writeResult({ ok: false, reason: "missing-live-key", links: null });
    console.log("missing-live-key");
    return;
  }
  let productNames = {};
  try {
    productNames = await verifyPrices(key);
  } catch (error) {
    writeResult({ ok: false, reason: "price-mismatch", message: safeMessage(error), names: error.names || productNames });
    console.log("price-mismatch");
    return;
  }
  const bySignature = await indexExisting(key);
  const problems = auditKnown(bySignature);
  if (problems.length) {
    writeResult({ ok: false, reason: "known-link-audit", problems: problems, names: productNames });
    console.log("known-link-audit");
    return;
  }
  const links = {};
  let created = 0;
  let reused = 0;
  const groups = subsets(WORKS);
  for (const group of groups) {
    const id = cartKey(group);
    const signature = signatureOf(group);
    const existing = bySignature.get(signature);
    if (existing && existing.cents === centsOf(group)) {
      links[id] = existing.url;
      reused += 1;
      continue;
    }
    try {
      let made;
      try {
        made = await createLink(key, group, true);
      } catch (error) {
        const redirectProblem = error.status === 400 && /redirect|url|after_completion/i.test(String(error.message) + String(error.param || ""));
        if (!redirectProblem) throw error;
        made = await createLink(key, group, false);
      }
      bySignature.set(signature, made);
      links[id] = made.url;
      created += 1;
    } catch (error) {
      writeResult({
        ok: false,
        reason: "create-failed",
        message: safeMessage(error),
        status: error.status || 0,
        cart: id.replace(/\n/g, " + "),
        created: created,
        reused: reused,
        names: productNames
      });
      console.log("create-failed");
      return;
    }
  }
  const see = links["See No Evil"];
  const pair = links["See No Evil\nUnheard"];
  const both = links["Continuum\nHomage"];
  const checks = [];
  if (see !== KNOWN["See No Evil"]) checks.push("See No Evil did not keep its $70 link");
  if (!pair || pair === see) checks.push("See No Evil + Unheard has no combined link");
  if (links.Homage !== KNOWN.Homage) checks.push("Homage did not keep its link");
  if (!both || both === KNOWN.Continuum || both === KNOWN.Homage) checks.push("Continuum + Homage has no combined link");
  if (Object.keys(links).length !== groups.length) checks.push("link count is " + Object.keys(links).length);
  if (checks.length) {
    writeResult({ ok: false, reason: "safety-check", checks: checks, created: created, reused: reused, samples: { see: see, pair: pair, both: both } });
    console.log("safety-check");
    return;
  }
  const ordered = {};
  Object.keys(links).sort().forEach(function (name) { ordered[name] = links[name]; });
  writeFileSync("public/data/cart-links.json", JSON.stringify(ordered, null, 2) + "\n");
  writeResult({
    ok: true,
    reason: "ready",
    created: created,
    reused: reused,
    count: Object.keys(ordered).length,
    names: productNames,
    samples: {
      see: ordered["See No Evil"],
      pair: ordered["See No Evil\nUnheard"],
      both: ordered["Continuum\nHomage"],
      all: ordered[cartKey(WORKS)],
      seeCents: 7000,
      pairCents: 14000,
      bothCents: 20000,
      allCents: centsOf(WORKS)
    }
  });
  console.log("ready created=" + created + " reused=" + reused);
}

main().catch(function (error) {
  writeResult({ ok: false, reason: "crashed", message: safeMessage(error) });
  console.log("crashed");
  process.exitCode = 1;
});
