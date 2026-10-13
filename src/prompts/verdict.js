const VERDICTS = [
  ["use_internal_tool", "an active internal tool with a strong fit already covers the task"],
  ["adopt_external_tool", "no active internal tool strongly covers it, and a listed external product does"],
  ["build_custom", "there is a real gap, and AI fits the work"],
  ["dont_use_ai", "the bottleneck is process, missing data, or a simple script, or AI is a poor fit"],
];

export function verdictPrompt({ problem, matches, options }) {
  const verdicts = VERDICTS.map(([name, meaning]) => `- ${name}: ${meaning}`).join("\n");

  return {
    system: [
      "Choose exactly one verdict for a workflow bottleneck.",
      "This team handles K-12 communications and student data.",
      "Weigh repetition, tolerance for ambiguity, cost of errors, volume, and data sensitivity.",
      "A deprecated internal tool does not count as a tool they already have.",
      "A partial internal match is not enough for use_internal_tool.",
      "Do not adopt or build AI when a process change or a simple script solves it.",
      "Sensitive student data can still be build_custom when a person reviews the result and the data stays inside the district.",
      "Use only these verdicts:",
      verdicts,
      'Return {"verdict": string, "confidence": "high" | "medium" | "low", "reasons": string[], "nextSteps": string[]}.',
      "Do not add tools. The matches and options you were given are the only ones.",
    ].join("\n"),
    user: [
      `Problem:\n${JSON.stringify(problem, null, 2)}`,
      `Internal matches:\n${JSON.stringify(matches, null, 2)}`,
      `External options:\n${JSON.stringify(options, null, 2)}`,
    ].join("\n\n"),
  };
}
