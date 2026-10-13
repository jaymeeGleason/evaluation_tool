import { tavily } from "@tavily/core";
import "dotenv/config";

const MAX_RESULTS = 5;

export async function search(query) {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("Missing TAVILY_API_KEY. Add it to .env and try again.");
  }
// AI Agentic Search
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
