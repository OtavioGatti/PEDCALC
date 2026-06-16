create extension if not exists "pgcrypto";

create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  notion_page_id text not null unique,
  nome text not null,
  principio_ativo text not null,
  concentracao_valor numeric not null check (concentracao_valor > 0),
  concentracao_unidade text not null,
  idade_min_valor numeric null check (idade_min_valor is null or idade_min_valor >= 0),
  idade_min_unidade text null,
  idade_max_valor numeric null check (idade_max_valor is null or idade_max_valor >= 0),
  idade_max_unidade text null,
  alerta_restricao text null,
  dose_alvo_mg_kg_dia numeric not null check (dose_alvo_mg_kg_dia > 0),
  fracionamento_vezes_dia numeric not null check (fracionamento_vezes_dia > 0),
  texto_prescricao_padrao text not null default '',
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medicamentos_nome_idx
  on public.medicamentos using btree (nome);

create index if not exists medicamentos_principio_ativo_idx
  on public.medicamentos using btree (principio_ativo);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists medicamentos_set_updated_at on public.medicamentos;

create trigger medicamentos_set_updated_at
before update on public.medicamentos
for each row
execute function public.set_updated_at();

alter table public.medicamentos enable row level security;

drop policy if exists "Medicamentos podem ser lidos pelo app" on public.medicamentos;

create policy "Medicamentos podem ser lidos pelo app"
on public.medicamentos
for select
to anon, authenticated
using (true);

-- Inserts, updates, and deletes intentionally have no public policy.
-- The Render sync service should use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
