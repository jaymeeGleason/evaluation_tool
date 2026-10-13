import { loadTools } from "./sheet.js";
import { clarify } from "./steps/clarify.js";
import { externalSearch } from "./steps/externalSearch.js";
import { internalMatch } from "./steps/internalMatch.js";
import { summarize } from "./steps/summarize.js";
import { verdict } from "./steps/verdict.js";

const MAX_ROUNDS = 2;

export async function run(ask) {
  const problem = await ask("Describe the workflow bottleneck.");
  const answers = [];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const result = await clarify({ problem, answers });
    if (result.ready) break;

    for (const question of result.questions) {
      const answer = await ask(question);
      answers.push({ question, answer });
    }
  }

  const structured = await summarize({ problem, answers });
  const tools = await loadTools();
  const { matches } = await internalMatch({ problem: structured, tools });
  const { options } = await externalSearch(structured);
  return verdict({ problem: structured, matches, options });
}
