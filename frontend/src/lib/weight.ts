import type { PatientAge } from "../types/medication";
import { ageToDays, formatAge } from "./age";
import { formatDecimal } from "./format";

const DAYS_PER_MONTH = 30.4375;

export const ABSOLUTE_MIN_WEIGHT_KG = 0.3;
export const ABSOLUTE_MAX_WEIGHT_KG = 150;

// Plausible weight-for-age band (both sexes): roughly 0.6 × P3 to 1.5 × P97 of the WHO
// (0–5 years) and CDC (5–18 years) curves, widened in the first months for preterm infants.
// It exists to catch typos (decimal slips, wrong age unit), not to classify nutrition.
const WEIGHT_BAND_BY_MONTH: ReadonlyArray<readonly [months: number, minKg: number, maxKg: number]> = [
  [0, 0.4, 6.6],
  [1, 0.6, 8.7],
  [2, 1.0, 10.7],
  [3, 2.0, 12],
  [6, 3.5, 14.7],
  [9, 4.0, 16.5],
  [12, 4.3, 18],
  [18, 4.9, 20.6],
  [24, 5.4, 23],
  [36, 6.5, 27.5],
  [48, 7.4, 31.8],
  [60, 8.2, 36.3],
  [84, 10.5, 49.5],
  [120, 14, 75],
  [144, 17, 95],
  [168, 21, 113],
  [192, 25, 128],
  [216, 28, 143]
];

export type WeightRange = { minKg: number; maxKg: number };

export function plausibleWeightRange(age: PatientAge): WeightRange | null {
  const days = ageToDays(age.value, age.unit);

  if (days === null || days < 0) {
    return null;
  }

  const months = days / DAYS_PER_MONTH;
  const last = WEIGHT_BAND_BY_MONTH[WEIGHT_BAND_BY_MONTH.length - 1];

  if (months >= last[0]) {
    return { minKg: last[1], maxKg: last[2] };
  }

  const upperIndex = WEIGHT_BAND_BY_MONTH.findIndex(([bandMonths]) => bandMonths > months);
  const [m0, min0, max0] = WEIGHT_BAND_BY_MONTH[upperIndex - 1];
  const [m1, min1, max1] = WEIGHT_BAND_BY_MONTH[upperIndex];
  const t = (months - m0) / (m1 - m0);

  return { minKg: min0 + (min1 - min0) * t, maxKg: max0 + (max1 - max0) * t };
}

export function validateWeightForAge(weightKg: number, age: PatientAge): string | null {
  if (!(weightKg > 0)) {
    return null;
  }

  if (weightKg < ABSOLUTE_MIN_WEIGHT_KG || weightKg > ABSOLUTE_MAX_WEIGHT_KG) {
    return `Peso de ${formatDecimal(weightKg)} kg está fora da faixa pediátrica. Confira se foi digitado corretamente.`;
  }

  const range = plausibleWeightRange(age);

  if (!range || (weightKg >= range.minKg && weightKg <= range.maxKg)) {
    return null;
  }

  return `Para ${formatAge(age)}, o esperado fica entre ${formatDecimal(range.minKg, 1)} e ${formatDecimal(range.maxKg, 1)} kg. Confira se o peso e a unidade da idade foram digitados corretamente.`;
}
