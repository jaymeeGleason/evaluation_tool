import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { run } from "./pipeline.js";

const LABELS = {
  use_internal_tool: "Use an internal tool",
  adopt_external_tool: "Adopt an external tool",
  build_custom: "Build a custom tool",
  dont_use_ai: "Don't use AI",
};

const rl = readline.createInterface({ input, output });

try {
  console.log("This takes a minute.\n");
  const result = await run((question) => rl.question(`${question}\n> `));
  console.log(`\n${formatVerdict(result)}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
}

function formatVerdict(result) {
  const lines = [
    `Verdict: ${result.verdict}`,
    LABELS[result.verdict] ?? result.verdict,
    `Confidence: ${result.confidence}`,
    "",
    "Why:",
    ...result.reasons.map((reason) => `- ${reason}`),
    "",
    "Next steps:",
    ...result.nextSteps.map((step) => `- ${step}`),
    "",
    "Internal matches:",
    ...formatMatches(result.internalMatches),
    "",
    "External options:",
    ...formatOptions(result.externalOptions),
  ];
  return lines.join("\n");
}

function formatMatches(matches) {
  if (!matches?.length) return ["None."];
  return matches.map(
    (match) => `- ${match.name} (${match.status}, ${match.fit}): ${match.reason}`,
  );
}

function formatOptions(options) {
  if (!options?.length) return ["None."];
  return options.flatMap((option) => [`- ${option.name}`, `  ${option.url}`, `  ${option.why}`]);
}
