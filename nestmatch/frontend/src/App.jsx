import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PhoneLogin from './components/PhoneLogin';
import HabitsQuiz from './components/HabitsQuiz';
import ExploreMatches from './pages/ExploreMatches';
import PropertyListings from './pages/PropertyListings';
import MyProfile from './pages/MyProfile';
import FairRentCalculator from './pages/FairRentCalculator';
import RoommateAgreement from './pages/RoommateAgreement';
import MyRequests from './pages/MyRequests';
import { api } from './api';
import { Users, LogIn, X, Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [userPhone, setUserPhone] = useState(localStorage.getItem('smart_rental_phone') || '');
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(() => {
    return localStorage.getItem('smart_rental_quiz_completed') === 'true';
  });
  
  // Auth Modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoadingInitial(true);
        // 1. Fetch demo users list
        const demos = await api.getDemoUsers();
        setDemoUsers(demos);

        // 2. Check if existing token is valid
        const token = api.getToken();
        if (token) {
          try {
            const me = await api.getMe();
            setCurrentUser(me);
          } catch (e) {
            api.clearToken();
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('App initialization error:', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    initApp();
  }, []);

  // Phone + OTP login success handler
  const handlePhoneLoginSuccess = async (user, phone) => {
    try {
      setUserPhone(phone);
      if (demoUsers.length > 0) {
        const res = await api.login(demoUsers[0].email, 'password123');
        api.setToken(res.access_token);
        const me = await api.getMe();
        me.phone = phone;
        setCurrentUser(me);
      } else {
        user.phone = phone;
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Phone login fallback error:', err);
      user.phone = phone;
      setCurrentUser(user);
    }
  };

  // Quick switch demo user persona
  const handleSwitchDemoUser = async (targetDemoUser) => {
    try {
      const res = await api.login(targetDemoUser.email, 'password123');
      api.setToken(res.access_token);
      setCurrentUser(res.user);
    } catch (err) {
      console.error('Failed to switch demo user:', err);
    }
  };

  const handleQuizComplete = async (habits) => {
    localStorage.setItem('smart_rental_quiz_completed', 'true');
    setHasCompletedQuiz(true);
    try {
      if (api.getToken()) {
        const me = await api.getMe();
        setCurrentUser(me);
      }
    } catch (e) {
      console.warn('Could not refresh user after quiz:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_rental_quiz_completed');
    localStorage.removeItem('smart_rental_user_habits');
    localStorage.removeItem('smart_rental_phone');
    api.clearToken();
    setHasCompletedQuiz(false);
    setCurrentUser(null);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const res = await api.login(authEmail, authPassword);
        api.setToken(res.access_token);
        setCurrentUser(res.user);
        setShowAuthModal(false);
      } else {
        const res = await api.register({
          email: authEmail,
          password: authPassword,
          full_name: authName || authEmail.split('@')[0],
          role: 'seeker',
          college_or_company: 'Independent Seeker',
        });
        api.setToken(res.access_token);
        setCurrentUser(res.user);
        setShowAuthModal(false);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/25 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Initializing Smart Rental Platform...</p>
      </div>
    );
  }

  // First time user opens the website: Show Phone + OTP screen
  if (!currentUser) {
    return (
      <PhoneLogin
        demoUsers={demoUsers}
        onLoginSuccess={handlePhoneLoginSuccess}
      />
    );
  }

  // Step 2: Show habits quiz right after login before browsing rooms
  if (!hasCompletedQuiz) {
    return (
      <HabitsQuiz
        currentUser={currentUser}
        onComplete={handleQuizComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        demoUsers={demoUsers}
        onSwitchDemoUser={handleSwitchDemoUser}
        onLogout={handleLogout}
        onRetakeQuiz={() => setHasCompletedQuiz(false)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        pendingRequestsCount={1}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'listings' && (
          <PropertyListings 
            currentUser={currentUser} 
            onRetakeQuiz={() => setHasCompletedQuiz(false)} 
          />
        )}
        {activeTab === 'matches' && <ExploreMatches currentUser={currentUser} />}
        {activeTab === 'profile' && (
          <MyProfile 
            currentUser={currentUser} 
            onProfileUpdated={() => {
              // Trigger refresh when user habits change
            }} 
          />
        )}
        {activeTab === 'calculator' && <FairRentCalculator />}
        {activeTab === 'agreement' && (
          <RoommateAgreement currentUser={currentUser} demoUsers={demoUsers} />
        )}
        {activeTab === 'requests' && <MyRequests currentUser={currentUser} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-600">NestMate — Verified PGs, Rooms & Roommate Compatibility Platform</span>
          <span className="text-[11px] text-slate-400 font-medium">Pan-India Tech & Student Co-Living</span>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {authMode === 'login' ? 'Welcome Back to NestMate' : 'Create a NestMate Account'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {authError && (
              <div className="p-2.5 mb-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
              {authMode === 'login' ? (
                <>
                  New to NestMate?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
