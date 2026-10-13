import { toClarifyResult } from "./clarify.js";

describe("toClarifyResult", () => {
  test("drops questions when the description is ready", () => {
    expect(toClarifyResult({ ready: true, questions: ["Who does this?"] })).toEqual({
      ready: true,
      questions: [],
    });
  });

  test("keeps at most 3 questions", () => {
    const result = toClarifyResult({
      ready: false,
      questions: ["One?", "Two?", "Three?", "Four?"],
    });

    expect(result).toEqual({
      ready: false,
      questions: ["One?", "Two?", "Three?"],
    });
  });

  test("treats an empty question list as ready", () => {
    expect(toClarifyResult({ ready: false, questions: [] })).toEqual({
      ready: true,
      questions: [],
    });
  });

  test("rejects a question that is not text", () => {
    expect(() => toClarifyResult({ ready: false, questions: [1] })).toThrow(
      /non-empty strings/,
    );
  });
});
