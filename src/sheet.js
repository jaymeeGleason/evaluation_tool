import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toolsPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "tools.mock.json",
);

export function loadTools() {
  return JSON.parse(readFileSync(toolsPath, "utf8"));
}
