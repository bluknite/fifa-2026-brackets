import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getTeamFlag } from './BracketEditor';

export default function Leaderboard({ currentUserId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState('primary'); // 'primary', 'second_chance'
  
  // State for viewing someone's bracket
  const [selectedUserBracket, setSelectedUserBracket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Perform a relational select: fetch profiles and inner-join/left-join their bracket details
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          avatar_url,
          brackets (
            id,
            score,
            is_submitted,
            predictions,
            score_second_chance,
            predictions_second_chance
          )
        `);

      if (fetchError) throw fetchError;

      // Map profiles and their corresponding scores
      const formatted = data.map(profile => {
        const userBracket = Array.isArray(profile.brackets)
          ? (profile.brackets[0] || null)
          : (profile.brackets || null);
        return {
          id: profile.id,
          displayName: profile.display_name || 'Anonymous Player',
          avatarUrl: profile.avatar_url,
          score: userBracket?.score || 0,
          isSubmitted: userBracket?.is_submitted || false,
          predictions: userBracket?.predictions || null,
          scoreSecondChance: userBracket?.score_second_chance || 0,
          predictionsSecondChance: userBracket?.predictions_second_chance || null
        };
      });

      setLeaderboard(formatted);
    } catch (err) {
      console.error('Leaderboard load error:', err);
      setError('Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeaderboard();
  }, []);

  const hasSecondChancePicks = (user) => {
    if (!user.predictionsSecondChance?.knockouts) return false;
    const ko = user.predictionsSecondChance.knockouts;
    return Object.values(ko.r32 || {}).some(Boolean) || 
           Object.values(ko.r16 || {}).some(Boolean) || 
           Object.values(ko.qf || {}).some(Boolean) || 
           Object.values(ko.sf || {}).some(Boolean) || 
           !!ko.final || 
           !!ko.third_place;
  };

  const handleViewBracket = (user) => {
    const hasData = leaderboardType === 'primary' ? !!user.predictions : hasSecondChancePicks(user);
    if (!hasData) return;
    setSelectedUserBracket(user);
    setShowModal(true);
  };

  // Sort by active type DESC, then by submitted status / picks status, then by name alphabetically
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (leaderboardType === 'primary') {
      if (b.score !== a.score) return b.score - a.score;
      if (b.isSubmitted !== a.isSubmitted) return (b.isSubmitted ? 1 : 0) - (a.isSubmitted ? 1 : 0);
    } else {
      if (b.scoreSecondChance !== a.scoreSecondChance) return b.scoreSecondChance - a.scoreSecondChance;
      const aHas = hasSecondChancePicks(a);
      const bHas = hasSecondChancePicks(b);
      if (bHas !== aHas) return (bHas ? 1 : 0) - (aHas ? 1 : 0);
    }
    return a.displayName.localeCompare(b.displayName);
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Recalculating standings...</div>;
  }

  return (
    <div className="glass-card leaderboard-container">
      <div className="leaderboard-title">
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>Live Standings</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track scores and compare brackets with everyone in the league.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLeaderboard} style={{ padding: '0.4rem 0.8rem' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="editor-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
        <button 
          className={`editor-nav-btn ${leaderboardType === 'primary' ? 'active' : ''}`}
          onClick={() => setLeaderboardType('primary')}
          style={{ background: leaderboardType === 'primary' ? 'var(--emerald)' : 'transparent', color: leaderboardType === 'primary' ? '#000' : 'var(--text-secondary)' }}
        >
          Primary Bracket
        </button>
        <button 
          className={`editor-nav-btn ${leaderboardType === 'second_chance' ? 'active' : ''}`}
          onClick={() => setLeaderboardType('second_chance')}
          style={{ background: leaderboardType === 'second_chance' ? 'var(--emerald)' : 'transparent', color: leaderboardType === 'second_chance' ? '#000' : 'var(--text-secondary)' }}
        >
          Second Chance Knockouts
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Rank</th>
              <th>Player</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.map((user) => {
              const isMe = user.id === currentUserId;
              
              const isPrimary = leaderboardType === 'primary';
              const activeScore = isPrimary ? user.score : user.scoreSecondChance;

              // Assign rank indices (players with the same score get the same rank)
              const firstIdxWithScore = sortedLeaderboard.findIndex(u => {
                const uScore = isPrimary ? u.score : u.scoreSecondChance;
                return uScore === activeScore;
              });
              const displayRank = firstIdxWithScore + 1;

              let rankBadge = <span className="rank-badge">{displayRank}</span>;
              if (displayRank === 1) rankBadge = <span className="rank-badge rank-1">🥇</span>;
              else if (displayRank === 2) rankBadge = <span className="rank-badge rank-2">🥈</span>;
              else if (displayRank === 3) rankBadge = <span className="rank-badge rank-3">🥉</span>;

              const hasData = isPrimary ? !!user.predictions : hasSecondChancePicks(user);
              const statusLabel = isPrimary 
                ? (user.isSubmitted ? 'Saved' : 'Not Saved')
                : (hasSecondChancePicks(user) ? 'Saved' : 'Not Saved');

              return (
                <tr 
                  key={user.id} 
                  className={isMe ? 'current-user' : ''}
                  onClick={() => hasData && handleViewBracket(user)}
                  style={{ cursor: hasData ? 'pointer' : 'default' }}
                  title={hasData ? "Click to view bracket" : "No bracket picks made"}
                >
                  <td>{rankBadge}</td>
                  <td>
                    <div className="table-user-cell">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} />
                      ) : (
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.displayName} {isMe && <span style={{ color: 'var(--emerald)', fontSize: '0.75rem' }}>(You)</span>}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${statusLabel === 'Saved' ? 'status-submitted' : 'status-draft'}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: isMe ? 'var(--emerald)' : 'var(--text-primary)' }}>
                    {activeScore} pts
                  </td>
                </tr>
              );
            })}

            {sortedLeaderboard.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No players registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bracket Viewer Modal */}
      {showModal && selectedUserBracket && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '1.5rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-card" style={{
            maxWidth: '650px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2rem', border: '1px solid var(--border-glow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>
                  {selectedUserBracket.displayName}'s {leaderboardType === 'primary' ? 'Primary' : 'Second-Chance'} Picks
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Score: {leaderboardType === 'primary' ? selectedUserBracket.score : selectedUserBracket.scoreSecondChance} pts
                </p>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
                style={{ padding: '0.3rem 0.6rem', minWidth: '40px' }}
              >
                ✕
              </button>
            </div>

            {leaderboardType === 'primary' ? (
              <>
                {/* Champion Spot */}
                {selectedUserBracket.predictions?.knockouts?.final ? (
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.02))', 
                    padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--gold)',
                    textAlign: 'center', marginBottom: '1.5rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', fontWeight: 'bold' }}>Predicted Champion</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)', marginTop: '0.25rem' }}>
                      {getTeamFlag(selectedUserBracket.predictions.knockouts.final)} {selectedUserBracket.predictions.knockouts.final}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    No champion selected yet.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Left Side: Semi-Finalists & Third Place */}
                  <div>
                    <h4 style={{ color: 'var(--emerald)', fontSize: '0.95rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Knockout Picks</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Finalist A:</span>
                        <strong>{selectedUserBracket.predictions?.knockouts?.sf?.m1 || 'TBD'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Finalist B:</span>
                        <strong>{selectedUserBracket.predictions?.knockouts?.sf?.m2 || 'TBD'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>3rd Place:</span>
                        <strong>{selectedUserBracket.predictions?.knockouts?.third_place || 'TBD'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Group Winners list */}
                  <div>
                    <h4 style={{ color: 'var(--azure)', fontSize: '0.95rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Advancing Wildcards</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {selectedUserBracket.predictions?.third_place_advancers?.map(team => (
                        <span key={team} style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--azure)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          {getTeamFlag(team)} {team}
                        </span>
                      ))}
                      {(!selectedUserBracket.predictions?.third_place_advancers || selectedUserBracket.predictions.third_place_advancers.length === 0) && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Second Chance Champion Spot */}
                {selectedUserBracket.predictionsSecondChance?.knockouts?.final ? (
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.02))', 
                    padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--gold)',
                    textAlign: 'center', marginBottom: '1.5rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', fontWeight: 'bold' }}>Predicted Champion</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)', marginTop: '0.25rem' }}>
                      {getTeamFlag(selectedUserBracket.predictionsSecondChance.knockouts.final)} {selectedUserBracket.predictionsSecondChance.knockouts.final}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    No champion selected yet.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Left Side: Semi-Finalists & Third Place */}
                  <div>
                    <h4 style={{ color: 'var(--emerald)', fontSize: '0.95rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Knockout Picks</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Finalist A:</span>
                        <strong>{selectedUserBracket.predictionsSecondChance?.knockouts?.sf?.m1 || 'TBD'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Finalist B:</span>
                        <strong>{selectedUserBracket.predictionsSecondChance?.knockouts?.sf?.m2 || 'TBD'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>3rd Place:</span>
                        <strong>{selectedUserBracket.predictionsSecondChance?.knockouts?.third_place || 'TBD'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Key QF picks */}
                  <div>
                    <h4 style={{ color: 'var(--azure)', fontSize: '0.95rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Quarterfinalists</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {['m1', 'm2', 'm3', 'm4'].map((qfKey, index) => {
                        const team = selectedUserBracket.predictionsSecondChance?.knockouts?.qf?.[qfKey];
                        return (
                          <div key={qfKey} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>QF {index + 1}:</span>
                            <strong>{team ? `${getTeamFlag(team)} ${team}` : 'TBD'}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                Close Bracket View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
