import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getTeamFlag } from './BracketEditor';

export default function Leaderboard({ currentUserId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
            predictions
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
          predictions: userBracket?.predictions || null
        };
      });

      // Sort by score DESC, then by submitted status, then by name alphabetically
      formatted.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.isSubmitted !== a.isSubmitted) return (b.isSubmitted ? 1 : 0) - (a.isSubmitted ? 1 : 0);
        return a.displayName.localeCompare(b.displayName);
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
    fetchLeaderboard();
  }, []);

  const handleViewBracket = (user) => {
    if (!user.predictions) return;
    setSelectedUserBracket(user);
    setShowModal(true);
  };

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
            {leaderboard.map((user, idx) => {
              const isMe = user.id === currentUserId;
              
              // Assign rank indices
              let rankBadge = <span className="rank-badge">{idx + 1}</span>;
              if (idx === 0) rankBadge = <span className="rank-badge rank-1">🥇</span>;
              else if (idx === 1) rankBadge = <span className="rank-badge rank-2">🥈</span>;
              else if (idx === 2) rankBadge = <span className="rank-badge rank-3">🥉</span>;

              return (
                <tr 
                  key={user.id} 
                  className={isMe ? 'current-user' : ''}
                  onClick={() => user.predictions && handleViewBracket(user)}
                  style={{ cursor: user.predictions ? 'pointer' : 'default' }}
                  title={user.predictions ? "Click to view bracket" : "No bracket submitted"}
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
                    {user.isSubmitted ? (
                      <span className="status-badge status-submitted">Saved</span>
                    ) : (
                      <span className="status-badge status-draft">Not Saved</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: isMe ? 'var(--emerald)' : 'var(--text-primary)' }}>
                    {user.score} pts
                  </td>
                </tr>
              );
            })}

            {leaderboard.length === 0 && (
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
                <h3 style={{ fontSize: '1.4rem' }}>{selectedUserBracket.displayName}'s Predictions</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Score: {selectedUserBracket.score} pts</p>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
                style={{ padding: '0.3rem 0.6rem', minWidth: '40px' }}
              >
                ✕
              </button>
            </div>

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
