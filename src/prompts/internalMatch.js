export function internalMatchPrompt({ problem, tools }) {
  const toolList = tools
    .map((tool) => `- ${tool.name} (${tool.status}): ${tool.description}`)
    .join("\n");

  return {
    system: [
      "Compare a workflow problem to an internal tools list.",
      "Return one JSON object: {\"matches\": [{\"name\": string, \"fit\": \"strong\" | \"partial\", \"reason\": string}]}.",
      "Include a tool only when it could actually do this task.",
      "Use \"strong\" when it covers the task, and \"partial\" when it covers only part of it.",
      "Include a deprecated tool when it fits, so it can be flagged. Do not invent a tool name.",
      "If nothing fits, return {\"matches\": []}.",
    ].join("\n"),
    user: `Problem:\n${JSON.stringify(problem, null, 2)}\n\nTools:\n${toolList}`,
  };
}
