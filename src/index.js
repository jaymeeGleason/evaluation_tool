import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { runPipeline } from "./pipeline.js";

const KEYS = ["ANTHROPIC_API_KEY", "TAVILY_API_KEY"];

function missingKeys() {
  return KEYS.filter((name) => {
    const value = process.env[name];
    return typeof value !== "string" || value.trim() === "";
  });
}

function scrub(text) {
  let out = text;
  for (const name of KEYS) {
    const secret = process.env[name]?.trim();
    if (secret) out = out.split(secret).join("[redacted]");
  }
  return out;
}

const absent = missingKeys();
if (absent.length > 0) {
  const verb = absent.length === 1 ? "is" : "are";
  const pronoun = absent.length === 1 ? "it" : "them";
  console.error(
    `${absent.join(" and ")} ${verb} missing. Set ${pronoun} in .env and try again.`,
  );
  process.exit(1);
}

const rl = createInterface({ input: stdin, output: stdout });

try {
  const problem = (await rl.question("What workflow is slowing the team down?\n> ")).trim();
  if (!problem) {
    console.error("Describe the workflow, then run this again.");
    process.exitCode = 1;
  } else {
    const result = await runPipeline({
      problem,
      ask: async (question) => (await rl.question(`${question}\n> `)).trim(),
    });
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
} catch (err) {
  const message = err instanceof Error ? err.message : "The evaluator failed.";
  console.error(scrub(message));
  process.exitCode = 1;
} finally {
  rl.close();
}
