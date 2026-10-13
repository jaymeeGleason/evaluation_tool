import { jsonText } from "./llm.js";

describe("jsonText", () => {
  test("returns raw JSON unchanged", () => {
    const raw = '{"ok":true}';
    expect(jsonText(raw)).toBe(raw);
  });

  test("strips a fence labeled json", () => {
    expect(jsonText('```json\n{"ok":true}\n```')).toBe('{"ok":true}');
  });

  test("strips a fence with no language label", () => {
    expect(jsonText("```\n{\"ok\":true}\n```")).toBe('{"ok":true}');
  });

  test("trims space inside the fence", () => {
    expect(jsonText('```json\n  {"ok": true}  \n```')).toBe('{"ok": true}');
  });

  test("leaves a fence that is not the whole reply", () => {
    const raw = "Here is the object:\n```json\n{\"ok\":true}\n```";
    expect(jsonText(raw)).toBe(raw);
  });
});
