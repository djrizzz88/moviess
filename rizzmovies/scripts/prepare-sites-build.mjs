import { copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const serverDir = resolve("dist/server");
const rscEntry = resolve(serverDir, "index.js");
const preservedRscEntry = resolve(serverDir, "rsc.js");
const ssrEntry = resolve(serverDir, "ssr/index.js");

await copyFile(rscEntry, preservedRscEntry);

const ssrSource = await readFile(ssrEntry, "utf8");
const updatedSsrSource = ssrSource.replaceAll("../index.js", "../rsc.js");
if (updatedSsrSource === ssrSource) {
  throw new Error("Could not locate the vinext RSC import in the SSR worker entry.");
}
await writeFile(ssrEntry, updatedSsrSource);

await writeFile(
  rscEntry,
  'import worker from "./ssr/index.js";\nexport default worker;\n',
);

console.log("Prepared dist/server/index.js as the Sites Worker entry.");
