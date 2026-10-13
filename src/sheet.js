import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toolsPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data/tools.mock.json",
);

export async function loadTools() {
  const raw = await readFile(toolsPath, "utf8");
  return JSON.parse(raw);
}
