# AI-Fit Evaluator

Internal tool for the AI Platform team. A teammate describes a workflow bottleneck, and the CLI decides whether AI is the right fix — including saying no, or pointing at a tool the team already has.

## Stack

Node 20+, ES modules. `@anthropic-ai/sdk` (claude-sonnet-4-6), `@tavily/core`, `dotenv`, and built-in `readline`. No frameworks, database, TypeScript, or agent libraries.

## Run

```bash
cp .env.example .env
# fill ANTHROPIC_API_KEY and TAVILY_API_KEY
npm start
```

## Design notes

Intentionally small: one person, one terminal. Prompts only write text. Steps only return data. `pipeline.js` takes an `ask` callback and never reads or writes the terminal. The tool catalog is a local JSON file, and a run is not saved. Search runs at most twice. After the model replies, the step drops any tool name that is not in the catalog and any external URL that was not in those search results. Keys stay in `.env`. Error text is scrubbed before it is printed.

A second person breaks that. The catalog, the API keys, and the session all live in one checkout, so someone else would copy `.env` or see a different tool list. The first change would be to keep keys off shared laptops and point `sheet.js` at one shared catalog, so two people see the same tools without sharing a machine secret.