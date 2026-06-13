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

  // Handle Group Standings reordering in Admin Panel
  const moveAdminGroupTeam = (groupKey, index, direction) => {
    const groupTeams = [...localResults.groups[groupKey]];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= groupTeams.length) return;

    const temp = groupTeams[index];
    groupTeams[index] = groupTeams[targetIndex];
    groupTeams[targetIndex] = temp;

    setLocalResults({
      ...localResults,
      groups: {
        ...localResults.groups,
        [groupKey]: groupTeams
      }
    });
  };

  // Toggle group completion status
  const toggleGroupCompleted = (groupKey) => {
    const gameKey = `group_${groupKey}`;
    let completed = [...(localResults.completed_games || [])];
    if (completed.includes(gameKey)) {
      completed = completed.filter(k => k !== gameKey);
    } else {
      completed.push(gameKey);
    }
    setLocalResults({
      ...localResults,
      completed_games: completed
    });
  };

  // Set Knockout Winner
  const setKnockoutWinner = (stage, matchId, teamName) => {
    let updated = { ...localResults };
    if (stage === 'final') {
      updated.knockouts.final = teamName;
    } else if (stage === 'third_place') {
      updated.knockouts.third_place = teamName;
    } else {
      updated.knockouts[stage][matchId] = teamName;
    }
    setLocalResults(updated);
  };

  // Toggle match completion status
  const toggleMatchCompleted = (stage, matchId) => {
    const gameKey = matchId ? `${stage}_${matchId}` : stage; // e.g. r32_m1, final, third_place
    let completed = [...(localResults.completed_games || [])];
    if (completed.includes(gameKey)) {
      completed = completed.filter(k => k !== gameKey);
    } else {
      completed.push(gameKey);
    }
    setLocalResults({
      ...localResults,
      completed_games: completed
    });
  };

  // Helper list of potential teams in knockouts (all 48 teams)
  const allTeamsList = Object.values(INITIAL_GROUPS).flat();

  // Scoring function: grades user predictions against official results
  const calculateScore = (userPredictions, official) => {
    let score = 0;

    // 1. Group stage: 10 pts per correct advancing team (top 2)
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

    // 2. Knockout matches
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

  return (
    <div className="glass-card admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--gold)' }}>League Administrator Control</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Lock submissions and record official World Cup results to update leaderboards.</p>
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

      {/* Official Results Editor */}
      <div>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--emerald)', marginBottom: '1rem' }}>Official Tournament Standings</h3>
        
        {/* Tab selector for Group stage vs Knockouts results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Groups configuration */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>Group Stage Final Rankings</h4>
            <div className="groups-grid">
              {Object.keys(INITIAL_GROUPS).map(groupKey => {
                const teamList = localResults.groups[groupKey];
                const gameKey = `group_${groupKey}`;
                const isCompleted = localResults.completed_games?.includes(gameKey);

                return (
                  <div key={groupKey} className="glass-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <strong style={{ color: 'var(--emerald)' }}>Group {groupKey}</strong>
                      <button 
                        className={`btn ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                        onClick={() => toggleGroupCompleted(groupKey)}
                      >
                        {isCompleted ? 'Completed ✓' : 'Set Active'}
                      </button>
                    </div>

                    <div className="group-team-list">
                      {teamList.map((team, idx) => (
                        <div key={team} className="group-team-row" style={{ padding: '0.4rem 0.6rem' }}>
                          <span style={{ fontSize: '0.85rem' }}>
                            {idx + 1}. {getTeamFlag(team)} {team}
                          </span>
                          <div className="rank-controls">
                            <button className="rank-btn" onClick={() => moveAdminGroupTeam(groupKey, idx, -1)} disabled={idx === 0}>▲</button>
                            <button className="rank-btn" onClick={() => moveAdminGroupTeam(groupKey, idx, 1)} disabled={idx === 3}>▼</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Knockouts Configuration */}
          <div className="admin-section">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>Knockout Matches Winners</h4>
            
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
                        <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <span>Match {idx + 1} Winner</span>
                          <button 
                            style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                            className={`btn ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => toggleMatchCompleted('r32', matchId)}
                          >
                            {isCompleted ? 'Locked ✓' : 'Lock'}
                          </button>
                        </div>
                        <select 
                          className="admin-select"
                          value={currentWinner}
                          onChange={(e) => setKnockoutWinner('r32', matchId, e.target.value || null)}
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
              <div className="admin-section">
                <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Round of 16 Winners</h5>
                <div className="admin-grid">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const matchId = `m${idx + 1}`;
                    const currentWinner = localResults.knockouts?.r16?.[matchId] || '';
                    const gameKey = `r16_${matchId}`;
                    const isCompleted = localResults.completed_games?.includes(gameKey);

                    return (
                      <div key={matchId} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <span>Match {16 + idx + 1} Winner</span>
                          <button 
                            style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                            className={`btn ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => toggleMatchCompleted('r16', matchId)}
                          >
                            {isCompleted ? 'Locked ✓' : 'Lock'}
                          </button>
                        </div>
                        <select 
                          className="admin-select"
                          value={currentWinner}
                          onChange={(e) => setKnockoutWinner('r16', matchId, e.target.value || null)}
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

              {/* Quarterfinals Matches */}
              <div className="admin-section">
                <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Quarterfinals Winners</h5>
                <div className="admin-grid">
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const matchId = `m${idx + 1}`;
                    const currentWinner = localResults.knockouts?.qf?.[matchId] || '';
                    const gameKey = `qf_${matchId}`;
                    const isCompleted = localResults.completed_games?.includes(gameKey);

                    return (
                      <div key={matchId} className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <span>QF {idx + 1} Winner</span>
                          <button 
                            style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                            className={`btn ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => toggleMatchCompleted('qf', matchId)}
                          >
                            {isCompleted ? 'Locked ✓' : 'Lock'}
                          </button>
                        </div>
                        <select 
                          className="admin-select"
                          value={currentWinner}
                          onChange={(e) => setKnockoutWinner('qf', matchId, e.target.value || null)}
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

              {/* Semifinals, Finals, Third Place */}
              <div className="admin-section">
                <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Semifinals & Finals Winners</h5>
                <div className="admin-grid">
                  {/* Semifinal 1 */}
                  <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <span>SF 1 Winner</span>
                      <button 
                        style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                        className={`btn ${localResults.completed_games?.includes('sf_m1') ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleMatchCompleted('sf', 'm1')}
                      >
                        {localResults.completed_games?.includes('sf_m1') ? 'Locked ✓' : 'Lock'}
                      </button>
                    </div>
                    <select className="admin-select" value={localResults.knockouts?.sf?.m1 || ''} onChange={(e) => setKnockoutWinner('sf', 'm1', e.target.value || null)}>
                      <option value="">-- No Winner Yet --</option>
                      {allTeamsList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Semifinal 2 */}
                  <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <span>SF 2 Winner</span>
                      <button 
                        style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                        className={`btn ${localResults.completed_games?.includes('sf_m2') ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleMatchCompleted('sf', 'm2')}
                      >
                        {localResults.completed_games?.includes('sf_m2') ? 'Locked ✓' : 'Lock'}
                      </button>
                    </div>
                    <select className="admin-select" value={localResults.knockouts?.sf?.m2 || ''} onChange={(e) => setKnockoutWinner('sf', 'm2', e.target.value || null)}>
                      <option value="">-- No Winner Yet --</option>
                      {allTeamsList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Third Place Winner */}
                  <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderColor: 'var(--azure)' }}>
                    <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <span>Third Place Winner</span>
                      <button 
                        style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                        className={`btn ${localResults.completed_games?.includes('third_place') ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleMatchCompleted('third_place', null)}
                      >
                        {localResults.completed_games?.includes('third_place') ? 'Locked ✓' : 'Lock'}
                      </button>
                    </div>
                    <select className="admin-select" value={localResults.knockouts?.third_place || ''} onChange={(e) => setKnockoutWinner('third_place', null, e.target.value || null)}>
                      <option value="">-- No Winner Yet --</option>
                      {allTeamsList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Final Winner (Champion) */}
                  <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderColor: 'var(--gold)' }}>
                    <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <span>Champion</span>
                      <button 
                        style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem', marginLeft: 'auto' }}
                        className={`btn ${localResults.completed_games?.includes('final') ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleMatchCompleted('final', null)}
                      >
                        {localResults.completed_games?.includes('final') ? 'Locked ✓' : 'Lock'}
                      </button>
                    </div>
                    <select className="admin-select" value={localResults.knockouts?.final || ''} onChange={(e) => setKnockoutWinner('final', null, e.target.value || null)}>
                      <option value="">-- No Winner Yet --</option>
                      {allTeamsList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
