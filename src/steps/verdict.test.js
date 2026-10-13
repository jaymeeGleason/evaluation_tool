import { toVerdictResult } from "./verdict.js";

const input = {
  matches: [
    {
      name: "Ticket Digest",
      fit: "strong",
      reason: "Summarizes tickets.",
      status: "active",
    },
  ],
  options: [
    { name: "Invented by the model", url: "https://example.com/nope", why: "Should not be used." },
  ],
};

describe("toVerdictResult", () => {
  test("keeps the matches and options it was given", () => {
    const result = toVerdictResult(
      {
        verdict: "use_internal_tool",
        confidence: "high",
        reasons: ["Ticket Digest already covers this."],
        nextSteps: ["Point the team at Ticket Digest."],
        internalMatches: [{ name: "Made Up" }],
        externalOptions: [{ name: "Also made up", url: "https://example.com/fake", why: "No." }],
      },
      input,
    );

    expect(result.verdict).toBe("use_internal_tool");
    expect(result.internalMatches).toEqual(input.matches);
    expect(result.externalOptions).toEqual(input.options);
  });

  test("rejects an unknown verdict", () => {
    expect(() =>
      toVerdictResult(
        {
          verdict: "maybe",
          confidence: "high",
          reasons: ["Unsure."],
          nextSteps: ["Look again."],
        },
        input,
      ),
    ).toThrow(/verdict/);
  });

  test("rejects empty reasons", () => {
    expect(() =>
      toVerdictResult(
        {
          verdict: "dont_use_ai",
          confidence: "medium",
          reasons: [],
          nextSteps: ["Change the process."],
        },
        input,
      ),
    ).toThrow(/reasons/);
  });
});
