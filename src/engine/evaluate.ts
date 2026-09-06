import type {
  Answers,
  AmountBand,
  RecommendedProduct,
  Result,
  Verdict,
} from "./types";
import {
  RULES,
  creditBucket,
  goldLtv,
  lenderFoirCap,
  type CreditBucket,
} from "./rules";
import { aprPct, clamp, emi, inr, maxPrincipal, pct, roundRupee } from "./money";
import { extraAnsweredCount, extraPossibleCount, isMustComplete } from "./questions";

function band(mid: number, widen: number): AmountBand {
  const m = roundRupee(Math.max(0, mid));
  return {
    low: roundRupee(m * (1 - widen)),
    mid: m,
    high: roundRupee(m * (1 + widen)),
  };
}

function impliedHighCostEmi(a: Answers): number {
  const outstanding = a.highCostOutstanding ?? 0;
  if (outstanding <= 0) return 0;
  const rate = a.highCostRatePct ?? 30;
  return emi(outstanding, rate, 12);
}

function existingDebt(a: Answers): number {
  const stated = a.existingEmis ?? 0;
  // Outstanding is for rate/refinance. Only invent an EMI if they did not already count one.
  if (stated > 0) return stated;
  return impliedHighCostEmi(a);
}

function lenderMonthlyIncome(a: Answers): number {
  const own = a.monthlyIncome ?? 0;
  const co = (a.coApplicantIncome ?? 0) * RULES.coApplicantLenderHaircut;
  if (a.incomeType === "salaried") return own + co;
  if (a.incomeType === "self_employed") {
    const itrMonthly =
      a.documentedAnnualIncome != null ? a.documentedAnnualIncome / 12 : null;
    if (itrMonthly != null) return itrMonthly + co;
    return own * RULES.undocumentedCashHaircut + co;
  }
  return own * RULES.informalLenderHaircut + co;
}

function typicalOwnIncome(a: Answers): number {
  return a.monthlyIncome ?? 0;
}

function stressedOwnIncome(a: Answers): number {
  if (a.incomeLow != null && a.incomeLow > 0) return a.incomeLow;
  const own = typicalOwnIncome(a);
  return own * (1 - RULES.incomeStressDrop);
}

function safeMonthlyIncome(a: Answers): number {
  const own = typicalOwnIncome(a);
  const variable = a.variableIncomeShare;
  const haircut =
    variable == null
      ? a.incomeType === "salaried"
        ? 1
        : 0.9
      : 1 - (variable / 100) * 0.5;
  return own * haircut + (a.coApplicantIncome ?? 0);
}

function routeProduct(a: Answers): { product: RecommendedProduct; why: string } {
  const wanted = a.amountWanted ?? 0;
  const col = a.collateralKind;
  const val = a.collateralValue ?? 0;

  if (col === "property" && val >= 500_000) {
    return {
      product: "lap",
      why: `You have unencumbered property around ${inr(val)}. A loan against property is the product a lender will actually underwrite for this size, not an unsecured personal or business loan.`,
    };
  }
  if (col === "gold" && val >= 50_000) {
    return {
      product: "gold",
      why: `Gold of about ${inr(val)} can raise cash against RBI LTV caps, usually cheaper and faster than unsecured credit — especially with a thin or stressed bureau file.`,
    };
  }
  if (a.purpose === "vehicle_work" || a.purpose === "vehicle_personal" || a.productHint === "two_wheeler") {
    return {
      product: "two_wheeler",
      why: "The asset hypothecates. A two-wheeler loan is cheaper than a personal loan and the lender will insist on it if the money is for a vehicle.",
    };
  }
  if (a.purpose === "business_stock" || a.purpose === "business_asset" || a.productHint === "business") {
    return {
      product: "business_unsecured",
      why: "No pledgeable collateral was given, so this is unsecured business credit — slower, dearer, and capped off documented income, not till cash.",
    };
  }
  if (wanted > 0 && wanted <= 250_000 && a.incomeType === "informal") {
    return {
      product: "personal",
      why: "Small ticket, no collateral: the street form is an NBFC / app personal loan. That is usually the wrong product if you have gold or a co-applicant.",
    };
  }
  return {
    product: "personal",
    why: "Unsecured personal loan is what most salaried borrowers are sold. Fair only if FOIR and score support bank pricing, not app pricing.",
  };
}

function rateBandFor(
  product: RecommendedProduct,
  bucket: CreditBucket,
  a: Answers,
): { low: number; high: number; why: string[] } {
  const pair = RULES.rates[product][bucket];
  let low: number = pair[0];
  let high: number = pair[1];
  const why: string[] = [];

  if (bucket === "unknown") {
    why.push(
      `Score is unknown, so the band stays ${pct(low)}–${pct(high)} rather than pretending you are a 300 or a 780.`,
    );
  } else if (bucket === "never") {
    why.push("No bureau file: unsecured is priced as thin-file; secured (LAP/gold) still clears near prime secured rates.");
  } else if (a.creditScore != null) {
    why.push(`Score ${a.creditScore} maps to the ${bucket} bucket for this product.`);
  }

  if (a.employerTier === "mnc_listed" || a.employerTier === "govt") {
    low -= 0.5;
    high -= 0.4;
    why.push("Employer tier (MNC/listed/govt) usually knocks 0.4–0.5 pts off personal-loan pricing.");
  }
  if ((a.yearsEarning ?? 0) >= 5) {
    low -= 0.25;
    high -= 0.25;
    why.push("Five or more years in the same job/business is a small stability discount.");
  } else if (a.yearsEarning != null && a.yearsEarning < 1) {
    low += 1;
    high += 1.5;
    why.push("Under a year in the current income is a loading.");
  }
  if ((a.cardUtilisation ?? 0) >= 50) {
    low += 1;
    high += 1.5;
    why.push("Card utilisation ≥ 50% is priced like extra FOIR.");
  }
  if ((a.bouncesLast12m ?? 0) >= 1) {
    low += 3;
    high += 5;
    why.push("A bounce in the last year is a 3–5 pt loading on anything unsecured, and often a decline.");
  }
  if (bucket === "unknown") {
    // already wide; do not narrow
  }
  low = Math.max(product === "personal" ? 10 : 8, low);
  high = Math.max(low + 0.75, high);
  return { low, high, why };
}

function salaryMultiple(a: Answers): number {
  if (a.incomeType === "informal") return RULES.salaryMultiple.informal_unsecured;
  if (a.incomeType === "self_employed") {
    return a.documentedAnnualIncome != null
      ? RULES.salaryMultiple.self_employed_documented
      : RULES.salaryMultiple.self_employed_cash;
  }
  if (a.employerTier === "mnc_listed") return RULES.salaryMultiple.salaried_mnc;
  if (a.employerTier === "govt") return RULES.salaryMultiple.salaried_govt;
  if (a.employerTier === "sme") return RULES.salaryMultiple.salaried_sme;
  return RULES.salaryMultiple.salaried_other;
}

function ltvCap(product: RecommendedProduct, collateralValue: number, wanted: number): number {
  if (product === "lap") return (collateralValue || 0) * RULES.ltv.lap;
  if (product === "gold") return (collateralValue || 0) * goldLtv(wanted || collateralValue);
  if (product === "two_wheeler") return wanted > 0 ? wanted * RULES.ltv.twoWheeler : 0;
  return Infinity;
}

function confidenceOf(a: Answers): Result["confidence"] {
  const extra = extraAnsweredCount(a);
  const possible = extraPossibleCount(a);
  let score = RULES.confidence.mustBase + extra * RULES.confidence.extraEach;
  const bits: string[] = [];
  if (a.creditKnowledge !== "known") {
    score -= RULES.confidence.unknownCreditPenalty;
    bits.push("score unknown, so the rate band stays wide");
  }
  if (
    (a.incomeType === "self_employed" || a.incomeType === "informal") &&
    a.variableIncomeShare == null &&
    a.incomeLow == null
  ) {
    score -= RULES.confidence.variableUnansweredPenalty;
    bits.push("variable income not pinned down");
  }
  score = clamp(score, 0.2, RULES.confidence.cap);
  const label = score < 0.5 ? "low" : score < 0.75 ? "medium" : "high";
  const why =
    extra === 0
      ? `Only the must-set was answered. Ranges are wide on purpose (${possible} tightening questions were skipped).`
      : `Must-set plus ${extra} of ${possible} extra questions. ${bits.join("; ") || "Each extra answer narrowed a range."}`;
  return { score, label, why };
}

export function evaluate(a: Answers): Result | { error: string } {
  if (!isMustComplete(a)) {
    return { error: "Answer the must questions first." };
  }

  const wanted = a.amountWanted ?? 0;
  const expenses = a.householdExpenses ?? 0;
  const age = a.age ?? 30;
  const { product, why: productWhy } = routeProduct(a);
  const bucket = creditBucket(a.creditKnowledge, a.creditScore);
  const rates = rateBandFor(product, bucket, a);
  const fee = RULES.processingFeePct[product];
  const tenure = RULES.tenureDefault[product];
  const rateMid = (rates.low + rates.high) / 2;

  const lenderInc = lenderMonthlyIncome(a);
  const safeInc = safeMonthlyIncome(a);
  const debt = existingDebt(a);
  const foirCap = lenderFoirCap(lenderInc);
  const foirRoom = Math.max(0, foirCap * lenderInc - debt);
  const safeFoirRoom = Math.max(0, RULES.safeFoir * safeInc - debt);
  const dependents = a.dependents ?? 0;
  const extraFloor = dependents > 0 ? dependents * 2_000 : 0;
  const residualFloor = RULES.residualFloorShare * safeInc + extraFloor;
  const hoped = (a.extraMonthlyFromLoan ?? 0) * RULES.hopedEarningsHaircut;
  const residualRoom = Math.max(0, safeInc + hoped - expenses - debt - residualFloor);

  let lenderByFoir = maxPrincipal(foirRoom, rateMid, tenure);
  let lenderByMultiple = salaryMultiple(a) * lenderInc;
  const lenderByLtv = ltvCap(product, a.collateralValue ?? 0, wanted);
  const productMax = RULES.productMax[product];

  if (bucket === "never" && (product === "personal" || product === "business_unsecured")) {
    lenderByMultiple *= RULES.thinFileUnsecuredHaircut;
    lenderByFoir *= RULES.thinFileUnsecuredHaircut;
  }
  if ((a.bouncesLast12m ?? 0) >= 1 && (product === "personal" || product === "business_unsecured" || product === "two_wheeler")) {
    lenderByFoir *= RULES.bounceUnsecuredHaircut;
    lenderByMultiple *= RULES.bounceUnsecuredHaircut;
  }

  const unsecured = product === "personal" || product === "business_unsecured";
  const lenderCaps = [lenderByFoir, productMax];
  if (unsecured) lenderCaps.push(lenderByMultiple);
  if (Number.isFinite(lenderByLtv)) lenderCaps.push(lenderByLtv);
  const finiteCaps = lenderCaps.filter((n) => Number.isFinite(n) && n >= 0);
  const lenderMid = roundRupee(Math.max(0, Math.min(...finiteCaps)));

  const purpose = a.purpose ?? "other";
  let safeByFoir = maxPrincipal(safeFoirRoom, rates.high, tenure);
  let safeByResidual = maxPrincipal(residualRoom, rates.high, tenure);
  let safeMid = Math.min(safeByFoir, safeByResidual) * RULES.purposeSafeHaircut[purpose];
  if (a.emergencyMonths != null && a.emergencyMonths < 2) {
    safeMid *= RULES.lowEmergencyHaircut;
  }
  if ((a.upcomingExpenses ?? 0) > 0) {
    safeMid = Math.max(0, safeMid - (a.upcomingExpenses ?? 0) * 0.35);
  }
  safeMid = roundRupee(Math.max(0, safeMid));

  const widen =
    a.creditKnowledge === "known" && extraAnsweredCount(a) >= 3 ? 0.12 : 0.28;
  const lenderAmount = band(lenderMid, widen);
  const safeAmount = band(safeMid, widen + 0.05);

  const useAmount = roundRupee(Math.min(wanted, safeMid, lenderMid || wanted));
  const recommendedEmi = emi(useAmount, rateMid, tenure);
  const emiCeiling = roundRupee(
    Math.max(0, Math.min(safeFoirRoom, residualRoom, emi(safeMid, rates.high, tenure))),
  );

  const stressedIncome = stressedOwnIncome(a) * (a.variableIncomeShare == null ? (a.incomeType === "salaried" ? 1 : 0.9) : 1 - (a.variableIncomeShare / 100) * 0.5) + (a.coApplicantIncome ?? 0);
  const stressResidual = stressedIncome + hoped - expenses - debt - recommendedEmi;
  const rateUpEmi = emi(useAmount, rateMid + RULES.rateStressAddPct, tenure);
  const emiFits = stressResidual >= residualFloor * 0.5 && rateUpEmi <= emiCeiling * 1.15;

  const bounce = a.bouncesLast12m ?? 0;
  const highCost = a.highCostOutstanding ?? 0;
  const highRate = a.highCostRatePct ?? 0;
  const residualNow = safeInc - expenses - debt;
  const consumption =
    purpose === "wedding" || purpose === "consumption" || purpose === "vehicle_personal";

  let verdict: Verdict = "borrow";
  let verdictWhy = "";

  const dontReasons: string[] = [];
  if (age < RULES.minAge) dontReasons.push(`age ${age} is below ${RULES.minAge}`);
  if (bounce >= 1 && (highCost > 0 || a.incomeType === "informal")) {
    dontReasons.push(
      `a bounce in the last year plus ${highCost > 0 ? "costly outstanding debt" : "informal income"} is how formal lenders decline, and how households snowball`,
    );
  }
  if (residualNow <= residualFloor) {
    dontReasons.push(
      `after expenses ${inr(expenses)} and current EMIs ${inr(debt)}, leftover is ${inr(residualNow)} — below the ${inr(residualFloor)} floor we refuse to eat`,
    );
  }
  if (consumption && (a.emergencyMonths != null && a.emergencyMonths < 1) && residualNow < expenses * 0.4) {
    dontReasons.push("consumption borrowing with no cash buffer");
  }
  if (highRate >= 30 && consumption && highCost > 0) {
    dontReasons.push(
      `you already carry ~${inr(highCost)} at ${pct(highRate, 0)}+; a new ${purpose} loan does not fix that`,
    );
  }
  if (useAmount <= 0 && wanted > 0) {
    dontReasons.push("no safe EMI room at a fair rate");
  }

  if (dontReasons.length) {
    verdict = "dont_borrow";
    verdictWhy = `Don't borrow. ${dontReasons[0][0].toUpperCase()}${dontReasons[0].slice(1)}.`;
  } else if (safeMid < wanted * 0.85 || lenderMid < wanted * 0.85 || RULES.purposeSafeHaircut[purpose] <= 0.75) {
    verdict = "borrow_less";
    const bits: string[] = [];
    if (RULES.purposeSafeHaircut[purpose] <= 0.75) {
      bits.push(
        `${purpose.replace("_", " ")} is consumption — we haircut safe capacity to ${Math.round(RULES.purposeSafeHaircut[purpose] * 100)}% so a party does not become a five-year FOIR problem`,
      );
    }
    if (safeMid < wanted) bits.push(`you can safely carry about ${inr(safeMid)}, not ${inr(wanted)}`);
    if (lenderMid < wanted) bits.push(`a typical lender file supports about ${inr(lenderMid)}`);
    verdictWhy = `Borrow less. ${bits.join("; ")}.`;
  } else {
    verdict = "borrow";
    verdictWhy = `Borrow. The amount is inside both the lender's likely sanction (${inr(lenderMid)}) and what you can safely carry (${inr(safeMid)}), on a ${product.replace("_", " ")} structure.`;
  }

  if (verdict === "dont_borrow") {
    // keep numbers visible but recommended take is 0
  }

  const take = verdict === "dont_borrow" ? 0 : useAmount;
  const takeEmi = emi(take || useAmount, rateMid, tenure);

  const lo = round1(rates.low);
  const hi = round1(rates.high);

  let useAmountWhy = `Use ${inr(take)}.`;
  if (verdict === "dont_borrow") {
    useAmountWhy = `The number to walk in with is ${inr(0)} — not a smaller version of ${inr(wanted)}.`;
  } else if (take < lenderMid && take <= safeMid) {
    useAmountWhy = `Use ${inr(take)}: the borrower's safe number, not the lender's ${inr(lenderMid)}. Lenders will often offer more than you should take.`;
  } else if (take < wanted) {
    useAmountWhy = `Use ${inr(take)}: a typical lender file (FOIR / LTV / multiple) is the binding cap, below the ${inr(wanted)} you asked for.`;
  } else {
    useAmountWhy = `Use ${inr(take)}: it sits inside both the lender's likely sanction (${inr(lenderMid)}) and the safe-carry number (${inr(safeMid)}).`;
  }

  const emiCeilingWhy = `Ceiling ${inr(emiCeiling)} is the lower of 35% FOIR on conservative income (${inr(safeFoirRoom)} room) and leftover after expenses plus a ${Math.round(RULES.residualFloorShare * 100)}% residual floor. That is why it is not ${inr(foirRoom)}.`;

  const aprLow = aprPct(Math.max(take, 100_000), rates.low, tenure, fee);
  const aprHigh = aprPct(Math.max(take, 100_000), rates.high, tenure, fee);

  const tenureOptions = RULES.tenureChoices[product].map((months) => {
    const e = emi(take || wanted, rateMid, months);
    return {
      months,
      emi: roundRupee(e),
      note:
        e > emiCeiling
          ? "Above your ceiling"
          : months === tenure
            ? "Recommended"
            : months < tenure
              ? "Dearer monthly, cheaper total interest"
              : "Easier monthly, more interest",
    };
  });

  const warnings: string[] = [];
  if (a.creditKnowledge !== "known") {
    warnings.push("Rate is a band because the score was not given. A bureau pull could move you 3–6 points either way.");
  }
  if (a.incomeType === "self_employed" && a.documentedAnnualIncome == null) {
    warnings.push("No ITR on file: the lender amount is a guess off haircut cash. Documented income would raise sanction, not the reverse.");
  }
  if (product === "lap") {
    warnings.push("LAP needs clear title and usually 2–4 weeks. Do not walk into an unsecured counter for this ticket.");
  }
  if (verdict === "dont_borrow" && hoped > 0) {
    warnings.push(
      `The earning thesis (${inr(a.extraMonthlyFromLoan ?? 0)}/month extra) is real, but sequence matters: clean ${highCost > 0 ? "costly debt" : "the bounce"} first or the scooter loan just stacks 16% on top of 30%.`,
    );
  }

  const quote = a.offerRatePct;
  const ifTheyQuote =
    verdict === "dont_borrow"
      ? "Do not negotiate a rate on a loan you should not take. If you talk at all, ask how to close the 30%+ debt first — a cheaper top-up that leaves the expensive loans in place is not a win."
      : quote != null
        ? quote > hi
          ? `They already quoted ${pct(quote)}. Fair for this file is ${pct(lo)}–${pct(hi)}. Ask them to put the APR (KFS) next to ${pct(aprHigh)} all-in — a headline below fair that hides a ${pct(fee, 1)} fee is not cheaper.`
          : `They quoted ${pct(quote)}, which sits inside or below the fair band ${pct(lo)}–${pct(hi)}. Still ask for the KFS APR and processing fee in writing.`
        : `If they quote above ${pct(hi)}, say: fair for this profile is ${pct(lo)}–${pct(hi)}. Ask for the Key Fact Statement APR, not the wall rate.`;

  const productName =
    product === "lap"
      ? "loan against property"
      : product === "business_unsecured"
        ? "unsecured business loan"
        : product === "two_wheeler"
          ? "two-wheeler loan"
          : product === "gold"
            ? "gold loan"
            : "personal loan";

  const negotiationBullets =
    verdict === "dont_borrow"
      ? [
          `Today: walk out. A bounce plus high-cost debt is not a two-wheeler file.`,
          `If you borrow later, the least-bad product is a ${productName} or gold — never another 30% app loan.`,
          `First job: close ~${inr(highCost)} sitting at ${pct(highRate || 30, 0)}. Then re-run this card.`,
        ]
      : [
          `Product to ask for: ${productName}. ${productWhy}`,
          `Amount to agree: ${inr(take)} (lender may say ${inr(lenderMid)}; you should not take more than ${inr(safeMid)}).`,
          `Rate: ${pct(lo)}–${pct(hi)} reducing. All-in APR with ~${pct(fee, 1)} processing fee + 18% GST: ${pct(aprLow)}–${pct(aprHigh)}.`,
          `EMI not to cross: ${inr(emiCeiling)} (recommended ${inr(roundRupee(takeEmi))} over ${tenure} months).`,
          `Stress: income −${Math.round(RULES.incomeStressDrop * 100)}% leaves residual ${inr(stressResidual)}; rate +${RULES.rateStressAddPct} pts raises EMI to ${inr(roundRupee(rateUpEmi))}. ${emiFits ? "Survivable." : "Not survivable — another reason to cut the ticket."}`,
        ];

  return {
    verdict,
    verdictWhy,
    lenderAmount,
    safeAmount,
    useAmount: take,
    useAmountWhy,
    recommendedProduct: product,
    productWhy,
    rate: {
      low: lo,
      high: hi,
      aprLow: round1(aprLow),
      aprHigh: round1(aprHigh),
      processingFeePct: fee,
    },
    rateWhy: rates.why.join(" "),
    emiCeiling,
    emiCeilingWhy,
    recommendedEmi: roundRupee(takeEmi),
    tenureMonths: tenure,
    tenureOptions,
    stress: {
      label: `Income drops ${Math.round(RULES.incomeStressDrop * 100)}% or rate rises ${RULES.rateStressAddPct} pts`,
      emiFits,
      residual: roundRupee(stressResidual),
      why: emiFits
        ? `Even after a ${Math.round(RULES.incomeStressDrop * 100)}% income dip, about ${inr(stressResidual)} is left once the EMI is paid.`
        : `Under a ${Math.round(RULES.incomeStressDrop * 100)}% income dip, leftover is ${inr(stressResidual)} — the EMI does not fit a bad year.`,
    },
    confidence: confidenceOf(a),
    negotiation: {
      headline:
        verdict === "dont_borrow"
          ? "Do not take this loan. The right quote is no — not a cheaper two-wheeler on top of 30% app debt."
          : `Fair for your profile is ${pct(lo)}–${pct(hi)} on a ${productName}.`,
      bullets: negotiationBullets,
      ifTheyQuote,
    },
    warnings,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function isResult(x: Result | { error: string }): x is Result {
  return !("error" in x);
}





