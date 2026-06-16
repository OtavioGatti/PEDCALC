import type { Medication } from "../types/medication";

export const seedMedications: Medication[] = [
  {
    id: "amoxicilina-250-5ml",
    nome: "Amoxicilina",
    principio_ativo: "Amoxicilina",
    concentracao_valor: 50,
    concentracao_unidade: "mg/mL",
    idade_min_valor: 3,
    idade_min_unidade: "Meses",
    idade_max_valor: null,
    idade_max_unidade: null,
    alerta_restricao:
      "Este medicamento não é recomendado para menores de 3 meses sem avaliação médica especializada.",
    dose_alvo_mg_kg_dia: 45,
    fracionamento_vezes_dia: 2,
    texto_prescricao_padrao: "Administrar por 7 dias. Agitar o frasco antes de usar."
  },
  {
    id: "paracetamol-200mg-ml",
    nome: "Paracetamol",
    principio_ativo: "Paracetamol",
    concentracao_valor: 200,
    concentracao_unidade: "mg/mL",
    idade_min_valor: 0,
    idade_min_unidade: "Dias",
    idade_max_valor: null,
    idade_max_unidade: null,
    alerta_restricao: null,
    dose_alvo_mg_kg_dia: 60,
    fracionamento_vezes_dia: 4,
    texto_prescricao_padrao: "Usar se dor ou febre. Não exceder 5 doses em 24 horas."
  },
  {
    id: "ibuprofeno-50mg-ml",
    nome: "Ibuprofeno",
    principio_ativo: "Ibuprofeno",
    concentracao_valor: 50,
    concentracao_unidade: "mg/mL",
    idade_min_valor: 6,
    idade_min_unidade: "Meses",
    idade_max_valor: null,
    idade_max_unidade: null,
    alerta_restricao:
      "Evitar em menores de 6 meses, desidratação, doença renal ou suspeita de dengue.",
    dose_alvo_mg_kg_dia: 30,
    fracionamento_vezes_dia: 3,
    texto_prescricao_padrao: "Administrar após alimentação. Usar pelo menor tempo necessário."
  },
  {
    id: "dipirona-500mg-ml",
    nome: "Dipirona",
    principio_ativo: "Dipirona monoidratada",
    concentracao_valor: 500,
    concentracao_unidade: "mg/mL",
    idade_min_valor: 3,
    idade_min_unidade: "Meses",
    idade_max_valor: null,
    idade_max_unidade: null,
    alerta_restricao:
      "Evitar em menores de 3 meses ou abaixo de 5 kg. Confirmar restrições locais.",
    dose_alvo_mg_kg_dia: 60,
    fracionamento_vezes_dia: 4,
    texto_prescricao_padrao: "Usar se dor ou febre. Suspender se surgirem sinais de alergia."
  }
];
