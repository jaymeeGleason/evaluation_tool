import { search, toSearchResults } from "./search.js";

describe("toSearchResults", () => {
  test("maps Tavily results to title, url, and snippet", () => {
    expect(
      toSearchResults({
        results: [
          { title: "Otter", url: "https://otter.ai/", content: "Meeting notes", score: 1 },
          { title: "", url: "https://example.com", content: "skip" },
        ],
      }),
    ).toEqual([{ title: "Otter", url: "https://otter.ai/", snippet: "Meeting notes" }]);
  });
});

describe("search", () => {
  test("throws when the API key is missing", async () => {
    const saved = process.env.TAVILY_API_KEY;
    delete process.env.TAVILY_API_KEY;
    try {
      await expect(search("meeting notes")).rejects.toThrow(/TAVILY_API_KEY/);
    } finally {
      if (saved === undefined) delete process.env.TAVILY_API_KEY;
      else process.env.TAVILY_API_KEY = saved;
    }
  });
});
