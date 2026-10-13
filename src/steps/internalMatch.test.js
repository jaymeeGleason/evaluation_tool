import { toMatchResult } from "./internalMatch.js";

const tools = [
  {
    name: "Ticket Digest",
    ownerTeam: "Support Ops",
    description: "Summarizes support tickets.",
    status: "active",
    cost: "Included",
  },
  {
    name: "Helpbot Classic",
    ownerTeam: "Support Ops",
    description: "Old FAQ chatbot.",
    status: "deprecated",
    cost: "Retired",
  },
];

describe("toMatchResult", () => {
  test("drops a tool name that is not in the list", () => {
    const result = toMatchResult(
      {
        matches: [
          { name: "Ticket Digest", fit: "strong", reason: "It summarizes tickets." },
          { name: "Invented Bot", fit: "strong", reason: "Made up." },
        ],
      },
      tools,
    );

    expect(result.matches.map((match) => match.name)).toEqual(["Ticket Digest"]);
  });

  test("copies deprecated status from the tools list", () => {
    const result = toMatchResult(
      {
        matches: [{ name: "helpbot classic", fit: "partial", reason: "It used to answer FAQs." }],
      },
      tools,
    );

    expect(result.matches).toEqual([
      {
        name: "Helpbot Classic",
        fit: "partial",
        reason: "It used to answer FAQs.",
        status: "deprecated",
      },
    ]);
  });

  test("returns no matches when nothing fits", () => {
    expect(toMatchResult({ matches: [] }, tools)).toEqual({ matches: [] });
  });

  test("rejects an unknown fit", () => {
    expect(() =>
      toMatchResult(
        { matches: [{ name: "Ticket Digest", fit: "high", reason: "Close." }] },
        tools,
      ),
    ).toThrow(/fit/);
  });
});
