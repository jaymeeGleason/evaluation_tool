import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const MODEL = "claude-sonnet-4-6";

export async function askJson({ system, user }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY. Add it to .env and try again.");
  }

  const client = new Anthropic();
  const systemPrompt = `${system}\n\nRespond with one JSON object and no other text.`;
  let prompt = user;

  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const text = textFrom(message);
    try {
      return JSON.parse(jsonText(text));
    } catch {
      prompt = `${user}\n\nYour previous reply was not valid JSON. Reply with one JSON object only.\n\n${text}`;
    }
  }

  throw new Error("Model did not return valid JSON.");
}

function textFrom(message) {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

function jsonText(raw) {
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : raw;
}
