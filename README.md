# AI-Fit Evaluator

For the AI Platform team, and for the teammate who brings them a slow workflow. The question is whether AI is the right fix, or whether the team should use a tool it already has, build something small, or leave the work alone.

People often reach for a new AI product when the bottleneck is a summary, a translation, or a pile of writing. Sometimes the team already owns that tool. Sometimes the work is a checklist or a short script. Sometimes the text is K-12 student or family data and should not go to an outside product.

## Run

From this folder:

```bash
cp .env.example .env
# fill ANTHROPIC_API_KEY and TAVILY_API_KEY
npm start
```

`npm start` asks what workflow is slowing the team down, then prints one verdict.

To score the preset cases without sitting at the terminal:

```bash
node evals/run.js
```

## Verdicts

- `use_internal_tool` — an active tool the team already has does this job.
- `adopt_external_tool` — no internal tool fits, the work is repetitive, a person can review the draft, and the text is not student or family data.
- `build_custom` — the work is worth software, but the text is student or family data, so it should stay inside rather than go to an outside product.
- `dont_use_ai` — the work is rare, physical, a fixed process, or a simple exact script, or a person has to own the decision.

## Stack

Node 20+, ES modules. `@anthropic-ai/sdk` (claude-sonnet-4-6), `@tavily/core`, `dotenv`, and built-in `readline`. No frameworks, database, TypeScript, or agent libraries.

## Design notes

Intentionally small: one person, one terminal. Prompts only write text. Steps only return data. `pipeline.js` takes an `ask` callback and never reads or writes the terminal. The tool catalog is a local JSON file, and a run is not saved. Search runs at most twice. After the model replies, the step drops any tool name that is not in the catalog and any external URL that was not in those search results. Keys stay in `.env`. Error text is scrubbed before it is printed.

A second person breaks that. The catalog, the API keys, and the session all live in one checkout, so someone else would copy `.env` or see a different tool list. The first change would be to keep keys off shared laptops and point `sheet.js` at one shared catalog, so two people see the same tools without sharing a machine secret.
