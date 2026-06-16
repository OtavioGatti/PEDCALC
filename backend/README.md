# PedCalc Sync Backend

Backend Node.js/TypeScript da Etapa 1. Ele expõe `GET /api/sync`, busca os medicamentos no Notion, sanitiza os campos e executa `upsert` na tabela `public.medicamentos` do Supabase.

## Setup local

```bash
npm install
cp .env.example .env
npm run dev
```

Chamada protegida:

```bash
curl -H "x-api-token: seu-token" http://localhost:3000/api/sync
```

Também funciona com `?token=...`, útil para cron jobs simples da Render.

## Variáveis de ambiente

- `SYNC_API_TOKEN`: token compartilhado para proteger `GET /api/sync`.
- `NOTION_TOKEN`: integration secret do Notion.
- `NOTION_DATABASE_ID`: ID do banco de dados Notion.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave service role, usada apenas no backend.
- `PORT`: porta local/Render.

## Campos esperados no Notion

O mapper aceita nomes em snake_case ou títulos legíveis em português:

- `Nome`
- `Princípio Ativo`
- `Concentração Valor`
- `Concentração Unidade`
- `Idade Min Valor`
- `Idade Min Unidade`
- `Idade Max Valor`
- `Idade Max Unidade`
- `Alerta Restrição`
- `Dose Alvo mg/kg/dia`
- `Fracionamento Vezes/Dia`
- `Via`
- `Duração`
- `Tags de Busca`
- `Texto Prescrição Padrão`

Unidades de idade aceitas: `Dias`, `Meses`, `Anos`.

## Deploy na Render

Crie um Web Service apontando para `backend`:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/health`

Configure as variáveis de ambiente no painel da Render. Para sincronização agendada, use um Cron Job chamando:

```text
https://seu-servico.onrender.com/api/sync?token=SYNC_API_TOKEN
```
