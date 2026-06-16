import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import { z } from "zod";
import type { Medicamento, UnidadeIdade } from "./types.js";

type NotionProperty = PageObjectResponse["properties"][string];

const unidadeIdadeSchema = z.enum(["Dias", "Meses", "Anos"]);

const medicamentoSchema = z.object({
  notion_page_id: z.string().min(1),
  nome: z.string().min(1),
  principio_ativo: z.string().min(1),
  concentracao_valor: z.number().positive(),
  concentracao_unidade: z.string().min(1),
  idade_min_valor: z.number().nonnegative().nullable(),
  idade_min_unidade: unidadeIdadeSchema.nullable(),
  idade_max_valor: z.number().nonnegative().nullable(),
  idade_max_unidade: unidadeIdadeSchema.nullable(),
  alerta_restricao: z.string().nullable(),
  dose_alvo_mg_kg_dia: z.number().positive(),
  fracionamento_vezes_dia: z.number().positive(),
  via_administracao: z.string().min(1),
  duracao_tratamento_padrao: z.string(),
  tags_busca: z.string(),
  texto_prescricao_padrao: z.string(),
  synced_at: z.string().datetime()
});

const propertyAliases = {
  nome: ["nome", "Nome", "Medicamento"],
  principio_ativo: ["principio_ativo", "Princípio Ativo", "Principio Ativo", "principio ativo"],
  concentracao_valor: ["concentracao_valor", "Concentração Valor", "Concentracao Valor"],
  concentracao_unidade: ["concentracao_unidade", "Concentração Unidade", "Concentracao Unidade"],
  idade_min_valor: ["idade_min_valor", "Idade Min Valor", "Idade Mínima Valor"],
  idade_min_unidade: ["idade_min_unidade", "Idade Min Unidade", "Idade Mínima Unidade"],
  idade_max_valor: ["idade_max_valor", "Idade Max Valor", "Idade Máxima Valor"],
  idade_max_unidade: ["idade_max_unidade", "Idade Max Unidade", "Idade Máxima Unidade"],
  alerta_restricao: ["alerta_restricao", "Alerta Restrição", "Alerta Restricao"],
  dose_alvo_mg_kg_dia: ["dose_alvo_mg_kg_dia", "Dose Alvo mg/kg/dia", "Dose Alvo"],
  fracionamento_vezes_dia: ["fracionamento_vezes_dia", "Fracionamento Vezes/Dia", "Fracionamento"],
  via_administracao: ["via_administracao", "Via Administração", "Via Administracao", "Via"],
  duracao_tratamento_padrao: [
    "duracao_tratamento_padrao",
    "Duração Tratamento Padrão",
    "Duracao Tratamento Padrao",
    "Duração"
  ],
  tags_busca: ["tags_busca", "Tags Busca", "Tags de Busca", "Busca"],
  texto_prescricao_padrao: ["texto_prescricao_padrao", "Texto Prescrição Padrão", "Texto Prescricao Padrao"]
} as const;

export function mapNotionPageToMedicamento(page: PageObjectResponse): Medicamento {
  const props = page.properties;

  const medicamento = {
    notion_page_id: page.id,
    nome: readText(requiredProperty(props, propertyAliases.nome)),
    principio_ativo: readText(requiredProperty(props, propertyAliases.principio_ativo)),
    concentracao_valor: readNumber(requiredProperty(props, propertyAliases.concentracao_valor)),
    concentracao_unidade: readText(requiredProperty(props, propertyAliases.concentracao_unidade)),
    idade_min_valor: readNullableNumber(optionalProperty(props, propertyAliases.idade_min_valor)),
    idade_min_unidade: readNullableUnidadeIdade(optionalProperty(props, propertyAliases.idade_min_unidade)),
    idade_max_valor: readNullableNumber(optionalProperty(props, propertyAliases.idade_max_valor)),
    idade_max_unidade: readNullableUnidadeIdade(optionalProperty(props, propertyAliases.idade_max_unidade)),
    alerta_restricao: readNullableText(optionalProperty(props, propertyAliases.alerta_restricao)),
    dose_alvo_mg_kg_dia: readNumber(requiredProperty(props, propertyAliases.dose_alvo_mg_kg_dia)),
    fracionamento_vezes_dia: readNumber(requiredProperty(props, propertyAliases.fracionamento_vezes_dia)),
    via_administracao:
      readNullableText(optionalProperty(props, propertyAliases.via_administracao)) ?? "VO",
    duracao_tratamento_padrao:
      readNullableText(optionalProperty(props, propertyAliases.duracao_tratamento_padrao)) ?? "",
    tags_busca: readNullableText(optionalProperty(props, propertyAliases.tags_busca)) ?? "",
    texto_prescricao_padrao: readText(optionalProperty(props, propertyAliases.texto_prescricao_padrao)) ?? "",
    synced_at: new Date().toISOString()
  };

  return medicamentoSchema.parse(medicamento);
}

function requiredProperty(
  props: PageObjectResponse["properties"],
  aliases: readonly string[]
): NotionProperty {
  const property = optionalProperty(props, aliases);

  if (!property) {
    throw new Error(`Propriedade obrigatória ausente no Notion: ${aliases.join(" | ")}`);
  }

  return property;
}

function optionalProperty(
  props: PageObjectResponse["properties"],
  aliases: readonly string[]
): NotionProperty | undefined {
  return aliases.map((alias) => props[alias]).find(Boolean);
}

function readText(property: NotionProperty | undefined): string | null {
  if (!property) {
    return null;
  }

  switch (property.type) {
    case "title":
      return property.title.map((item) => item.plain_text).join("").trim();
    case "rich_text":
      return property.rich_text.map((item) => item.plain_text).join("").trim();
    case "select":
      return property.select?.name.trim() ?? null;
    case "status":
      return property.status?.name.trim() ?? null;
    case "formula":
      return readFormulaAsText(property);
    case "number":
      return property.number === null ? null : String(property.number);
    default:
      return null;
  }
}

function readNullableText(property: NotionProperty | undefined): string | null {
  const value = readText(property);
  return value && value.length > 0 ? value : null;
}

function readNumber(property: NotionProperty): number {
  const value = readNullableNumber(property);

  if (value === null) {
    throw new Error(`Valor numérico obrigatório ausente ou inválido em propriedade ${property.id}`);
  }

  return value;
}

function readNullableNumber(property: NotionProperty | undefined): number | null {
  if (!property) {
    return null;
  }

  if (property.type === "number") {
    return property.number;
  }

  if (property.type === "formula" && property.formula.type === "number") {
    return property.formula.number;
  }

  const text = readText(property);

  if (!text) {
    return null;
  }

  const normalized = text.replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function readNullableUnidadeIdade(property: NotionProperty | undefined): UnidadeIdade | null {
  const text = readNullableText(property);

  if (!text) {
    return null;
  }

  return unidadeIdadeSchema.parse(text);
}

function readFormulaAsText(property: Extract<NotionProperty, { type: "formula" }>): string | null {
  switch (property.formula.type) {
    case "string":
      return property.formula.string?.trim() ?? null;
    case "number":
      return property.formula.number === null ? null : String(property.formula.number);
    case "boolean":
      return String(property.formula.boolean);
    case "date":
      return property.formula.date?.start ?? null;
    default:
      return null;
  }
}
