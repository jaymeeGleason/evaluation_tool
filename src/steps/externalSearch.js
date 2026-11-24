import { askJson } from "../llm.js";
import {
  externalSearchPickPrompt,
  externalSearchQueriesPrompt,
} from "../prompts/externalSearch.js";
import { search } from "../search.js";

const MAX_SEARCH_CALLS = 2;

function canonicalUrl(url) {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return url.trim();
  }
}

function capQueries(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("externalSearch: query response must be a JSON object.");
  }
  if (!Array.isArray(raw.queries)) {
    throw new Error("externalSearch: queries must be an array.");
  }
  const queries = [];
  const seen = new Set();
  for (const query of raw.queries) {
    if (typeof query !== "string") continue;
    const trimmed = query.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    queries.push(trimmed);
    if (queries.length === MAX_SEARCH_CALLS) break;
  }
  return queries;
}

function keepResultOptions(raw, results) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("externalSearch: pick response must be a JSON object.");
  }
  if (!Array.isArray(raw.options)) {
    throw new Error("externalSearch: options must be an array.");
  }

  const urlsByKey = new Map();
  for (const result of results) {
    if (!result || typeof result.url !== "string") continue;
    urlsByKey.set(canonicalUrl(result.url), result.url);
  }

  const options = [];
  const seen = new Set();
  for (const option of raw.options) {
    if (!option || typeof option.url !== "string") continue;
    const url = urlsByKey.get(canonicalUrl(option.url));
    if (!url || seen.has(url)) continue;
    if (typeof option.name !== "string" || option.name.trim() === "") continue;
    if (typeof option.why !== "string" || option.why.trim() === "") continue;
    seen.add(url);
    options.push({
      name: option.name.trim(),
      url,
      why: option.why.trim(),
    });
  }
  return options;
}

export async function externalSearch({
  problem,
  searchImpl = search,
  ask = askJson,
}) {
  const queries = capQueries(await ask(externalSearchQueriesPrompt(problem)));
  const results = [];
  for (const query of queries) {
    const found = await searchImpl(query);
    if (!Array.isArray(found)) {
      throw new Error("externalSearch: search must return an array.");
    }
    results.push(...found);
  }
  if (results.length === 0) return { options: [] };

  const picked = await ask(externalSearchPickPrompt(problem, results));
  return { options: keepResultOptions(picked, results) };
}
