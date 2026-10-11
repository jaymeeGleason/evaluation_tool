import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

function stripCodeFence(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed
    .replace(/^```[a-zA-Z0-9]*\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
}

function parseJsonObject(text) {
  let value;
  try {
    value = JSON.parse(stripCodeFence(text));
  } catch {
    return null;
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value;
}

function textFromMessage(message) {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function askJson({ system, user }) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing. Set it in .env and try again.",
    );
  }

  const client = new Anthropic({ apiKey });
  let lastResponse = "";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: user }],
    });
    lastResponse = textFromMessage(message);
    const parsed = parseJsonObject(lastResponse);
    if (parsed) return parsed;
  }

  throw new Error(
    "askJson: model response was not a valid JSON object after one retry.",
  );
}
