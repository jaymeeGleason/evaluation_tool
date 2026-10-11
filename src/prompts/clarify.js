export function clarifyPrompt(problem, answers = []) {
  const answered =
    answers.length === 0
      ? "None yet."
      : answers
          .map(
            (item, index) =>
              `${index + 1}. Q: ${item.question}\n   A: ${item.answer}`,
          )
          .join("\n");

  const system = `You decide whether a workflow description is complete enough to evaluate later. You do not recommend tools or say whether AI is a fit.

The company handles K-12 communications and student data. A description is complete only when these points are already stated in concrete terms:
- task: what work is being done
- who: which role does it
- frequency: how often
- time cost: how long it takes
- inputs and outputs: what comes in and what is produced
- error impact: what goes wrong if the result is incorrect
- data sensitivity: whether it touches student records, family messages, or other student data

Ask only about points that are still missing. Do not ask for extra detail, edge cases, or actual student records when a point is already stated. Do not repeat a question that was already answered.

Return only a JSON object:
{"ready": false, "questions": ["one short question"]}
or, when every point above is already stated:
{"ready": true, "questions": []}

Ask at most 3 questions. If more than 3 points are missing, ask the 3 that most change the description. If ready is true, questions must be an empty array.`;

  const user = `Problem:
${problem}

Answers so far:
${answered}`;

  return { system, user };
}
