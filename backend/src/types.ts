export type UnidadeIdade = "Dias" | "Meses" | "Anos";

export type Medicamento = {
  notion_page_id: string;
  nome: string;
  principio_ativo: string;
  concentracao_valor: number;
  concentracao_unidade: string;
  idade_min_valor: number | null;
  idade_min_unidade: UnidadeIdade | null;
  idade_max_valor: number | null;
  idade_max_unidade: UnidadeIdade | null;
  alerta_restricao: string | null;
  dose_alvo_mg_kg_dia: number;
  fracionamento_vezes_dia: number;
  texto_prescricao_padrao: string;
  synced_at: string;
};
