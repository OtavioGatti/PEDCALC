alter table public.medicamentos
  add column if not exists dose_max_tomada_mg numeric null
    check (dose_max_tomada_mg is null or dose_max_tomada_mg > 0),
  add column if not exists dose_max_dia_mg numeric null
    check (dose_max_dia_mg is null or dose_max_dia_mg > 0);

notify pgrst, 'reload schema';
