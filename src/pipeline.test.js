import { run } from "./pipeline.js";

describe("run", () => {
  test("stops before asking when an API key is missing", async () => {
    const saved = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    let asked = 0;
    const ask = () => {
      asked += 1;
      return "";
    };

    try {
      await expect(run(ask)).rejects.toThrow(/ANTHROPIC_API_KEY/);
      expect(asked).toBe(0);
    } finally {
      if (saved === undefined) delete process.env.ANTHROPIC_API_KEY;
      else process.env.ANTHROPIC_API_KEY = saved;
    }
  });
});
