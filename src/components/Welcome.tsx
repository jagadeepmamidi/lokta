import { PERSONAS } from "../engine";

export function Welcome({
  onStart,
  onPersona,
}: {
  onStart: () => void;
  onPersona: (id: (typeof PERSONAS)[number]["id"], jump: boolean) => void;
}) {
  return (
    <main className="sheet">
      <p className="eyebrow">Lokta · Borrower copilot</p>
      <h1>
        Walk in knowing <em>your</em> number.
      </h1>
      <p className="lede">
        Four questions before you sit across a lender: should you borrow, how much
        is real, what rate is fair, what EMI you can live with. Then a card you
        can hold up.
      </p>
      <p className="fine">
        No login. No bureau pull. Nothing stored. Unknown is not treated as zero.
      </p>
      <button className="primary" type="button" onClick={onStart}>
        Start with my numbers
      </button>
      <h2 className="sub">Or run the three borrowers from the brief</h2>
      <div className="persona-grid">
        {PERSONAS.map((p) => (
          <article key={p.id} className="persona-card">
            <h3>{p.name}</h3>
            <p>{p.blurb}</p>
            <div className="row">
              <button type="button" className="ghost" onClick={() => onPersona(p.id, false)}>
                Walk the questions
              </button>
              <button type="button" className="text" onClick={() => onPersona(p.id, true)}>
                Skip to result
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
