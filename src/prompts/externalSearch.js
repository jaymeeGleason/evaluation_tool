export function externalSearchQueriesPrompt(problem) {
  const system = `You write web search queries for software a team could adopt for this workflow. You do not pick a product yet and you do not invent a URL.

Return only a JSON object with 1 or 2 short queries:
{"queries": ["query one", "query two"]}

The queries should name the kind of product, not a private record. Do not include student names, family details, or text from a real ticket or note.`;

  const user = `Workflow:
${JSON.stringify(problem, null, 2)}`;

  return { system, user };
}

export function externalSearchPickPrompt(problem, results) {
  const system = `You pick credible software options from search results. You do not invent products or URLs.

Rules:
- Every url must be copied exactly from the results list.
- Keep an option only when the page is a real product or tool a team could adopt for this workflow.
- Skip ads, listicles with no product, and pages about a different job.
- name is the product name from that result. why is one short sentence.
- Return at most 3 options.
- If none of the results are a credible fit, return an empty options array.

Return only a JSON object:
{"options": [{"name": "Product", "url": "https://exact-url-from-results", "why": "why it fits"}]}`;

  const user = `Workflow:
${JSON.stringify(problem, null, 2)}

Search results:
${JSON.stringify(results, null, 2)}`;

  return { system, user };
}
