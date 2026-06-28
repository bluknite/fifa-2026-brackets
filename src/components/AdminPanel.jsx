import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getTeamFlag } from './BracketEditor';
import { calculateSecondChanceScore, getOfficialAdvancingTeams } from '../utils/standings';

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

export default function AdminPanel({ tournamentResults, onResultsUpdated }) {
  const [localResults, setLocalResults] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSecondChanceLocked, setIsSecondChanceLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [selectedGroupOverride, setSelectedGroupOverride] = useState('A');

  useEffect(() => {
    if (tournamentResults) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalResults(JSON.parse(JSON.stringify(tournamentResults.results || {})));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLocked(tournamentResults.is_locked || false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSecondChanceLocked(tournamentResults.is_second_chance_locked || false);
    }
  }, [tournamentResults]);

  if (!localResults) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Admin Panel...</div>;
  }

  // Helper: map a team name to its flag emoji

  // Scoring function: grades user predictions against official results
  const calculateScore = (userPredictions, official, isLockedVal) => {
    if (!isLockedVal) return 0;
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


  const handleToggleLock = async () => {
    try {
      setSaving(true);
      setStatusMsg(null);
      const newLockState = !isLocked;

      const { error } = await supabase
        .from('tournament_results')
        .update({
          is_locked: newLockState,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'live');

      if (error) throw error;

      // Recalculate user brackets scores with the new lock state
      const { data: brackets, error: bracketsError } = await supabase
        .from('brackets')
        .select('*');
      if (bracketsError) throw bracketsError;

      const updates = brackets.map(b => {
        const newScore = calculateScore(b.predictions, localResults, newLockState);
        return supabase
          .from('brackets')
          .update({ score: newScore })
          .eq('id', b.id);
      });
      await Promise.all(updates);

      setIsLocked(newLockState);
      setStatusMsg({ type: 'success', message: `Bracket submissions are now ${newLockState ? 'LOCKED' : 'OPEN'}! User scores recalculated.` });
      onResultsUpdated();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', message: err.message || 'Error updating lock state.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSecondChanceLock = async () => {
    try {
      setSaving(true);
      setStatusMsg(null);
      const newSecondChanceLockState = !isSecondChanceLocked;

      const { error } = await supabase
        .from('tournament_results')
        .update({
          is_second_chance_locked: newSecondChanceLockState,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'live');

      if (error) throw error;

      // Recalculate user brackets scores with the new lock state
      const { data: brackets, error: bracketsError } = await supabase
        .from('brackets')
        .select('*');
      if (bracketsError) throw bracketsError;

      const updates = brackets.map(b => {
        const newSecondChanceScore = calculateSecondChanceScore(b.predictions_second_chance, localResults, newSecondChanceLockState);
        return supabase
          .from('brackets')
          .update({ score_second_chance: newSecondChanceScore })
          .eq('id', b.id);
      });
      await Promise.all(updates);

      setIsSecondChanceLocked(newSecondChanceLockState);
      setStatusMsg({ type: 'success', message: `Second Chance submissions are now ${newSecondChanceLockState ? 'LOCKED' : 'OPEN'}! User scores recalculated.` });
      onResultsUpdated();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', message: err.message || 'Error updating Second Chance lock state.' });
    } finally {
      setSaving(false);
    }
  };

  // --- Reset all user primary predictions/brackets ---
  const handleResetPrimaryBrackets = async () => {
    if (!window.confirm("Are you sure you want to RESET all user primary predictions, brackets, and scores? This will not affect second chance brackets. This action cannot be undone.")) return;
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
      setStatusMsg({ type: 'success', message: `Successfully reset primary brackets and scores for all ${brackets.length} users.` });
      onResultsUpdated();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', message: err.message || 'Error resetting primary brackets.' });
    } finally {
      setSaving(false);
    }
  };

  // --- Reset all user second chance predictions/brackets ---
  const handleResetSecondChanceBrackets = async () => {
    if (!window.confirm("Are you sure you want to RESET all user second chance predictions and scores? This will not affect primary bracket results. This action cannot be undone.")) return;
    try {
      setSaving(true);
      setStatusMsg(null);

      const { data: brackets, error: loadError } = await supabase
        .from('brackets')
        .select('id');
      if (loadError) throw loadError;

      const updates = brackets.map(b => 
        supabase
          .from('brackets')
          .update({
            predictions_second_chance: {
              knockouts: {
                r32: {},
                r16: {},
                qf: {},
                sf: {},
                final: null,
                third_place: null
              }
            },
            score_second_chance: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', b.id)
      );

      await Promise.all(updates);
      setStatusMsg({ type: 'success', message: `Successfully reset second chance brackets and scores for all ${brackets.length} users.` });
      onResultsUpdated();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', message: err.message || 'Error resetting second chance brackets.' });
    } finally {
      setSaving(false);
    }
  };

  // --- Reset official standing results back to default seed ---
  const handleResetOfficialResults = async () => {
    if (!window.confirm("Are you sure you want to RESET all official tournament results and matches back to default seed? This will also grade all user brackets to 0.")) return;
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
          is_second_chance_locked: false,
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
          .update({ 
            score: 0,
            score_second_chance: 0
          })
          .eq('id', b.id)
      );
      await Promise.all(updates);

      setIsSecondChanceLocked(false);
      setLocalResults(defaultResults);
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

      matchesFound.forEach(event => {
        const completed = event.status?.type?.completed || false;
        if (!completed) return;
        const competitors = event.competitions?.[0]?.competitors || [];
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

      // --- Automated Knockout Sync (R32, R16, QF, SF) ---
      const allGroupsCompleted = Object.keys(INITIAL_GROUPS).every(g => 
        results.completed_games?.includes(`group_${g}`)
      );
      if (allGroupsCompleted) {
        const r32Teams = getOfficialAdvancingTeams(results, GROUP_MATCHES);
        const r32Matches = [
          { id: 'm1', teamAKey: '2A', teamBKey: '2B' },
          { id: 'm2', teamAKey: '1E', teamBKey: 'OPP_1E' },
          { id: 'm3', teamAKey: '1F', teamBKey: '2C' },
          { id: 'm4', teamAKey: '1C', teamBKey: '2F' },
          { id: 'm5', teamAKey: '1I', teamBKey: 'OPP_1I' },
          { id: 'm6', teamAKey: '2E', teamBKey: '2I' },
          { id: 'm7', teamAKey: '1A', teamBKey: 'OPP_1A' },
          { id: 'm8', teamAKey: '1L', teamBKey: 'OPP_1L' },
          { id: 'm9', teamAKey: '1D', teamBKey: 'OPP_1D' },
          { id: 'm10', teamAKey: '1G', teamBKey: 'OPP_1G' },
          { id: 'm11', teamAKey: '2K', teamBKey: '2L' },
          { id: 'm12', teamAKey: '1H', teamBKey: '2J' },
          { id: 'm13', teamAKey: '1B', teamBKey: 'OPP_1B' },
          { id: 'm14', teamAKey: '1J', teamBKey: '2H' },
          { id: 'm15', teamAKey: '1K', teamBKey: 'OPP_1K' },
          { id: 'm16', teamAKey: '2D', teamBKey: '2G' }
        ];

        const getOfficialKnockoutTeams = (stage, matchId) => {
          if (stage === 'r32') {
            const match = r32Matches.find(m => m.id === matchId);
            const teamA = r32Teams[match.teamAKey] || null;
            const teamB = r32Teams[match.teamBKey] || null;
            return { teamA, teamB };
          }

          const getWinner = (st, mId) => results.knockouts?.[st]?.[mId] || null;

          if (stage === 'r16') {
            const sourceMap = {
              m1: ['r32', 'm1', 'm3'],
              m2: ['r32', 'm2', 'm5'],
              m3: ['r32', 'm4', 'm6'],
              m4: ['r32', 'm7', 'm8'],
              m5: ['r32', 'm11', 'm12'],
              m6: ['r32', 'm9', 'm10'],
              m7: ['r32', 'm14', 'm16'],
              m8: ['r32', 'm13', 'm15']
            };
            const [prevStage, mKeyA, mKeyB] = sourceMap[matchId];
            const teamA = getWinner(prevStage, mKeyA);
            const teamB = getWinner(prevStage, mKeyB);
            return { teamA, teamB };
          }

          if (stage === 'qf') {
            const sourceMap = {
              m1: ['r16', 'm1', 'm2'],
              m2: ['r16', 'm5', 'm6'],
              m3: ['r16', 'm3', 'm4'],
              m4: ['r16', 'm7', 'm8']
            };
            const [prevStage, mKeyA, mKeyB] = sourceMap[matchId];
            const teamA = getWinner(prevStage, mKeyA);
            const teamB = getWinner(prevStage, mKeyB);
            return { teamA, teamB };
          }

          if (stage === 'sf') {
            const sourceMap = {
              m1: ['qf', 'm1', 'm2'],
              m2: ['qf', 'm3', 'm4']
            };
            const [prevStage, mKeyA, mKeyB] = sourceMap[matchId];
            const teamA = getWinner(prevStage, mKeyA);
            const teamB = getWinner(prevStage, mKeyB);
            return { teamA, teamB };
          }

          return { teamA: null, teamB: null };
        };

        const stagesToSync = [
          { key: 'r32', count: 16 },
          { key: 'r16', count: 8 },
          { key: 'qf', count: 4 },
          { key: 'sf', count: 2 }
        ];

        stagesToSync.forEach(({ key, count }) => {
          if (!results.knockouts[key]) results.knockouts[key] = {};
          for (let idx = 0; idx < count; idx++) {
            const matchId = `m${idx + 1}`;
            const { teamA, teamB } = getOfficialKnockoutTeams(key, matchId);
            if (!teamA || !teamB) continue;

            const matchingEvent = matchesFound.find(event => {
              const competitors = event.competitions?.[0]?.competitors || [];
              if (competitors.length < 2) return false;
              const t1 = normalizeLocalName(competitors[0].team?.displayName);
              const t2 = normalizeLocalName(competitors[1].team?.displayName);
              return (t1 === teamA && t2 === teamB) || (t1 === teamB && t2 === teamA);
            });

            if (matchingEvent && matchingEvent.status?.type?.completed) {
              const competitors = matchingEvent.competitions[0].competitors;
              const homeComp = competitors.find(c => c.homeAway === 'home');
              const awayComp = competitors.find(c => c.homeAway === 'away');
              const hTeam = normalizeLocalName(homeComp.team?.displayName);
              const aTeam = normalizeLocalName(awayComp.team?.displayName);
              const winnerTeam = homeComp.winner ? hTeam : (awayComp.winner ? aTeam : null);

              if (winnerTeam && results.knockouts[key][matchId] !== winnerTeam) {
                results.knockouts[key][matchId] = winnerTeam;
                const gameKey = `${key}_${matchId}`;
                if (!results.completed_games.includes(gameKey)) {
                  results.completed_games.push(gameKey);
                }
                updatedCount++;
              }
            }
          }
        });
      }

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
        setLocalResults(results);
      }

      // ALWAYS Recalculate user brackets scores on sync trigger
      const { data: brackets, error: bracketsError } = await supabase
        .from('brackets')
        .select('*');
      if (bracketsError) throw bracketsError;

      const updates = brackets.map(b => {
        const newScore = calculateScore(b.predictions, results, isLocked);
        const newSecondChanceScore = calculateSecondChanceScore(b.predictions_second_chance, results, isSecondChanceLocked);
        return supabase
          .from('brackets')
          .update({ 
            score: newScore,
            score_second_chance: newSecondChanceScore
          })
          .eq('id', b.id);
      });
      await Promise.all(updates);

      if (updatedCount > 0) {
        setStatusMsg({ type: 'success', message: `ESPN Score sync complete. ${updatedCount} updates recorded. User scores recalculated!` });
      } else {
        setStatusMsg({ type: 'success', message: 'Score sync complete. Standings are already up to date. User scores recalculated!' });
      }
      onResultsUpdated();
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

        </div>
      </div>

      {/* Global Submission Locking Toggle */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', borderLeft: '4px solid var(--crimson)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔒</span> Submission Access Lock
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Toggle this switch to manually freeze all user bracket updates. If locked, users can view their brackets but cannot make changes.
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className={`btn ${isLocked ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleToggleLock}
            disabled={saving}
          >
            {isLocked ? '🔓 Open Bracket Submissions' : '🔒 Lock Bracket Submissions'}
          </button>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Current Status: {isLocked ? <span style={{ color: 'var(--crimson)' }}>LOCKED</span> : <span style={{ color: 'var(--emerald)' }}>OPEN</span>}
          </span>
        </div>
      </div>

      {/* Second Chance Submission Locking Toggle */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', borderLeft: '4px solid var(--azure)', background: 'rgba(59, 130, 246, 0.02)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔒</span> Second-Chance Knockout Lock
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Manually freeze second-chance bracket entries. Predictions automatically lock if knockout games start.
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className={`btn ${isSecondChanceLocked ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleToggleSecondChanceLock}
            disabled={saving}
          >
            {isSecondChanceLocked ? '🔓 Open Second Chance Submissions' : '🔒 Lock Second Chance Submissions'}
          </button>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Current Status: {isSecondChanceLocked ? <span style={{ color: 'var(--crimson)' }}>LOCKED</span> : <span style={{ color: 'var(--emerald)' }}>OPEN</span>}
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
          
          <button className="btn btn-danger" onClick={handleResetPrimaryBrackets} disabled={saving} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--crimson)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ Reset Primary Brackets
          </button>

          <button className="btn btn-danger" onClick={handleResetSecondChanceBrackets} disabled={saving} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--crimson)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ Reset Second Chance Brackets
          </button>

          <button className="btn btn-danger" onClick={handleResetOfficialResults} disabled={saving} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--crimson)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ Reset Official Results to Seed
          </button>
        </div>
      </div>

      {/* Synced Group Stage Standings & Results */}
      <div className="admin-section" style={{ marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
        <h4 style={{ fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚽</span> Synced Group Stage Standings & Results
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          View real-time official group matches and standings fetched from ESPN. Runs automatically or via manual sync.
        </p>

        {/* Group Selector tab/button row */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {Object.keys(INITIAL_GROUPS).map(groupKey => (
            <button
              key={groupKey}
              className={`btn ${selectedGroupOverride === groupKey ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setSelectedGroupOverride(groupKey)}
            >
              Group {groupKey}
            </button>
          ))}
        </div>

        {/* Split grid: Matches list (left) vs Standings (right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', flexWrap: 'wrap' }} className="group-editor-row">
          {/* Matches List */}
          <div>
            <h5 style={{ color: 'var(--emerald)', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>Group {selectedGroupOverride} Match Scoreboard</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {GROUP_MATCHES.filter(m => m.group === selectedGroupOverride).map(m => {
                const matchData = localResults.actual_matches?.[m.id];
                const isCompleted = matchData?.completed;

                return (
                  <div key={m.id} className="match-predict-row" style={{ background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'rgba(0,0,0,0.15)' }}>
                    <div className="match-info-col">
                      <span className="match-fixture-lbl">Fixture ({m.date})</span>
                      {isCompleted ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {getTeamFlag(m.home)} {m.home} vs {getTeamFlag(m.away)} {m.away}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {getTeamFlag(m.home)} {m.home} vs {getTeamFlag(m.away)} {m.away}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isCompleted ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>
                            {matchData.homeGoals} - {matchData.awayGoals}
                          </span>
                          <span className="status-badge status-submitted" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>Final</span>
                        </div>
                      ) : (
                        <span className="status-badge" style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Scheduled</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculated Standings */}
          <div>
            <h5 style={{ color: 'var(--azure)', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>Official Calculated Standings</h5>
            
            <div className="standings-table-container">
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.4rem 0.25rem' }}>Pos</th>
                    <th>Team</th>
                    <th style={{ textAlign: 'center' }}>P</th>
                    <th style={{ textAlign: 'center' }}>W</th>
                    <th style={{ textAlign: 'center' }}>D</th>
                    <th style={{ textAlign: 'center' }}>L</th>
                    <th style={{ textAlign: 'center' }}>GD</th>
                    <th style={{ textAlign: 'right', paddingRight: '0.5rem' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const groupTeams = INITIAL_GROUPS[selectedGroupOverride];
                    const groupMatchesList = GROUP_MATCHES.filter(m => m.group === selectedGroupOverride);
                    
                    // We calculate standing statistics dynamically based on currently synced scores
                    const sortedTeams = calculateStandingsLocal(groupTeams, groupMatchesList, localResults.actual_matches || {});
                    
                    // Pre-calculate team stats
                    const stats = {};
                    groupTeams.forEach(t => {
                      stats[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0, gd: 0 };
                    });
                    groupMatchesList.forEach(m => {
                      const score = localResults.actual_matches?.[m.id];
                      if (!score || !score.completed) return;
                      const hg = score.homeGoals || 0;
                      const ag = score.awayGoals || 0;
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
                    groupTeams.forEach(t => { stats[t].gd = stats[t].gf - stats[t].ga; });

                    return sortedTeams.map((team, idx) => {
                      const s = stats[team];
                      let rankClass = 'rank-elim-4';
                      if (idx === 0) rankClass = 'rank-adv-1';
                      else if (idx === 1) rankClass = 'rank-adv-2';
                      else if (idx === 2) rankClass = 'rank-elim-3';

                      return (
                        <tr key={team} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: '36px' }}>
                          <td style={{ padding: '0.4rem 0.25rem' }}>
                            <span className={`team-rank-indicator ${rankClass}`}>{idx + 1}</span>
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            <span style={{ fontSize: '1rem', marginRight: '0.25rem' }}>{getTeamFlag(team)}</span>
                            {team}
                          </td>
                          <td style={{ textAlign: 'center' }}>{s.played}</td>
                          <td style={{ textAlign: 'center' }}>{s.won}</td>
                          <td style={{ textAlign: 'center' }}>{s.drawn}</td>
                          <td style={{ textAlign: 'center' }}>{s.lost}</td>
                          <td style={{ textAlign: 'center', color: s.gd > 0 ? 'var(--emerald)' : (s.gd < 0 ? 'var(--crimson)' : 'var(--text-muted)') }}>
                            {s.gd > 0 ? `+${s.gd}` : s.gd}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '0.5rem', color: idx < 2 ? 'var(--emerald)' : 'var(--text-primary)' }}>{s.points}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Synced Knockout Results */}
      <div className="admin-section" style={{ marginTop: '2.5rem' }}>
        <h4 style={{ fontSize: '1.2rem', color: 'var(--emerald)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏆</span> Synced Knockout Winners & Champions
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          View real-time official knockout match winners synced from ESPN. These determine the grading of player knockout prediction paths.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Round of 32 */}
          <div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Round of 32</h5>
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {Array.from({ length: 16 }).map((_, idx) => {
                const matchId = `m${idx + 1}`;
                const winner = localResults.knockouts?.r32?.[matchId];
                const gameKey = `r32_${matchId}`;
                const isCompleted = localResults.completed_games?.includes(gameKey);

                return (
                  <div key={matchId} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: isCompleted ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match {idx + 1}</span>
                    {isCompleted && winner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--emerald)' }}>
                        <span>{getTeamFlag(winner)}</span>
                        <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{winner}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>TBD / Sync Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Round of 16 */}
          <div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Round of 16</h5>
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {Array.from({ length: 8 }).map((_, idx) => {
                const matchId = `m${idx + 1}`;
                const winner = localResults.knockouts?.r16?.[matchId];
                const gameKey = `r16_${matchId}`;
                const isCompleted = localResults.completed_games?.includes(gameKey);

                return (
                  <div key={matchId} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: isCompleted ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match {16 + idx + 1}</span>
                    {isCompleted && winner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--emerald)' }}>
                        <span>{getTeamFlag(winner)}</span>
                        <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{winner}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>TBD / Sync Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarter-Finals */}
          <div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quarter-Finals</h5>
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {Array.from({ length: 4 }).map((_, idx) => {
                const matchId = `m${idx + 1}`;
                const winner = localResults.knockouts?.qf?.[matchId];
                const gameKey = `qf_${matchId}`;
                const isCompleted = localResults.completed_games?.includes(gameKey);

                return (
                  <div key={matchId} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: isCompleted ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match {24 + idx + 1}</span>
                    {isCompleted && winner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--emerald)' }}>
                        <span>{getTeamFlag(winner)}</span>
                        <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{winner}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>TBD / Sync Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Semi-Finals */}
          <div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semi-Finals</h5>
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {Array.from({ length: 2 }).map((_, idx) => {
                const matchId = `m${idx + 1}`;
                const winner = localResults.knockouts?.sf?.[matchId];
                const gameKey = `sf_${matchId}`;
                const isCompleted = localResults.completed_games?.includes(gameKey);

                return (
                  <div key={matchId} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: isCompleted ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match {28 + idx + 1}</span>
                    {isCompleted && winner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--emerald)' }}>
                        <span>{getTeamFlag(winner)}</span>
                        <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{winner}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>TBD / Sync Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finals */}
          <div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Championship & Third Place</h5>
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
              
              {/* Grand Final Winner */}
              {(() => {
                const winner = localResults.knockouts?.final;
                const isCompleted = localResults.completed_games?.includes('final');

                return (
                  <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderColor: isCompleted ? 'var(--gold)' : 'var(--border-light)', background: isCompleted ? 'rgba(245, 158, 11, 0.03)' : 'rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      <span>🏆 World Champion</span>
                      {isCompleted && <span style={{ color: 'var(--gold)' }}>Final Locked</span>}
                    </div>
                    {isCompleted && winner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--gold)', fontSize: '1.05rem' }}>
                        <span>{getTeamFlag(winner)}</span>
                        <span>{winner}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>TBD / Sync Pending</span>
                    )}
                  </div>
                );
              })()}

              {/* Third Place Winner */}
              {(() => {
                const winner = localResults.knockouts?.third_place;
                const isCompleted = localResults.completed_games?.includes('third_place');

                return (
                  <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderColor: isCompleted ? 'var(--azure)' : 'var(--border-light)', background: isCompleted ? 'rgba(59, 130, 246, 0.03)' : 'rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      <span>🥉 Third Place Winner</span>
                      {isCompleted && <span style={{ color: 'var(--azure)' }}>Match Locked</span>}
                    </div>
                    {isCompleted && winner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--azure)', fontSize: '1.05rem' }}>
                        <span>{getTeamFlag(winner)}</span>
                        <span>{winner}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>TBD / Sync Pending</span>
                    )}
                  </div>
                );
              })()}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
