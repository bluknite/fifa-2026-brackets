-- Seed File for 2026 FIFA World Cup Brackets App
-- Inserts the initial official tournament results row with the official group drawing.

insert into public.tournament_results (id, results, is_locked)
values (
  'live',
  '{
    "groups": {
      "A": ["Mexico", "South Africa", "Korea Republic", "Czechia"],
      "B": ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
      "C": ["Brazil", "Morocco", "Haiti", "Scotland"],
      "D": ["United States", "Paraguay", "Australia", "Turkiye"],
      "E": ["Curacao", "Ecuador", "Germany", "Ivory Coast"],
      "F": ["Japan", "Netherlands", "Sweden", "Tunisia"],
      "G": ["Belgium", "Egypt", "Iran", "New Zealand"],
      "H": ["Cape Verde", "Saudi Arabia", "Spain", "Uruguay"],
      "I": ["France", "Iraq", "Norway", "Senegal"],
      "J": ["Algeria", "Argentina", "Austria", "Jordan"],
      "K": ["Colombia", "DR Congo", "Portugal", "Uzbekistan"],
      "L": ["Croatia", "England", "Ghana", "Panama"]
    },
    "knockouts": {
      "r32": {
        "m1": null, "m2": null, "m3": null, "m4": null, "m5": null, "m6": null, "m7": null, "m8": null,
        "m9": null, "m10": null, "m11": null, "m12": null, "m13": null, "m14": null, "m15": null, "m16": null
      },
      "r16": {
        "m1": null, "m2": null, "m3": null, "m4": null, "m5": null, "m6": null, "m7": null, "m8": null
      },
      "qf": {
        "m1": null, "m2": null, "m3": null, "m4": null
      },
      "sf": {
        "m1": null, "m2": null
      },
      "final": null,
      "third_place": null
    },
    "completed_games": []
  }'::jsonb,
  false
)
on conflict (id) do update
set results = excluded.results,
    updated_at = now();
