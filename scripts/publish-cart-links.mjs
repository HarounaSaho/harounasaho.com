import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const resultPath = "cart-link-result.json";
const mapPath = "public/data/cart-links.json";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function commitIfNeeded(message) {
  try {
    git(["diff", "--cached", "--quiet"]);
    return false;
  } catch (error) {
    if (error.status !== 1) throw error;
  }
  git(["commit", "-m", message]);
  return true;
}

if (!existsSync(resultPath)) {
  console.log("nothing to publish");
  process.exit(0);
}

const result = JSON.parse(readFileSync(resultPath, "utf8"));
git(["config", "user.name", "github-actions[bot]"]);
git(["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
git(["checkout", "-B", "cart-checkout-links"]);

const files = [resultPath];
if (existsSync(mapPath)) files.push(mapPath);
git(["add", "-f", ...files]);
if (commitIfNeeded("Record print cart checkout links")) {
  git(["push", "--force", "origin", "cart-checkout-links"]);
}

if (!result.ok || !existsSync(mapPath)) {
  console.log(result.ok ? "result recorded" : "result recorded without a link map");
  process.exit(result.ok ? 0 : 1);
}

git(["fetch", "origin", "main"]);
git(["checkout", "-B", "main", "origin/main"]);
git(["checkout", "cart-checkout-links", "--", mapPath]);
git(["add", mapPath]);
if (!commitIfNeeded("Use one Stripe page for each print cart.")) {
  console.log("map already on main");
  process.exit(0);
}
git(["push", "origin", "main"]);
console.log("published");
