import { describe, expect, it } from "vitest";
import { evaluate, isResult } from "./evaluate";
import { PERSONAS } from "./personas";
import { nextQuestion, visibleQuestions } from "./questions";
import { aprPct, emi } from "./money";

describe("money", () => {
  it("computes a known EMI", () => {
    const e = emi(800_000, 12, 48);
    expect(e).toBeGreaterThan(20_000);
    expect(e).toBeLessThan(22_000);
  });

  it("APR is above headline once a fee is added", () => {
    const apr = aprPct(800_000, 12, 48, 2);
    expect(apr).toBeGreaterThan(12);
    expect(apr).toBeLessThan(15);
  });
});

describe("adaptive questions", () => {
  it("does not ask ITR of a salaried borrower", () => {
    const ids = visibleQuestions({ incomeType: "salaried" }).map((q) => q.id);
    expect(ids).not.toContain("documentedAnnualIncome");
    expect(ids).toContain("employerTier");
  });

  it("asks collateral and ITR of a self-employed borrower", () => {
    const ids = visibleQuestions({
      incomeType: "self_employed",
      productHint: "business",
      amountWanted: 1_500_000,
      monthlyIncome: 60_000,
      creditKnowledge: "never_borrowed",
    }).map((q) => q.id);
    expect(ids).toContain("documentedAnnualIncome");
    expect(ids).toContain("collateralKind");
    expect(ids).not.toContain("employerTier");
  });

  it("starts with purpose", () => {
    expect(nextQuestion({})?.id).toBe("purpose");
  });
});

describe("personas", () => {
  it("Priya: borrow less, personal, lender > safe, prime-ish rate", () => {
    const r = evaluate(PERSONAS[0].answers);
    expect(isResult(r)).toBe(true);
    if (!isResult(r)) return;
    expect(r.verdict).toBe("borrow_less");
    expect(r.recommendedProduct).toBe("personal");
    expect(r.lenderAmount.mid).toBeGreaterThan(r.safeAmount.mid);
    expect(r.useAmount).toBeLessThan(800_000);
    expect(r.useAmount).toBeGreaterThan(0);
    expect(r.rate.low).toBeGreaterThanOrEqual(9.5);
    expect(r.rate.high).toBeLessThanOrEqual(14);
    expect(r.rate.aprLow).toBeGreaterThan(r.rate.low);
    expect(r.verdictWhy.toLowerCase()).toContain("wedding");
  });

  it("Ravi: borrow via LAP, not unsecured, unknown score is not 300", () => {
    const r = evaluate(PERSONAS[1].answers);
    expect(isResult(r)).toBe(true);
    if (!isResult(r)) return;
    expect(r.verdict).toBe("borrow");
    expect(r.recommendedProduct).toBe("lap");
    expect(r.lenderAmount.mid).toBeGreaterThanOrEqual(1_000_000);
    expect(r.rate.high).toBeLessThan(16);
    expect(r.rateWhy.toLowerCase()).toMatch(/never|no bureau|thin/);
    expect(r.productWhy.toLowerCase()).toMatch(/property|lap/);
  });

  it("Anita: don't borrow is reachable and fires", () => {
    const r = evaluate(PERSONAS[2].answers);
    expect(isResult(r)).toBe(true);
    if (!isResult(r)) return;
    expect(r.verdict).toBe("dont_borrow");
    expect(r.useAmount).toBe(0);
    expect(r.verdictWhy.toLowerCase()).toMatch(/don/);
    expect(r.stress.emiFits).toBe(false);
  });
  it("zero FOIR room binds lender amount to 0, not the salary multiple", () => {
    const r = evaluate({
      ...PERSONAS[0].answers,
      existingEmis: 80_000,
      highCostOutstanding: 0,
    });
    expect(isResult(r)).toBe(true);
    if (!isResult(r)) return;
    expect(r.lenderAmount.mid).toBe(0);
  });

  it("does not add implied high-cost EMI when existing EMIs already include them", () => {
    const withBoth = evaluate({
      ...PERSONAS[0].answers,
      existingEmis: 20_000,
      highCostOutstanding: 200_000,
      highCostRatePct: 36,
      purpose: "refinance",
      amountWanted: 200_000,
    });
    const emisOnly = evaluate({
      ...PERSONAS[0].answers,
      existingEmis: 20_000,
      highCostOutstanding: 0,
      purpose: "refinance",
      amountWanted: 200_000,
    });
    expect(isResult(withBoth) && isResult(emisOnly)).toBe(true);
    if (!isResult(withBoth) || !isResult(emisOnly)) return;
    expect(withBoth.lenderAmount.mid).toBe(emisOnly.lenderAmount.mid);
  });
});

