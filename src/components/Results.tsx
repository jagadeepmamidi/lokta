import type { Answers, Result } from "../engine";
import { inr, pct } from "../engine/money";
import { NegotiationCard } from "./NegotiationCard";

const VERDICT: Record<Result["verdict"], string> = {
  borrow: "Borrow",
  borrow_less: "Borrow less",
  dont_borrow: "Don’t borrow",
};

export function Results({
  answers,
  result,
  personaName,
  onEdit,
  onRestart,
}: {
  answers: Answers;
  result: Result;
  personaName: string | null;
  onEdit: () => void;
  onRestart: () => void;
}) {
  return (
    <main className="sheet results">
      <p className="eyebrow">
        {personaName ?? "Your file"} · confidence {result.confidence.label} (
        {Math.round(result.confidence.score * 100)}%)
      </p>
      <h1>{VERDICT[result.verdict]}</h1>
      <p className="lede">{result.verdictWhy}</p>
      <p className="fine">{result.confidence.why}</p>

      <section>
        <h2>O1 · Verdict</h2>
        <p>{result.verdictWhy}</p>
      </section>

      <section>
        <h2>O2 · Two amounts</h2>
        <div className="pair">
          <article>
            <p className="k">Lender will likely sanction</p>
            <p className="num">{inr(result.lenderAmount.mid)}</p>
            <p className="fine">
              Band {inr(result.lenderAmount.low)} – {inr(result.lenderAmount.high)}
            </p>
          </article>
          <article>
            <p className="k">You can safely carry</p>
            <p className="num">{inr(result.safeAmount.mid)}</p>
            <p className="fine">
              Band {inr(result.safeAmount.low)} – {inr(result.safeAmount.high)}
            </p>
          </article>
        </div>
        <p>
          <strong>Use {inr(result.useAmount)}.</strong> {result.useAmountWhy}
        </p>
        <p className="fine">{result.productWhy}</p>
      </section>

      <section>
        <h2>O3 · Fair rate</h2>
        <p className="num">
          {pct(result.rate.low)} – {pct(result.rate.high)}
        </p>
        <p>
          All-in APR (rate + ~{pct(result.rate.processingFeePct, 1)} processing fee +
          GST): {pct(result.rate.aprLow)} – {pct(result.rate.aprHigh)}.
        </p>
        <p>{result.rateWhy}</p>
      </section>

      <section>
        <h2>O4 · EMI to agree to</h2>
        <p>
          Monthly ceiling <strong>{inr(result.emiCeiling)}</strong>. Recommended EMI{" "}
          <strong>{inr(result.recommendedEmi)}</strong> over {result.tenureMonths}{" "}
          months.
        </p>
        <p>{result.emiCeilingWhy}</p>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Tenure</th>
                <th>EMI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {result.tenureOptions.map((t) => (
                <tr key={t.months}>
                  <td>{t.months} months</td>
                  <td>{inr(t.emi)}</td>
                  <td>{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="callout">
          <p>
            <strong>Stress · {result.stress.label}.</strong> {result.stress.why}
          </p>
        </div>
      </section>

      {result.warnings.map((w) => (
        <p key={w} className="warn">
          {w}
        </p>
      ))}

      <NegotiationCard result={result} answers={answers} />

      <div className="row">
        <button type="button" className="ghost" onClick={onEdit}>
          Change an answer
        </button>
        <button type="button" className="text" onClick={onRestart}>
          Start over
        </button>
      </div>
    </main>
  );
}
