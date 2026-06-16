import type { DoseCalculation, Medication } from "../types/medication";
import { formatDecimal } from "./format";

export function calculateDose(
  medication: Medication | null,
  patientWeightKg: number
): DoseCalculation | null {
  if (!medication || !patientWeightKg || patientWeightKg <= 0) {
    return null;
  }

  const doseDiariaMg = patientWeightKg * medication.dose_alvo_mg_kg_dia;
  const dosePorTomadaMg = doseDiariaMg / medication.fracionamento_vezes_dia;
  const volumePorTomadaMl = dosePorTomadaMg / medication.concentracao_valor;
  const intervaloHoras = 24 / medication.fracionamento_vezes_dia;
  const frequenciaTexto = `${formatDecimal(intervaloHoras, 0)}/${formatDecimal(intervaloHoras, 0)}`;

  const prescriptionText = [
    "Uso Oral",
    `1. ${medication.nome} (${formatDecimal(medication.concentracao_valor)} ${medication.concentracao_unidade}) ------- 1 Frasco`,
    `   Dar ${formatDecimal(volumePorTomadaMl)} mL por via oral de ${frequenciaTexto} em ${frequenciaTexto} horas.`,
    `   ${medication.texto_prescricao_padrao}`
  ].join("\n");

  return {
    doseDiariaMg,
    dosePorTomadaMg,
    volumePorTomadaMl,
    intervaloHoras,
    frequenciaTexto,
    prescriptionText
  };
}
