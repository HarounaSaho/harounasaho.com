import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function materialize(sourceDir, outDir) {
  let names = [];
  try {
    names = await readdir(sourceDir);
  } catch {
    console.log("No source directory", sourceDir);
    return;
  }
  await mkdir(outDir, { recursive: true });
  for (const name of names) {
    const dir = join(sourceDir, name);
    let files = [];
    try {
      files = (await readdir(dir)).filter((file) => file.endsWith(".txt")).sort();
    } catch {
      continue;
    }
    if (!files.length) continue;
    const jpgName = name.endsWith(".jpg") ? name : name + ".jpg";
    const dest = join(outDir, jpgName);
    if (await exists(dest)) {
      console.log("Keeping existing", dest);
      continue;
    }
    const chunks = await Promise.all(files.map((file) => readFile(join(dir, file), "utf8")));
    const encoded = chunks.join("").replace(/\s/g, "");
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      throw new Error("Source did not decode to a JPEG: " + name);
    }
    await writeFile(dest, bytes);
    console.log("Wrote", dest, bytes.length);
  }
}

await materialize(join(root, "print-sources"), join(root, "public", "prints"));
await materialize(join(root, "work-sources"), join(root, "public", "works"));
