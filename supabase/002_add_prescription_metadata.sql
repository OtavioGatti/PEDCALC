alter table public.medicamentos
  add column if not exists via_administracao text not null default 'VO',
  add column if not exists duracao_tratamento_padrao text not null default '',
  add column if not exists tags_busca text not null default '';

create index if not exists medicamentos_tags_busca_idx
  on public.medicamentos using gin (to_tsvector('portuguese', coalesce(tags_busca, '')));
