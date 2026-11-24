import { tavily } from "@tavily/core";

const MAX_SNIPPET = 500;

function scrub(text, secret) {
  if (!secret) return text;
  return text.split(secret).join("[redacted]");
}

export async function search(query) {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is missing. Set it in .env and try again.");
  }
  if (typeof query !== "string" || query.trim() === "") {
    throw new Error("search requires a query.");
  }

  const client = tavily({ apiKey });
  let response;
  try {
    response = await client.search(query.trim(), {
      searchDepth: "basic",
      maxResults: 5,
      includeAnswer: false,
      includeRawContent: false,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Search failed.";
    throw new Error(scrub(`Search failed: ${detail}`, apiKey));
  }

  const rows = Array.isArray(response?.results) ? response.results : [];
  return rows
    .filter((row) => row && typeof row.url === "string" && row.url.trim() !== "")
    .map((row) => ({
      title: typeof row.title === "string" ? row.title : "",
      url: row.url.trim(),
      snippet:
        typeof row.content === "string" ? row.content.slice(0, MAX_SNIPPET) : "",
    }));
}
