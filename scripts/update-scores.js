import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Team Name Mappings to normalize names from ESPN API
const TEAM_NAME_MAPPINGS = {
  "South Korea": "Korea Republic",
  "Korea Republic": "Korea Republic",
  "Czech Republic": "Czechia",
  "Czechia": "Czechia",
  "Turkey": "Turkiye",
  "Türkiye": "Turkiye",
  "Turkiye": "Turkiye",
  "Curaçao": "Curacao",
  "Curacao": "Curacao",
  "Congo DR": "DR Congo",
  "DR Congo": "DR Congo",
  "United States": "United States",
  "USA": "United States",
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Bosnia and Herzegovina": "Bosnia and Herzegovina",
  "Cape Verde": "Cape Verde",
  "Cabo Verde": "Cape Verde",
  "Ivory Coast": "Ivory Coast",
  "Côte d'Ivoire": "Ivory Coast"
};

function normalizeTeamName(name) {
  if (!name) return "";
  const trimmed = name.trim();
  return TEAM_NAME_MAPPINGS[trimmed] || trimmed;
}

// Static matches schedule matching seed.sql
const GROUP_MATCHES = [
  {"id": "A_m1", "group": "A", "home": "Mexico", "away": "South Africa"},
  {"id": "A_m2", "group": "A", "home": "Korea Republic", "away": "Czechia"},
  {"id": "A_m3", "group": "A", "home": "Czechia", "away": "South Africa"},
  {"id": "A_m4", "group": "A", "home": "Mexico", "away": "Korea Republic"},
  {"id": "A_m5", "group": "A", "home": "Czechia", "away": "Mexico"},
  {"id": "A_m6", "group": "A", "home": "South Africa", "away": "Korea Republic"},

  {"id": "B_m1", "group": "B", "home": "Canada", "away": "Bosnia and Herzegovina"},
  {"id": "B_m2", "group": "B", "home": "Qatar", "away": "Switzerland"},
  {"id": "B_m3", "group": "B", "home": "Switzerland", "away": "Bosnia and Herzegovina"},
  {"id": "B_m4", "group": "B", "home": "Canada", "away": "Qatar"},
  {"id": "B_m5", "group": "B", "home": "Switzerland", "away": "Canada"},
  {"id": "B_m6", "group": "B", "home": "Bosnia and Herzegovina", "away": "Qatar"},

  {"id": "C_m1", "group": "C", "home": "Brazil", "away": "Morocco"},
  {"id": "C_m2", "group": "C", "home": "Haiti", "away": "Scotland"},
  {"id": "C_m3", "group": "C", "home": "Scotland", "away": "Morocco"},
  {"id": "C_m4", "group": "C", "home": "Brazil", "away": "Haiti"},
  {"id": "C_m5", "group": "C", "home": "Scotland", "away": "Brazil"},
  {"id": "C_m6", "group": "C", "home": "Morocco", "away": "Haiti"},

  {"id": "D_m1", "group": "D", "home": "United States", "away": "Paraguay"},
  {"id": "D_m2", "group": "D", "home": "Australia", "away": "Turkiye"},
  {"id": "D_m3", "group": "D", "home": "United States", "away": "Australia"},
  {"id": "D_m4", "group": "D", "home": "Turkiye", "away": "Paraguay"},
  {"id": "D_m5", "group": "D", "home": "Turkiye", "away": "United States"},
  {"id": "D_m6", "group": "D", "home": "Paraguay", "away": "Australia"},

  {"id": "E_m1", "group": "E", "home": "Germany", "away": "Curacao"},
  {"id": "E_m2", "group": "E", "home": "Ivory Coast", "away": "Ecuador"},
  {"id": "E_m3", "group": "E", "home": "Germany", "away": "Ivory Coast"},
  {"id": "E_m4", "group": "E", "home": "Ecuador", "away": "Curacao"},
  {"id": "E_m5", "group": "E", "home": "Ecuador", "away": "Germany"},
  {"id": "E_m6", "group": "E", "home": "Curacao", "away": "Ivory Coast"},

  {"id": "F_m1", "group": "F", "home": "Netherlands", "away": "Japan"},
  {"id": "F_m2", "group": "F", "home": "Sweden", "away": "Tunisia"},
  {"id": "F_m3", "group": "F", "home": "Netherlands", "away": "Sweden"},
  {"id": "F_m4", "group": "F", "home": "Tunisia", "away": "Japan"},
  {"id": "F_m5", "group": "F", "home": "Japan", "away": "Sweden"},
  {"id": "F_m6", "group": "F", "home": "Tunisia", "away": "Netherlands"},

  {"id": "G_m1", "group": "G", "home": "Belgium", "away": "Egypt"},
  {"id": "G_m2", "group": "G", "home": "Iran", "away": "New Zealand"},
  {"id": "G_m3", "group": "G", "home": "Belgium", "away": "Iran"},
  {"id": "G_m4", "group": "G", "home": "New Zealand", "away": "Egypt"},
  {"id": "G_m5", "group": "G", "home": "Egypt", "away": "Iran"},
  {"id": "G_m6", "group": "G", "home": "New Zealand", "away": "Belgium"},

  {"id": "H_m1", "group": "H", "home": "Spain", "away": "Cape Verde"},
  {"id": "H_m2", "group": "H", "home": "Saudi Arabia", "away": "Uruguay"},
  {"id": "H_m3", "group": "H", "home": "Spain", "away": "Saudi Arabia"},
  {"id": "H_m4", "group": "H", "home": "Uruguay", "away": "Cape Verde"},
  {"id": "H_m5", "group": "H", "home": "Cape Verde", "away": "Saudi Arabia"},
  {"id": "H_m6", "group": "H", "home": "Uruguay", "away": "Spain"},

  {"id": "I_m1", "group": "I", "home": "France", "away": "Senegal"},
  {"id": "I_m2", "group": "I", "home": "Iraq", "away": "Norway"},
  {"id": "I_m3", "group": "I", "home": "France", "away": "Iraq"},
  {"id": "I_m4", "group": "I", "home": "Norway", "away": "Senegal"},
  {"id": "I_m5", "group": "I", "home": "Norway", "away": "France"},
  {"id": "I_m6", "group": "I", "home": "Senegal", "away": "Iraq"},

  {"id": "J_m1", "group": "J", "home": "Argentina", "away": "Algeria"},
  {"id": "J_m2", "group": "J", "home": "Austria", "away": "Jordan"},
  {"id": "J_m3", "group": "J", "home": "Argentina", "away": "Austria"},
  {"id": "J_m4", "group": "J", "home": "Jordan", "away": "Algeria"},
  {"id": "J_m5", "group": "J", "home": "Algeria", "away": "Austria"},
  {"id": "J_m6", "group": "J", "home": "Jordan", "away": "Argentina"},

  {"id": "K_m1", "group": "K", "home": "Portugal", "away": "DR Congo"},
  {"id": "K_m2", "group": "K", "home": "Uzbekistan", "away": "Colombia"},
  {"id": "K_m3", "group": "K", "home": "Portugal", "away": "Uzbekistan"},
  {"id": "K_m4", "group": "K", "home": "Colombia", "away": "DR Congo"},
  {"id": "K_m5", "group": "K", "home": "Colombia", "away": "Portugal"},
  {"id": "K_m6", "group": "K", "home": "DR Congo", "away": "Uzbekistan"},

  {"id": "L_m1", "group": "L", "home": "England", "away": "Croatia"},
  {"id": "L_m2", "group": "L", "home": "Ghana", "away": "Panama"},
  {"id": "L_m3", "group": "L", "home": "England", "away": "Ghana"},
  {"id": "L_m4", "group": "L", "home": "Panama", "away": "Croatia"},
  {"id": "L_m5", "group": "L", "home": "Panama", "away": "England"},
  {"id": "L_m6", "group": "L", "home": "Croatia", "away": "Ghana"}
];

const INITIAL_GROUPS = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['United States', 'Paraguay', 'Australia', 'Turkiye'],
  E: ['Curacao', 'Ecuador', 'Germany', 'Ivory Coast'],
  F: ['Japan', 'Netherlands', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Cape Verde', 'Saudi Arabia', 'Spain', 'Uruguay'],
  I: ['France', 'Iraq', 'Norway', 'Senegal'],
  J: ['Algeria', 'Argentina', 'Austria', 'Jordan'],
  K: ['Colombia', 'DR Congo', 'Portugal', 'Uzbekistan'],
  L: ['Croatia', 'England', 'Ghana', 'Panama']
};

// Official FIFA Standing Calculation
function calculateActualStandings(teams, matches, scores) {
  const stats = {};
  teams.forEach(t => {
    stats[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0, gd: 0 };
  });

  matches.forEach(m => {
    const score = scores[m.id];
    if (!score || !score.completed) return;

    const hg = score.homeGoals;
    const ag = score.awayGoals;

    stats[m.home].played += 1;
    stats[m.away].played += 1;
    stats[m.home].gf += hg;
    stats[m.home].ga += ag;
    stats[m.away].gf += ag;
    stats[m.away].ga += hg;

    if (hg > ag) {
      stats[m.home].won += 1;
      stats[m.home].points += 3;
      stats[m.away].lost += 1;
    } else if (ag > hg) {
      stats[m.away].won += 1;
      stats[m.away].points += 3;
      stats[m.home].lost += 1;
    } else {
      stats[m.home].drawn += 1;
      stats[m.home].points += 1;
      stats[m.away].drawn += 1;
      stats[m.away].points += 1;
    }
  });

  teams.forEach(t => {
    stats[t].gd = stats[t].gf - stats[t].ga;
  });

  const sorted = [...teams];
  sorted.sort((a, b) => {
    if (stats[b].points !== stats[a].points) return stats[b].points - stats[a].points;
    if (stats[b].gd !== stats[a].gd) return stats[b].gd - stats[a].gd;
    if (stats[b].gf !== stats[a].gf) return stats[b].gf - stats[a].gf;

    // H2H Points
    const h2hMatch = matches.find(m => 
      (m.home === a && m.away === b) || (m.home === b && m.away === a)
    );
    const h2hScore = h2hMatch ? scores[h2hMatch.id] : null;
    if (h2hScore && h2hScore.completed) {
      const aIsHome = h2hMatch.home === a;
      const hg = h2hScore.homeGoals;
      const ag = h2hScore.awayGoals;
      if (hg > ag) return aIsHome ? -1 : 1;
      else if (ag > hg) return aIsHome ? 1 : -1;
    }
    return a.localeCompare(b);
  });

  return sorted;
}

// Grades a single user bracket predictions against official results
function calculateScore(userPredictions, official) {
  let score = 0;

  // 1. Group Stage Match Outcome Predictions: +5 pts each
  if (userPredictions.groupMatches && official.actual_matches) {
    Object.keys(official.actual_matches).forEach(matchId => {
      const actual = official.actual_matches[matchId];
      if (actual && actual.completed) {
        const pred = userPredictions.groupMatches[matchId];
        if (pred === actual.outcome) {
          score += 5;
        }
      }
    });
  }

  // 2. Correct Advancing Group Teams (top 2): +10 pts each
  if (userPredictions.groups && official.groups) {
    Object.keys(official.groups).forEach(g => {
      if (official.completed_games?.includes(`group_${g}`)) {
        const predAdv = (userPredictions.groups[g] || []).slice(0, 2);
        const actAdv = (official.groups[g] || []).slice(0, 2);
        predAdv.forEach(team => {
          if (actAdv.includes(team)) score += 10;
        });
      }
    });
  }

  // 3. Knockouts Stage Matches Winners
  const stages = [
    { key: 'r32', pts: 20 },
    { key: 'r16', pts: 40 },
    { key: 'qf', pts: 80 },
    { key: 'sf', pts: 160 }
  ];

  stages.forEach(({ key, pts }) => {
    const predStage = userPredictions.knockouts?.[key] || {};
    const actStage = official.knockouts?.[key] || {};
    Object.keys(predStage).forEach(matchId => {
      if (official.completed_games?.includes(`${key}_${matchId}`)) {
        if (predStage[matchId] === actStage[matchId] && actStage[matchId] !== null) {
          score += pts;
        }
      }
    });
  });

  // Third Place Winner
  if (official.completed_games?.includes('third_place')) {
    const predThird = userPredictions.knockouts?.third_place;
    const actThird = official.knockouts?.third_place;
    if (predThird === actThird && actThird !== null) score += 160;
  }

  // Grand Final Winner (Champion)
  if (official.completed_games?.includes('final')) {
    const predFinal = userPredictions.knockouts?.final;
    const actFinal = official.knockouts?.final;
    if (predFinal === actFinal && actFinal !== null) score += 320;
  }

  return score;
}

async function run() {
  console.log("Starting automated FIFA 2026 score synchronization...");

  // Load existing official results
  const { data: dbResults, error: dbError } = await supabase
    .from('tournament_results')
    .select('*')
    .eq('id', 'live')
    .single();

  if (dbError) {
    console.error("Database read error:", dbError);
    process.exit(1);
  }

  const results = dbResults.results || {};
  if (!results.actual_matches) results.actual_matches = {};
  if (!results.groups) results.groups = {};
  if (!results.knockouts) results.knockouts = {};
  if (!results.completed_games) results.completed_games = [];

  // Generate date lists to fetch
  const dates = [];
  // June 11 to June 30
  for (let d = 11; d <= 30; d++) {
    dates.push(`202606${d}`);
  }
  // July 1 to July 20
  for (let d = 1; d <= 20; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    dates.push(`202607${dayStr}`);
  }

  console.log(`Fetching ESPN scoreboards for ${dates.length} tournament days...`);

  const matchesFound = [];

  // Fetch scoreboards in batches to prevent rate limit issues
  const batchSize = 5;
  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize);
    const promises = batch.map(date => 
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`)
        .then(res => res.json())
        .catch(err => {
          console.warn(`Could not fetch scoreboard for date ${date}:`, err.message);
          return null;
        })
    );
    const scoreboards = await Promise.all(promises);
    scoreboards.forEach(sb => {
      if (sb && sb.events) {
        sb.events.forEach(event => {
          matchesFound.push(event);
        });
      }
    });
  }

  console.log(`Successfully retrieved ${matchesFound.length} matches from ESPN.`);

  let updatedCount = 0;

  // Process Matches
  matchesFound.forEach(event => {
    const completed = event.status?.type?.completed || false;
    if (!completed) return;

    const competitors = event.competitors || [];
    if (competitors.length < 2) return;

    const homeComp = competitors.find(c => c.homeAway === 'home');
    const awayComp = competitors.find(c => c.homeAway === 'away');

    if (!homeComp || !awayComp) return;

    const homeTeam = normalizeTeamName(homeComp.team?.displayName);
    const awayTeam = normalizeTeamName(awayComp.team?.displayName);

    const homeScore = parseInt(homeComp.score, 10);
    const awayScore = parseInt(awayComp.score, 10);

    // 1. Check if it matches a group match
    const groupMatch = GROUP_MATCHES.find(gm => 
      (gm.home === homeTeam && gm.away === awayTeam) || 
      (gm.home === awayTeam && gm.away === homeTeam)
    );

    if (groupMatch) {
      // Re-align home/away score in case home/away is flipped in ESPN
      const hg = groupMatch.home === homeTeam ? homeScore : awayScore;
      const ag = groupMatch.away === awayTeam ? awayScore : homeScore;
      const outcome = hg > ag ? "home" : (ag > hg ? "away" : "draw");

      const existing = results.actual_matches[groupMatch.id];
      if (!existing || !existing.completed || existing.outcome !== outcome) {
        results.actual_matches[groupMatch.id] = {
          homeGoals: hg,
          awayGoals: ag,
          outcome: outcome,
          completed: true
        };
        console.log(`Updating Group Match: ${groupMatch.home} ${hg} - ${ag} ${groupMatch.away} (${outcome})`);
        updatedCount++;
      }
    }

    // 2. Check if it matches a knockout match
    // Winner of the knockout is competitor with winner = true
    const winnerTeam = homeComp.winner ? homeTeam : (awayComp.winner ? awayTeam : null);
    if (winnerTeam) {
      // Look through predicted knockouts to see if both teams match this game
      // E.g. we search results.knockouts to see if there is any stage containing these teams
      const stagesList = ['r32', 'r16', 'qf', 'sf', 'final', 'third_place'];
      stagesList.forEach(stage => {
        if (stage === 'final' || stage === 'third_place') {
          // Check if this match contains finalist teams
          // If the match is the final or third place match
          const isFinal = event.name?.toLowerCase().includes("final") && !event.name?.toLowerCase().includes("quarter") && !event.name?.toLowerCase().includes("semi") && !event.name?.toLowerCase().includes("third");
          const isThird = event.name?.toLowerCase().includes("third");
          
          if (stage === 'final' && isFinal) {
            if (results.knockouts.final !== winnerTeam) {
              results.knockouts.final = winnerTeam;
              if (!results.completed_games.includes('final')) results.completed_games.push('final');
              console.log(`Updating Champion: ${winnerTeam}`);
              updatedCount++;
            }
          }
          if (stage === 'third_place' && isThird) {
            if (results.knockouts.third_place !== winnerTeam) {
              results.knockouts.third_place = winnerTeam;
              if (!results.completed_games.includes('third_place')) results.completed_games.push('third_place');
              console.log(`Updating Third Place Winner: ${winnerTeam}`);
              updatedCount++;
            }
          }
        } else {
          // Check other stages matches
          const matchKeys = Object.keys(results.knockouts[stage] || {});
          matchKeys.forEach(matchId => {
            // We only autocomplete if the game contains both teams
            // But wait, since we don't have team keys in results.knockouts, we can infer by ESPN team names
            // If the ESPN match is completed, and it contains homeTeam and awayTeam, and we know this matchId is active
            // For now, if the team matches one of the expected nodes, we can record it
            // Let's rely on standard admin entry for knockouts or check if the teams are tied to the node.
            // A safer automated matching for knockouts: check if winner is playing in a match of this stage.
            // Actually, we can check if both teams played in this stage
          });
        }
      });
    }
  });

  // Calculate official standings for completed groups
  Object.keys(INITIAL_GROUPS).forEach(g => {
    const groupTeams = INITIAL_GROUPS[g];
    const groupMatchesList = GROUP_MATCHES.filter(m => m.group === g);
    
    // Check if all 6 matches are completed
    const allCompleted = groupMatchesList.every(m => 
      results.actual_matches[m.id] && results.actual_matches[m.id].completed
    );

    if (allCompleted) {
      const gameKey = `group_${g}`;
      const sorted = calculateActualStandings(groupTeams, groupMatchesList, results.actual_matches);
      
      const orderChanged = !results.groups[g] || JSON.stringify(results.groups[g]) !== JSON.stringify(sorted);
      if (orderChanged) {
        results.groups[g] = sorted;
        console.log(`Updating Standing Group ${g} final: ${sorted.join(', ')}`);
        updatedCount++;
      }

      if (!results.completed_games.includes(gameKey)) {
        results.completed_games.push(gameKey);
        console.log(`Locking Group Stage: Group ${g} is now completed.`);
        updatedCount++;
      }
    }
  });

  if (updatedCount > 0) {
    console.log(`Saving ${updatedCount} official updates to database...`);
    
    const { error: updateError } = await supabase
      .from('tournament_results')
      .update({
        results: results,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'live');

    if (updateError) {
      console.error("Database update error:", updateError);
      process.exit(1);
    }

    // Load all brackets to recalculate scores
    console.log("Recalculating scores for all user brackets...");
    const { data: brackets, error: bracketsError } = await supabase
      .from('brackets')
      .select('*');

    if (bracketsError) {
      console.error("Error loading user brackets:", bracketsError);
      process.exit(1);
    }

    const updates = brackets.map(b => {
      const newScore = calculateScore(b.predictions, results);
      return supabase
        .from('brackets')
        .update({ score: newScore })
        .eq('id', b.id);
    });

    await Promise.all(updates);
    console.log(`Successfully graded ${brackets.length} user brackets!`);
  } else {
    console.log("No new match updates found. Standings are up to date.");
  }

  console.log("Score sync job complete!");
  process.exit(0);
}

run();
