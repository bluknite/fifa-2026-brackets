-- Migration: Update RLS policies for brackets table to allow second-chance bracket updates and late signups
drop policy if exists "Allow users to update their own bracket" on public.brackets;
drop policy if exists "Allow users to create their own bracket" on public.brackets;

create policy "Allow users to create their own bracket"
  on public.brackets for insert
  with check (
    auth.uid() = user_id
    and (
      not exists (
        select 1 from public.tournament_results
        where id = 'live' and is_locked = true
      )
      or
      not exists (
        select 1 from public.tournament_results
        where id = 'live' and is_second_chance_locked = true
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
      or
      not exists (
        select 1 from public.tournament_results
        where id = 'live' and is_second_chance_locked = true
      )
    )
  );
