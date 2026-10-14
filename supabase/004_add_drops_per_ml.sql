alter table public.medicamentos
  add column if not exists gotas_por_ml numeric null
    check (gotas_por_ml is null or gotas_por_ml > 0);

notify pgrst, 'reload schema';
