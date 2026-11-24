export function verdictPrompt({ problem, matches, options }) {
  const system = `You decide whether AI is the right fix for one workflow at a company that handles K-12 communications and student data. Weigh all of these:
- repetition: repeated work is a better candidate than a one-off
- tolerance for ambiguity: the draft must be reviewable by a person when the wording can be wrong
- cost of errors: a mistake that changes a student record, a grade, a consent decision, or a discipline outcome is too costly for an unreviewed AI result
- volume: enough repetitions that the time matters
- data sensitivity: student records and family messages must not be sent to an outside product

Pick exactly one verdict:
- use_internal_tool: an active internal tool already does this drafting or judgment job, such as a summary, a translation, or meeting notes. A deprecated tool does not count. A paper chart, a snack list, or an exact script does not count.
- adopt_external_tool: no active internal tool does the job, the work is repetitive, a person can review the draft, the data is not student or family content, and at least one external option was provided.
- build_custom: the work is repetitive drafting worth software, a person reviews the draft, and the text is student or family data so it cannot go to an outside product. No active internal tool does the job. If the only match is deprecated, do not use that tool; choose build_custom when the drafting work should continue.
- dont_use_ai: the work is rare, physical, a fixed process, or a simple exact script (sort, rename, dedupe, copy a column, fill blanks). Also use this when a person must own the decision because an error cannot be reviewed, or when a tool would not actually do the work.

confidence is "low", "medium", or "high".
reasons is 2 to 4 short sentences a teammate can read, covering the tradeoff you weighed.
nextSteps is 1 to 3 concrete actions.

Leave internalMatches and externalOptions as empty arrays. The caller fills those from checked data. Do not invent a tool name or a URL.

Return only a JSON object:
{"verdict": "use_internal_tool", "confidence": "medium", "reasons": ["..."], "nextSteps": ["..."], "internalMatches": [], "externalOptions": []}`;

  const user = `Workflow:
${JSON.stringify(problem, null, 2)}

Internal matches already checked (deprecated true means do not route new work there):
${JSON.stringify(matches, null, 2)}

External options already checked (every url came from a search result):
${JSON.stringify(options, null, 2)}`;

  return { system, user };
}
