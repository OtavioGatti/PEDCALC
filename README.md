# PEDCALC

PWA mobile-first para cálculo de posologia pediátrica em mL, com motor de cálculo local e base offline.

## Estrutura

- `frontend/`: React + Vite + Tailwind, PWA, cálculo local, cache em `localStorage` e integração futura com Supabase via variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `backend/`: sincronizador Notion -> Supabase em Node.js/TypeScript, com `GET /api/sync` protegido por token.
- `supabase/`: SQL inicial da tabela `medicamentos` com RLS.
- `docs/concepts/`: referência visual gerada para o primeiro layout.
- `docs/screenshots/`: capturas usadas na verificação visual local.

## Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

Build/PWA:

```bash
cd frontend
npm run lint
npm run build
```

## Rodar o backend

```bash
cd backend
npm install
npm run dev
```

Consulte `backend/README.md` para variáveis de ambiente e deploy na Render.
