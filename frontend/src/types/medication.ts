export type AgeUnit = "Dias" | "Meses" | "Anos";

export type Medication = {
  id: string;
  notion_page_id?: string;
  nome: string;
  principio_ativo: string;
  concentracao_valor: number;
  concentracao_unidade: string;
  idade_min_valor: number | null;
  idade_min_unidade: AgeUnit | null;
  idade_max_valor: number | null;
  idade_max_unidade: AgeUnit | null;
  alerta_restricao: string | null;
  dose_alvo_mg_kg_dia: number;
  fracionamento_vezes_dia: number;
  texto_prescricao_padrao: string;
};

export type PatientAge = {
  value: number;
  unit: AgeUnit;
};

export type DoseCalculation = {
  doseDiariaMg: number;
  dosePorTomadaMg: number;
  volumePorTomadaMl: number;
  intervaloHoras: number;
  frequenciaTexto: string;
  prescriptionText: string;
};
