create table if not exists profiles (
  user_id text primary key,
  display_name text,
  avatar_url text,
  look_id text not null default 'moonlit',
  updated_at timestamptz not null default now()
);
