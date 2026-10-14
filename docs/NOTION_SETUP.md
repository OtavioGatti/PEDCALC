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
- `dose_max_tomada_mg` (opcional, número em mg)
- `dose_max_dia_mg` (opcional, número em mg)
- `fracionamento_vezes_dia`
- `gotas_por_ml` (opcional, número)
- `via_administracao`
- `duracao_tratamento_padrao`
- `tags_busca`
- `texto_prescricao_padrao`

## Unidades permitidas

Idade:

- `Dias`
- `Meses`
- `Anos`

Concentração:

- `mg/mL`
- `mg/5 mL` (qualquer volume: `mg/2 mL`, `mg/10 mL`...)
- `mcg/mL`
- `g/mL`

Qualquer outra unidade (ex.: `UI/mL`, `mg/gota`, `mg/comprimido`) bloqueia o cálculo no app,
porque a dose alvo é em mg/kg/dia e o volume seria calculado errado.

## Dose máxima

Se `dose_max_tomada_mg` ou `dose_max_dia_mg` estiverem preenchidas, o app limita a dose por
tomada ao menor desses limites (a dose diária máxima é dividida pelo fracionamento) e mostra um
aviso no card. Deixe em branco para não aplicar limite.

Via de administração:

- `VO`
- `EV`
- `IM`
- `SC`
- `IN`

## Gotas por mL

`gotas_por_ml` é quantas gotas do conta-gotas da apresentação equivalem a 1 mL (ex.: dipirona
500 mg/mL, 1 gota = 25 mg: `20`). Varia entre apresentações, então confira na bula.

- Preenchido: o app abre esse medicamento já em gotas e converte com esse fator.
- Em branco: o app abre em mL; se o usuário trocar para gotas, usa 20 gotas/mL e mostra um aviso
  pedindo para conferir na bula.

As gotas são arredondadas para número inteiro. Quando a dose foi limitada à dose máxima, o
arredondamento é para baixo. Doses menores que 1 gota continuam em mL.

## Linhas por via

Se o mesmo medicamento tiver dose, concentração, fracionamento ou texto de prescrição diferente
por via de administração, crie uma linha separada para cada via. Exemplo:

- `Dipirona` com `via_administracao = VO`
- `Dipirona` com `via_administracao = EV`

O app agrupa medicamentos pelo nome/princípio ativo e permite alternar a via quando houver mais
de uma linha compatível.

## Observação

A database original `PEDCALC` não permitiu alteração de schema pelo plugin do Notion,
embora permitisse criação de linhas. Por isso, a database operacional correta foi criada
dentro da mesma página `PEDCALC Main`.

## Supabase

Antes de rodar o sync com os campos `via_administracao`, `duracao_tratamento_padrao` e
`tags_busca`, aplique a migração:

```sql
alter table public.medicamentos
  add column if not exists via_administracao text not null default 'VO',
  add column if not exists duracao_tratamento_padrao text not null default '',
  add column if not exists tags_busca text not null default '';

create index if not exists medicamentos_tags_busca_idx
  on public.medicamentos using gin (to_tsvector('portuguese', coalesce(tags_busca, '')));
```

O mesmo SQL está em `supabase/002_add_prescription_metadata.sql`.

Antes de fazer deploy do backend com os campos de dose máxima, aplique também
`supabase/003_add_max_dose.sql`. Sem ela, o sync falha com "Could not find the column".

O mesmo vale para `gotas_por_ml`: aplique `supabase/004_add_drops_per_ml.sql` antes do deploy do
backend.
