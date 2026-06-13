import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { calculateGroupStandings } from '../utils/standings';

// Helper: 12 Groups setup with flags
const INITIAL_GROUPS = {
  A: { name: 'Group A', teams: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'], flags: ['🇲🇽', '🇿🇦', '🇰🇷', '🇨🇿'] },
  B: { name: 'Group B', teams: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'], flags: ['🇨🇦', '🇧🇦', '🇶🇦', '🇨🇭'] },
  C: { name: 'Group C', teams: ['Brazil', 'Morocco', 'Haiti', 'Scotland'], flags: ['🇧🇷', '🇲🇦', '🇭🇹', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'] },
  D: { name: 'Group D', teams: ['United States', 'Paraguay', 'Australia', 'Turkiye'], flags: ['🇺🇸', '🇵🇾', '🇦🇺', '🇹🇷'] },
  E: { name: 'Group E', teams: ['Curacao', 'Ecuador', 'Germany', 'Ivory Coast'], flags: ['🇨🇼', '🇪🇨', '🇩🇪', '🇨🇮'] },
  F: { name: 'Group F', teams: ['Japan', 'Netherlands', 'Sweden', 'Tunisia'], flags: ['🇯🇵', '🇳🇱', '🇸🇪', '🇹🇳'] },
  G: { name: 'Group G', teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'], flags: ['🇧🇪', '🇪🇬', '🇮🇷', '🇳🇿'] },
  H: { name: 'Group H', teams: ['Cape Verde', 'Saudi Arabia', 'Spain', 'Uruguay'], flags: ['🇨🇻', '🇸🇦', '🇪🇸', '🇺🇾'] },
  I: { name: 'Group I', teams: ['France', 'Iraq', 'Norway', 'Senegal'], flags: ['🇫🇷', '🇮🇶', '🇳🇴', '🇸🇳'] },
  J: { name: 'Group J', teams: ['Algeria', 'Argentina', 'Austria', 'Jordan'], flags: ['🇩🇿', '🇦🇷', '🇦🇹', '🇯🇴'] },
  K: { name: 'Group K', teams: ['Colombia', 'DR Congo', 'Portugal', 'Uzbekistan'], flags: ['🇨🇴', '🇨🇩', '🇵🇹', '🇺🇿'] },
  L: { name: 'Group L', teams: ['Croatia', 'England', 'Ghana', 'Panama'], flags: ['🇭🇷', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇬🇭', '🇵🇦'] }
};

// Static Match Fixtures Schedule for Group Stage
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

// Helper: map a team name to its flag emoji
export const getTeamFlag = (teamName) => {
  if (!teamName) return '';
  for (const group of Object.values(INITIAL_GROUPS)) {
    const idx = group.teams.indexOf(teamName);
    if (idx !== -1) return group.flags[idx];
  }
  return '🏳️';
};

// Get current 3rd place teams list from current predictions
export const getThirdPlaceTeams = (groupsState) => {
  return Object.keys(INITIAL_GROUPS).map(g => {
    const list = groupsState[g] || INITIAL_GROUPS[g].teams;
    return list[2]; // Index 2 is 3rd place
  });
};

export const calculateScore = (userPredictions, official) => {
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

export default function BracketEditor({ profile, bracket, tournamentResults, onSaveSuccess }) {
  const [activeSubTab, setActiveSubTab] = useState('groups'); // 'groups', 'knockouts'
  const [predictions, setPredictions] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success'|'error', message: '' }
  const [saving, setSaving] = useState(false);
  const isDirtyRef = useRef(false);

  const isLocked = tournamentResults?.is_locked || false;
  const officialResults = tournamentResults?.results || {};

  // Load predictions state from bracket prop or set defaults, and auto-align with official results
  useEffect(() => {
    if (bracket?.predictions) {
      const cloned = JSON.parse(JSON.stringify(bracket.predictions));
      
      // Ensure groupMatches and groups structures exist
      if (!cloned.groupMatches) cloned.groupMatches = {};
      if (!cloned.groups) cloned.groups = {};

      Object.keys(INITIAL_GROUPS).forEach(g => {
        if (!cloned.groups[g] || cloned.groups[g].length === 0) {
          cloned.groups[g] = [...INITIAL_GROUPS[g].teams];
        }
      });
      
      // Ensure knockouts structure exists
      if (!cloned.knockouts) cloned.knockouts = {};
      const stagesList = ['r32', 'r16', 'qf', 'sf'];
      stagesList.forEach(stage => {
        if (!cloned.knockouts[stage]) cloned.knockouts[stage] = {};
      });
      if (cloned.knockouts.final === undefined) cloned.knockouts.final = null;
      if (cloned.knockouts.third_place === undefined) cloned.knockouts.third_place = null;
      if (!cloned.third_place_advancers) cloned.third_place_advancers = [];

      if (!isLocked) {
        // Auto-align completed group matches from official results
        GROUP_MATCHES.forEach(m => {
          const actual = officialResults?.actual_matches?.[m.id];
          if (actual && actual.completed) {
            cloned.groupMatches[m.id] = actual.outcome;
          }
        });
      }

      // Recalculate standings for all groups based on the updated match outcomes
      Object.keys(INITIAL_GROUPS).forEach(g => {
        const groupTeams = INITIAL_GROUPS[g].teams;
        const groupMatchesList = GROUP_MATCHES.filter(m => m.group === g);
        const currentOrder = cloned.groups[g] || [...groupTeams];
        const { standings } = calculateGroupStandings(groupTeams, groupMatchesList, cloned.groupMatches, currentOrder);
        cloned.groups[g] = standings.map(s => s.team);
      });

      if (!isLocked) {
        // Auto-align completed group standings from official results
        Object.keys(INITIAL_GROUPS).forEach(g => {
          if (officialResults?.completed_games?.includes(`group_${g}`)) {
            cloned.groups[g] = [...(officialResults.groups[g] || [])];
          }
        });
      }

      // Auto-update third place eligibility list
      const thirdPlaces = getThirdPlaceTeams(cloned.groups);
      cloned.third_place_advancers = cloned.third_place_advancers.filter(team => thirdPlaces.includes(team));

      if (!isLocked) {
        // Auto-align completed knockouts from official results
        stagesList.forEach(st => {
          if (cloned.knockouts[st]) {
            Object.keys(cloned.knockouts[st]).forEach(mId => {
              if (officialResults?.completed_games?.includes(`${st}_${mId}`)) {
                cloned.knockouts[st][mId] = officialResults.knockouts[st][mId];
              }
            });
          }
        });
        if (officialResults?.completed_games?.includes('final')) {
          cloned.knockouts.final = officialResults.knockouts.final;
        }
        if (officialResults?.completed_games?.includes('third_place')) {
          cloned.knockouts.third_place = officialResults.knockouts.third_place;
        }
      }

      setPredictions(cloned);
    }
  }, [bracket, tournamentResults]);

  // Auto-save predictions when dirty
  useEffect(() => {
    if (!predictions || !bracket || !isDirtyRef.current) return;

    // Set status to "Saving..."
    setSaveStatus({ type: 'info', message: 'Saving changes...' });

    const timer = setTimeout(async () => {
      try {
        setSaving(true);
        const aligned = JSON.parse(JSON.stringify(predictions));

        if (!isLocked) {
          // Auto-align completed group matches from official results
          GROUP_MATCHES.forEach(m => {
            const actual = officialResults?.actual_matches?.[m.id];
            if (actual && actual.completed) {
              aligned.groupMatches[m.id] = actual.outcome;
            }
          });

          // Recalculate standings for all groups based on the updated match outcomes
          Object.keys(INITIAL_GROUPS).forEach(g => {
            const groupTeams = INITIAL_GROUPS[g].teams;
            const groupMatchesList = GROUP_MATCHES.filter(m => m.group === g);
            const currentOrder = aligned.groups[g] || [...groupTeams];
            const { standings } = calculateGroupStandings(groupTeams, groupMatchesList, aligned.groupMatches, currentOrder);
            aligned.groups[g] = standings.map(s => s.team);
          });

          // Auto-align completed group standings from official results
          Object.keys(INITIAL_GROUPS).forEach(g => {
            if (officialResults?.completed_games?.includes(`group_${g}`)) {
              aligned.groups[g] = [...(officialResults.groups[g] || [])];
            }
          });

          // Auto-update third place eligibility list
          const thirdPlaces = getThirdPlaceTeams(aligned.groups);
          aligned.third_place_advancers = aligned.third_place_advancers.filter(team => thirdPlaces.includes(team));

          // Auto-align completed knockouts from official results
          const stagesList = ['r32', 'r16', 'qf', 'sf'];
          stagesList.forEach(st => {
            if (aligned.knockouts[st]) {
              Object.keys(aligned.knockouts[st]).forEach(mId => {
                if (officialResults?.completed_games?.includes(`${st}_${mId}`)) {
                  aligned.knockouts[st][mId] = officialResults.knockouts[st][mId];
                }
              });
            }
          });
          if (officialResults?.completed_games?.includes('final')) {
            aligned.knockouts.final = officialResults.knockouts.final;
          }
          if (officialResults?.completed_games?.includes('third_place')) {
            aligned.knockouts.third_place = officialResults.knockouts.third_place;
          }
        }

        const calculatedScore = calculateScore(aligned, officialResults);
        const { error } = await supabase
          .from('brackets')
          .update({
            predictions: aligned,
            is_submitted: true,
            score: calculatedScore,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.id);

        if (error) throw error;

        isDirtyRef.current = false; // Reset dirty flag
        setSaveStatus({ type: 'success', message: 'All changes saved automatically! ⚽' });
        onSaveSuccess();
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus({ type: 'error', message: err.message || 'Auto-save failed.' });
      } finally {
        setSaving(false);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [predictions]);

  if (!predictions) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Formatting predictions...</div>;
  }

  // --- Group Stage Match Predict Event handler ---
  const handleMatchPredict = (groupKey, matchId, outcome) => {
    if (isLocked) return;

    // Check if match has already completed in real life
    const actualMatch = officialResults?.actual_matches?.[matchId];
    if (actualMatch && actualMatch.completed) {
      return;
    }

    // Check if group is already completed in official results
    if (officialResults?.completed_games?.includes(`group_${groupKey}`)) {
      return;
    }

    const updatedMatches = {
      ...predictions.groupMatches,
      [matchId]: outcome
    };

    const groupTeams = INITIAL_GROUPS[groupKey].teams;
    const groupMatchesList = GROUP_MATCHES.filter(m => m.group === groupKey);
    const currentOrder = predictions.groups[groupKey] || [...groupTeams];

    // Compute live standings and respect manual override orders
    const { standings } = calculateGroupStandings(groupTeams, groupMatchesList, updatedMatches, currentOrder);
    const newOrder = standings.map(s => s.team);

    const updated = {
      ...predictions,
      groupMatches: updatedMatches,
      groups: {
        ...predictions.groups,
        [groupKey]: newOrder
      }
    };

    // Auto-update third place eligibility list
    const thirdPlaces = getThirdPlaceTeams(updated.groups);
    const validThirdPlaces = updated.third_place_advancers.filter(team => thirdPlaces.includes(team));
    updated.third_place_advancers = validThirdPlaces;

    isDirtyRef.current = true;
    setPredictions(updated);
  };

  // --- Swap ambiguous tied teams rank control ---
  const swapAmbiguousTeams = (groupKey, index, direction) => {
    if (isLocked) return;
    if (officialResults?.completed_games?.includes(`group_${groupKey}`)) return;

    const groupTeams = INITIAL_GROUPS[groupKey].teams;
    const groupMatchesList = GROUP_MATCHES.filter(m => m.group === groupKey);
    const currentOrder = [...(predictions.groups[groupKey] || groupTeams)];

    const { ambiguousTies } = calculateGroupStandings(groupTeams, groupMatchesList, predictions.groupMatches || {}, currentOrder);

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const teamA = currentOrder[index];
    const teamB = currentOrder[targetIndex];

    // Swap is ONLY allowed if both teams are tied and H2H is ambiguous/equal
    if (ambiguousTies.includes(teamA) && ambiguousTies.includes(teamB)) {
      currentOrder[index] = teamB;
      currentOrder[targetIndex] = teamA;

      const updated = {
        ...predictions,
        groups: {
          ...predictions.groups,
          [groupKey]: currentOrder
        }
      };

      // Auto-update third place eligibility list
      const thirdPlaces = getThirdPlaceTeams(updated.groups);
      const validThirdPlaces = updated.third_place_advancers.filter(team => thirdPlaces.includes(team));
      updated.third_place_advancers = validThirdPlaces;

      isDirtyRef.current = true;
      setPredictions(updated);
    }
  };

  // Note: getThirdPlaceTeams has been moved to top-level helpers

  const handleThirdPlaceSelect = (team) => {
    if (isLocked) return;
    
    let current = [...predictions.third_place_advancers];
    if (current.includes(team)) {
      current = current.filter(t => t !== team);
    } else {
      if (current.length >= 8) return; // Max 8
      current.push(team);
    }

    isDirtyRef.current = true;
    setPredictions({
      ...predictions,
      third_place_advancers: current
    });
  };

  // --- Knockouts Logic ---
  const calculateR32Teams = () => {
    const teams = {};
    
    // Group Winners and Runners-Up
    Object.keys(INITIAL_GROUPS).forEach(g => {
      const list = predictions.groups[g] || INITIAL_GROUPS[g].teams;
      teams[`1${g}`] = list[0]; // Winner
      teams[`2${g}`] = list[1]; // Runner-up
    });

    // 8 Wildcard Third-places
    const selectedWildcards = predictions.third_place_advancers || [];
    for (let i = 0; i < 8; i++) {
      teams[`WC${i+1}`] = selectedWildcards[i] || null;
    }

    return teams;
  };

  const r32Teams = calculateR32Teams();

  // Defines matches in Round of 32
  const r32Matches = [
    { id: 'm1', teamAKey: '1A', teamBKey: 'WC1' },
    { id: 'm2', teamAKey: '2B', teamBKey: '2C' },
    { id: 'm3', teamAKey: '1B', teamBKey: 'WC2' },
    { id: 'm4', teamAKey: '1C', teamBKey: '2D' },
    { id: 'm5', teamAKey: '1D', teamBKey: 'WC3' },
    { id: 'm6', teamAKey: '2E', teamBKey: '2F' },
    { id: 'm7', teamAKey: '1E', teamBKey: 'WC4' },
    { id: 'm8', teamAKey: '1F', teamBKey: '2A' },
    { id: 'm9', teamAKey: '1G', teamBKey: 'WC5' },
    { id: 'm10', teamAKey: '2H', teamBKey: '2I' },
    { id: 'm11', teamAKey: '1H', teamBKey: 'WC6' },
    { id: 'm12', teamAKey: '1I', teamBKey: '2J' },
    { id: 'm13', teamAKey: '1J', teamBKey: 'WC7' },
    { id: 'm14', teamAKey: '2K', teamBKey: '2L' },
    { id: 'm15', teamAKey: '1K', teamBKey: 'WC8' },
    { id: 'm16', teamAKey: '1L', teamBKey: '2G' }
  ];

  // Load team for specific match node based on propagation
  const getMatchTeams = (stage, matchId) => {
    const officialWinner = officialResults?.knockouts?.[stage]?.[matchId] || null;

    if (stage === 'r32') {
      const match = r32Matches.find(m => m.id === matchId);
      const teamA = r32Teams[match.teamAKey] || null;
      const teamB = r32Teams[match.teamBKey] || null;
      return { teamA, teamB, officialWinner };
    }

    if (stage === 'r16') {
      const sourceMap = {
        m1: ['r32', 'm1', 'm2'],
        m2: ['r32', 'm3', 'm4'],
        m3: ['r32', 'm5', 'm6'],
        m4: ['r32', 'm7', 'm8'],
        m5: ['r32', 'm9', 'm10'],
        m6: ['r32', 'm11', 'm12'],
        m7: ['r32', 'm13', 'm14'],
        m8: ['r32', 'm15', 'm16']
      };
      const [prevStage, mKeyA, mKeyB] = sourceMap[matchId];
      const teamA = getSelectedWinner(prevStage, mKeyA);
      const teamB = getSelectedWinner(prevStage, mKeyB);
      return { teamA, teamB, officialWinner };
    }

    if (stage === 'qf') {
      const sourceMap = {
        m1: ['r16', 'm1', 'm2'],
        m2: ['r16', 'm3', 'm4'],
        m3: ['r16', 'm5', 'm6'],
        m4: ['r16', 'm7', 'm8']
      };
      const [prevStage, mKeyA, mKeyB] = sourceMap[matchId];
      const teamA = getSelectedWinner(prevStage, mKeyA);
      const teamB = getSelectedWinner(prevStage, mKeyB);
      return { teamA, teamB, officialWinner };
    }

    if (stage === 'sf') {
      const sourceMap = {
        m1: ['qf', 'm1', 'm2'],
        m2: ['qf', 'm3', 'm4']
      };
      const [prevStage, mKeyA, mKeyB] = sourceMap[matchId];
      const teamA = getSelectedWinner(prevStage, mKeyA);
      const teamB = getSelectedWinner(prevStage, mKeyB);
      return { teamA, teamB, officialWinner };
    }

    if (stage === 'final') {
      const teamA = getSelectedWinner('sf', 'm1');
      const teamB = getSelectedWinner('sf', 'm2');
      return { teamA, teamB, officialWinner: officialResults?.knockouts?.final || null };
    }

    if (stage === 'third_place') {
      const teamA = getSelectedLoser('sf', 'm1');
      const teamB = getSelectedLoser('sf', 'm2');
      return { teamA, teamB, officialWinner: officialResults?.knockouts?.third_place || null };
    }

    return { teamA: null, teamB: null };
  };

  const getSelectedWinner = (stage, matchId) => {
    return predictions.knockouts?.[stage]?.[matchId] || null;
  };

  const getSelectedLoser = (stage, matchId) => {
    const { teamA, teamB } = getMatchTeams(stage, matchId);
    const winner = predictions.knockouts?.[stage]?.[matchId];
    if (!winner || !teamA || !teamB) return null;
    return winner === teamA ? teamB : teamA;
  };

  // Handle picking a match winner
  const selectWinner = (stage, matchId, teamName) => {
    const gameKey = matchId ? `${stage}_${matchId}` : stage;
    const isGameCompleted = officialResults?.completed_games?.includes(gameKey);
    if (isLocked || isGameCompleted || !teamName) return;

    let updated = { ...predictions };

    if (stage === 'final') {
      updated.knockouts.final = teamName;
    } else if (stage === 'third_place') {
      updated.knockouts.third_place = teamName;
    } else {
      updated.knockouts[stage][matchId] = teamName;
    }

    // Clean up future rounds if the loser of this choice was previously selected further up
    const cleanUpTree = (clearedTeam) => {
      if (!clearedTeam) return;
      const k = updated.knockouts;
      const stages = ['r16', 'qf', 'sf'];
      stages.forEach(st => {
        Object.keys(k[st] || {}).forEach(mId => {
          if (k[st][mId] === clearedTeam) k[st][mId] = null;
        });
      });
      if (k.final === clearedTeam) k.final = null;
      if (k.third_place === clearedTeam) k.third_place = null;
    };

    const { teamA, teamB } = getMatchTeams(stage, matchId);
    const loser = teamName === teamA ? teamB : teamA;
    cleanUpTree(loser);

    isDirtyRef.current = true;
    setPredictions(updated);
  };


  const getThirdPlaceList = getThirdPlaceTeams(predictions.groups);
  const selectedThirdPlacesCount = predictions.third_place_advancers?.length || 0;

  return (
    <div className="editor-layout">
      <div className="editor-header">
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>Tournament Predictor</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Predict match outcomes and manually resolve standings ties to construct your bracket.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {saveStatus && (
            <div className={saveStatus.type === 'success' ? 'success-box' : saveStatus.type === 'info' ? 'info-box' : 'error-box'} style={{ margin: 0, padding: '0.5rem 1rem' }}>
              {saveStatus.message}
            </div>
          )}

          {isLocked && (
            <div className="locked-notification">
              🔒 Submissions Locked
            </div>
          )}
        </div>
      </div>

      {/* Editor Sub-navigation */}
      <div className="editor-nav">
        <button 
          className={`editor-nav-btn ${activeSubTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('groups')}
        >
          1. Group Stage
        </button>
        <button 
          className={`editor-nav-btn ${activeSubTab === 'knockouts' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('knockouts')}
          style={{ position: 'relative' }}
        >
          2. Knockout Bracket
          {selectedThirdPlacesCount !== 8 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--azure)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              !
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'groups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Third Places Wildcard Selector */}
          <div className="glass-card third-places-card">
            <h3>
              <span>🎯</span> 
              Select 8 Advancing Third-Place Teams ({selectedThirdPlacesCount}/8)
            </h3>
            <p>
              Under the 48-team expansion, the 8 best third-placed teams across the 12 groups advance to the Round of 32. Select exactly 8 teams from your predicted 3rd-place finishers to fill the wildcard slots.
            </p>
            <div className="third-places-grid">
              {getThirdPlaceList.map((team, idx) => {
                const groupLetter = Object.keys(INITIAL_GROUPS)[idx];
                const isSelected = predictions.third_place_advancers?.includes(team);
                return (
                  <div 
                    key={team}
                    className={`third-place-select-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleThirdPlaceSelect(team)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>G{groupLetter}</span>
                      <span>{getTeamFlag(team)}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{team}</span>
                    </div>
                    <div className="checkbox-custom"></div>
                  </div>
                );
              })}
            </div>
            {selectedThirdPlacesCount !== 8 && (
              <div style={{ color: 'var(--azure)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.75rem' }}>
                * You must select exactly 8 teams to complete your knockout bracket entry.
              </div>
            )}
          </div>

          {/* Groups Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {Object.keys(INITIAL_GROUPS).map((groupKey) => {
              const group = INITIAL_GROUPS[groupKey];
              const groupMatchesList = GROUP_MATCHES.filter(m => m.group === groupKey);
              
              // Calculate live standings order
              const { standings, isAmbiguous, ambiguousTies } = calculateGroupStandings(
                group.teams,
                groupMatchesList,
                predictions.groupMatches || {},
                predictions.groups[groupKey]
              );
              
              const isGroupCompleted = officialResults?.completed_games?.includes(`group_${groupKey}`) || false;

              return (
                <div key={groupKey} className="glass-card group-editor-row" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
                  
                  {/* Left Side: Match Outcomes List */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--emerald)' }}>{group.name} Matches</strong>
                      {isGroupCompleted && (
                        <span className="status-badge status-submitted" style={{ fontSize: '0.65rem' }}>Group Standings Finalised</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {groupMatchesList.map(m => {
                        // Check if match was completed officially
                        const actualMatch = officialResults?.actual_matches?.[m.id];
                        const isGameCompleted = actualMatch && actualMatch.completed;

                        // While brackets are open, completed games use the actual outcome.
                        // Once locked, we show the user's prediction outcome.
                        const matchOutcome = (!isLocked && isGameCompleted)
                          ? actualMatch.outcome
                          : (predictions.groupMatches?.[m.id] || null);

                        const isFieldDisabled = isLocked || isGameCompleted;
                        const predictionClass = (isLocked && isGameCompleted)
                          ? (predictions.groupMatches?.[m.id] === actualMatch.outcome ? 'correct-prediction' : 'incorrect-prediction')
                          : '';

                        return (
                          <div key={m.id} className={`match-predict-row ${predictionClass}`}>
                            <div className="match-info-col">
                              <span className="match-fixture-lbl">Fixture ({m.date})</span>
                              {isGameCompleted && (
                                <span className="match-actual-score-lbl" style={{ color: 'var(--gold)' }}>
                                  Actual Score: {actualMatch.homeGoals} - {actualMatch.awayGoals}
                                </span>
                              )}
                            </div>

                            <div className="match-selector-wrapper">
                              {/* Home Team (Clickable Name + Flag Button) */}
                              <div 
                                className="team-selector-side home clickable"
                                onClick={() => {
                                  if (!isFieldDisabled) {
                                    handleMatchPredict(groupKey, m.id, 'home');
                                  }
                                }}
                                title={`${m.home} Win`}
                              >
                                <span className="team-selector-name">{m.home}</span>
                                <button 
                                  className={`flag-predict-btn ${matchOutcome === 'home' ? 'active home-win' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMatchPredict(groupKey, m.id, 'home');
                                  }}
                                  disabled={isFieldDisabled}
                                >
                                  {getTeamFlag(m.home)}
                                </button>
                              </div>

                              {/* Draw Button */}
                              <button 
                                className={`draw-predict-btn ${matchOutcome === 'draw' ? 'active draw-win' : ''}`}
                                onClick={() => handleMatchPredict(groupKey, m.id, 'draw')}
                                disabled={isFieldDisabled}
                                title="Draw"
                              >
                                Draw
                              </button>

                              {/* Away Team (Clickable Flag Button + Name) */}
                              <div 
                                className="team-selector-side away clickable"
                                onClick={() => {
                                  if (!isFieldDisabled) {
                                    handleMatchPredict(groupKey, m.id, 'away');
                                  }
                                }}
                                title={`${m.away} Win`}
                              >
                                <button 
                                  className={`flag-predict-btn ${matchOutcome === 'away' ? 'active away-win' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMatchPredict(groupKey, m.id, 'away');
                                  }}
                                  disabled={isFieldDisabled}
                                >
                                  {getTeamFlag(m.away)}
                                </button>
                                <span className="team-selector-name">{m.away}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Side: Standings Tally */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--azure)' }}>Standing Calculator</strong>
                      {isAmbiguous && !isGroupCompleted && (
                        <span className="unresolved-badge" style={{ animation: 'pulse 1.5s infinite' }}>Ties Require Manual Order</span>
                      )}
                    </div>

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
                            <th style={{ textAlign: 'right', paddingRight: '0.5rem' }}>Pts</th>
                            {!isLocked && !isGroupCompleted && <th style={{ width: '50px' }}>Adjust</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((s, idx) => {
                            let rankClass = 'rank-elim-4';
                            let rankLabel = '4th';
                            if (idx === 0) {
                              rankClass = 'rank-adv-1';
                              rankLabel = '1st';
                            } else if (idx === 1) {
                              rankClass = 'rank-adv-2';
                              rankLabel = '2nd';
                            } else if (idx === 2) {
                              const isAdvancingWildcard = predictions.third_place_advancers?.includes(s.team);
                              rankClass = isAdvancingWildcard ? 'rank-adv-2 style-wildcard' : 'rank-elim-3';
                              rankLabel = isAdvancingWildcard ? '3rd (Q)' : '3rd';
                            }

                            const canSwapUp = idx > 0 && ambiguousTies.includes(s.team) && ambiguousTies.includes(standings[idx - 1].team);
                            const canSwapDown = idx < 3 && ambiguousTies.includes(s.team) && ambiguousTies.includes(standings[idx + 1].team);

                            return (
                              <tr key={s.team} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: s.isTied && !isGroupCompleted ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                                <td style={{ padding: '0.5rem 0.25rem' }}>
                                  <span className={`team-rank-indicator ${rankClass}`} style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                                    {rankLabel}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontSize: '1rem', marginRight: '0.25rem' }}>{getTeamFlag(s.team)}</span>
                                  <span style={{ fontWeight: 600 }}>{s.team}</span>
                                  {s.isTied && !isGroupCompleted && (
                                    <span style={{ fontSize: '0.65rem', color: 'var(--azure)', display: 'block', fontStyle: 'italic' }}>Tied H2H</span>
                                  )}
                                </td>
                                <td style={{ textAlign: 'center' }}>{s.played}</td>
                                <td style={{ textAlign: 'center' }}>{s.won}</td>
                                <td style={{ textAlign: 'center' }}>{s.drawn}</td>
                                <td style={{ textAlign: 'center' }}>{s.lost}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '0.5rem', color: 'var(--emerald)' }}>{s.points}</td>
                                {!isLocked && !isGroupCompleted && (
                                  <td style={{ display: 'flex', gap: '0.2rem', padding: '0.5rem 0' }}>
                                    <button 
                                      className="rank-btn" 
                                      onClick={() => swapAmbiguousTeams(groupKey, idx, -1)}
                                      disabled={!canSwapUp}
                                      title="Swap Rank Up"
                                      style={{ padding: '0.1rem 0.25rem', fontSize: '0.65rem' }}
                                    >
                                      ▲
                                    </button>
                                    <button 
                                      className="rank-btn" 
                                      onClick={() => swapAmbiguousTeams(groupKey, idx, 1)}
                                      disabled={!canSwapDown}
                                      title="Swap Rank Down"
                                      style={{ padding: '0.1rem 0.25rem', fontSize: '0.65rem' }}
                                    >
                                      ▼
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'knockouts' && (
        <div>
          {selectedThirdPlacesCount !== 8 && (
            <div className="error-box" style={{ marginBottom: '1.5rem' }}>
              ⚠️ Please complete the Group Stage tab first and select exactly 8 advancing third-place wildcard teams to build the complete Round of 32 knockout grid.
            </div>
          )}

          <div className="knockout-tree-container">
            <div className="bracket-viewport">
              
              {/* ROUND OF 32 */}
              <div className="bracket-column">
                <div className="round-header">Round of 32</div>
                {r32Matches.map((m, idx) => {
                  const { teamA, teamB, officialWinner } = getMatchTeams('r32', m.id);
                  const selectedWinner = getSelectedWinner('r32', m.id);
                  const isGameCompleted = officialResults?.completed_games?.includes(`r32_${m.id}`) || false;
                  const isCompleted = isLocked || isGameCompleted;

                  const predictionClass = (isLocked && isGameCompleted)
                    ? (selectedWinner === officialWinner ? 'correct-prediction' : 'incorrect-prediction')
                    : '';

                  return (
                    <div key={m.id} className="match-card">
                      <span className="match-number">Match {idx + 1} {isGameCompleted && '✓'}</span>
                      <div className={`match-body ${predictionClass}`}>
                        <button 
                          className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                          onClick={() => selectWinner('r32', m.id, teamA)}
                          disabled={!teamA || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamA)}</span>
                          {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                        <button 
                          className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                          onClick={() => selectWinner('r32', m.id, teamB)}
                          disabled={!teamB || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamB)}</span>
                          {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                      </div>
                      {isGameCompleted && officialWinner && (
                        <div className="match-actual-winner-lbl" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '0.25rem', textAlign: 'center', fontWeight: 'bold' }}>
                          Actual Winner: {officialWinner} {officialWinner === selectedWinner ? '🟢 (Correct)' : '🔴 (Incorrect)'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ROUND OF 16 */}
              <div className="bracket-column">
                <div className="round-header">Round of 16</div>
                {Array.from({ length: 8 }).map((_, idx) => {
                  const matchId = `m${idx + 1}`;
                  const { teamA, teamB, officialWinner } = getMatchTeams('r16', matchId);
                  const selectedWinner = getSelectedWinner('r16', matchId);
                  const isGameCompleted = officialResults?.completed_games?.includes(`r16_${matchId}`) || false;
                  const isCompleted = isLocked || isGameCompleted;

                  const predictionClass = (isLocked && isGameCompleted)
                    ? (selectedWinner === officialWinner ? 'correct-prediction' : 'incorrect-prediction')
                    : '';

                  return (
                    <div key={matchId} className="match-card" style={{ height: '140px', justifyContent: 'center' }}>
                      <span className="match-number">Match {16 + idx + 1} {isGameCompleted && '✓'}</span>
                      <div className={`match-body ${predictionClass}`}>
                        <button 
                          className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                          onClick={() => selectWinner('r16', matchId, teamA)}
                          disabled={!teamA || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamA)}</span>
                          {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                        <button 
                          className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                          onClick={() => selectWinner('r16', matchId, teamB)}
                          disabled={!teamB || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamB)}</span>
                          {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                      </div>
                      {isGameCompleted && officialWinner && (
                        <div className="match-actual-winner-lbl" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '0.25rem', textAlign: 'center', fontWeight: 'bold' }}>
                          Actual Winner: {officialWinner} {officialWinner === selectedWinner ? '🟢 (Correct)' : '🔴 (Incorrect)'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* QUARTER FINALS */}
              <div className="bracket-column">
                <div className="round-header">Quarterfinals</div>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const matchId = `m${idx + 1}`;
                  const { teamA, teamB, officialWinner } = getMatchTeams('qf', matchId);
                  const selectedWinner = getSelectedWinner('qf', matchId);
                  const isGameCompleted = officialResults?.completed_games?.includes(`qf_${matchId}`) || false;
                  const isCompleted = isLocked || isGameCompleted;

                  const predictionClass = (isLocked && isGameCompleted)
                    ? (selectedWinner === officialWinner ? 'correct-prediction' : 'incorrect-prediction')
                    : '';

                  return (
                    <div key={matchId} className="match-card" style={{ height: '280px', justifyContent: 'center' }}>
                      <span className="match-number">QF {idx + 1} {isGameCompleted && '✓'}</span>
                      <div className={`match-body ${predictionClass}`}>
                        <button 
                          className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                          onClick={() => selectWinner('qf', matchId, teamA)}
                          disabled={!teamA || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamA)}</span>
                          {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                        <button 
                          className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                          onClick={() => selectWinner('qf', matchId, teamB)}
                          disabled={!teamB || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamB)}</span>
                          {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                      </div>
                      {isGameCompleted && officialWinner && (
                        <div className="match-actual-winner-lbl" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '0.25rem', textAlign: 'center', fontWeight: 'bold' }}>
                          Actual Winner: {officialWinner} {officialWinner === selectedWinner ? '🟢 (Correct)' : '🔴 (Incorrect)'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* SEMI FINALS */}
              <div className="bracket-column">
                <div className="round-header">Semifinals</div>
                {Array.from({ length: 2 }).map((_, idx) => {
                  const matchId = `m${idx + 1}`;
                  const { teamA, teamB, officialWinner } = getMatchTeams('sf', matchId);
                  const selectedWinner = getSelectedWinner('sf', matchId);
                  const isGameCompleted = officialResults?.completed_games?.includes(`sf_${matchId}`) || false;
                  const isCompleted = isLocked || isGameCompleted;

                  const predictionClass = (isLocked && isGameCompleted)
                    ? (selectedWinner === officialWinner ? 'correct-prediction' : 'incorrect-prediction')
                    : '';

                  return (
                    <div key={matchId} className="match-card" style={{ height: '560px', justifyContent: 'center' }}>
                      <span className="match-number">SF {idx + 1} {isGameCompleted && '✓'}</span>
                      <div className={`match-body ${predictionClass}`}>
                        <button 
                          className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                          onClick={() => selectWinner('sf', matchId, teamA)}
                          disabled={!teamA || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamA)}</span>
                          {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                        <button 
                          className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                          onClick={() => selectWinner('sf', matchId, teamB)}
                          disabled={!teamB || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamB)}</span>
                          {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                      </div>
                      {isGameCompleted && officialWinner && (
                        <div className="match-actual-winner-lbl" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '0.25rem', textAlign: 'center', fontWeight: 'bold' }}>
                          Actual Winner: {officialWinner} {officialWinner === selectedWinner ? '🟢 (Correct)' : '🔴 (Incorrect)'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* FINALS & CHAMPION */}
              <div className="bracket-column finals-box" style={{ justifyContent: 'center' }}>
                <div>
                  <div className="round-header">3rd Place Match</div>
                  {(() => {
                    const { teamA, teamB, officialWinner } = getMatchTeams('third_place');
                    const selectedWinner = predictions.knockouts?.third_place;
                    const isGameCompleted = officialResults?.completed_games?.includes('third_place') || false;
                    const isCompleted = isLocked || isGameCompleted;

                    const predictionClass = (isLocked && isGameCompleted)
                      ? (selectedWinner === officialWinner ? 'correct-prediction' : 'incorrect-prediction')
                      : '';

                    return (
                      <div className="match-card">
                        <div className={`match-body ${predictionClass}`} style={{ borderColor: 'var(--azure)' }}>
                          <button 
                            className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                            onClick={() => selectWinner('third_place', null, teamA)}
                            disabled={!teamA || isCompleted}
                          >
                            <span className="team-flag">{getTeamFlag(teamA)}</span>
                            {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                          </button>
                          <button 
                            className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                            onClick={() => selectWinner('third_place', null, teamB)}
                            disabled={!teamB || isCompleted}
                          >
                            <span className="team-flag">{getTeamFlag(teamB)}</span>
                            {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                          </button>
                        </div>
                        {isGameCompleted && officialWinner && (
                          <div className="match-actual-winner-lbl" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '0.25rem', textAlign: 'center', fontWeight: 'bold' }}>
                            Actual Winner: {officialWinner} {officialWinner === selectedWinner ? '🟢 (Correct)' : '🔴 (Incorrect)'}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <div className="round-header">Grand Final</div>
                  {(() => {
                    const { teamA, teamB, officialWinner } = getMatchTeams('final');
                    const selectedWinner = predictions.knockouts?.final;
                    const isGameCompleted = officialResults?.completed_games?.includes('final') || false;
                    const isCompleted = isLocked || isGameCompleted;

                    const predictionClass = (isLocked && isGameCompleted)
                      ? (selectedWinner === officialWinner ? 'correct-prediction' : 'incorrect-prediction')
                      : '';

                    return (
                      <div className="match-card">
                        <div className={`match-body ${predictionClass}`} style={{ borderColor: 'var(--gold)' }}>
                          <button 
                            className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                            onClick={() => selectWinner('final', null, teamA)}
                            disabled={!teamA || isCompleted}
                          >
                            <span className="team-flag">{getTeamFlag(teamA)}</span>
                            {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                          </button>
                          <button 
                            className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                            onClick={() => selectWinner('final', null, teamB)}
                            disabled={!teamB || isCompleted}
                          >
                            <span className="team-flag">{getTeamFlag(teamB)}</span>
                            {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                          </button>
                        </div>
                        {isGameCompleted && officialWinner && (
                          <div className="match-actual-winner-lbl" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '0.25rem', textAlign: 'center', fontWeight: 'bold' }}>
                            Actual Winner: {officialWinner} {officialWinner === selectedWinner ? '🟢 (Correct)' : '🔴 (Incorrect)'}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* CHAMPION BANNER */}
                {predictions.knockouts?.final && (
                  <div className="glass-card champion-card">
                    <div className="champion-cup">🏆</div>
                    <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Your Predicted Champion</div>
                    <div className="champion-name">
                      {getTeamFlag(predictions.knockouts.final)} {predictions.knockouts.final}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
