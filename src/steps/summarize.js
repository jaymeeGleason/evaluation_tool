import { askJson } from "../llm.js";
import { summarizePrompt } from "../prompts/summarize.js";

const FIELDS = [
  "task",
  "who",
  "frequency",
  "timeCost",
  "inputsOutputs",
  "errorImpact",
  "dataSensitivity",
];

export async function summarize(input) {
  const raw = await askJson(summarizePrompt(input));
  return toSummarizeResult(raw);
}

export function toSummarizeResult(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Summarize step did not return an object.");
  }

  const problem = {};
  for (const field of FIELDS) {
    const item = value[field];
    if (typeof item !== "string" || item.trim() === "") {
      throw new Error(`Summarize step is missing "${field}".`);
    }
    problem[field] = item.trim();
  }
  return problem;
}
