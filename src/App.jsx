import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BracketEditor from './components/BracketEditor';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bracket, setBracket] = useState(null);
  const [tournamentResults, setTournamentResults] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // 1. Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setBracket(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Click outside to close profile dropdown
  useEffect(() => {
    if (!showProfileMenu) return;
    const closeMenu = () => setShowProfileMenu(false);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [showProfileMenu]);;

  // 2. Fetch User Profile and Bracket, and Official Results when session changes
  useEffect(() => {
    if (!session) return;

    const loadAppData = async () => {
      try {
        setLoading(true);

        // Fetch Official Results (read access is public, so this should always work)
        const { data: resData, error: resError } = await supabase
          .from('tournament_results')
          .select('*')
          .eq('id', 'live')
          .single();

        if (resError && resError.code !== 'PGRST116') {
          console.error('Error loading tournament results:', resError);
        } else if (resData) {
          setTournamentResults(resData);
        }

        // Fetch Profile
        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profError) {
          console.error('Error loading profile:', profError);
        } else {
          setProfile(profData);
        }

        // Fetch Bracket
        const { data: bracData, error: bracError } = await supabase
          .from('brackets')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (bracError && bracError.code === 'PGRST116') {
          // If no bracket exists, initialize an empty bracket draft in DB
          const emptyPredictions = {
            groups: {},
            knockouts: {
              r32: {},
              r16: {},
              qf: {},
              sf: {},
              final: null,
              third_place: null
            },
            third_place_advancers: [] // Selected 3rd place teams advancing (2026 format)
          };

          const { data: newBrac, error: insertError } = await supabase
            .from('brackets')
            .insert({
              user_id: session.user.id,
              predictions: emptyPredictions,
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
              is_submitted: false,
              score: 0,
              score_second_chance: 0
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating default bracket:', insertError);
          } else {
            setBracket(newBrac);
          }
        } else if (bracError) {
          console.error('Error loading bracket:', bracError);
        } else {
          setBracket(bracData);
        }

      } catch (err) {
        console.error('App data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppData();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const reloadTournamentResults = async () => {
    const { data } = await supabase
      .from('tournament_results')
      .select('*')
      .eq('id', 'live')
      .single();
    if (data) {
      setTournamentResults(data);
    }
  };

  const reloadUserBracket = async () => {
    const { data } = await supabase
      .from('brackets')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    if (data) {
      setBracket(data);
    }
  };

  // Determine if the user is an administrator
  const isAdmin = 
    session?.user?.email === 'siraj-ahmed-cal@gmail.com' || 
    profile?.email === 'siraj-ahmed-cal@gmail.com' ||
    session?.user?.email === 'syed.s.ahmed@gmail.com' || 
    profile?.email === 'syed.s.ahmed@gmail.com' ||
    session?.user?.user_metadata?.is_admin === true;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="logo-ball" style={{ fontSize: '3rem' }}>⚽</div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)' }}>Loading Bracket Arena...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div>
      <header className="app-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 1.5rem' }}>
          <div className="logo-section" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            <span className="logo-ball">⚽</span>
            <h1>World Cup '26</h1>
          </div>

          <nav className="nav-tabs">
            <button 
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
              onClick={() => setActiveTab('predictions')}
            >
              My Bracket
            </button>
            <button 
              className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              Leaderboard
            </button>
            {isAdmin && (
              <button 
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                Admin
              </button>
            )}
          </nav>

          <select
            className="mobile-nav-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="dashboard">Dashboard</option>
            <option value="predictions">My Bracket</option>
            <option value="leaderboard">Leaderboard</option>
            {isAdmin && <option value="admin">Admin</option>}
          </select>

          <div className="user-profile" style={{ position: 'relative' }}>
            <div 
              className="user-avatar-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu(!showProfileMenu);
              }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="user-avatar" />
              ) : (
                <div className="user-avatar" style={{ background: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                  {profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-info">
                  <div className="profile-dropdown-name">{profile?.display_name || 'Player'}</div>
                  <div className="profile-dropdown-email">{session.user.email}</div>
                </div>
                <hr className="profile-dropdown-divider" />
                <button className="profile-dropdown-item" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        {activeTab === 'dashboard' && (
          <Dashboard 
            profile={profile} 
            bracket={bracket} 
            tournamentResults={tournamentResults}
            onNavigate={setActiveTab}
          />
        )}
        
        {activeTab === 'predictions' && (
          <BracketEditor 
            profile={profile} 
            bracket={bracket} 
            tournamentResults={tournamentResults}
            onSaveSuccess={reloadUserBracket}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard 
            currentUserId={session.user.id}
          />
        )}

        {activeTab === 'admin' && isAdmin && (
          <AdminPanel 
            tournamentResults={tournamentResults}
            onResultsUpdated={async () => {
              await reloadTournamentResults();
              await reloadUserBracket();
            }}
          />
        )}
      </main>

      <footer style={{ marginTop: '5rem', padding: '2rem 0', borderTop: '1px solid var(--border-light)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>FIFA World Cup 2026 Brackets &copy; {new Date().getFullYear()}</p>
        <p style={{ marginTop: '0.25rem' }}>A friendly soccer prediction game for friends and family.</p>
      </footer>
    </div>
  );
}
