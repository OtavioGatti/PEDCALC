import type { DoseCalculation, DoseResult, Medication } from "../types/medication";
import { formatDecimal } from "./format";

const MASS_TO_MG: Record<string, number> = {
  mcg: 0.001,
  "µg": 0.001,
  mg: 1,
  g: 1000
};

const CONCENTRATION_PATTERN = /^(mcg|µg|mg|g)\s*\/\s*(\d+(?:[.,]\d+)?)?\s*ml$/i;

export const SUPPORTED_CONCENTRATION_UNITS = "mg/mL, mg/5 mL, mcg/mL ou g/mL";

export function concentrationMgPerMl(valor: number, unidade: string): number | null {
  const match = unidade.trim().match(CONCENTRATION_PATTERN);

  if (!match || !(valor > 0)) {
    return null;
  }

  const massFactor = MASS_TO_MG[match[1].toLowerCase()];
  const volumeMl = match[2] ? Number(match[2].replace(",", ".")) : 1;

  if (!massFactor || !(volumeMl > 0)) {
    return null;
  }

  return (valor * massFactor) / volumeMl;
}

export function frequencyText(timesPerDay: number) {
  if (timesPerDay === 1) {
    return "1 vez ao dia";
  }

  const intervalHours = 24 / timesPerDay;

  if (Number.isInteger(intervalHours)) {
    return `de ${intervalHours} em ${intervalHours} horas`;
  }

  return `${formatDecimal(timesPerDay)} vezes ao dia`;
}

export function calculateDose(
  medication: Medication | null,
  patientWeightKg: number,
  duration: string
): DoseResult {
  if (!medication || !(patientWeightKg > 0)) {
    return { status: "empty" };
  }

  const mgPerMl = concentrationMgPerMl(medication.concentracao_valor, medication.concentracao_unidade);

  if (mgPerMl === null) {
    return {
      status: "error",
      message: `Não é possível calcular o volume: a unidade de concentração "${medication.concentracao_unidade}" não é suportada. Use ${SUPPORTED_CONCENTRATION_UNITS}.`
    };
  }

  const timesPerDay = medication.fracionamento_vezes_dia;
  const dosePorTomadaCalculadaMg = (patientWeightKg * medication.dose_alvo_mg_kg_dia) / timesPerDay;

  const maxPerDoseLimits = [
    positiveOrNull(medication.dose_max_tomada_mg),
    positiveOrNull(medication.dose_max_dia_mg) !== null
      ? (medication.dose_max_dia_mg as number) / timesPerDay
      : null
  ].filter((limit): limit is number => limit !== null);

  const dosePorTomadaMg = Math.min(dosePorTomadaCalculadaMg, ...maxPerDoseLimits);
  const limitadoPelaDoseMaxima = dosePorTomadaMg < dosePorTomadaCalculadaMg;
  const doseDiariaMg = dosePorTomadaMg * timesPerDay;
  const volumePorTomadaMl = dosePorTomadaMg / mgPerMl;
  const intervaloHoras = 24 / timesPerDay;
  const frequenciaTexto = frequencyText(timesPerDay);
  const viaTexto = getRouteText(medication.via_administracao);
  const usoTitulo = getUseTitle(medication.via_administracao);
  const duracaoTexto = formatTreatmentDuration(duration);
  const duracaoSufixo = duracaoTexto ? ` por ${duracaoTexto}` : "";
  const receita = {
    titulo: usoTitulo,
    item: `${medication.nome} (${formatDecimal(medication.concentracao_valor)} ${medication.concentracao_unidade})`,
    quantidade: "1 Frasco",
    posologia: `Dar ${formatDecimal(volumePorTomadaMl)} mL por ${viaTexto} ${frequenciaTexto}${duracaoSufixo}.`,
    observacao: cleanPrescriptionNote(medication.texto_prescricao_padrao)
  };

  const prescriptionText = [
    receita.titulo,
    `1. ${receita.item} ------- ${receita.quantidade}`,
    `   ${receita.posologia}`,
    receita.observacao ? `   ${receita.observacao}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const calculation: DoseCalculation = {
    doseDiariaMg,
    dosePorTomadaMg,
    dosePorTomadaCalculadaMg,
    limitadoPelaDoseMaxima,
    volumePorTomadaMl,
    intervaloHoras,
    frequenciaTexto,
    viaTexto,
    usoTitulo,
    duracaoTexto,
    receita,
    prescriptionText
  };

  return { status: "ok", calculation };
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

function positiveOrNull(value: number | null | undefined) {
  return typeof value === "number" && value > 0 ? value : null;
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
