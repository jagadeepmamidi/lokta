import { useState } from "react";
import type { Answers, Question } from "../engine";
import { extraAnsweredCount, extraPossibleCount, visibleQuestions } from "../engine";
import { inr } from "../engine/money";

export function Interview({
  answers,
  question,
  personaName,
  canSeeResults,
  onPatch,
  onBack,
  onSkipExtra,
  onFinish,
}: {
  answers: Answers;
  question: Question | undefined;
  personaName: string | null;
  canSeeResults: boolean;
  onPatch: (partial: Answers) => void;
  onBack: () => void;
  onSkipExtra: () => void;
  onFinish: () => void;
}) {
  const vis = visibleQuestions(answers);
  const idx = question ? vis.findIndex((q) => q.id === question.id) : vis.length;
  const total = vis.length;
  const extraA = extraAnsweredCount(answers);
  const extraP = extraPossibleCount(answers);

  if (!question) {
    return (
      <main className="sheet">
        <p className="eyebrow">Questions done</p>
        <h1>We have enough to score this.</h1>
        <p>
          {extraA} extra answers of {extraP} that apply. You can still go back, or
          see the four outputs.
        </p>
        <div className="row">
          <button type="button" className="ghost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="primary" onClick={onFinish}>
            See my numbers
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="sheet interview">
      <div className="progress" role="status">
        <span>
          {question.must ? "Must" : "Extra"} · {Math.min(idx + 1, total)} / {total}
        </span>
        {personaName && <span className="muted">{personaName}</span>}
      </div>
      <div className="bar" aria-hidden="true">
        <i style={{ width: `${Math.round((idx / total) * 100)}%` }} />
      </div>
      <p className="eyebrow">{question.moves}</p>
      <h1>{question.title}</h1>
      <p className="help">{question.help}</p>
      <Field key={String(question.id)} question={question} answers={answers} onPatch={onPatch} />
      <div className="row">
        <button type="button" className="ghost" onClick={onBack}>
          Back
        </button>
        {!question.must && (
          <button type="button" className="text" onClick={onSkipExtra}>
            I don’t know — keep the range wide
          </button>
        )}
        {canSeeResults && !question.must && (
          <button type="button" className="text" onClick={onFinish}>
            Skip extras, show result
          </button>
        )}
      </div>
    </main>
  );
}

function Field({
  question,
  answers,
  onPatch,
}: {
  question: Question;
  answers: Answers;
  onPatch: (partial: Answers) => void;
}) {
  const [draft, setDraft] = useState("");

  if (question.kind === "choice" && question.options) {
    return (
      <div className="choices" role="list">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="choice"
            onClick={() => onPatch({ [question.id]: opt.value } as Answers)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (question.kind === "credit") {
    return (
      <div className="stack">
        <div className="choices">
          <button
            type="button"
            className="choice"
            onClick={() => onPatch({ creditKnowledge: "unknown", creditScore: null })}
          >
            I don’t know my score
          </button>
          <button
            type="button"
            className="choice"
            onClick={() => onPatch({ creditKnowledge: "never_borrowed", creditScore: null })}
          >
            I have never taken a formal loan
          </button>
        </div>
        <label className="field">
          <span>I know it — enter 300 to 900</span>
          <input
            inputMode="numeric"
            min={300}
            max={900}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="primary"
          disabled={!draft}
          onClick={() => {
            const n = Number(draft.replace(/,/g, ""));
            if (!Number.isFinite(n) || n < 300 || n > 900) return;
            onPatch({ creditKnowledge: "known", creditScore: Math.round(n) });
          }}
        >
          Use this score
        </button>
      </div>
    );
  }

  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(draft.replace(/[,₹\s]/g, ""));
        if (!Number.isFinite(n) || n < 0) return;
        onPatch({ [question.id]: n } as Answers);
        setDraft("");
      }}
    >
      <label className="field">
        <span>
          {question.kind === "rupees"
            ? "Amount in rupees"
            : question.kind === "percent"
              ? "Percent"
              : question.suffix ?? "Number"}
        </span>
        <input
          autoFocus
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            question.kind === "rupees"
              ? inr(answers.monthlyIncome ?? 50_000).replace("₹", "").trim()
              : "0"
          }
        />
      </label>
      <button type="submit" className="primary" disabled={draft.trim() === ""}>
        Continue
      </button>
    </form>
  );
}


