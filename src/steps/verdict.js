import { askJson } from "../llm.js";
import { verdictPrompt } from "../prompts/verdict.js";

const VERDICTS = new Set([
  "use_internal_tool",
  "adopt_external_tool",
  "build_custom",
  "dont_use_ai",
]);

const CONFIDENCE = new Set(["low", "medium", "high"]);

function stringList(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`verdict: ${label} must be an array of strings.`);
  }
  const cleaned = value.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    throw new Error(`verdict: ${label} must include at least one string.`);
  }
  return cleaned;
}

function normalizeVerdict(raw, matches, options) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("verdict: model response must be a JSON object.");
  }
  if (!VERDICTS.has(raw.verdict)) {
    throw new Error("verdict: verdict is not one of the four allowed values.");
  }
  const confidence =
    typeof raw.confidence === "string" ? raw.confidence.trim().toLowerCase() : "";
  if (!CONFIDENCE.has(confidence)) {
    throw new Error("verdict: confidence must be low, medium, or high.");
  }

  const reasons = stringList(raw.reasons, "reasons");
  const nextSteps = stringList(raw.nextSteps, "nextSteps");
  const active = matches.filter((match) => !match.deprecated);
  let verdict = raw.verdict;

  if (verdict === "use_internal_tool" && active.length === 0) {
    verdict = "build_custom";
    reasons.push("No active internal tool does this job.");
  }
  if (verdict === "adopt_external_tool" && options.length === 0) {
    verdict = active.length > 0 ? "use_internal_tool" : "build_custom";
    reasons.push("No external option had a URL from the search results.");
  }

  return {
    verdict,
    confidence,
    reasons,
    nextSteps,
    internalMatches: matches,
    externalOptions: options,
  };
}

export async function verdict({ problem, matches, options, ask = askJson }) {
  const safeMatches = Array.isArray(matches) ? matches : [];
  const safeOptions = Array.isArray(options) ? options : [];
  const raw = await ask(
    verdictPrompt({
      problem,
      matches: safeMatches,
      options: safeOptions,
    }),
  );
  return normalizeVerdict(raw, safeMatches, safeOptions);
}
