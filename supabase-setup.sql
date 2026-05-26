-- Crear tabla de eventos en Supabase
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase

create table if not exists public.eventos (
  id          bigint generated always as identity primary key,
  nombre      text        not null,
  descripcion text        default '',
  fecha_inicio date       not null,
  fecha_fin   date        not null,
  tareas      jsonb       default '[]'::jsonb,
  creado_en   timestamptz default now()
);

-- Habilitar Row Level Security (opcional pero recomendado)
alter table public.eventos enable row level security;

-- Política: permitir todo a usuarios anónimos (para este demo)
create policy "Allow all for anon"
  on public.eventos
  for all
  to anon
  using (true)
  with check (true);

-- Índice para ordenar por fecha de creación
create index if not exists eventos_creado_en_idx on public.eventos (creado_en desc);
