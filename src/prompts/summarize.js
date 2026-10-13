const FIELDS = [
  ["task", "what the work is"],
  ["who", "who does it"],
  ["frequency", "how often it happens"],
  ["timeCost", "how long it takes"],
  ["inputsOutputs", "what goes in and what should come out"],
  ["errorImpact", "what a wrong result would cost"],
  ["dataSensitivity", "whether student or family data is involved"],
];

export function summarizePrompt({ problem, answers = [] }) {
  const lines = [`Problem:\n${problem}`];
  for (const answer of answers) {
    lines.push(`Question: ${answer.question}\nAnswer: ${answer.answer}`);
  }

  const fields = FIELDS.map(([name, meaning]) => `- ${name}: ${meaning}`).join("\n");

  return {
    system: [
      "Turn a teammate's description of a workflow bottleneck into one JSON object.",
      "This team handles K-12 communications and student data.",
      "Use exactly these string fields:",
      fields,
      'If the conversation does not support a field, set it to "unknown". Do not guess.',
      "Do not recommend a tool or say whether to use AI.",
    ].join("\n"),
    user: lines.join("\n\n"),
  };
}
