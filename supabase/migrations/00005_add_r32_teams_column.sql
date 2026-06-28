-- Migration: Add r32_teams column to tournament_results
alter table public.tournament_results
add column r32_teams jsonb;

-- Populate the r32_teams column with the official 2026 FIFA World Cup Round of 32 matchups
update public.tournament_results
set r32_teams = '{
  "1A": "Mexico",
  "2A": "South Africa",
  "1B": "Switzerland",
  "2B": "Canada",
  "1C": "Brazil",
  "2C": "Morocco",
  "1D": "United States",
  "2D": "Australia",
  "1E": "Germany",
  "2E": "Ivory Coast",
  "1F": "Netherlands",
  "2F": "Japan",
  "1G": "Belgium",
  "2G": "Egypt",
  "1H": "Spain",
  "2H": "Cape Verde",
  "1I": "France",
  "2I": "Norway",
  "1J": "Argentina",
  "2J": "Austria",
  "1K": "Colombia",
  "2K": "Portugal",
  "1L": "England",
  "2L": "Croatia",
  "OPP_1A": "Ecuador",
  "OPP_1E": "Paraguay",
  "OPP_1I": "Sweden",
  "OPP_1L": "DR Congo",
  "OPP_1D": "Bosnia and Herzegovina",
  "OPP_1G": "Senegal",
  "OPP_1B": "Algeria",
  "OPP_1K": "Ghana"
}'::jsonb
where id = 'live';

-- Also store it as results.r32_teams for backwards compatibility fallback
update public.tournament_results
set results = jsonb_set(
  results,
  '{r32_teams}',
  '{
    "1A": "Mexico",
    "2A": "South Africa",
    "1B": "Switzerland",
    "2B": "Canada",
    "1C": "Brazil",
    "2C": "Morocco",
    "1D": "United States",
    "2D": "Australia",
    "1E": "Germany",
    "2E": "Ivory Coast",
    "1F": "Netherlands",
    "2F": "Japan",
    "1G": "Belgium",
    "2G": "Egypt",
    "1H": "Spain",
    "2H": "Cape Verde",
    "1I": "France",
    "2I": "Norway",
    "1J": "Argentina",
    "2J": "Austria",
    "1K": "Colombia",
    "2K": "Portugal",
    "1L": "England",
    "2L": "Croatia",
    "OPP_1A": "Ecuador",
    "OPP_1E": "Paraguay",
    "OPP_1I": "Sweden",
    "OPP_1L": "DR Congo",
    "OPP_1D": "Bosnia and Herzegovina",
    "OPP_1G": "Senegal",
    "OPP_1B": "Algeria",
    "OPP_1K": "Ghana"
  }'::jsonb
)
where id = 'live';
