import type { Medication } from "../types/medication";

export function makeMedication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: "dipirona-teste",
    nome: "Dipirona",
    principio_ativo: "Dipirona monoidratada",
    concentracao_valor: 500,
    concentracao_unidade: "mg/mL",
    idade_min_valor: 3,
    idade_min_unidade: "Meses",
    idade_max_valor: null,
    idade_max_unidade: null,
    alerta_restricao: "Evitar em menores de 3 meses.",
    dose_alvo_mg_kg_dia: 60,
    dose_max_tomada_mg: null,
    dose_max_dia_mg: null,
    fracionamento_vezes_dia: 4,
    via_administracao: "VO",
    duracao_tratamento_padrao: "",
    tags_busca: "",
    texto_prescricao_padrao: "",
    ...overrides
  };
}
