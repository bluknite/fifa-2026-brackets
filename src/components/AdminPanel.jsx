import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getTeamFlag } from './BracketEditor';

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

const GROUP_MATCHES = [
  {"id": "A_m1", "group": "A", "home": "Mexico", "away": "South Africa", "date": "June 11"},
  {"id": "A_m2", "group": "A", "home": "Korea Republic", "away": "Czechia", "date": "June 11"},
  {"id": "A_m3", "group": "A", "home": "Czechia", "away": "South Africa", "date": "June 18"},
  {"id": "A_m4", "group": "A", "home": "Mexico", "away": "Korea Republic", "date": "June 18"},
  {"id": "A_m5", "group": "A", "home": "Czechia", "away": "Mexico", "date": "June 24"},
  {"id": "A_m6", "group": "A", "home": "South Africa", "away": "Korea Republic", "date": "June 24"},

  {"id": "B_m1", "group": "B", "home": "Canada", "away": "Bosnia and Herzegovina", "date": "June 12"},
  {"id": "B_m2", "group": "B", "home": "Qatar", "away": "Switzerland", "date": "June 13"},
  {"id": "B_m3", "group": "B", "home": "Switzerland", "away": "Bosnia and Herzegovina", "date": "June 18"},
  {"id": "B_m4", "group": "B", "home": "Canada", "away": "Qatar", "date": "June 18"},
  {"id": "B_m5", "group": "B", "home": "Switzerland", "away": "Canada", "date": "June 24"},
  {"id": "B_m6", "group": "B", "home": "Bosnia and Herzegovina", "away": "Qatar", "date": "June 24"},

  {"id": "C_m1", "group": "C", "home": "Brazil", "away": "Morocco", "date": "June 13"},
  {"id": "C_m2", "group": "C", "home": "Haiti", "away": "Scotland", "date": "June 13"},
  {"id": "C_m3", "group": "C", "home": "Scotland", "away": "Morocco", "date": "June 19"},
  {"id": "C_m4", "group": "C", "home": "Brazil", "away": "Haiti", "date": "June 19"},
  {"id": "C_m5", "group": "C", "home": "Scotland", "away": "Brazil", "date": "June 24"},
  {"id": "C_m6", "group": "C", "home": "Morocco", "away": "Haiti", "date": "June 24"},

  {"id": "D_m1", "group": "D", "home": "United States", "away": "Paraguay", "date": "June 12"},
  {"id": "D_m2", "group": "D", "home": "Australia", "away": "Turkiye", "date": "June 13"},
  {"id": "D_m3", "group": "D", "home": "United States", "away": "Australia", "date": "June 19"},
  {"id": "D_m4", "group": "D", "home": "Turkiye", "away": "Paraguay", "date": "June 19"},
  {"id": "D_m5", "group": "D", "home": "Turkiye", "away": "United States", "date": "June 25"},
  {"id": "D_m6", "group": "D", "home": "Paraguay", "away": "Australia", "date": "June 25"},

  {"id": "E_m1", "group": "E", "home": "Germany", "away": "Curacao", "date": "June 14"},
  {"id": "E_m2", "group": "E", "home": "Ivory Coast", "away": "Ecuador", "date": "June 14"},
  {"id": "E_m3", "group": "E", "home": "Germany", "away": "Ivory Coast", "date": "June 20"},
  {"id": "E_m4", "group": "E", "home": "Ecuador", "away": "Curacao", "date": "June 20"},
  {"id": "E_m5", "group": "E", "home": "Ecuador", "away": "Germany", "date": "June 25"},
  {"id": "E_m6", "group": "E", "home": "Curacao", "away": "Ivory Coast", "date": "June 25"},

  {"id": "F_m1", "group": "F", "home": "Netherlands", "away": "Japan", "date": "June 14"},
  {"id": "F_m2", "group": "F", "home": "Sweden", "away": "Tunisia", "date": "June 14"},
  {"id": "F_m3", "group": "F", "home": "Netherlands", "away": "Sweden", "date": "June 20"},
  {"id": "F_m4", "group": "F", "home": "Tunisia", "away": "Japan", "date": "June 20"},
  {"id": "F_m5", "group": "F", "home": "Japan", "away": "Sweden", "date": "June 25"},
  {"id": "F_m6", "group": "F", "home": "Tunisia", "away": "Netherlands", "date": "June 25"},

  {"id": "G_m1", "group": "G", "home": "Belgium", "away": "Egypt", "date": "June 15"},
  {"id": "G_m2", "group": "G", "home": "Iran", "away": "New Zealand", "date": "June 15"},
  {"id": "G_m3", "group": "G", "home": "Belgium", "away": "Iran", "date": "June 21"},
  {"id": "G_m4", "group": "G", "home": "New Zealand", "away": "Egypt", "date": "June 21"},
  {"id": "G_m5", "group": "G", "home": "Egypt", "away": "Iran", "date": "June 26"},
  {"id": "G_m6", "group": "G", "home": "New Zealand", "away": "Belgium", "date": "June 26"},

  {"id": "H_m1", "group": "H", "home": "Spain", "away": "Cape Verde", "date": "June 15"},
  {"id": "H_m2", "group": "H", "home": "Saudi Arabia", "away": "Uruguay", "date": "June 15"},
  {"id": "H_m3", "group": "H", "home": "Spain", "away": "Saudi Arabia", "date": "June 21"},
  {"id": "H_m4", "group": "H", "home": "Uruguay", "away": "Cape Verde", "date": "June 21"},
  {"id": "H_m5", "group": "H", "home": "Cape Verde", "away": "Saudi Arabia", "date": "June 26"},
  {"id": "H_m6", "group": "H", "home": "Uruguay", "away": "Spain", "date": "June 26"},

  {"id": "I_m1", "group": "I", "home": "France", "away": "Senegal", "date": "June 16"},
  {"id": "I_m2", "group": "I", "home": "Iraq", "away": "Norway", "date": "June 16"},
  {"id": "I_m3", "group": "I", "home": "France", "away": "Iraq", "date": "June 22"},
  {"id": "I_m4", "group": "I", "home": "Norway", "away": "Senegal", "date": "June 22"},
  {"id": "I_m5", "group": "I", "home": "Norway", "away": "France", "date": "June 26"},
  {"id": "I_m6", "group": "I", "home": "Senegal", "away": "Iraq", "date": "June 26"},

  {"id": "J_m1", "group": "J", "home": "Argentina", "away": "Algeria", "date": "June 16"},
  {"id": "J_m2", "group": "J", "home": "Austria", "away": "Jordan", "date": "June 16"},
  {"id": "J_m3", "group": "J", "home": "Argentina", "away": "Austria", "date": "June 22"},
  {"id": "J_m4", "group": "J", "home": "Jordan", "away": "Algeria", "date": "June 22"},
  {"id": "J_m5", "group": "J", "home": "Algeria", "away": "Austria", "date": "June 27"},
  {"id": "J_m6", "group": "J", "home": "Jordan", "away": "Argentina", "date": "June 27"},

  {"id": "K_m1", "group": "K", "home": "Portugal", "away": "DR Congo", "date": "June 17"},
  {"id": "K_m2", "group": "K", "home": "Uzbekistan", "away": "Colombia", "date": "June 17"},
  {"id": "K_m3", "group": "K", "home": "Portugal", "away": "Uzbekistan", "date": "June 23"},
  {"id": "K_m4", "group": "K", "home": "Colombia", "away": "DR Congo", "date": "June 23"},
  {"id": "K_m5", "group": "K", "home": "Colombia", "away": "Portugal", "date": "June 27"},
  {"id": "K_m6", "group": "K", "home": "DR Congo", "away": "Uzbekistan", "date": "June 27"},

  {"id": "L_m1", "group": "L", "home": "England", "away": "Croatia", "date": "June 17"},
  {"id": "L_m2", "group": "L", "home": "Ghana", "away": "Panama", "date": "June 17"},
  {"id": "L_m3", "group": "L", "home": "England", "away": "Ghana", "date": "June 23"},
  {"id": "L_m4", "group": "L", "home": "Panama", "away": "Croatia", "date": "June 23"},
  {"id": "L_m5", "group": "L", "home": "Panama", "away": "England", "date": "June 27"},
  {"id": "L_m6", "group": "L", "home": "Croatia", "away": "Ghana", "date": "June 27"}
];

export default function AdminPanel({ tournamentResults, onResultsUpdated }) {
  const [localResults, setLocalResults] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (tournamentResults) {
      setLocalResults(JSON.parse(JSON.stringify(tournamentResults.results || {})));
      setIsLocked(tournamentResults.is_locked || false);
    }
  }, [tournamentResults]);

  if (!localResults) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Admin Panel...</div>;
  }

  // Helper: map a team name to its flag emoji
  const allTeamsList = Object.values(INITIAL_GROUPS).flat();

  // Scoring function: grades user predictions against official results
  const calculateScore = (userPredictions, official) => {
    let score = 0;

    // 1. Group Stage Match predictions: +5 pts each
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

    // 2. Group stage: 10 pts per correct advancing team (top 2)
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

    // 3. Knockout matches
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

    // Third place
    if (official.completed_games?.includes('third_place')) {
      const predThird = userPredictions.knockouts?.third_place;
      const actThird = official.knockouts?.third_place;
      if (predThird === actThird && actThird !== null) score += 160;
    }

    // Final
    if (official.completed_games?.includes('final')) {
      const predFinal = userPredictions.knockouts?.final;
      const actFinal = official.knockouts?.final;
      if (predFinal === actFinal && actFinal !== null) score += 320;
    }

    return score;
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setStatusMsg(null);

      // 1. Save results to tournament_results
      const { error: resultsError } = await supabase
        .from('tournament_results')
        .update({
          results: localResults,
          is_locked: isLocked,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'live');

      if (resultsError) throw resultsError;

      // 2. Load all brackets to score them
      const { data: brackets, error: bracketsError } = await supabase
        .from('brackets')
        .select('*');

      if (bracketsError) throw bracketsError;

      // 3. Batch recalculate scores and update DB
      const updates = brackets.map(b => {
        const newScore = calculateScore(b.predictions, localResults);
        return supabase
          .from('brackets')
          .update({ score: newScore })
          .eq('id', b.id);
      });

      await Promise.all(updates);

      setStatusMsg({ type: 'success', message: 'Official standings saved and all user scores successfully recalculated!' });
      onResultsUpdated();
    } catch (err) {
      console.error('Admin panel save error:', err);
      setStatusMsg({ type: 'error', message: err.message || 'Error saving changes.' });
    } finally {
      setSaving(false);
    }
  };

  // --- Reset all user predictions/brackets ---
  const handleResetBrackets = async () => {
    if (!window.confirm("Are you sure you want to RESET all user predictions, brackets, and scores? This action cannot be undone.")) return;
    try {
      setSaving(true);
      setStatusMsg(null);

      const { data: brackets, error: loadError } = await supabase
        .from('brackets')
        .select('id');
      if (loadError) throw loadError;

      const emptyPredictions = {
        groups: {},
        groupMatches: {},
        knockouts: {
          r32: {},
          r16: {},
          qf: {},
          sf: {},
          final: null,
          third_place: null
        },
        third_place_advancers: []
      };

      const updates = brackets.map(b => 
        supabase
          .from('brackets')
          .update({
            predictions: emptyPredictions,
            score: 0,
            is_submitted: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', b.id)
      );

      await Promise.all(updates);
      setStatusMsg({ type: 'success', message: `Successfully reset all ${brackets.length} user brackets.` });
      onResultsUpdated();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', message: err.message || 'Error resetting brackets.' });
    } finally {
      setSaving(false);
    }
  };

  // --- Reset official standing results and lock states back to default seed ---
  const handleResetOfficialResults = async () => {
    if (!window.confirm("Are you sure you want to RESET all official tournament results, matches, and lock states back to default seed? This will also grade all user brackets to 0.")) return;
    try {
      setSaving(true);
      setStatusMsg(null);

      const defaultResults = {
        groups: INITIAL_GROUPS,
        group_matches: GROUP_MATCHES.map(m => ({ ...m, date: m.date })),
        knockouts: {
          r32: {
            m1: null, m2: null, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null,
            m9: null, m10: null, m11: null, m12: null, m13: null, m14: null, m15: null, m16: null
          },
          r16: {
            m1: null, m2: null, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null
          },
          qf: {
            m1: null, m2: null, m3: null, m4: null
          },
          sf: {
            m1: null, m2: null
          },
          final: null,
          third_place: null
        },
        completed_games: [],
        actual_matches: {}
      };

      const { error: resetError } = await supabase
        .from('tournament_results')
        .update({
          results: defaultResults,
          is_locked: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'live');

      if (resetError) throw resetError;

      // Grade all user brackets to 0
      const { data: brackets, error: bracketsError } = await supabase
        .from('brackets')
        .select('id');
      if (bracketsError) throw bracketsError;

      const updates = brackets.map(b => 
        supabase
          .from('brackets')
          .update({ score: 0 })
          .eq('id', b.id)
      );
      await Promise.all(updates);

      setLocalResults(defaultResults);
      setIsLocked(false);
      setStatusMsg({ type: 'success', message: 'Official results successfully reset and user scores set to 0.' });
      onResultsUpdated();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', message: err.message || 'Error resetting results.' });
    } finally {
      setSaving(false);
    }
  };

  // --- Trigger Score Sync from ESPN API directly ---
  const handleTriggerScoreSync = async () => {
    try {
      setSaving(true);
      setStatusMsg(null);

      const dates = [];
      for (let d = 11; d <= 30; d++) {
        dates.push(`202606${d}`);
      }
      for (let d = 1; d <= 20; d++) {
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        dates.push(`202607${dayStr}`);
      }

      setStatusMsg({ type: 'success', message: 'Syncing live scores from ESPN API...' });

      const matchesFound = [];
      const batchSize = 5;
      for (let i = 0; i < dates.length; i += batchSize) {
        const batch = dates.slice(i, i + batchSize);
        const promises = batch.map(date => 
          fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`)
            .then(res => res.json())
            .catch(() => null)
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

      const results = JSON.parse(JSON.stringify(localResults));
      if (!results.actual_matches) results.actual_matches = {};
      if (!results.completed_games) results.completed_games = [];
      if (!results.groups) results.groups = {};

      const normalizeLocalName = (name) => {
        const mappings = {
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
        if (!name) return "";
        return mappings[name.trim()] || name.trim();
      };

      let updatedCount = 0;

      // Group Standings FIFA Rules Calculator
      const calculateStandingsLocal = (teams, matches, scores) => {
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
        teams.forEach(t => { stats[t].gd = stats[t].gf - stats[t].ga; });
        const sorted = [...teams];
        sorted.sort((a, b) => {
          if (stats[b].points !== stats[a].points) return stats[b].points - stats[a].points;
          if (stats[b].gd !== stats[a].gd) return stats[b].gd - stats[a].gd;
          if (stats[b].gf !== stats[a].gf) return stats[b].gf - stats[a].gf;
          const h2hMatch = matches.find(m => (m.home === a && m.away === b) || (m.home === b && m.away === a));
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
      };

      matchesFound.forEach(event => {
        const completed = event.status?.type?.completed || false;
        if (!completed) return;
        const competitors = event.competitors || [];
        if (competitors.length < 2) return;
        const homeComp = competitors.find(c => c.homeAway === 'home');
        const awayComp = competitors.find(c => c.homeAway === 'away');
        if (!homeComp || !awayComp) return;

        const homeTeam = normalizeLocalName(homeComp.team?.displayName);
        const awayTeam = normalizeLocalName(awayComp.team?.displayName);
        const homeScore = parseInt(homeComp.score, 10);
        const awayScore = parseInt(awayComp.score, 10);

        const groupMatch = GROUP_MATCHES.find(gm => 
          (gm.home === homeTeam && gm.away === awayTeam) || 
          (gm.home === awayTeam && gm.away === homeTeam)
        );

        if (groupMatch) {
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
            updatedCount++;
          }
        }

        // Champion and third place winner
        const winnerTeam = homeComp.winner ? homeTeam : (awayComp.winner ? awayTeam : null);
        if (winnerTeam) {
          const isFinal = event.name?.toLowerCase().includes("final") && !event.name?.toLowerCase().includes("quarter") && !event.name?.toLowerCase().includes("semi") && !event.name?.toLowerCase().includes("third");
          const isThird = event.name?.toLowerCase().includes("third");
          if (isFinal && results.knockouts.final !== winnerTeam) {
            results.knockouts.final = winnerTeam;
            if (!results.completed_games.includes('final')) results.completed_games.push('final');
            updatedCount++;
          }
          if (isThird && results.knockouts.third_place !== winnerTeam) {
            results.knockouts.third_place = winnerTeam;
            if (!results.completed_games.includes('third_place')) results.completed_games.push('third_place');
            updatedCount++;
          }
        }
      });

      // Recalculate standings for completed groups
      Object.keys(INITIAL_GROUPS).forEach(g => {
        const groupTeams = INITIAL_GROUPS[g];
        const groupMatchesList = GROUP_MATCHES.filter(m => m.group === g);
        const allCompleted = groupMatchesList.every(m => 
          results.actual_matches[m.id] && results.actual_matches[m.id].completed
        );
        if (allCompleted) {
          const gameKey = `group_${g}`;
          const sorted = calculateStandingsLocal(groupTeams, groupMatchesList, results.actual_matches);
          const orderChanged = !results.groups[g] || JSON.stringify(results.groups[g]) !== JSON.stringify(sorted);
          if (orderChanged) {
            results.groups[g] = sorted;
            updatedCount++;
          }
          if (!results.completed_games.includes(gameKey)) {
            results.completed_games.push(gameKey);
            updatedCount++;
          }
        }
      });

      if (updatedCount > 0) {
        // Update DB tournament results
        const { error: resultsError } = await supabase
          .from('tournament_results')
          .update({
            results: results,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'live');
        if (resultsError) throw resultsError;

        // Recalculate user brackets scores
        const { data: brackets, error: bracketsError } = await supabase
          .from('brackets')
          .select('*');
        if (bracketsError) throw bracketsError;

        const updates = brackets.map(b => {
          const newScore = calculateScore(b.predictions, results);
          return supabase
            .from('brackets')
            .update({ score: newScore })
            .eq('id', b.id);
        });
        await Promise.all(updates);

        setLocalResults(results);
        setStatusMsg({ type: 'success', message: `ESPN Score sync complete. ${updatedCount} updates recorded. User scores recalculated!` });
        onResultsUpdated();
      } else {
        setStatusMsg({ type: 'success', message: 'Score sync complete. Standings are already up to date.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', message: err.message || 'Error executing ESPN Score sync.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--gold)' }}>League Administrator Control</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Lock submissions, trigger score sync, or reset datasets.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {statusMsg && (
            <div className={statusMsg.type === 'success' ? 'success-box' : 'error-box'} style={{ margin: 0, padding: '0.5rem 1rem' }}>
              {statusMsg.message}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Updating...' : 'Save & Grade All Brackets'}
          </button>
        </div>
      </div>

      {/* Global Submission Locking Toggle */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', borderLeft: '4px solid var(--crimson)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔒</span> Submission Access Lock
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Toggle this switch to manually freeze all user bracket updates. If locked, users can view their brackets but cannot make draft changes.
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className={`btn ${isLocked ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setIsLocked(!isLocked)}
          >
            {isLocked ? '🔓 Open Bracket Submissions' : '🔒 Lock Bracket Submissions'}
          </button>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Current Status: {isLocked ? <span style={{ color: 'var(--crimson)' }}>LOCKED</span> : <span style={{ color: 'var(--emerald)' }}>OPEN</span>}
          </span>
        </div>
      </div>

      {/* Admin Settings & Resets */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', borderLeft: '4px solid var(--gold)', background: 'rgba(245, 158, 11, 0.02)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚙️</span> Administrative Settings & Resets
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Reset player entry data for testing, clear official results to default state, or trigger ESPN live scores synchronization.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleTriggerScoreSync} disabled={saving} style={{ border: '1px solid var(--border-glow)' }}>
            🔄 Sync Live Scores from ESPN
          </button>
          
          <button className="btn btn-danger" onClick={handleResetBrackets} disabled={saving} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--crimson)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ Reset All User Brackets
          </button>

          <button className="btn btn-danger" onClick={handleResetOfficialResults} disabled={saving} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--crimson)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ Reset Official Results to Seed
          </button>
        </div>
      </div>

      {/* Knockouts Configuration */}
      <div className="admin-section" style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '1.2rem', color: 'var(--emerald)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Official Knockout Winners Override</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Round of 32 Matches */}
          <div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Round of 32 Winners</h5>
            <div className="admin-grid">
              {Array.from({ length: 16 }).map((_, idx) => {
                const matchId = `m${idx + 1}`;
                const currentWinner = localResults.knockouts?.r32?.[matchId] || '';
                const gameKey = `r32_${matchId}`;
                const isCompleted = localResults.completed_games?.includes(gameKey);

                return (
                  <div key={matchId} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <span>Match {idx + 1} Winner</span>
                      <button 
                        style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                        className={`btn ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          const completed = [...(localResults.completed_games || [])];
                          const next = completed.includes(gameKey) ? completed.filter(k => k !== gameKey) : [...completed, gameKey];
                          setLocalResults({ ...localResults, completed_games: next });
                        }}
                      >
                        {isCompleted ? 'Locked ✓' : 'Lock'}
                      </button>
                    </div>
                    <select 
                      className="admin-select"
                      value={currentWinner}
                      onChange={(e) => {
                        const nextKnockouts = { ...localResults.knockouts };
                        nextKnockouts.r32[matchId] = e.target.value || null;
                        setLocalResults({ ...localResults, knockouts: nextKnockouts });
                      }}
                    >
                      <option value="">-- No Winner Yet --</option>
                      {allTeamsList.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Round of 16 Matches */}
          <div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Round of 16 Winners</h5>
            <div className="admin-grid">
              {Array.from({ length: 8 }).map((_, idx) => {
                const matchId = `m${idx + 1}`;
                const currentWinner = localResults.knockouts?.r16?.[matchId] || '';
                const gameKey = `r16_${matchId}`;
                const isCompleted = localResults.completed_games?.includes(gameKey);

                return (
                  <div key={matchId} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <span>Match {16 + idx + 1} Winner</span>
                      <button 
                        style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                        className={`btn ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          const completed = [...(localResults.completed_games || [])];
                          const next = completed.includes(gameKey) ? completed.filter(k => k !== gameKey) : [...completed, gameKey];
                          setLocalResults({ ...localResults, completed_games: next });
                        }}
                      >
                        {isCompleted ? 'Locked ✓' : 'Lock'}
                      </button>
                    </div>
                    <select 
                      className="admin-select"
                      value={currentWinner}
                      onChange={(e) => {
                        const nextKnockouts = { ...localResults.knockouts };
                        nextKnockouts.r16[matchId] = e.target.value || null;
                        setLocalResults({ ...localResults, knockouts: nextKnockouts });
                      }}
                    >
                      <option value="">-- No Winner Yet --</option>
                      {allTeamsList.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarterfinals, Semifinals, Finals */}
          <div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Final Rounds Winners</h5>
            <div className="admin-grid">
              {/* Grand Final Winner */}
              <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderColor: 'var(--gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <span>Champion (Final)</span>
                  <button 
                    style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                    className={`btn ${localResults.completed_games?.includes('final') ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      const completed = [...(localResults.completed_games || [])];
                      const next = completed.includes('final') ? completed.filter(k => k !== 'final') : [...completed, 'final'];
                      setLocalResults({ ...localResults, completed_games: next });
                    }}
                  >
                    {localResults.completed_games?.includes('final') ? 'Locked ✓' : 'Lock'}
                  </button>
                </div>
                <select 
                  className="admin-select"
                  value={localResults.knockouts?.final || ''}
                  onChange={(e) => {
                    const nextKnockouts = { ...localResults.knockouts };
                    nextKnockouts.final = e.target.value || null;
                    setLocalResults({ ...localResults, knockouts: nextKnockouts });
                  }}
                >
                  <option value="">-- No Winner Yet --</option>
                  {allTeamsList.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Third Place Winner */}
              <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderColor: 'var(--azure)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <span>Third Place Match</span>
                  <button 
                    style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                    className={`btn ${localResults.completed_games?.includes('third_place') ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      const completed = [...(localResults.completed_games || [])];
                      const next = completed.includes('third_place') ? completed.filter(k => k !== 'third_place') : [...completed, 'third_place'];
                      setLocalResults({ ...localResults, completed_games: next });
                    }}
                  >
                    {localResults.completed_games?.includes('third_place') ? 'Locked ✓' : 'Lock'}
                  </button>
                </div>
                <select 
                  className="admin-select"
                  value={localResults.knockouts?.third_place || ''}
                  onChange={(e) => {
                    const nextKnockouts = { ...localResults.knockouts };
                    nextKnockouts.third_place = e.target.value || null;
                    setLocalResults({ ...localResults, knockouts: nextKnockouts });
                  }}
                >
                  <option value="">-- No Winner Yet --</option>
                  {allTeamsList.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
