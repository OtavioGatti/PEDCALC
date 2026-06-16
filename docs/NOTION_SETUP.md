# PEDCALC Notion Setup

Database operacional:

- Nome: `PEDCALC Medicamentos`
- URL: https://app.notion.com/p/0a5671a6dcd24cfbb692dca1ef7caf4c
- Database ID para `NOTION_DATABASE_ID`: `0a5671a6dcd24cfbb692dca1ef7caf4c`
- Data source: `collection://8b4cd214-35d6-48b6-8999-2e5404826b50`

## Colunas

Use exatamente estes nomes:

- `nome`
- `principio_ativo`
- `concentracao_valor`
- `concentracao_unidade`
- `idade_min_valor`
- `idade_min_unidade`
- `idade_max_valor`
- `idade_max_unidade`
- `alerta_restricao`
- `dose_alvo_mg_kg_dia`
- `fracionamento_vezes_dia`
- `texto_prescricao_padrao`

## Unidades permitidas

Idade:

- `Dias`
- `Meses`
- `Anos`

Concentração:

- `mg/mL`
- `mg/5 mL`
- `mcg/mL`
- `UI/mL`

## Observação

A database original `PEDCALC` não permitiu alteração de schema pelo plugin do Notion,
embora permitisse criação de linhas. Por isso, a database operacional correta foi criada
dentro da mesma página `PEDCALC Main`.
