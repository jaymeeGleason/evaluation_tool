import { askJson } from "../llm.js";
import { clarifyPrompt } from "../prompts/clarify.js";

const MAX_QUESTIONS = 3;

function normalizeClarify(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("clarify: model response must be a JSON object.");
  }
  if (typeof raw.ready !== "boolean") {
    throw new Error("clarify: model response must include ready as a boolean.");
  }
  if (
    !Array.isArray(raw.questions) ||
    raw.questions.some((question) => typeof question !== "string")
  ) {
    throw new Error("clarify: questions must be an array of strings.");
  }
  if (raw.ready) {
    return { ready: true, questions: [] };
  }

  const questions = raw.questions
    .map((question) => question.trim())
    .filter(Boolean)
    .slice(0, MAX_QUESTIONS);
  if (questions.length === 0) {
    throw new Error("clarify: ready is false but the model returned no questions.");
  }
  return { ready: false, questions };
}

export async function clarify({ problem, answers }) {
  const raw = await askJson(clarifyPrompt(problem, answers ?? []));
  return normalizeClarify(raw);
}
