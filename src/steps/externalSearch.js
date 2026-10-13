import { askJson } from "../llm.js";
import { optionsPrompt, queryPrompt } from "../prompts/externalSearch.js";
import { search } from "../search.js";

const MAX_QUERIES = 2;
const MAX_OPTIONS = 3;

export async function externalSearch(problem) {
  const queries = toQueries(await askJson(queryPrompt(problem)));
  const results = [];
  const seenUrls = new Set();

  for (const query of queries) {
    for (const result of await search(query)) {
      const key = normalizeUrl(result.url);
      if (seenUrls.has(key)) continue;
      seenUrls.add(key);
      results.push(result);
    }
  }

  return toExternalOptions(await askJson(optionsPrompt(problem, results)), results);
}

export function toQueries(value) {
  if (!value || !Array.isArray(value.queries)) {
    throw new Error('External search step is missing "queries".');
  }

  const queries = [];
  for (const query of value.queries) {
    if (typeof query !== "string" || query.trim() === "") continue;
    queries.push(query.trim());
    if (queries.length === MAX_QUERIES) break;
  }

  if (queries.length === 0) {
    throw new Error("External search step did not return a query.");
  }

  return queries;
}

export function toExternalOptions(value, results) {
  if (!value || !Array.isArray(value.options)) {
    throw new Error('External search step is missing "options".');
  }

  const options = [];
  const seen = new Set();

  for (const option of value.options) {
    const result = resultByUrl(results, option?.url);
    if (!result || seen.has(result.url)) continue;
    if (typeof option.name !== "string" || option.name.trim() === "") continue;
    if (typeof option.why !== "string" || option.why.trim() === "") continue;

    seen.add(result.url);
    options.push({
      name: option.name.trim(),
      url: result.url,
      why: option.why.trim(),
    });
    if (options.length === MAX_OPTIONS) break;
  }

  return { options };
}

function resultByUrl(results, url) {
  if (typeof url !== "string") return undefined;
  const key = normalizeUrl(url);
  return results.find((result) => normalizeUrl(result.url) === key);
}

function normalizeUrl(url) {
  return url.trim().replace(/\/$/, "");
}
