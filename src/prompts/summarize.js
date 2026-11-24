const FIELDS = [
  "task",
  "who",
  "frequency",
  "timeCost",
  "inputsOutputs",
  "errorImpact",
  "dataSensitivity",
];

export function summarizePrompt(problem, answers = []) {
  const answered =
    answers.length === 0
      ? "None yet."
      : answers
          .map(
            (item, index) =>
              `${index + 1}. Q: ${item.question}\n   A: ${item.answer}`,
          )
          .join("\n");

  const system = `You turn a workflow description into a short structured summary for a later evaluation. You do not recommend tools or say whether AI is a fit.

The company handles K-12 communications and student data. Use only what the problem and answers already say. If a point was never stated, set that field to "not stated". Do not invent numbers, roles, or student details.

Return only a JSON object with exactly these string fields:
${FIELDS.map((field) => `- ${field}`).join("\n")}

Meanings:
- task: the work being done
- who: the role that does it
- frequency: how often
- timeCost: how long it takes
- inputsOutputs: what comes in and what is produced
- errorImpact: what goes wrong if the result is incorrect
- dataSensitivity: whether it touches student records, family messages, or other student data`;

  const user = `Problem:
${problem}

Answers so far:
${answered}`;

  return { system, user };
}
