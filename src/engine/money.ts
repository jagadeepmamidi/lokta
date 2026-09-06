import { RULES } from "./rules";

export function emi(principal: number, annualPct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualPct <= 0) return principal / months;
  const r = annualPct / 12 / 100;
  const pow = (1 + r) ** months;
  return (principal * r * pow) / (pow - 1);
}

export function maxPrincipal(emiCap: number, annualPct: number, months: number): number {
  if (emiCap <= 0 || months <= 0) return 0;
  if (annualPct <= 0) return emiCap * months;
  const r = annualPct / 12 / 100;
  const pow = (1 + r) ** months;
  return (emiCap * (pow - 1)) / (r * pow);
}

/** Reducing-balance APR including processing fee + GST, Newton on closed-form NPV. */
export function aprPct(
  principal: number,
  annualPct: number,
  months: number,
  feePct: number,
  gst = RULES.gstOnFees,
): number {
  if (principal <= 0 || months <= 0) return 0;
  const fee = principal * (feePct / 100) * (1 + gst);
  const net = principal - fee;
  const instalment = emi(principal, annualPct, months);
  if (net <= 0) return annualPct + feePct * 12;
  const npv = (i: number) => {
    if (Math.abs(i) < 1e-12) return -net + instalment * months;
    return -net + (instalment * (1 - (1 + i) ** -months)) / i;
  };
  const dnpv = (i: number) => {
    const h = 1e-7;
    return (npv(i + h) - npv(i - h)) / (2 * h);
  };
  let i = annualPct / 12 / 100;
  for (let n = 0; n < 40; n++) {
    const f = npv(i);
    const df = dnpv(i);
    if (!Number.isFinite(df) || Math.abs(df) < 1e-14) break;
    const next = i - f / df;
    if (!Number.isFinite(next) || next <= -0.9) break;
    if (Math.abs(next - i) < 1e-10) {
      i = next;
      break;
    }
    i = next;
  }
  return Math.max(annualPct, i * 12 * 100);
}

export function roundRupee(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n < 1_000) return Math.round(n / 10) * 10;
  if (n < 100_000) return Math.round(n / 1_000) * 1_000;
  return Math.round(n / 5_000) * 5_000;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}
