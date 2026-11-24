import { askJson } from "../llm.js";
import { internalMatchPrompt } from "../prompts/internalMatch.js";

function normalizeMatches(raw, tools) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("internalMatch: model response must be a JSON object.");
  }
  if (!Array.isArray(raw.matches)) {
    throw new Error("internalMatch: matches must be an array.");
  }

  const byName = new Map(
    (Array.isArray(tools) ? tools : [])
      .filter((tool) => tool && typeof tool.name === "string")
      .map((tool) => [tool.name, tool]),
  );
  const seen = new Set();
  const matches = [];

  for (const match of raw.matches) {
    if (!match || typeof match.name !== "string") continue;
    const tool = byName.get(match.name.trim());
    if (!tool || seen.has(tool.name)) continue;
    if (match.fit !== "strong" && match.fit !== "partial") continue;
    if (typeof match.reason !== "string" || match.reason.trim() === "") continue;
    seen.add(tool.name);
    matches.push({
      name: tool.name,
      fit: match.fit,
      reason: match.reason.trim(),
      deprecated: tool.status === "deprecated",
    });
  }

  return { matches };
}

export async function internalMatch({ problem, tools, ask = askJson }) {
  const raw = await ask(internalMatchPrompt(problem, tools));
  return normalizeMatches(raw, tools);
}
