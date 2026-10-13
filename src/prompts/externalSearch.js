export function queryPrompt(problem) {
  return {
    system: [
      "Write web search queries that would find off-the-shelf products for this workflow.",
      'Return {"queries": string[]}.',
      "Use 1 or 2 short queries. Do not judge the products.",
    ].join("\n"),
    user: JSON.stringify(problem, null, 2),
  };
}

export function optionsPrompt(problem, results) {
  const list = results
    .map((result, index) => `${index + 1}. ${result.title}\n${result.url}\n${result.snippet}`)
    .join("\n\n");

  return {
    system: [
      "Pick credible off-the-shelf products for this workflow from the search results.",
      'Return {"options": [{"name": string, "url": string, "why": string}]}.',
      "Use at most 3 options.",
      "Every url must be copied from the results. Do not invent a product or a url.",
      "Prefer a vendor page over a roundup article.",
      'If nothing credible is in the results, return {"options": []}.',
    ].join("\n"),
    user: `Problem:\n${JSON.stringify(problem, null, 2)}\n\nResults:\n${list}`,
  };
}
