-- Migration: Add Second Chance Knockout Bracket Support
-- Add second chance predictions and score columns to the brackets table
alter table public.brackets
add column predictions_second_chance jsonb not null default '{}'::jsonb,
add column score_second_chance integer not null default 0;

-- Add second-chance locking toggle to tournament_results
alter table public.tournament_results
add column is_second_chance_locked boolean not null default false;
