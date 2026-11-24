import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runPipeline } from "../src/pipeline.js";

const casesPath = join(dirname(fileURLToPath(import.meta.url)), "cases.json");
const cases = JSON.parse(readFileSync(casesPath, "utf8"));

function pad(value, width) {
  const text = String(value);
  return text.length >= width ? text : text + " ".repeat(width - text.length);
}

const rows = [];

for (const item of cases) {
  const answers = Array.isArray(item.answers) ? item.answers : [];
  let index = 0;
  let actual = "error";
  try {
    const result = await runPipeline({
      problem: item.problem,
      ask: async () => {
        const answer = answers[index];
        index += 1;
        return typeof answer === "string"
          ? answer
          : "The description already includes the role, cadence, time, inputs, outputs, error cost, and data sensitivity.";
      },
    });
    actual = result.verdict;
  } catch (err) {
    const message = err instanceof Error ? err.message : "The case failed.";
    console.error(`${item.id}: ${message}`);
  }
  rows.push({
    id: item.id,
    expected: item.expected,
    actual,
    pass: actual === item.expected,
  });
}

const idWidth = Math.max(2, ...rows.map((row) => row.id.length));
const verdictWidth = Math.max(
  8,
  ...rows.map((row) => Math.max(row.expected.length, row.actual.length)),
);

console.log(
  `${pad("case", idWidth)}  ${pad("expected", verdictWidth)}  ${pad("actual", verdictWidth)}  result`,
);
for (const row of rows) {
  console.log(
    `${pad(row.id, idWidth)}  ${pad(row.expected, verdictWidth)}  ${pad(row.actual, verdictWidth)}  ${row.pass ? "pass" : "fail"}`,
  );
}

const passed = rows.filter((row) => row.pass).length;
console.log(`score: ${passed}/${rows.length}`);
process.exitCode = passed === rows.length ? 0 : 1;
