# AI-Fit Evaluator

Internal CLI for the AI Platform team. A teammate describes a workflow bottleneck; the tool decides whether AI is the right fix, including saying no or pointing at a tool that already exists.

## Run

```bash
npm install
npm start
```

`npm start` prints a hello message. The evaluation pipeline is not built yet.

Internal tools load from the [Google Sheet](https://docs.google.com/spreadsheets/d/1M9a_kIKegQyVCBN8-XTKMvg2cgloNl_Ue31rsDNUOtc/edit). General access has to be "Anyone with the link" as Viewer, or the CLI cannot read it.
