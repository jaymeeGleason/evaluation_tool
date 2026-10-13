export function clarifyPrompt({ problem, answers = [] }) {
  const lines = [`Problem:\n${problem}`];
  for (const answer of answers) {
    lines.push(`Question: ${answer.question}\nAnswer: ${answer.answer}`);
  }

  return {
    system: [
      "Decide whether a teammate's description of a workflow bottleneck is detailed enough to evaluate.",
      "This team handles K-12 communications and student data.",
      "It is detailed enough only when the conversation already says:",
      "- what the work is",
      "- who does it",
      "- how often it happens",
      "- how long it takes",
      "- what goes in and what should come out",
      "- what a wrong result would cost",
      "- whether student or family data is involved",
      'Return {"ready": boolean, "questions": string[]}.',
      'If it is detailed enough, set ready to true and questions to [].',
      "If it is not, set ready to false and ask at most 3 short questions about the biggest gaps.",
      "Do not ask about something already answered. Write the questions for a non-engineer.",
    ].join("\n"),
    user: lines.join("\n\n"),
  };
}
