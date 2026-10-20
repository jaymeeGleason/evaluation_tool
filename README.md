# AI-Fit Evaluator

A teammate describes a workflow bottleneck. This tool tells the AI Platform team whether AI is the right fix. It can say to use a tool the team already has, adopt something that already exists, build something custom, or not use AI at all.

## Who it's for

The AI Platform team, when a colleague asks for an AI tool. The person describing the work does not need to be an engineer.

## How to run

Requires Node 20 or newer.

```bash
cp .env.example .env
npm install
npm start
```

Put `ANTHROPIC_API_KEY` and `TAVILY_API_KEY` in `.env`. If either one is missing, the CLI stops before it asks any questions.

Describe the bottleneck on one line. The tool may ask up to three questions, and it will do that at most twice. Then it prints one verdict.

Internal tools are read from this [Google Sheet](https://docs.google.com/spreadsheets/d/1M9a_kIKegQyVCBN8-XTKMvg2cgloNl_Ue31rsDNUOtc/edit). The sheet has to be viewable by anyone with the link.

## Verdicts

- `use_internal_tool`: an active internal tool already covers the work
- `adopt_external_tool`: nothing internal does, and a real off-the-shelf product does
- `build_custom`: there is a real gap, and AI fits
- `dont_use_ai`: the bottleneck is process, data, or a simple script

## Checks

```bash
npm test
npm run eval
```

`npm test` checks the step shapes without calling the model. `npm run eval` runs eight sample cases through the full pipeline and prints a score. The eval calls the model and web search, so it takes a few minutes.

## Demo

```bash
npm run demo
```

Open http://localhost:3000. The page is the same evaluation as the CLI, with example bottlenecks filled in so a demo does not start from a blank box. The command line is still `npm start`.

Each run searches the web at most twice.
