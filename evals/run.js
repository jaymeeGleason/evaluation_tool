import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "../src/pipeline.js";

const casesPath = join(dirname(fileURLToPath(import.meta.url)), "cases.json");
const cases = JSON.parse(await readFile(casesPath, "utf8"));
const rows = [];

for (const [index, item] of cases.entries()) {
  console.log(`Running ${index + 1}/${cases.length}: ${item.name}`);
  try {
    const result = await run(presetAsk(item));
    rows.push({
      name: item.name,
      expected: item.expected,
      actual: result.verdict,
      pass: result.verdict === item.expected,
    });
  } catch (error) {
    rows.push({
      name: item.name,
      expected: item.expected,
      actual: "error",
      pass: false,
    });
    console.error(error.message);
  }
}

console.log("");
console.log(table(rows));
const passed = rows.filter((row) => row.pass).length;
console.log(`\nScore: ${passed}/${rows.length}`);

function presetAsk(item) {
  const answers = item.answers ?? [];
  let asked = 0;

  return async () => {
    if (asked === 0) {
      asked += 1;
      return item.problem;
    }
    const answer = answers[asked - 1] ?? answers.at(-1) ?? "That is everything I know.";
    asked += 1;
    return answer;
  };
}

function table(rows) {
  const header = ["Case", "Expected", "Actual", "Result"];
  const body = rows.map((row) => [
    row.name,
    row.expected,
    row.actual,
    row.pass ? "pass" : "fail",
  ]);
  const widths = header.map((label, index) =>
    Math.max(label.length, ...body.map((cells) => cells[index].length)),
  );
  const line = (cells) => cells.map((cell, index) => cell.padEnd(widths[index])).join("  ");
  return [line(header), ...body.map(line)].join("\n");
}
