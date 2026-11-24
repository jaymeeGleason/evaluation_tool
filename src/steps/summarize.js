import { askJson } from "../llm.js";
import { summarizePrompt } from "../prompts/summarize.js";

const KEYS = [
  "task",
  "who",
  "frequency",
  "timeCost",
  "inputsOutputs",
  "errorImpact",
  "dataSensitivity",
];

function normalizeSummary(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("summarize: model response must be a JSON object.");
  }
  const summary = {};
  for (const key of KEYS) {
    const value = raw[key];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`summarize: ${key} must be a non-empty string.`);
    }
    summary[key] = value.trim();
  }
  return summary;
}

export async function summarize({ problem, answers, ask = askJson }) {
  const raw = await ask(summarizePrompt(problem, answers ?? []));
  return normalizeSummary(raw);
}
