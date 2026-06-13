-- Update RLS Policy to allow syed.s.ahmed@gmail.com to manage tournament results from the frontend
drop policy if exists "Allow admins to manage tournament_results" on public.tournament_results;

create policy "Allow admins to manage tournament_results"
  on public.tournament_results for all
  using (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
    or auth.jwt() ->> 'email' = 'siraj-ahmed-cal@gmail.com'
    or auth.jwt() ->> 'email' = 'syed.s.ahmed@gmail.com'
  );
