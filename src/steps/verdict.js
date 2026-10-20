import { askJson } from "../llm.js";
import { verdictPrompt } from "../prompts/verdict.js";

const VERDICTS = new Set([
  "use_internal_tool",
  "adopt_external_tool",
  "build_custom",
  "dont_use_ai",
]);
const CONFIDENCE = new Set(["high", "medium", "low"]);

export async function verdict(input) {
  const raw = await askJson(verdictPrompt(input));
  return toVerdictResult(raw, input);
}

export function toVerdictResult(value, input) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Verdict step did not return an object.");
  }
  if (!VERDICTS.has(value.verdict)) {
    throw new Error(`Verdict step returned an unknown verdict "${value.verdict}".`);
  }
  if (!CONFIDENCE.has(value.confidence)) {
    throw new Error(`Verdict step returned an unknown confidence "${value.confidence}".`);
  }

  const reasons = stringList(value.reasons, "reasons").slice(0, 3);
  const nextSteps = stringList(value.nextSteps, "nextSteps").slice(0, 3);

  return {
    verdict: value.verdict,
    confidence: value.confidence,
    tldr: oneSentence(value.tldr) || reasons[0],
    reasons,
    nextSteps,
    internalMatches: input.matches ?? [],
    externalOptions: input.options ?? [],
  };
}

function oneSentence(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function stringList(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Verdict step is missing "${field}".`);
  }
  return value.map((item) => {
    if (typeof item !== "string" || item.trim() === "") {
      throw new Error(`Verdict step "${field}" must be non-empty strings.`);
    }
    return item.trim();
  });
}
