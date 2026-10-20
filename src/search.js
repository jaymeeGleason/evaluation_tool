import { tavily } from "@tavily/core";
import "dotenv/config";

const MAX_RESULTS = 3;
const MAX_SEARCH_CALLS = 2;

let calls = 0;

export function resetSearchBudget() {
  calls = 0;
}

export function reserveSearchCall() {
  if (calls >= MAX_SEARCH_CALLS) {
    throw new Error("Search is limited to 2 calls per run.");
  }
  calls += 1;
}

export async function search(query) {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("Missing TAVILY_API_KEY. Add it to .env and try again.");
  }

  reserveSearchCall();
  const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const response = await client.search(query, { maxResults: MAX_RESULTS });
  return toSearchResults(response);
}

export function toSearchResults(response) {
  return (response?.results ?? [])
    .filter((result) => result?.title && result?.url)
    .map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.content ?? "",
    }));
}
