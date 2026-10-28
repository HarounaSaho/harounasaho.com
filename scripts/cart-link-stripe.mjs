export const WORKS = [
  { work: "Continuum", price: "price_1UUo2J2NVSc2aDRHVRlb7Zbc", cents: 10000 },
  { work: "What Remains", price: "price_1UUoBT2NVSc2aDRHC0Tsqf2X", cents: 8000 },
  { work: "Offering", price: "price_1UUpLx2NVSc2aDRHRoQCBBbo", cents: 8000 },
  { work: "Homage", price: "price_1UUpO22NVSc2aDRHAe6dEpKc", cents: 10000 },
  { work: "See No Evil", price: "price_1UUwyL2NVSc2aDRHjwAWgfis", cents: 7000 },
  { work: "Hear No Evil", price: "price_1UUwzW2NVSc2aDRHYx7PbXcQ", cents: 7000 },
  { work: "Speak No Evil", price: "price_1UUx062NVSc2aDRHADBz5MOf", cents: 7000 },
  { work: "Unheard", price: "price_1UUx0k2NVSc2aDRHx7lOUuZy", cents: 7000 }
];

export const KNOWN = {
  "Continuum": "https://buy.stripe.com/14AdR28I34Ez5qF67WfMA08",
  "Hear No Evil": "https://buy.stripe.com/14A7sEgavgnh2et8g4fMA03",
  "Homage": "https://buy.stripe.com/7sY3co7DZ9YT6uJ7c0fMA05",
  "Offering": "https://buy.stripe.com/7sYeV62jFef92et67WfMA06",
  "Speak No Evil": "https://buy.stripe.com/eVq9AM0bx1sn7yNcwkfMA01",
  "Unheard": "https://buy.stripe.com/14A3coe2n2wr06lcwkfMA02",
  "What Remains": "https://buy.stripe.com/aFa5kw5vRb2X6uJ0NCfMA07",
  "See No Evil": "https://buy.stripe.com/fZu9AM2jF1snbP30NCfMA04"
};

export const BANNED = new Set([
  "https://buy.stripe.com/dRm5kwe2n5IDf1f7c0fMA00"
]);

export const THANK_YOU = "https://harounasaho.com/prints/thank-you/";

export function liveKey() {
  const names = [
    "STRIPE_SECRET_KEY",
    "STRIPE_API_KEY",
    "STRIPE_LIVE_SECRET_KEY",
    "STRIPE_SECRET",
    "STRIPE_RESTRICTED_KEY",
    "STRIPE_SK",
    "STRIPE_KEY"
  ];
  for (const name of names) {
    const value = process.env[name] || "";
    if (value.startsWith("sk_live_") || value.startsWith("rk_live_")) return value;
  }
  return "";
}

export function cartKey(group) {
  return group.map(function (item) { return item.work; }).sort().join("\n");
}

export function signatureOf(group) {
  return group.map(function (item) { return item.price; }).slice().sort().join(",");
}

export function centsOf(group) {
  return group.reduce(function (sum, item) { return sum + item.cents; }, 0);
}

export function subsets(works) {
  const out = [];
  const count = works.length;
  for (let mask = 1; mask < (1 << count); mask += 1) {
    const group = [];
    for (let index = 0; index < count; index += 1) {
      if (mask & (1 << index)) group.push(works[index]);
    }
    out.push(group);
  }
  return out;
}

export function safeMessage(error) {
  return String((error && error.message) || "request failed")
    .replace(/[sr]k_(live|test)_[A-Za-z0-9]+/g, "redacted")
    .slice(0, 300);
}

export function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

export async function stripe(key, method, path, params, idempotencyKey) {
  const headers = { Authorization: "Bearer " + key };
  let body;
  if (params) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(params).toString();
  }
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch("https://api.stripe.com" + path, { method, headers, body });
    const text = await response.text();
    let json = {};
    try { json = JSON.parse(text); } catch (error) { json = {}; }
    if (response.status === 429 && attempt < 5) {
      const wait = Math.min(Number(response.headers.get("retry-after") || 2) * 1000, 15000);
      await sleep(wait);
      continue;
    }
    if (!response.ok) {
      lastError = new Error((json.error && json.error.message) || response.statusText || "Stripe request failed");
      lastError.status = response.status;
      lastError.param = json.error && json.error.param;
      throw lastError;
    }
    return json;
  }
  throw lastError || new Error("Stripe request failed");
}

export async function verifyPrices(key) {
  const names = {};
  for (const item of WORKS) {
    const price = await stripe(key, "GET", "/v1/prices/" + item.price + "?expand[]=product");
    const productName = price.product && price.product.name ? price.product.name : "";
    names[item.work] = productName;
    if (price.unit_amount !== item.cents || price.currency !== "usd" || price.active === false) {
      const error = new Error(item.work + " price does not match " + item.cents + " usd");
      error.names = names;
      throw error;
    }
  }
  return names;
}

export async function listLinks(key) {
  const links = [];
  let startingAfter = "";
  for (;;) {
    const query = new URLSearchParams({ limit: "100", active: "true" });
    if (startingAfter) query.set("starting_after", startingAfter);
    const page = await stripe(key, "GET", "/v1/payment_links?" + query.toString());
    links.push.apply(links, page.data || []);
    if (!page.has_more || !page.data || !page.data.length) break;
    startingAfter = page.data[page.data.length - 1].id;
  }
  return links;
}

export async function linkItems(key, id) {
  const page = await stripe(
    key,
    "GET",
    "/v1/payment_links/" + id + "/line_items?limit=20&expand[]=data.price"
  );
  return (page.data || []).map(function (item) {
    const price = item.price || {};
    return {
      price: typeof price === "string" ? price : price.id,
      cents: typeof price === "string" ? null : price.unit_amount,
      currency: typeof price === "string" ? "" : price.currency,
      quantity: item.quantity
    };
  });
}

export function bareUrl(url) {
  return String(url || "").split("?")[0];
}

export async function indexExisting(key) {
  const bySignature = new Map();
  const knownUrls = new Set(Object.values(KNOWN));
  const links = await listLinks(key);
  for (const link of links) {
    const url = bareUrl(link.url);
    if (!url || BANNED.has(url) || link.active === false) continue;
    const items = await linkItems(key, link.id);
    if (!items.length || items.some(function (item) {
      return item.quantity !== 1 || item.currency !== "usd" || typeof item.cents !== "number";
    })) continue;
    const signature = items.map(function (item) { return item.price; }).sort().join(",");
    const found = {
      url: url,
      cents: items.reduce(function (sum, item) { return sum + item.cents; }, 0),
      source: link.metadata && link.metadata.source || ""
    };
    const current = bySignature.get(signature);
    if (!current) {
      bySignature.set(signature, found);
      continue;
    }
    const rank = function (entry) {
      if (knownUrls.has(entry.url)) return 3;
      if (entry.source === "saho-print-cart") return 2;
      return 1;
    };
    if (rank(found) > rank(current)) bySignature.set(signature, found);
  }
  return bySignature;
}
