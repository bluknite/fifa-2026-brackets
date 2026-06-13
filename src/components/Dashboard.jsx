import React from 'react';

export default function Dashboard({ profile, bracket, tournamentResults, onNavigate }) {
  const isLocked = tournamentResults?.is_locked || false;
  const hasBracket = !!bracket && Object.keys(bracket.predictions || {}).length > 0;
  const isSubmitted = bracket?.is_submitted || false;
  const score = bracket?.score || 0;

  // Count matches outcome predictions
  const countGroupPicks = () => {
    if (!bracket?.predictions?.groupMatches) return 0;
    return Object.values(bracket.predictions.groupMatches).filter(Boolean).length;
  };

  // Count knockout picks
  const countKnockoutPicks = () => {
    if (!bracket?.predictions?.knockouts) return 0;
    const { r32, r16, qf, sf, final, third_place } = bracket.predictions.knockouts;
    let count = 0;
    if (r32) count += Object.values(r32).filter(Boolean).length;
    if (r16) count += Object.values(r16).filter(Boolean).length;
    if (qf) count += Object.values(qf).filter(Boolean).length;
    if (sf) count += Object.values(sf).filter(Boolean).length;
    if (final) count += 1;
    if (third_place) count += 1;
    return count;
  };

  const groupPicksCount = countGroupPicks();
  const knockoutPicksCount = countKnockoutPicks();
  const wildcardPicksCount = bracket?.predictions?.third_place_advancers?.length || 0;

  // 72 group stage matches, 8 third-place selectors, 16 R32, 8 R16, 4 QF, 2 SF, 1 F, 1 Third-place = 112 choices total.
  const totalPicksPossible = 72 + 8 + 16 + 8 + 4 + 2 + 1 + 1; 
  const totalPicksMade = groupPicksCount + wildcardPicksCount + knockoutPicksCount;
  const completionPercentage = Math.round((totalPicksMade / totalPicksPossible) * 100);

  return (
    <div className="dashboard-grid">
      <div>
        <div className="glass-card welcome-banner">
          <h2>Welcome, {profile?.display_name || 'Player'}!</h2>
          <p>The 2026 FIFA World Cup is active. Update your bracket and compare predictions with friends and family.</p>
        </div>

        <div className="glass-card stats-card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--emerald)', marginBottom: '1.25rem' }}>Your Bracket Status</h3>
          
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div style={{ flex: '1', minWidth: '180px', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span className="stat-label">Points Earned</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>
                {score} pts
              </div>
            </div>

            <div style={{ flex: '1', minWidth: '180px', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span className="stat-label">Bracket Status</span>
              <div style={{ marginTop: '0.5rem' }}>
                {isSubmitted ? (
                  <span className="status-badge status-submitted">Saved</span>
                ) : (
                  <span className="status-badge status-draft">Not Saved</span>
                )}
              </div>
            </div>

            <div style={{ flex: '1', minWidth: '180px', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span className="stat-label">Lock Status</span>
              <div style={{ marginTop: '0.5rem' }}>
                {isLocked ? (
                  <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--crimson)' }}>Locked</span>
                ) : (
                  <span className="status-badge status-submitted" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)' }}>Submissions Open</span>
                )}
              </div>
            </div>
          </div>

          {isLocked ? (
            <div className="error-box">
              🔒 Submissions are closed by the league owner. You can no longer modify your predictions, but you can track your live score!
            </div>
          ) : (
            <div className="info-box">
              ⚽ You can edit your bracket anytime. Remember to click <strong>Save Bracket</strong> in the editor when you are done! Completed games will automatically lock to their official outcomes.
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>Bracket Progress ({completionPercentage}%)</div>
              <div style={{ width: '220px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(completionPercentage, 100)}%`, height: '100%', background: 'var(--emerald)', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('predictions')}
            >
              {isLocked ? 'View My Bracket' : hasBracket ? 'Edit My Bracket' : 'Create Bracket Now'}
            </button>
          </div>
        </div>
      </div>

      <div className="lobby-sidebar">
        <div className="glass-card stats-card">
          <h3>Tournament Scoring Rules</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.35rem' }}>
              <span>Correct match prediction</span>
              <strong style={{ color: 'var(--emerald)' }}>+5 pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.35rem' }}>
              <span>Correct advancing Group team</span>
              <strong style={{ color: 'var(--emerald)' }}>+10 pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.35rem' }}>
              <span>Round of 32 Winner</span>
              <strong style={{ color: 'var(--emerald)' }}>+20 pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.35rem' }}>
              <span>Round of 16 Winner</span>
              <strong style={{ color: 'var(--emerald)' }}>+40 pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.35rem' }}>
              <span>Quarterfinal Winner</span>
              <strong style={{ color: 'var(--emerald)' }}>+80 pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.35rem' }}>
              <span>Semifinal Winner</span>
              <strong style={{ color: 'var(--emerald)' }}>+160 pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.35rem' }}>
              <span>Third-Place Winner</span>
              <strong style={{ color: 'var(--emerald)' }}>+160 pts</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.15rem' }}>
              <span>World Cup Champion</span>
              <strong style={{ color: 'var(--gold)' }}>+320 pts</strong>
            </div>
          </div>
        </div>

        <div className="glass-card stats-card" style={{ background: 'linear-gradient(135deg, var(--bg-card), rgba(59, 130, 246, 0.03))' }}>
          <h3>Tournament Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
              <span className="stat-label">Hosts:</span>
              <span style={{ marginLeft: 'auto' }}>🇺🇸 USA 🇲🇽 MEX 🇨🇦 CAN</span>
            </div>
            <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
              <span className="stat-label">Total Teams:</span>
              <span style={{ marginLeft: 'auto' }}>48 Teams</span>
            </div>
            <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
              <span className="stat-label">Knockout Stage:</span>
              <span style={{ marginLeft: 'auto' }}>Round of 32 (Starts June 2026)</span>
            </div>
            <div style={{ display: 'flex', justifyBetween: 'space-between' }}>
              <span className="stat-label">Final Match:</span>
              <span style={{ marginLeft: 'auto' }}>July 19, 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
