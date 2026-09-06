# Run-throughs

Numbers from `evaluate()` on the persona fixtures in `src/engine/personas.ts` (same engine the UI runs). Household expenses for Priya are not in the brief; we inferred ₹42,000 including the ₹28,000 rent. Ravi household ₹28,000; Anita ₹24,000. Those are stated in the extra questions, not hidden.

## Priya — 29, Bengaluru, salaried

**Asked (must):** purpose, amount, product, how she earns, net income, existing EMIs, household spend, age, credit score.

**Asked (extra — each moves a number):** years in job, employer tier, bounces, emergency months, high-cost outstanding, upcoming wedding cash, card utilisation. Skipped: ITR, income-low, variable share, dependents, collateral (renter, ₹8L PL), co-applicant, hoped earnings. Optional offer rate left blank.

**Answers used:** Wedding; ₹8,00,000 personal; salaried; ₹1,10,000 net; EMI ₹14,000; expenses ₹42,000; 29; score 780; 5 years; MNC/listed; 0 bounces; 2 months savings; ₹1,50,000 more wedding cash coming; 15% card utilisation.

### Four outputs

| | |
| --- | --- |
| **O1** | **Borrow less.** Wedding is consumption — safe capacity is haircut to 55% so a function does not become a five-year FOIR problem. |
| **O2** | Lender likely sanction **₹18,00,000** (band ₹15.85–20.15L). Safe carry **₹4,60,000** (band ₹3.8–5.4L). **Use ₹4,60,000.** The lender will happily give more than she should take. |
| **O3** | Fair **10.0–11.9%** reducing. All-in APR with ~2% fee + GST **11.3–13.1%**. Why: 780 prime, MNC, five years. |
| **O4** | Ceiling **₹12,000**/month. Recommended EMI **₹12,000** over 48 months. 24m/36m sit above the ceiling. Stress (income −20%): ~₹20,000 left — survivable at the *safe* ticket, not at ₹8L. |

### Negotiation card

> Fair for your profile is 10.0%–11.9% on a personal loan.

If they quote 14%: that is above the band. Ask for the KFS APR, not the wall rate. Do not take ₹8L because FOIR still “fits” — FOIR ignores that this is a wedding.

---

## Ravi — 42, Mysuru, self-employed

**Asked (must):** same nine.

**Asked (extra):** years in business, ITR, bad-month income, variable share, dependents (shown because expenses/income is tight on ITR), bounces, collateral + value, co-applicant income, extra monthly from the stock line. Not asked: employer tier, card utilisation, high-cost app loans.

**Answers used:** Business stock; ₹15,00,000; thinking “business loan”; self-employed; typical cash ₹60,000; bad month ₹40,000; EMI ₹0; expenses ₹28,000; 42; **never borrowed** (not unknown-as-300); 14 years; ITR ₹4,20,000; 40% variable; shop ₹45,00,000 unencumbered; wife ₹18,000; hoped extra ₹12,000/month.

### Four outputs

| | |
| --- | --- |
| **O1** | **Borrow** — on a **loan against property**, not unsecured business. |
| **O2** | Lender **₹15,00,000** (FOIR on *ITR + 70% wife*, 50% LTV on ₹45L would allow more; FOIR binds). Safe **₹15,30,000** off till cash. **Use ₹15,00,000.** The two numbers are different in kind: cash can carry it; the file the bank can write is the ITR file, rescued by the shop. |
| **O3** | Fair LAP **10.5–13.3%**. APR **10.8–13.6%** with ~1% fee. Unknown/never-borrowed does **not** price him as subprime unsecured; secured thin-file is a wide *secured* band. Unsecured business would have been ~20–30%. |
| **O4** | Ceiling **₹23,000**. Recommended **₹21,000** over 120 months. 5-year EMI (₹33k) is above the ceiling — do not let a branch shorten tenor to “prove” affordability. Stress on the ₹40k month: ~₹6,600 leftover — tight but the engine still calls it survivable. |

### Negotiation card

> Fair for your profile is 10.5%–13.3% on a loan against property.

Walk into the **LAP** desk. Unsecured ₹15L on a ₹4.2L ITR and no bureau file is a decline or a 24% NBFC. Property is the product.

---

## Anita — 35, Hubballi, informal

**Asked (must):** same nine. Score: **I don’t know** (wide band, not 300).

**Asked (extra):** years earning, bad month, variable share, dependents, bounces, emergency months, co-applicant (husband unemployed → ₹0), hoped extra from the scooter, high-cost outstanding + rate. Not asked: employer, ITR, collateral (no property/gold given).

**Answers used:** Work vehicle; ₹1,50,000 two-wheeler; informal; ₹28,000 typical / ₹26,000 bad month; stated EMI ₹0; expenses ₹24,000; 35; score unknown; 3 years; 50% variable; 3 dependents; **1 bounce**; 0 months savings; hoped +₹8,000; app loans ₹35,000 at 32%.

### Four outputs

| | |
| --- | --- |
| **O1** | **Don’t borrow.** Bounce in the last year plus 32% debt is how formal lenders decline and how households snowball. Don’t is reachable and it fires. |
| **O2** | Lender stub **₹11,000** (bounce haircut on an already tiny informal unsecured/TW file). Safe **₹0**. **Use ₹0** — not a smaller scooter. |
| **O3** | A two-wheeler band after bounce loading **16–25%** (APR 17.3–26.3%). Shown so she can see that “even the fair vehicle rate” is not the point. Unknown score stayed a band, then bounce widened it. |
| **O4** | Ceiling **₹0**. Every listed tenure is above the ceiling. Stress leftover **negative**. |

### Negotiation card

> Do not take this loan. The right quote is no — not a cheaper two-wheeler on top of 30% app debt.

First job: close ~₹35,000 at 32%. The earning thesis (₹8,000 extra from an e-scooter) is real; sequence is the product. If she later borrows, gold or a clean two-wheeler file — never another app loan.

---

## How adaptive paths differed

| Question | Priya | Ravi | Anita |
| --- | --- | --- | --- |
| Employer tier | Yes | No | No |
| ITR | No | Yes | No |
| Bad-month income | No | Yes | Yes |
| Collateral | No (renter, small PL) | Yes — routes to LAP | No |
| Dependents | No | Shown (ITR-tight) | Yes |
| High-cost app loans | Shown (existing EMI) | No | Yes |
| Hoped extra from loan | No (wedding) | Yes | Yes |
| Card utilisation | Yes | No | No |
