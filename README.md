# AI-Fit Evaluator

Internal tool for the AI Platform team. A teammate describes a workflow bottleneck, and the CLI decides whether AI is the right fix — including saying no, or pointing at a tool the team already has.

## Stack

Node 20+, ES modules. `@anthropic-ai/sdk` (claude-sonnet-4-6), `@tavily/core`, `dotenv`, and built-in `readline`. No frameworks, database, TypeScript, or agent libraries.

## Run

```bash
cp .env.example .env
# fill ANTHROPIC_API_KEY and TAVILY_API_KEY
