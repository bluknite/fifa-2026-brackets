-- Allow admins to update all brackets (specifically to recalculate scores/grade them)
create policy "Allow admins to update all brackets"
  on public.brackets for update
  using (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
    or auth.jwt() ->> 'email' = 'siraj-ahmed-cal@gmail.com'
    or auth.jwt() ->> 'email' = 'syed.s.ahmed@gmail.com'
  );
