export type IncomeType = "salaried" | "self_employed" | "informal";

export type Purpose =
  | "wedding"
  | "consumption"
  | "education"
  | "medical"
  | "vehicle_personal"
  | "vehicle_work"
  | "business_stock"
  | "business_asset"
  | "home"
  | "refinance"
  | "other";

export type ProductHint =
  | "personal"
  | "business"
  | "two_wheeler"
  | "gold"
  | "property"
  | "unsure";

export type RecommendedProduct =
  | "personal"
  | "business_unsecured"
  | "lap"
  | "gold"
  | "two_wheeler"
  | "none";

export type CreditKnowledge = "known" | "unknown" | "never_borrowed";
export type EmployerTier = "mnc_listed" | "govt" | "sme" | "other";
export type CollateralKind = "none" | "property" | "gold";
export type Verdict = "borrow" | "borrow_less" | "dont_borrow";

/** null means unknown — never treat as zero. */
export interface Answers {
  purpose?: Purpose;
  amountWanted?: number;
  productHint?: ProductHint;
  incomeType?: IncomeType;
  monthlyIncome?: number;
  incomeLow?: number | null;
  existingEmis?: number;
  householdExpenses?: number;
  age?: number;
  creditScore?: number | null;
  creditKnowledge?: CreditKnowledge;
  yearsEarning?: number | null;
  employerTier?: EmployerTier | null;
  documentedAnnualIncome?: number | null;
  variableIncomeShare?: number | null;
  cardUtilisation?: number | null;
  bouncesLast12m?: number | null;
  emergencyMonths?: number | null;
  collateralKind?: CollateralKind | null;
  collateralValue?: number | null;
  coApplicantIncome?: number | null;
  upcomingExpenses?: number | null;
  extraMonthlyFromLoan?: number | null;
  highCostOutstanding?: number | null;
  highCostRatePct?: number | null;
  dependents?: number | null;
  offerRatePct?: number | null;
}

export interface AmountBand {
  low: number;
  mid: number;
  high: number;
}

export interface RateBand {
  low: number;
  high: number;
  aprLow: number;
  aprHigh: number;
  processingFeePct: number;
}

export interface TenureOption {
  months: number;
  emi: number;
  note: string;
}

export interface Result {
  verdict: Verdict;
  verdictWhy: string;
  lenderAmount: AmountBand;
  safeAmount: AmountBand;
  useAmount: number;
  useAmountWhy: string;
  recommendedProduct: RecommendedProduct;
  productWhy: string;
  rate: RateBand;
  rateWhy: string;
  emiCeiling: number;
  emiCeilingWhy: string;
  recommendedEmi: number;
  tenureMonths: number;
  tenureOptions: TenureOption[];
  stress: { label: string; emiFits: boolean; residual: number; why: string };
  confidence: { score: number; label: "low" | "medium" | "high"; why: string };
  negotiation: { headline: string; bullets: string[]; ifTheyQuote: string };
  warnings: string[];
}

export interface QuestionOption {
  value: string;
  label: string;
}

export type FieldKind =
  | "choice"
  | "rupees"
  | "number"
  | "percent"
  | "score"
  | "credit";

export interface Question {
  id: keyof Answers | "credit";
  must: boolean;
  title: string;
  help: string;
  moves: string;
  kind: FieldKind;
  suffix?: string;
  options?: QuestionOption[];
  allowUnknown?: boolean;
  showIf: (a: Answers) => boolean;
}
