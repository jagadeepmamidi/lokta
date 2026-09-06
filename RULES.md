# RULES.md

Every number the engine uses. Change `src/engine/rules.ts` and the UI follows. Format: **what · value · why · source**.

## Affordability

| What | Value | Why | Source |
| --- | --- | --- | --- |
| Lender FOIR, net monthly ≤ ₹25k | 40% | Thin surplus; banks are stricter at this slab | Judgement, in the 40–50% market range ([FOIR 2026](https://honestmoney.in/loans/personal-loan-foir-eligibility)) |
| Lender FOIR, ₹25–50k | 45% | Mid slab | Same |
| Lender FOIR, ₹50–100k | 50% | Common private-bank cap | SBI/HDFC/ICICI published caps ~50–55% |
| Lender FOIR, > ₹100k | 55% | Higher income, more room | Same |
| Safe FOIR (borrower number) | 35% | Lender FOIR is what they will *sell*. 35% is what a household should keep after a bad month | My judgement |
| Residual floor | 15% of conservative income + ₹2,000/dependent | FOIR ignores rent and food. Residual does not | My judgement |
| Income-drop stress | −20% | Informal and kirana cash really does that | My judgement |
| Rate-rise stress | +3 percentage points | Personal loans are often floating; 300 bps is a cycle, not a crisis | My judgement |
| Co-applicant counted for lender | 70% of stated income | Joint files are haircut, not 1+1 | My judgement |
| Hoped extra earnings from the loan | 50% counted | Optimism is not collateral | My judgement |
| Undocumented self-employed cash | 60% for lender income | Lenders underwrite ITR, not the till | Market practice |
| Informal income for lender | 55% of stated | Thin docs, high variance | My judgement |
| High-cost outstanding vs EMI | If existing EMIs > 0, outstanding does not add a second EMI. If EMIs are 0, we imply 12-month EMI at the stated high-cost rate | Stops double-counting when the borrower followed both questions | Bugbot fix / my judgement |
| Zero FOIR room | Lender amount = 0 even if salary multiple or LTV is large | No EMI headroom means no sanction | Bugbot fix |
| Thin-file unsecured haircut | 55% of FOIR/multiple | No bureau file is not a 300; it is a smaller unsecured ticket | My judgement |
| Bounce unsecured haircut | 15% of unsecured lender amount | One bounce is often a decline; we still show a stub number | My judgement |
| Low emergency savings haircut | ×0.8 on safe amount if < 2 months | A loan with no buffer is how a wedding becomes default | My judgement |

## Purpose haircut (applied only to the *safe* amount)

| Purpose | Factor | Why | Source |
| --- | --- | --- | --- |
| Wedding | 0.55 | Consumption, social pressure to over-borrow | My judgement |
| Other consumption | 0.50 | Same | My judgement |
| Personal vehicle | 0.75 | Depreciating, but hypothecated | My judgement |
| Education / medical | 0.85 / 0.90 | Harder to postpone | My judgement |
| Work vehicle / business stock or asset / refinance | 1.00 | Can earn, or replaces costlier debt | My judgement |
| Home | 0.95 | Long asset, still a stretch | My judgement |
| Other | 0.70 | Unknown purpose | My judgement |

## Amount caps

| What | Value | Why | Source |
| --- | --- | --- | --- |
| Salaried multiple, MNC/listed | 22× monthly | Bank PL multiples ~20–24× | HonestMoney / bank grids |
| Salaried, government | 24× | Often looser | Same |
| Salaried, SME | 16× | Weaker employer | My judgement |
| Salaried, other | 14× | Default salaried | My judgement |
| Self-employed with ITR | 10× of ITR/12 | Unsecured business is tight | My judgement |
| Self-employed cash only | 6× | No ITR | My judgement |
| Informal unsecured | 4× | App-loan territory | My judgement |
| LAP LTV | 50% of stated property value | Advertised 50–70%; we stay conservative without a valuation | Market; my judgement |
| Two-wheeler LTV | 85% of amount wanted | Typical 80–90% of on-road | Dealer/bank practice 2026 |
| Gold LTV | 85% / 80% / 75% by ticket (₹2.5L / ₹5L) | RBI gold directions from 1 Apr 2026 | RBI gold LTV tiers |
| Product max PL / biz / LAP / gold / TW | ₹40L / ₹20L / ₹75L / ₹50L / ₹2.5L | Ceiling so a bad input cannot explode | Market caps, rounded |

Salary multiple is **not** applied to LAP or gold. Those are LTV + FOIR files.

## Tenure defaults

| Product | Default | Choices shown | Why |
| --- | --- | --- | --- |
| Personal | 48 months | 24 / 36 / 48 / 60 | Common PL |
| Unsecured business | 36 | 24 / 36 / 48 | Shorter, dearer |
| LAP | 120 | 60 / 84 / 120 / 180 | 10-year default; 15 years available |
| Gold | 12 | 6 / 12 / 24 | Bullet/short tenor |
| Two-wheeler | 36 | 24 / 36 / 48 | Typical bike |

## Processing fee (plus 18% GST)

| Product | Fee | Why | Source |
| --- | --- | --- | --- |
| Personal | 2.0% | Banks 1–2.5%, NBFCs higher | 2026 PL tables |
| Unsecured business | 2.5% | Dearer origination | My judgement |
| LAP | 1.0% | Secured, larger ticket | My judgement |
| Gold | 0.5% | Often waived; we still assume a fee | Gold-loan fee tables |
| Two-wheeler | 1.5% | Dealer + lender | My judgement |
| GST on fees | 18% | Indian GST | Statute |

APR is the reducing-balance IRR of (disbursal = principal − fee×1.18, then EMIs). That is closer to a KFS APR than “headline + fee”.

## Fair rate bands (% p.a., reducing)

Buckets: prime ≥760, strong 720–759, fair 680–719, weak 650–679, poor <650, **unknown** (score not given), **never** (never borrowed). Unknown is a *wide band*, not 300.

| Product | Prime | Strong | Fair | Weak | Poor | Unknown | Never borrowed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Personal | 10.5–12.5 | 12–14.5 | 14.5–18 | 18–22 | 22–28 | 12–20 | 14–22 |
| Unsecured business | 14–18 | 16–20 | 18–24 | 22–28 | 26–32 | 18–28 | 20–30 |
| LAP | 9.75–11.5 | 10.5–12.5 | 11.5–13.5 | 12.5–14.5 | 13.5–16 | 10.5–13.5 | 10.75–13.5 |
| Gold | 9–12 | 9.5–13 | 10–14 | 11–15 | 12–16 | 9.5–14 | 9.5–14 |
| Two-wheeler | 11–14 | 12–15.5 | 14–18 | 16–22 | 20–26 | 13–20 | 14–22 |

Loadings / discounts (then personal low is floored at 10%):

| What | Delta | Why | Source |
| --- | --- | --- | --- |
| MNC / listed / govt employer | −0.5 / −0.4 pts | Relationship pricing | Market |
| ≥5 years in job/business | −0.25 | Stability | My judgement |
| <1 year | +1 / +1.5 | Probation / new shop | My judgement |
| Card utilisation ≥50% | +1 / +1.5 | Silent FOIR | Bureau practice |
| ≥1 bounce in 12 months | +3 / +5 | Price or decline | My judgement |

Personal advertised floors near 9.99% in 2026 (HDFC/ICICI/Axis). Most approved files still land 12–18%. Prime MNC 780 is the 10.5–12.5 story, not 9.99.

## Credit, unknown, zero

| What | Rule | Why |
| --- | --- | --- |
| “I don’t know my score” | Bucket = unknown, wide rate, −8 confidence pts | Not a 300 |
| “Never borrowed” | Bucket = never. Unsecured ticket haircut; LAP/gold still near secured prime | Thin file ≠ bad file |
| Skipped extra question | `null`, not 0. Expenses/EMI if skipped on a must-question cannot happen; extras leave the range wide | Brief: unknown is never zero |
| Confidence | 0.38 must-only + 0.07 per extra answered, cap 0.92 | Honest widening |

## Product routing

1. Property ≥ ₹5L pledged → **LAP**
2. Gold ≥ ₹50k → **gold**
3. Purpose/hint two-wheeler or work vehicle → **two-wheeler**
4. Business purpose, no collateral → **unsecured business**
5. Else → **personal**

## Verdict

**Don’t borrow** if any of: age < 21; bounce + (high-cost debt or informal income); residual after expenses and current EMIs below the floor; consumption + no savings + thin leftover; already in ≥30% debt and asking for more consumption; no safe EMI room.

**Borrow less** if safe amount or lender amount < 85% of asked, or purpose haircut ≤ 0.75 (wedding/consumption).

**Borrow** otherwise, on the routed product.

The number to use is `min(asked, safe, lender)`, or ₹0 if don’t borrow. When lender > safe, we say so in one sentence.

## What we do not know

- Live bureau, banking, GST, or ITR — the user types numbers.
- City-level rent/expense models. We *ask* expenses; we do not invent Bengaluru vs Hubballi baskets if they skip (must-question, so they cannot skip).
- Exact lender grids (SBI Xpress vs Bajaj vs a gold NBFC). Bands are composites.
- Title search, gold purity, hypothecation, insurance bundling, prepayment clauses.
- Whether Ravi’s shop is actually free of charge. We take the answer.
- Anita’s true bounce reason. One bounce is enough to say no to *new* debt.

Repo rate ~5.25% (July 2026 news). We did not index bands to repo; a follow-up can shift every row in `RULES.rates`.

