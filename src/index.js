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
  let noted = false;
  const result = await run(async (question) => {
    const answer = await rl.question(`${question}\n> `);
    if (!noted) {
      noted = true;
      console.log("\nThis takes a minute.");
    }
    return answer;
  });
  console.log(`\n${formatVerdict(result)}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
}

function formatVerdict(result) {
  const tool = bestTool(result);
  const lines = [
    LABELS[result.verdict] ?? result.verdict,
    ...(tool ? [tool] : []),
    result.tldr || result.reasons[0],
    `${result.confidence} confidence`,
    "",
    "Why:",
    ...result.reasons.slice(0, 3).map((reason) => `- ${reason}`),
    "",
    "Next steps:",
    ...result.nextSteps.slice(0, 3).map((step) => `- ${step}`),
  ];
  return lines.join("\n");
}

function bestTool(result) {
  if (result.verdict === "use_internal_tool") {
    const strong = result.internalMatches.find(
      (match) => match.status === "active" && match.fit === "strong",
    );
    const active = result.internalMatches.find((match) => match.status === "active");
    return (strong || active || result.internalMatches[0])?.name || "";
  }
  if (result.verdict === "adopt_external_tool") {
    return result.externalOptions[0]?.name || "";
  }
  return "";
}
