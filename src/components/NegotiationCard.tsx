import type { Answers, Result } from "../engine";
import { inr } from "../engine/money";

export function NegotiationCard({
  result,
  answers,
}: {
  result: Result;
  answers: Answers;
}) {
  return (
    <section className="card" id="card">
      <p className="eyebrow">Negotiation card · hold this up</p>
      <h2>{result.negotiation.headline}</h2>
      <p className="fine">
        {answers.incomeType} · wants {inr(answers.amountWanted ?? 0)} · age{" "}
        {answers.age}
        {answers.creditKnowledge === "known" && answers.creditScore
          ? ` · score ${answers.creditScore}`
          : " · score unknown"}
      </p>
      <ul>
        {result.negotiation.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="callout">{result.negotiation.ifTheyQuote}</p>
      <button type="button" className="primary" onClick={() => window.print()}>
        Print / save as PDF
      </button>
    </section>
  );
}

