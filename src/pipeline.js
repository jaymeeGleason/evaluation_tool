import { loadTools } from "./sheet.js";
import { clarify } from "./steps/clarify.js";
import { externalSearch } from "./steps/externalSearch.js";
import { internalMatch } from "./steps/internalMatch.js";
import { summarize } from "./steps/summarize.js";
import { verdict } from "./steps/verdict.js";

const MAX_ROUNDS = 2;
const MAX_QUESTIONS = 3;

export async function runPipeline({ problem, ask }) {
  if (typeof ask !== "function") {
    throw new Error("runPipeline requires an ask(question) callback.");
  }
  const text = typeof problem === "string" ? problem.trim() : "";
  if (!text) {
    throw new Error("Describe the workflow before running the evaluator.");
  }

  const answers = [];
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const result = await clarify({ problem: text, answers });
    if (result.ready) break;
    const questions = result.questions.slice(0, MAX_QUESTIONS);
    for (const question of questions) {
      const answer = await ask(question);
      answers.push({
        question,
        answer: typeof answer === "string" ? answer.trim() : String(answer ?? ""),
      });
    }
  }

  const summary = await summarize({ problem: text, answers });
  const internal = await internalMatch({
    problem: summary,
    tools: loadTools(),
  });
  const external = await externalSearch({ problem: summary });
  return verdict({
    problem: summary,
    matches: internal.matches,
    options: external.options,
  });
}
