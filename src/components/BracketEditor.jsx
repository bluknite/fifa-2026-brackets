import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

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

// Helper: map a team name to its flag emoji
export const getTeamFlag = (teamName) => {
  if (!teamName) return '';
  for (const group of Object.values(INITIAL_GROUPS)) {
    const idx = group.teams.indexOf(teamName);
    if (idx !== -1) return group.flags[idx];
  }
  return '🏳️';
};

export default function BracketEditor({ profile, bracket, tournamentResults, onSaveSuccess }) {
  const [activeSubTab, setActiveSubTab] = useState('groups'); // 'groups', 'knockouts'
  const [predictions, setPredictions] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success'|'error', message: '' }
  const [saving, setSaving] = useState(false);

  const isLocked = tournamentResults?.is_locked || false;
  const officialResults = tournamentResults?.results || {};

  // Load predictions state from bracket prop or set defaults
  useEffect(() => {
    if (bracket?.predictions) {
      // Deep clone predictions to avoid direct prop mutation
      const cloned = JSON.parse(JSON.stringify(bracket.predictions));
      
      // Ensure all groups exist in state, defaulting to initial setup if missing
      if (!cloned.groups) cloned.groups = {};
      Object.keys(INITIAL_GROUPS).forEach(g => {
        if (!cloned.groups[g] || cloned.groups[g].length === 0) {
          cloned.groups[g] = [...INITIAL_GROUPS[g].teams];
        }
      });
      
      // Ensure knockouts structure exists
      if (!cloned.knockouts) cloned.knockouts = {};
      const stages = ['r32', 'r16', 'qf', 'sf'];
      stages.forEach(stage => {
        if (!cloned.knockouts[stage]) cloned.knockouts[stage] = {};
      });
      if (cloned.knockouts.final === undefined) cloned.knockouts.final = null;
      if (cloned.knockouts.third_place === undefined) cloned.knockouts.third_place = null;
      if (!cloned.third_place_advancers) cloned.third_place_advancers = [];

      setPredictions(cloned);
    }
  }, [bracket]);

  if (!predictions) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Formatting predictions...</div>;
  }

  // --- Group Stage Reordering ---
  const moveTeam = (groupKey, index, direction) => {
    if (isLocked) return;
    
    // Check if group is already locked/completed in official results
    if (officialResults?.completed_games?.includes(`group_${groupKey}`)) {
      return; // Cannot edit completed group
    }

    const groupTeams = [...predictions.groups[groupKey]];
    const targetIndex = index + direction;
    
    if (targetIndex < 0 || targetIndex >= groupTeams.length) return;

    // Swap teams
    const temp = groupTeams[index];
    groupTeams[index] = groupTeams[targetIndex];
    groupTeams[targetIndex] = temp;

    const updated = {
      ...predictions,
      groups: {
        ...predictions.groups,
        [groupKey]: groupTeams
      }
    };

    // Auto-update third place eligibility list
    const thirdPlaces = getThirdPlaceTeams(updated.groups);
    const validThirdPlaces = updated.third_place_advancers.filter(team => thirdPlaces.includes(team));
    updated.third_place_advancers = validThirdPlaces;

    setPredictions(updated);
  };

  // Get current 3rd place teams list from current predictions
  const getThirdPlaceTeams = (groupsState) => {
    return Object.keys(INITIAL_GROUPS).map(g => {
      const list = groupsState[g] || INITIAL_GROUPS[g].teams;
      return list[2]; // index 2 is 3rd place
    });
  };

  const handleThirdPlaceSelect = (team) => {
    if (isLocked) return;
    
    let current = [...predictions.third_place_advancers];
    if (current.includes(team)) {
      current = current.filter(t => t !== team);
    } else {
      if (current.length >= 8) return; // Max 8
      current.push(team);
    }

    setPredictions({
      ...predictions,
      third_place_advancers: current
    });
  };

  // --- Knockouts Logic ---
  // Calculates the 32 teams advancing to R32 based on current group predictions
  const calculateR32Teams = () => {
    const teams = {};
    
    // Group Winners and Runners-Up
    Object.keys(INITIAL_GROUPS).forEach(g => {
      const list = predictions.groups[g] || INITIAL_GROUPS[g].teams;
      teams[`1${g}`] = list[0]; // Winner
      teams[`2${g}`] = list[1]; // Runner-up
    });

    // 8 Wildcard Third-places
    // We map them based on the selections (W1 to W8)
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
    // Override with official outcome if completed
    const officialWinner = officialResults?.knockouts?.[stage]?.[matchId];

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
      return { teamA, teamB, officialWinner: officialResults?.knockouts?.final };
    }

    if (stage === 'third_place') {
      const teamA = getSelectedLoser('sf', 'm1');
      const teamB = getSelectedLoser('sf', 'm2');
      return { teamA, teamB, officialWinner: officialResults?.knockouts?.third_place };
    }

    return { teamA: null, teamB: null };
  };

  const getSelectedWinner = (stage, matchId) => {
    // If official result exists, use it as forced input
    if (officialResults?.knockouts?.[stage]?.[matchId]) {
      return officialResults.knockouts[stage][matchId];
    }
    return predictions.knockouts?.[stage]?.[matchId] || null;
  };

  const getSelectedLoser = (stage, matchId) => {
    // If official result exists, determine the loser
    const officialWin = officialResults?.knockouts?.[stage]?.[matchId];
    const { teamA, teamB } = getMatchTeams(stage, matchId);
    
    if (officialWin) {
      return officialWin === teamA ? teamB : teamA;
    }

    const winner = predictions.knockouts?.[stage]?.[matchId];
    if (!winner || !teamA || !teamB) return null;
    return winner === teamA ? teamB : teamA;
  };

  // Handle picking a match winner
  const selectWinner = (stage, matchId, teamName) => {
    if (isLocked || !teamName) return;

    // Check if specific match is completed officials
    if (officialResults?.completed_games?.includes(`${stage}_${matchId}`)) {
      return; // Locked
    }

    let updated = { ...predictions };

    if (stage === 'final') {
      updated.knockouts.final = teamName;
    } else if (stage === 'third_place') {
      updated.knockouts.third_place = teamName;
    } else {
      updated.knockouts[stage][matchId] = teamName;
    }

    // Clean up future rounds if the loser of this choice was previously selected further up the tree
    const cleanUpTree = (clearedTeam) => {
      if (!clearedTeam) return;
      
      const k = updated.knockouts;
      // Loop through all stages and matches and wipe out references to the cleared team
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

    setPredictions(updated);
  };

  // Save changes to DB
  const saveBracket = async (submit = false) => {
    try {
      setSaving(true);
      setSaveStatus(null);

      // Default completed games to official outcome in user predictions just to align values
      const aligned = JSON.parse(JSON.stringify(predictions));
      
      // Auto-align any completed group standings in predictions to official results
      Object.keys(INITIAL_GROUPS).forEach(g => {
        if (officialResults?.completed_games?.includes(`group_${g}`)) {
          aligned.groups[g] = [...officialResults.groups[g]];
        }
      });

      // Auto-align completed knockouts
      const stages = ['r32', 'r16', 'qf', 'sf'];
      stages.forEach(st => {
        Object.keys(aligned.knockouts[st]).forEach(mId => {
          if (officialResults?.completed_games?.includes(`${st}_${mId}`)) {
            aligned.knockouts[st][mId] = officialResults.knockouts[st][mId];
          }
        });
      });
      if (officialResults?.completed_games?.includes('final')) {
        aligned.knockouts.final = officialResults.knockouts.final;
      }
      if (officialResults?.completed_games?.includes('third_place')) {
        aligned.knockouts.third_place = officialResults.knockouts.third_place;
      }

      const { error } = await supabase
        .from('brackets')
        .update({
          predictions: aligned,
          is_submitted: submit || bracket.is_submitted,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.id);

      if (error) throw error;

      setSaveStatus({ type: 'success', message: submit ? 'Bracket submitted successfully! ⚽' : 'Draft saved successfully!' });
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setSaveStatus({ type: 'error', message: err.message || 'Failed to save bracket.' });
    } finally {
      setSaving(false);
    }
  };

  const getThirdPlaceList = getThirdPlaceTeams(predictions.groups);
  const selectedThirdPlacesCount = predictions.third_place_advancers?.length || 0;

  return (
    <div className="editor-layout">
      <div className="editor-header">
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>Tournament Predictor</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Configure group rankings and click winners to advance them through the bracket.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {saveStatus && (
            <div className={saveStatus.type === 'success' ? 'success-box' : 'error-box'} style={{ margin: 0, padding: '0.5rem 1rem' }}>
              {saveStatus.message}
            </div>
          )}

          {!isLocked && (
            <>
              <button className="btn btn-secondary" onClick={() => saveBracket(false)} disabled={saving}>
                Save Draft
              </button>
              <button className="btn btn-primary" onClick={() => saveBracket(true)} disabled={saving || selectedThirdPlacesCount !== 8}>
                Submit Bracket
              </button>
            </>
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
          <div className="groups-grid">
            {Object.keys(INITIAL_GROUPS).map((groupKey) => {
              const group = INITIAL_GROUPS[groupKey];
              const userList = predictions.groups[groupKey] || group.teams;
              const isGroupCompleted = officialResults?.completed_games?.includes(`group_${groupKey}`);

              return (
                <div key={groupKey} className={`glass-card group-card ${isGroupCompleted ? 'glowing' : ''}`} style={isGroupCompleted ? { borderColor: 'var(--emerald)' } : {}}>
                  <div className="group-header">
                    <span className="group-title">{group.name}</span>
                    {isGroupCompleted ? (
                      <span className="status-badge status-submitted" style={{ fontSize: '0.65rem' }}>Official Standings</span>
                    ) : (
                      <span className="group-badge">Predicting</span>
                    )}
                  </div>
                  
                  <div className="group-team-list">
                    {userList.map((team, index) => {
                      // Determine status badge (1st/2nd advance, 3rd wildcard, 4th out)
                      let rankClass = 'rank-elim-4';
                      let rankLabel = '4th';
                      if (index === 0) {
                        rankClass = 'rank-adv-1';
                        rankLabel = '1st';
                      } else if (index === 1) {
                        rankClass = 'rank-adv-2';
                        rankLabel = '2nd';
                      } else if (index === 2) {
                        const isAdvancingWildcard = predictions.third_place_advancers?.includes(team);
                        rankClass = isAdvancingWildcard ? 'rank-adv-2' : 'rank-elim-3';
                        rankLabel = isAdvancingWildcard ? '3rd (Q)' : '3rd';
                        if (isAdvancingWildcard) rankClass += ' style-wildcard'; // customize
                      }

                      return (
                        <div key={team} className="group-team-row">
                          <div className="team-info">
                            <span className={`team-rank-indicator ${rankClass}`}>
                              {rankLabel}
                            </span>
                            <span className="team-flag">{getTeamFlag(team)}</span>
                            <span className="team-name">{team}</span>
                          </div>

                          {!isLocked && !isGroupCompleted && (
                            <div className="rank-controls">
                              <button 
                                className="rank-btn" 
                                onClick={() => moveTeam(groupKey, index, -1)}
                                disabled={index === 0}
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <button 
                                className="rank-btn" 
                                onClick={() => moveTeam(groupKey, index, 1)}
                                disabled={index === 3}
                                title="Move Down"
                              >
                                ▼
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  const isCompleted = officialResults?.completed_games?.includes(`r32_${m.id}`);

                  return (
                    <div key={m.id} className="match-card">
                      <span className="match-number">Match {idx + 1} {isCompleted && '✓'}</span>
                      <div className="match-body">
                        <button 
                          className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                          onClick={() => selectWinner('r32', m.id, teamA)}
                          disabled={!teamA || isLocked || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamA)}</span>
                          {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                        <button 
                          className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                          onClick={() => selectWinner('r32', m.id, teamB)}
                          disabled={!teamB || isLocked || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamB)}</span>
                          {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                      </div>
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
                  const isCompleted = officialResults?.completed_games?.includes(`r16_${matchId}`);

                  return (
                    <div key={matchId} className="match-card" style={{ height: '140px', justifyContent: 'center' }}>
                      <span className="match-number">Match {16 + idx + 1} {isCompleted && '✓'}</span>
                      <div className="match-body">
                        <button 
                          className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                          onClick={() => selectWinner('r16', matchId, teamA)}
                          disabled={!teamA || isLocked || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamA)}</span>
                          {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                        <button 
                          className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                          onClick={() => selectWinner('r16', matchId, teamB)}
                          disabled={!teamB || isLocked || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamB)}</span>
                          {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                      </div>
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
                  const isCompleted = officialResults?.completed_games?.includes(`qf_${matchId}`);

                  return (
                    <div key={matchId} className="match-card" style={{ height: '280px', justifyContent: 'center' }}>
                      <span className="match-number">QF {idx + 1} {isCompleted && '✓'}</span>
                      <div className="match-body">
                        <button 
                          className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                          onClick={() => selectWinner('qf', matchId, teamA)}
                          disabled={!teamA || isLocked || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamA)}</span>
                          {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                        <button 
                          className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                          onClick={() => selectWinner('qf', matchId, teamB)}
                          disabled={!teamB || isLocked || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamB)}</span>
                          {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                      </div>
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
                  const isCompleted = officialResults?.completed_games?.includes(`sf_${matchId}`);

                  return (
                    <div key={matchId} className="match-card" style={{ height: '560px', justifyContent: 'center' }}>
                      <span className="match-number">SF {idx + 1} {isCompleted && '✓'}</span>
                      <div className="match-body">
                        <button 
                          className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                          onClick={() => selectWinner('sf', matchId, teamA)}
                          disabled={!teamA || isLocked || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamA)}</span>
                          {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                        <button 
                          className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                          onClick={() => selectWinner('sf', matchId, teamB)}
                          disabled={!teamB || isLocked || isCompleted}
                        >
                          <span className="team-flag">{getTeamFlag(teamB)}</span>
                          {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                        </button>
                      </div>
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
                    const isCompleted = officialResults?.completed_games?.includes('third_place');

                    return (
                      <div className="match-card">
                        <div className="match-body" style={{ borderColor: 'var(--azure)' }}>
                          <button 
                            className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                            onClick={() => selectWinner('third_place', null, teamA)}
                            disabled={!teamA || isLocked || isCompleted}
                          >
                            <span className="team-flag">{getTeamFlag(teamA)}</span>
                            {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                          </button>
                          <button 
                            className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                            onClick={() => selectWinner('third_place', null, teamB)}
                            disabled={!teamB || isLocked || isCompleted}
                          >
                            <span className="team-flag">{getTeamFlag(teamB)}</span>
                            {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <div className="round-header">Grand Final</div>
                  {(() => {
                    const { teamA, teamB, officialWinner } = getMatchTeams('final');
                    const selectedWinner = predictions.knockouts?.final;
                    const isCompleted = officialResults?.completed_games?.includes('final');

                    return (
                      <div className="match-card">
                        <div className="match-body" style={{ borderColor: 'var(--gold)' }}>
                          <button 
                            className={`match-team ${selectedWinner === teamA && teamA ? 'selected' : ''}`}
                            onClick={() => selectWinner('final', null, teamA)}
                            disabled={!teamA || isLocked || isCompleted}
                          >
                            <span className="team-flag">{getTeamFlag(teamA)}</span>
                            {teamA ? <span className="team-name">{teamA}</span> : <span className="team-tbd">TBD</span>}
                          </button>
                          <button 
                            className={`match-team ${selectedWinner === teamB && teamB ? 'selected' : ''}`}
                            onClick={() => selectWinner('final', null, teamB)}
                            disabled={!teamB || isLocked || isCompleted}
                          >
                            <span className="team-flag">{getTeamFlag(teamB)}</span>
                            {teamB ? <span className="team-name">{teamB}</span> : <span className="team-tbd">TBD</span>}
                          </button>
                        </div>
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
