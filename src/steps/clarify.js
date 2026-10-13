import { askJson } from "../llm.js";
import { clarifyPrompt } from "../prompts/clarify.js";

const MAX_QUESTIONS = 3;

export async function clarify(input) {
  const raw = await askJson(clarifyPrompt(input));
  return toClarifyResult(raw);
}

export function toClarifyResult(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Clarify step did not return an object.");
  }
  if (typeof value.ready !== "boolean") {
    throw new Error('Clarify step is missing "ready".');
  }
  if (!Array.isArray(value.questions)) {
    throw new Error('Clarify step "questions" must be a list.');
  }

  const questions = value.questions.slice(0, MAX_QUESTIONS).map((question) => {
    if (typeof question !== "string" || question.trim() === "") {
      throw new Error("Clarify step questions must be non-empty strings.");
    }
    return question.trim();
  });

  if (value.ready || questions.length === 0) {
    return { ready: true, questions: [] };
  }

  return { ready: false, questions };
}
