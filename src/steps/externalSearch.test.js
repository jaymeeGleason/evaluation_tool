import { toExternalOptions, toQueries } from "./externalSearch.js";

const results = [
  { title: "Otter", url: "https://otter.ai/", snippet: "Meeting notes" },
  { title: "Fireflies", url: "https://fireflies.ai/", snippet: "Meeting notes" },
];

describe("toQueries", () => {
  test("keeps at most two trimmed queries", () => {
    expect(toQueries({ queries: ["  meeting notes app  ", "", "second", "third"] })).toEqual([
      "meeting notes app",
      "second",
    ]);
  });

  test("rejects a response with no queries", () => {
    expect(() => toQueries({ queries: ["  "] })).toThrow(/query/);
  });
});

describe("toExternalOptions", () => {
  test("drops a url that was not in the search results", () => {
    expect(
      toExternalOptions(
        {
          options: [
            { name: "Otter", url: "https://otter.ai", why: "Turns transcripts into notes." },
            { name: "Made Up", url: "https://example.com/nope", why: "Not in the results." },
          ],
        },
        results,
      ),
    ).toEqual({
      options: [
        {
          name: "Otter",
          url: "https://otter.ai/",
          why: "Turns transcripts into notes.",
        },
      ],
    });
  });

  test("returns no options when nothing matches", () => {
    expect(toExternalOptions({ options: [] }, results)).toEqual({ options: [] });
  });
});
