# Borrower Copilot

A client-only self-assessment for an Indian borrower walking into a lender. No login, no bureau, nothing stored.

## Run locally (under 5 minutes)

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

On the home screen:

- **Start with my numbers** — adaptive interview
- **Priya / Ravi / Anita** — the three brief personas. Walk the questions or skip to result

```bash
npm test      # engine tests for the three borrowers
npm run build # production bundle
```

## Layout

| Path | What |
| --- | --- |
| `src/engine/rules.ts` | Every threshold. Change a rule here in the follow-up. |
| `src/engine/evaluate.ts` | Scoring: verdict, two amounts, rate+APR, EMI, card |
| `src/engine/questions.ts` | Must-set + extras. `showIf` is the adaptive path |
| `src/components/` | UI only — it calls `evaluate()` |
| `RULES.md` | What · value · why · source |
| `RUNTHROUGHS.md` | Priya, Ravi, Anita |
| `WALKTHROUGH.md` | 5-minute written walkthrough |

## What this is not

Not a credit model, not a sanction, not advice. Bands are wide when you skip. "I don't know my score" is not 300.
