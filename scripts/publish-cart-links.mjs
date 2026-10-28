import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const files = ["cart-link-result.json", "public/data/cart-links.json"].filter((path) => existsSync(path));
if (!files.length) {
  console.log("nothing to publish");
  process.exit(0);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

git(["config", "user.name", "github-actions[bot]"]);
git(["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
git(["checkout", "-B", "cart-checkout-links"]);
git(["add", "-f", ...files]);

try {
  git(["diff", "--cached", "--quiet"]);
  console.log("nothing to publish");
  process.exit(0);
} catch (error) {
  if (error.status !== 1) throw error;
}

git(["commit", "-m", "Record print cart checkout links"]);
git(["push", "--force", "origin", "cart-checkout-links"]);
console.log("published");
