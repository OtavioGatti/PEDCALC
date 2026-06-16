import type { AgeUnit, Medication, PatientAge } from "../types/medication";

const DAYS_BY_UNIT: Record<AgeUnit, number> = {
  Dias: 1,
  Meses: 30.4375,
  Anos: 365.25
};

export function ageToDays(value: number | null, unit: AgeUnit | null): number | null {
  if (value === null || unit === null || Number.isNaN(value)) {
    return null;
  }

  return value * DAYS_BY_UNIT[unit];
}

export function validateMedicationAge(medication: Medication | null, age: PatientAge) {
  if (!medication || !age.value) {
    return { isRestricted: false, message: null };
  }

  const patientDays = ageToDays(age.value, age.unit);
  const minDays = ageToDays(medication.idade_min_valor, medication.idade_min_unidade);
  const maxDays = ageToDays(medication.idade_max_valor, medication.idade_max_unidade);

  const belowMin = minDays !== null && patientDays !== null && patientDays < minDays;
  const aboveMax = maxDays !== null && patientDays !== null && patientDays > maxDays;

  if (!belowMin && !aboveMax) {
    return { isRestricted: false, message: null };
  }

  return {
    isRestricted: true,
    message:
      medication.alerta_restricao ??
      "Idade fora da faixa recomendada para este medicamento. Confirme a prescrição."
  };
}
