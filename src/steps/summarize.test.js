import { toSummarizeResult } from "./summarize.js";

const problem = {
  task: "Summarize parent emails",
  who: "Family communications",
  frequency: "Weekly",
  timeCost: "6 hours",
  inputsOutputs: "Emails in, a paragraph out",
  errorImpact: "The principal follows up on the wrong issue",
  dataSensitivity: "Student names and parent phone numbers",
};

describe("toSummarizeResult", () => {
  test("keeps the structured problem fields", () => {
    expect(toSummarizeResult({ ...problem, verdict: "build_custom" })).toEqual(problem);
  });

  test("trims each field", () => {
    expect(toSummarizeResult({ ...problem, task: "  Summarize parent emails  " }).task).toBe(
      "Summarize parent emails",
    );
  });

  test("rejects a missing field", () => {
    const rest = { ...problem };
    delete rest.task;
    expect(() => toSummarizeResult(rest)).toThrow(/task/);
  });

  test("rejects a field that is not text", () => {
    expect(() => toSummarizeResult({ ...problem, frequency: 2 })).toThrow(/frequency/);
  });
});
