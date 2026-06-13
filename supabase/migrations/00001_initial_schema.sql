-- Supabase Migration: Initial Schema Setup

-- 1. Create Profiles Table (Public information synced with Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Brackets Table (User predictions and scores)
create table public.brackets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  predictions jsonb not null default '{}'::jsonb,
  is_submitted boolean not null default false,
  score integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Tournament Results Table (Single row holding official results and global lock status)
create table public.tournament_results (
  id text primary key default 'live',
  results jsonb not null default '{}'::jsonb,
  is_locked boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint only_one_row check (id = 'live')
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.brackets enable row level security;
alter table public.tournament_results enable row level security;

-- 5. Create RLS Policies for Profiles
create policy "Allow public read access to profiles"
  on public.profiles for select
  using (true);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 6. Create RLS Policies for Brackets
create policy "Allow public read access to brackets"
  on public.brackets for select
  using (true);

create policy "Allow users to create their own bracket"
  on public.brackets for insert
  with check (
    auth.uid() = user_id
    and (
      not exists (
        select 1 from public.tournament_results
        where id = 'live' and is_locked = true
      )
    )
  );

create policy "Allow users to update their own bracket"
  on public.brackets for update
  using (
    auth.uid() = user_id
    and (
      not exists (
        select 1 from public.tournament_results
        where id = 'live' and is_locked = true
      )
    )
  );

-- 7. Create RLS Policies for Tournament Results
create policy "Allow public read access to tournament_results"
  on public.tournament_results for select
  using (true);

create policy "Allow admins to manage tournament_results"
  on public.tournament_results for all
  using (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
    or auth.jwt() ->> 'email' = 'siraj-ahmed-cal@gmail.com'
  );

-- 8. Automate Profile Creation on User Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Player'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
