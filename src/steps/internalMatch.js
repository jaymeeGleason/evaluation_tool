import { askJson } from "../llm.js";
import { internalMatchPrompt } from "../prompts/internalMatch.js";

const FITS = new Set(["strong", "partial"]);

export async function internalMatch({ problem, tools }) {
  const raw = await askJson(internalMatchPrompt({ problem, tools }));
  return toMatchResult(raw, tools);
}

export function toMatchResult(value, tools) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Internal match step did not return an object.");
  }
  if (!Array.isArray(value.matches)) {
    throw new Error('Internal match step is missing "matches".');
  }

  const matches = [];
  const seen = new Set();

  for (const match of value.matches) {
    const tool = toolByName(tools, match?.name);
    if (!tool || seen.has(tool.name)) continue;
    if (!FITS.has(match.fit)) {
      throw new Error(`Internal match step has an unknown fit for "${tool.name}".`);
    }
    if (typeof match.reason !== "string" || match.reason.trim() === "") {
      throw new Error(`Internal match step is missing a reason for "${tool.name}".`);
    }

    seen.add(tool.name);
    matches.push({
      name: tool.name,
      fit: match.fit,
      reason: match.reason.trim(),
      status: tool.status,
    });
  }

  return { matches };
}

function toolByName(tools, name) {
  if (typeof name !== "string") return undefined;
  const key = name.trim().toLowerCase();
  return tools.find((tool) => tool.name.trim().toLowerCase() === key);
}
