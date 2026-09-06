# Walkthrough (five minutes)

Open the app. Do not start with a blank file. Hit **Skip to result** on each persona, then one **Walk the questions** so the adaptive path is visible.

## Minute 0–1 — What this is

A borrower-side copilot. The lender already has a model. This one answers four questions from what she types: borrow or not, two amounts (theirs vs hers), a fair *band* plus APR, an EMI ceiling with a stress case. Then a card she can hold up. No backend.

## Minute 1–2 — Priya (skip to result)

A 780 MNC file. The lender number is ~₹18L. The safe number is ₹4.6L. **Use the smaller one.** Wedding haircut is why “FOIR still fits ₹8L” is not the verdict. Rate 10–11.9%, APR a point higher because of a 2% fee + GST. If a branch quotes 14%, the card says so.

Change an answer: drop emergency savings to 0, or raise upcoming wedding cash — the safe number moves. That is the point of extra questions.

## Minute 2–3 — Ravi (skip to result)

The scoring trap: unsecured ₹15L on a ₹4.2L ITR and no score. We do **not** do that. Collateral routes him to **LAP** at 10.5–13.3%. Never-borrowed is a wide *secured* band, not a 300. Lender ~₹15L (FOIR on ITR) vs safe ~₹15.3L (till + wife). Same rupee, different story — say which to use (the asked ₹15L, inside both). Tell him not to accept a 5-year tenor that pushes EMI to ₹33k.

## Minute 3–4 — Anita (skip to result)

**Don’t borrow** fires. Bounce + ₹35k at 32% + no buffer. The scooter thesis is in a warning, not a sanction. Use ₹0. The card refuses to negotiate a rate.

## Minute 4–5 — Walk one path + what I would cut or build next

Walk **Ravi** from the start. After “self-employed”, ITR and bad-month appear; employer tier does not. After collateral = property, value is asked. Skip “I don’t know” on an extra: the confidence label drops and bands widen. Unknown is never zero.

**Build next:** (1) paste a sanction letter / KFS and diff it against the card; (2) gold-gram calculator at live price; (3) Hindi copy; (4) a refinance optimiser for Anita’s 32% stack before any new asset.

**Cut:** two-wheeler as a full product family beyond what Anita needs; city-tier expense imputation (we already ask expenses); any ML score; login.

**Follow-up live change:** open `src/engine/rules.ts`. Move `safeFoir` from 0.35 to 0.40, or `purposeSafeHaircut.wedding` from 0.55 to 0.70, save, watch Priya’s safe amount jump. That is the architecture: rules are data, UI is a renderer.
