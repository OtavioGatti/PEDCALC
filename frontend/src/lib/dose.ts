import type { DoseCalculation, Medication } from "../types/medication";
import { formatDecimal } from "./format";

export function calculateDose(
  medication: Medication | null,
  patientWeightKg: number,
  duration: string
): DoseCalculation | null {
  if (!medication || !patientWeightKg || patientWeightKg <= 0) {
    return null;
  }

  const doseDiariaMg = patientWeightKg * medication.dose_alvo_mg_kg_dia;
  const dosePorTomadaMg = doseDiariaMg / medication.fracionamento_vezes_dia;
  const volumePorTomadaMl = dosePorTomadaMg / medication.concentracao_valor;
  const intervaloHoras = 24 / medication.fracionamento_vezes_dia;
  const frequenciaTexto = `${formatDecimal(intervaloHoras, 0)}/${formatDecimal(intervaloHoras, 0)}`;
  const viaTexto = getRouteText(medication.via_administracao);
  const usoTitulo = getUseTitle(medication.via_administracao);
  const duracaoTexto = formatTreatmentDuration(duration);
  const duracaoSufixo = duracaoTexto ? ` por ${duracaoTexto}` : "";

  const prescriptionText = [
    usoTitulo,
    `1. ${medication.nome} (${formatDecimal(medication.concentracao_valor)} ${medication.concentracao_unidade}) ------- 1 Frasco`,
    `   Dar ${formatDecimal(volumePorTomadaMl)} mL por ${viaTexto} de ${frequenciaTexto} em ${frequenciaTexto} horas${duracaoSufixo}.`,
    cleanPrescriptionNote(medication.texto_prescricao_padrao)
      ? `   ${cleanPrescriptionNote(medication.texto_prescricao_padrao)}`
      : ""
  ]
    .filter(Boolean)
    .join("\n");

  return {
    doseDiariaMg,
    dosePorTomadaMg,
    volumePorTomadaMl,
    intervaloHoras,
    frequenciaTexto,
    viaTexto,
    usoTitulo,
    duracaoTexto,
    prescriptionText
  };
}

export function formatTreatmentDuration(duration: string) {
  const trimmed = duration.trim();

  if (!trimmed) {
    return "";
  }

  if (/^\d+(?:[,.]\d+)?$/.test(trimmed)) {
    return `${trimmed} dias`;
  }

  return trimmed;
}

function cleanPrescriptionNote(note: string) {
  return note
    .replace(/administrar\s+por\s+\d+\s+dias?\.?\s*/i, "")
    .replace(/usar\s+por\s+\d+\s+dias?\.?\s*/i, "")
    .trim();
}

function getRouteText(route: string) {
  const normalized = route.toUpperCase();

  if (normalized === "EV") return "via endovenosa";
  if (normalized === "IM") return "via intramuscular";
  if (normalized === "SC") return "via subcutânea";
  if (normalized === "IN") return "via inalatória";

  return "via oral";
}

function getUseTitle(route: string) {
  const normalized = route.toUpperCase();

  if (normalized === "EV") return "Uso Endovenoso";
  if (normalized === "IM") return "Uso Intramuscular";
  if (normalized === "SC") return "Uso Subcutâneo";
  if (normalized === "IN") return "Uso Inalatório";

  return "Uso Oral";
}
