-- Seed File for 2026 FIFA World Cup Brackets App
-- Inserts the initial official tournament results row with the official group drawing and match fixtures.

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
    "group_matches": [
      {"id": "A_m1", "group": "A", "home": "Mexico", "away": "South Africa", "date": "2026-06-11"},
      {"id": "A_m2", "group": "A", "home": "Korea Republic", "away": "Czechia", "date": "2026-06-11"},
      {"id": "A_m3", "group": "A", "home": "Czechia", "away": "South Africa", "date": "2026-06-18"},
      {"id": "A_m4", "group": "A", "home": "Mexico", "away": "Korea Republic", "date": "2026-06-18"},
      {"id": "A_m5", "group": "A", "home": "Czechia", "away": "Mexico", "date": "2026-06-24"},
      {"id": "A_m6", "group": "A", "home": "South Africa", "away": "Korea Republic", "date": "2026-06-24"},

      {"id": "B_m1", "group": "B", "home": "Canada", "away": "Bosnia and Herzegovina", "date": "2026-06-12"},
      {"id": "B_m2", "group": "B", "home": "Qatar", "away": "Switzerland", "date": "2026-06-13"},
      {"id": "B_m3", "group": "B", "home": "Switzerland", "away": "Bosnia and Herzegovina", "date": "2026-06-18"},
      {"id": "B_m4", "group": "B", "home": "Canada", "away": "Qatar", "date": "2026-06-18"},
      {"id": "B_m5", "group": "B", "home": "Switzerland", "away": "Canada", "date": "2026-06-24"},
      {"id": "B_m6", "group": "B", "home": "Bosnia and Herzegovina", "away": "Qatar", "date": "2026-06-24"},

      {"id": "C_m1", "group": "C", "home": "Brazil", "away": "Morocco", "date": "2026-06-13"},
      {"id": "C_m2", "group": "C", "home": "Haiti", "away": "Scotland", "date": "2026-06-13"},
      {"id": "C_m3", "group": "C", "home": "Scotland", "away": "Morocco", "date": "2026-06-19"},
      {"id": "C_m4", "group": "C", "home": "Brazil", "away": "Haiti", "date": "2026-06-19"},
      {"id": "C_m5", "group": "C", "home": "Scotland", "away": "Brazil", "date": "2026-06-24"},
      {"id": "C_m6", "group": "C", "home": "Morocco", "away": "Haiti", "date": "2026-06-24"},

      {"id": "D_m1", "group": "D", "home": "United States", "away": "Paraguay", "date": "2026-06-12"},
      {"id": "D_m2", "group": "D", "home": "Australia", "away": "Turkiye", "date": "2026-06-13"},
      {"id": "D_m3", "group": "D", "home": "United States", "away": "Australia", "date": "2026-06-19"},
      {"id": "D_m4", "group": "D", "home": "Turkiye", "away": "Paraguay", "date": "2026-06-19"},
      {"id": "D_m5", "group": "D", "home": "Turkiye", "away": "United States", "date": "2026-06-25"},
      {"id": "D_m6", "group": "D", "home": "Paraguay", "away": "Australia", "date": "2026-06-25"},

      {"id": "E_m1", "group": "E", "home": "Germany", "away": "Curacao", "date": "2026-06-14"},
      {"id": "E_m2", "group": "E", "home": "Ivory Coast", "away": "Ecuador", "date": "2026-06-14"},
      {"id": "E_m3", "group": "E", "home": "Germany", "away": "Ivory Coast", "date": "2026-06-20"},
      {"id": "E_m4", "group": "E", "home": "Ecuador", "away": "Curacao", "date": "2026-06-20"},
      {"id": "E_m5", "group": "E", "home": "Ecuador", "away": "Germany", "date": "2026-06-25"},
      {"id": "E_m6", "group": "E", "home": "Curacao", "away": "Ivory Coast", "date": "2026-06-25"},

      {"id": "F_m1", "group": "F", "home": "Netherlands", "away": "Japan", "date": "2026-06-14"},
      {"id": "F_m2", "group": "F", "home": "Sweden", "away": "Tunisia", "date": "2026-06-14"},
      {"id": "F_m3", "group": "F", "home": "Netherlands", "away": "Sweden", "date": "2026-06-20"},
      {"id": "F_m4", "group": "F", "home": "Tunisia", "away": "Japan", "date": "2026-06-20"},
      {"id": "F_m5", "group": "F", "home": "Japan", "away": "Sweden", "date": "2026-06-25"},
      {"id": "F_m6", "group": "F", "home": "Tunisia", "away": "Netherlands", "date": "2026-06-25"},

      {"id": "G_m1", "group": "G", "home": "Belgium", "away": "Egypt", "date": "2026-06-15"},
      {"id": "G_m2", "group": "G", "home": "Iran", "away": "New Zealand", "date": "2026-06-15"},
      {"id": "G_m3", "group": "G", "home": "Belgium", "away": "Iran", "date": "2026-06-21"},
      {"id": "G_m4", "group": "G", "home": "New Zealand", "away": "Egypt", "date": "2026-06-21"},
      {"id": "G_m5", "group": "G", "home": "Egypt", "away": "Iran", "date": "2026-06-26"},
      {"id": "G_m6", "group": "G", "home": "New Zealand", "away": "Belgium", "date": "2026-06-26"},

      {"id": "H_m1", "group": "H", "home": "Spain", "away": "Cape Verde", "date": "2026-06-15"},
      {"id": "H_m2", "group": "H", "home": "Saudi Arabia", "away": "Uruguay", "date": "2026-06-15"},
      {"id": "H_m3", "group": "H", "home": "Spain", "away": "Saudi Arabia", "date": "2026-06-21"},
      {"id": "H_m4", "group": "H", "home": "Uruguay", "away": "Cape Verde", "date": "2026-06-21"},
      {"id": "H_m5", "group": "H", "home": "Cape Verde", "away": "Saudi Arabia", "date": "2026-06-26"},
      {"id": "H_m6", "group": "H", "home": "Uruguay", "away": "Spain", "date": "2026-06-26"},

      {"id": "I_m1", "group": "I", "home": "France", "away": "Senegal", "date": "2026-06-16"},
      {"id": "I_m2", "group": "I", "home": "Iraq", "away": "Norway", "date": "2026-06-16"},
      {"id": "I_m3", "group": "I", "home": "France", "away": "Iraq", "date": "2026-06-22"},
      {"id": "I_m4", "group": "I", "home": "Norway", "away": "Senegal", "date": "2026-06-22"},
      {"id": "I_m5", "group": "I", "home": "Norway", "away": "France", "date": "2026-06-26"},
      {"id": "I_m6", "group": "I", "home": "Senegal", "away": "Iraq", "date": "2026-06-26"},

      {"id": "J_m1", "group": "J", "home": "Argentina", "away": "Algeria", "date": "2026-06-16"},
      {"id": "J_m2", "group": "J", "home": "Austria", "away": "Jordan", "date": "2026-06-16"},
      {"id": "J_m3", "group": "J", "home": "Argentina", "away": "Austria", "date": "2026-06-22"},
      {"id": "J_m4", "group": "J", "home": "Jordan", "away": "Algeria", "date": "2026-06-22"},
      {"id": "J_m5", "group": "J", "home": "Algeria", "away": "Austria", "date": "2026-06-27"},
      {"id": "J_m6", "group": "J", "home": "Jordan", "away": "Argentina", "date": "2026-06-27"},

      {"id": "K_m1", "group": "K", "home": "Portugal", "away": "DR Congo", "date": "2026-06-17"},
      {"id": "K_m2", "group": "K", "home": "Uzbekistan", "away": "Colombia", "date": "2026-06-17"},
      {"id": "K_m3", "group": "K", "home": "Portugal", "away": "Uzbekistan", "date": "2026-06-23"},
      {"id": "K_m4", "group": "K", "home": "Colombia", "away": "DR Congo", "date": "2026-06-23"},
      {"id": "K_m5", "group": "K", "home": "Colombia", "away": "Portugal", "date": "2026-06-27"},
      {"id": "K_m6", "group": "K", "home": "DR Congo", "away": "Uzbekistan", "date": "2026-06-27"},

      {"id": "L_m1", "group": "L", "home": "England", "away": "Croatia", "date": "2026-06-17"},
      {"id": "L_m2", "group": "L", "home": "Ghana", "away": "Panama", "date": "2026-06-17"},
      {"id": "L_m3", "group": "L", "home": "England", "away": "Ghana", "date": "2026-06-23"},
      {"id": "L_m4", "group": "L", "home": "Panama", "away": "Croatia", "date": "2026-06-23"},
      {"id": "L_m5", "group": "L", "home": "Panama", "away": "England", "date": "2026-06-27"},
      {"id": "L_m6", "group": "L", "home": "Croatia", "away": "Ghana", "date": "2026-06-27"}
    ],
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
    "completed_games": [],
    "actual_matches": {}
  }'::jsonb,
  false
)
on conflict (id) do update
set results = excluded.results,
    updated_at = now();
