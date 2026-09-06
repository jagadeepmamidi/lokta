import type { Answers, Question } from "./types";

const answered = (v: unknown) => v !== undefined;

export const QUESTIONS: Question[] = [
  {
    id: "purpose",
    must: true,
    title: "What do you need the money for?",
    help: "Purpose decides whether this is a loan that can earn, or one you just have to carry.",
    moves: "Verdict and the safe-amount haircut",
    kind: "choice",
    showIf: () => true,
    options: [
      { value: "wedding", label: "Wedding or family function" },
      { value: "consumption", label: "Spending — travel, gadgets, other" },
      { value: "education", label: "Education" },
      { value: "medical", label: "Medical" },
      { value: "vehicle_personal", label: "Personal vehicle" },
      { value: "vehicle_work", label: "Vehicle that will earn (delivery, taxi)" },
      { value: "business_stock", label: "Business — stock or working capital" },
      { value: "business_asset", label: "Business — equipment or shop" },
      { value: "home", label: "Home purchase or repair" },
      { value: "refinance", label: "Pay off costlier loans" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    id: "amountWanted",
    must: true,
    title: "How much do you want to borrow?",
    help: "Ask for the number in your head. We will tell you if that number is the wrong one.",
    moves: "Both amount outputs and the EMI ceiling",
    kind: "rupees",
    showIf: () => true,
  },
  {
    id: "productHint",
    must: true,
    title: "What kind of loan are you walking in for?",
    help: "If you are not sure, say so. We will still pick a product from your answers.",
    moves: "Product routing and the fair-rate band",
    kind: "choice",
    showIf: () => true,
    options: [
      { value: "personal", label: "Personal loan — no collateral" },
      { value: "business", label: "Business loan" },
      { value: "two_wheeler", label: "Two-wheeler loan" },
      { value: "gold", label: "Gold loan" },
      { value: "property", label: "Against property / LAP" },
      { value: "unsure", label: "I am not sure yet" },
    ],
  },
  {
    id: "incomeType",
    must: true,
    title: "How do you earn?",
    help: "Lenders treat a salary slip, an ITR, and cash income as three different stories.",
    moves: "Lender amount, rate, and which questions come next",
    kind: "choice",
    showIf: () => true,
    options: [
      { value: "salaried", label: "Salaried — payslip / bank salary" },
      { value: "self_employed", label: "Self-employed — business or profession" },
      { value: "informal", label: "Informal / gig / cash, little paperwork" },
    ],
  },
  {
    id: "monthlyIncome",
    must: true,
    title: "What is your net monthly income?",
    help: "Take-home, after PF and tax. If income jumps around, give a typical recent month.",
    moves: "FOIR, both amounts, EMI ceiling",
    kind: "rupees",
    showIf: () => true,
  },
  {
    id: "existingEmis",
    must: true,
    title: "What do you already pay in EMIs each month?",
    help: "Car, home, gold, app loans, and the minimum due on cards. Rent is not an EMI — we ask expenses next.",
    moves: "FOIR room for a new loan",
    kind: "rupees",
    showIf: () => true,
  },
  {
    id: "householdExpenses",
    must: true,
    title: "What does the household spend in a normal month?",
    help: "Rent, food, school, travel, help. Not EMIs — those are above. If you skip this we will not pretend expenses are zero.",
    moves: "Safe amount and residual after EMI",
    kind: "rupees",
    showIf: () => true,
  },
  {
    id: "age",
    must: true,
    title: "How old are you?",
    help: "Tenure and some products stop before typical retirement ages.",
    moves: "Max tenure and unsecured eligibility",
    kind: "number",
    suffix: "years",
    showIf: () => true,
  },
  {
    id: "credit",
    must: true,
    title: "Do you know your credit score?",
    help: "CIBIL / Experian / CRIF, roughly. “I don’t know” is not a 300 — we will keep the rate band wide.",
    moves: "Fair-rate band and unsecured lender amount",
    kind: "credit",
    showIf: () => true,
  },
  {
    id: "yearsEarning",
    must: false,
    title: "How many years have you been in this job or business?",
    help: "Stability is one of the few things a branch manager actually prices.",
    moves: "Rate (−0.5 to +1.5 pts) and unsecured multiple",
    kind: "number",
    suffix: "years",
    allowUnknown: true,
    showIf: () => true,
  },
  {
    id: "employerTier",
    must: false,
    title: "What kind of employer?",
    help: "MNC / listed / government files clear faster and cheaper than a small private firm.",
    moves: "Personal-loan rate and salary multiple",
    kind: "choice",
    allowUnknown: true,
    showIf: (a) => a.incomeType === "salaried",
    options: [
      { value: "mnc_listed", label: "Large MNC or listed company" },
      { value: "govt", label: "Government / PSU / bank" },
      { value: "sme", label: "Small or mid-size private company" },
      { value: "other", label: "Other / startup / unclear" },
    ],
  },
  {
    id: "documentedAnnualIncome",
    must: false,
    title: "What income did you declare on last year’s ITR?",
    help: "Lenders underwrite the ITR, not the cash in the till. If you don’t file, skip.",
    moves: "Lender amount (often far below cash income)",
    kind: "rupees",
    allowUnknown: true,
    showIf: (a) => a.incomeType === "self_employed",
  },
  {
    id: "incomeLow",
    must: false,
    title: "In a bad month, how low can income fall?",
    help: "We size the safe EMI off the bad month, not the good one.",
    moves: "Safe amount and the income-drop stress case",
    kind: "rupees",
    allowUnknown: true,
    showIf: (a) => a.incomeType === "self_employed" || a.incomeType === "informal",
  },
  {
    id: "variableIncomeShare",
    must: false,
    title: "How much of your income is variable — overtime, commission, cash?",
    help: "Lenders often ignore the variable slice. We haircut it for the safe number.",
    moves: "Safe amount (haircut on the variable share)",
    kind: "percent",
    allowUnknown: true,
    showIf: (a) => a.incomeType !== "salaried" || a.employerTier === "other",
  },
  {
    id: "dependents",
    must: false,
    title: "How many people depend on this income?",
    help: "More dependents raise the residual we refuse to eat into.",
    moves: "Safe residual floor and EMI ceiling",
    kind: "number",
    suffix: "people",
    allowUnknown: true,
    showIf: (a) =>
      a.incomeType === "informal" ||
      ((a.monthlyIncome ?? 0) > 0 && (a.householdExpenses ?? 0) / (a.monthlyIncome ?? 1) > 0.4),
  },
  {
    id: "bouncesLast12m",
    must: false,
    title: "EMI or NACH bounces in the last 12 months?",
    help: "One bounce is a story. A recent bounce is often a decline on unsecured paper.",
    moves: "Verdict (Don’t borrow) and lender amount",
    kind: "number",
    suffix: "bounces",
    allowUnknown: true,
    showIf: (a) =>
      a.creditKnowledge !== "known" ||
      (a.creditScore != null && a.creditScore < 750) ||
      a.incomeType === "informal" ||
      (a.existingEmis ?? 0) > 0,
  },
  {
    id: "emergencyMonths",
    must: false,
    title: "How many months of expenses do you have in savings?",
    help: "A loan with no cash buffer is how a wedding or a sick month becomes default.",
    moves: "Verdict and a haircut on safe amount",
    kind: "number",
    suffix: "months",
    allowUnknown: true,
    showIf: (a) =>
      a.purpose === "wedding" ||
      a.purpose === "consumption" ||
      a.purpose === "medical" ||
      a.incomeType === "informal",
  },
  {
    id: "collateralKind",
    must: false,
    title: "Do you have collateral you could pledge?",
    help: "Property or gold can move you from a 22% personal loan to an 11% secured one.",
    moves: "Product (LAP / gold) and lender amount via LTV",
    kind: "choice",
    allowUnknown: true,
    showIf: (a) =>
      a.productHint === "gold" ||
      a.productHint === "property" ||
      a.incomeType === "self_employed" ||
      a.creditKnowledge === "never_borrowed" ||
      (a.amountWanted ?? 0) > (a.monthlyIncome ?? 0) * 10,
    options: [
      { value: "none", label: "Nothing I would pledge" },
      { value: "property", label: "House, shop, or land (clear title)" },
      { value: "gold", label: "Gold jewellery" },
    ],
  },
  {
    id: "collateralValue",
    must: false,
    title: "Rough market value of that collateral?",
    help: "Your estimate is fine. We apply a conservative LTV, not 100%.",
    moves: "Lender amount (LTV cap)",
    kind: "rupees",
    allowUnknown: true,
    showIf: (a) => a.collateralKind === "property" || a.collateralKind === "gold",
  },
  {
    id: "coApplicantIncome",
    must: false,
    title: "Does a spouse or parent have monthly income that can join the file?",
    help: "A co-applicant is often the difference between a decline and a sanction for small businesses.",
    moves: "Lender income and safe residual",
    kind: "rupees",
    allowUnknown: true,
    showIf: (a) => a.incomeType === "self_employed" || a.incomeType === "informal",
  },
  {
    id: "extraMonthlyFromLoan",
    must: false,
    title: "If this loan works, how much extra could you earn a month?",
    help: "We only count half of hoped earnings. Optimism is not collateral.",
    moves: "Verdict (productive vs consumption) and safe EMI room",
    kind: "rupees",
    allowUnknown: true,
    showIf: (a) =>
      a.purpose === "business_stock" ||
      a.purpose === "business_asset" ||
      a.purpose === "vehicle_work",
  },
  {
    id: "highCostOutstanding",
    must: false,
    title: "How much do you still owe on app / payday / 24%+ loans?",
    help: "Outstanding only — if you already put those EMIs in the EMI question, we will not add a second EMI. This is for the 24%+ refinance / don`t-borrow path.",
    moves: "Implied existing EMI and Don’t-borrow / refinance path",
    kind: "rupees",
    allowUnknown: true,
    showIf: (a) => a.incomeType === "informal" || (a.existingEmis ?? 0) > 0,
  },
  {
    id: "highCostRatePct",
    must: false,
    title: "About what interest are those expensive loans charging?",
    help: "If this is 24%+ and you want a new consumption loan, we will say no.",
    moves: "Whether refinance is the only sensible borrow",
    kind: "percent",
    allowUnknown: true,
    showIf: (a) => (a.highCostOutstanding ?? 0) > 0,
  },
  {
    id: "upcomingExpenses",
    must: false,
    title: "Any large cash need in the next 6 months besides this loan?",
    help: "A wedding has more bills than the venue. We hold back safe capacity for them.",
    moves: "Safe amount (capacity reserved)",
    kind: "rupees",
    allowUnknown: true,
    showIf: (a) => a.purpose === "wedding" || a.purpose === "consumption",
  },
  {
    id: "cardUtilisation",
    must: false,
    title: "About what percent of your credit-card limit is drawn?",
    help: "High utilisation is a silent FOIR. Lenders see it even if you pay in full some months.",
    moves: "Rate (+0 to +2 pts) and a FOIR add-on",
    kind: "percent",
    allowUnknown: true,
    showIf: (a) => a.incomeType === "salaried" && a.creditKnowledge === "known",
  },
  {
    id: "offerRatePct",
    must: false,
    title: "Has a lender already quoted you a rate?",
    help: "Optional. If yes, the card will compare that quote to a fair band.",
    moves: "Negotiation card comparison line",
    kind: "percent",
    allowUnknown: true,
    showIf: () => true,
  },
];

export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => q.showIf(answers));
}

export function nextQuestion(answers: Answers): Question | undefined {
  return visibleQuestions(answers).find((q) => {
    if (q.id === "credit") return !answered(answers.creditKnowledge);
    return !answered(answers[q.id as keyof Answers]);
  });
}

export function isMustComplete(answers: Answers): boolean {
  return QUESTIONS.filter((q) => q.must).every((q) => {
    if (q.id === "credit") return answered(answers.creditKnowledge);
    return answered(answers[q.id as keyof Answers]);
  });
}

export function extraAnsweredCount(answers: Answers): number {
  return QUESTIONS.filter((q) => !q.must && q.showIf(answers)).filter((q) => {
    const v = answers[q.id as keyof Answers];
    return v !== undefined && v !== null;
  }).length;
}

export function extraPossibleCount(answers: Answers): number {
  return QUESTIONS.filter((q) => !q.must && q.showIf(answers)).length;
}

