import type { CreditKnowledge, Purpose, RecommendedProduct } from "./types";

/**
 * Every threshold lives here so a follow-up can change a rule without hunting UI.
 * Sources cited in RULES.md.
 */
export const RULES = {
  gstOnFees: 0.18,
  incomeStressDrop: 0.2,
  rateStressAddPct: 3,
  safeFoir: 0.35,
  residualFloorShare: 0.15,
  coApplicantLenderHaircut: 0.7,
  hopedEarningsHaircut: 0.5,
  undocumentedCashHaircut: 0.6,
  informalLenderHaircut: 0.55,
  unknownCreditWiden: 2.5,
  bounceUnsecuredHaircut: 0.15,
  thinFileUnsecuredHaircut: 0.55,
  lowEmergencyHaircut: 0.8,
  consumptionSafeIfFoirOver: 0.4,
  minAge: 21,
  maxAgeUnsecured: 58,
  maxAgeSecured: 65,

  foirLender: [
    { upTo: 25_000, cap: 0.4 },
    { upTo: 50_000, cap: 0.45 },
    { upTo: 100_000, cap: 0.5 },
    { upTo: Infinity, cap: 0.55 },
  ] as const,

  purposeSafeHaircut: {
    wedding: 0.55,
    consumption: 0.5,
    vehicle_personal: 0.75,
    education: 0.85,
    medical: 0.9,
    vehicle_work: 1,
    business_stock: 1,
    business_asset: 1,
    home: 0.95,
    refinance: 1,
    other: 0.7,
  } satisfies Record<Purpose, number>,

  salaryMultiple: {
    salaried_mnc: 22,
    salaried_govt: 24,
    salaried_sme: 16,
    salaried_other: 14,
    self_employed_documented: 10,
    self_employed_cash: 6,
    informal_unsecured: 4,
  },

  ltv: {
    lap: 0.5,
    twoWheeler: 0.85,
    goldSmall: 0.85,
    goldMid: 0.8,
    goldLarge: 0.75,
    goldSmallUpto: 250_000,
    goldMidUpto: 500_000,
  },

  productMax: {
    personal: 4_000_000,
    business_unsecured: 2_000_000,
    lap: 7_500_000,
    gold: 5_000_000,
    two_wheeler: 250_000,
    none: 0,
  } satisfies Record<RecommendedProduct, number>,

  tenureDefault: {
    personal: 48,
    business_unsecured: 36,
    lap: 120,
    gold: 12,
    two_wheeler: 36,
    none: 12,
  } satisfies Record<RecommendedProduct, number>,

  tenureChoices: {
    personal: [24, 36, 48, 60],
    business_unsecured: [24, 36, 48],
    lap: [60, 84, 120, 180],
    gold: [6, 12, 24],
    two_wheeler: [24, 36, 48],
    none: [12],
  } satisfies Record<RecommendedProduct, number[]>,

  processingFeePct: {
    personal: 2,
    business_unsecured: 2.5,
    lap: 1,
    gold: 0.5,
    two_wheeler: 1.5,
    none: 0,
  } satisfies Record<RecommendedProduct, number>,

  rates: {
    personal: {
      prime: [10.5, 12.5],
      strong: [12, 14.5],
      fair: [14.5, 18],
      weak: [18, 22],
      poor: [22, 28],
      unknown: [12, 20],
      never: [14, 22],
    },
    business_unsecured: {
      prime: [14, 18],
      strong: [16, 20],
      fair: [18, 24],
      weak: [22, 28],
      poor: [26, 32],
      unknown: [18, 28],
      never: [20, 30],
    },
    lap: {
      prime: [9.75, 11.5],
      strong: [10.5, 12.5],
      fair: [11.5, 13.5],
      weak: [12.5, 14.5],
      poor: [13.5, 16],
      unknown: [10.5, 13.5],
      never: [10.75, 13.5],
    },
    gold: {
      prime: [9, 12],
      strong: [9.5, 13],
      fair: [10, 14],
      weak: [11, 15],
      poor: [12, 16],
      unknown: [9.5, 14],
      never: [9.5, 14],
    },
    two_wheeler: {
      prime: [11, 14],
      strong: [12, 15.5],
      fair: [14, 18],
      weak: [16, 22],
      poor: [20, 26],
      unknown: [13, 20],
      never: [14, 22],
    },
    none: {
      prime: [0, 0],
      strong: [0, 0],
      fair: [0, 0],
      weak: [0, 0],
      poor: [0, 0],
      unknown: [0, 0],
      never: [0, 0],
    },
  } as const,

  confidence: {
    mustBase: 0.38,
    extraEach: 0.07,
    unknownCreditPenalty: 0.08,
    variableUnansweredPenalty: 0.05,
    cap: 0.92,
  },
} as const;

export type CreditBucket =
  | "prime"
  | "strong"
  | "fair"
  | "weak"
  | "poor"
  | "unknown"
  | "never";

export function lenderFoirCap(monthlyIncome: number): number {
  for (const row of RULES.foirLender) {
    if (monthlyIncome <= row.upTo) return row.cap;
  }
  return 0.5;
}

export function goldLtv(amount: number): number {
  if (amount <= RULES.ltv.goldSmallUpto) return RULES.ltv.goldSmall;
  if (amount <= RULES.ltv.goldMidUpto) return RULES.ltv.goldMid;
  return RULES.ltv.goldLarge;
}

export function creditBucket(
  knowledge: CreditKnowledge | undefined,
  score: number | null | undefined,
): CreditBucket {
  if (knowledge === "never_borrowed") return "never";
  if (knowledge !== "known" || score == null) return "unknown";
  if (score >= 760) return "prime";
  if (score >= 720) return "strong";
  if (score >= 680) return "fair";
  if (score >= 650) return "weak";
  return "poor";
}



