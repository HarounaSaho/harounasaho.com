import { existsSync, readFileSync } from "node:fs";

if (!existsSync("cart-link-result.json")) {
  console.log("no result file");
  process.exit(0);
}

const data = JSON.parse(readFileSync("cart-link-result.json", "utf8"));
delete data.links;
console.log(JSON.stringify(data, null, 2).slice(0, 4000));
