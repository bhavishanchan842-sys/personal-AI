import React, { useState } from 'react';
import { 
  Users, 
  Home, 
  Calculator, 
  FileText, 
  Send, 
  UserCircle, 
  LogOut, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  demoUsers, 
  onSwitchDemoUser, 
  onLogout,
  onRetakeQuiz,
  onOpenAuthModal,
  pendingRequestsCount 
}) {
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const navItems = [
    { id: 'listings', label: 'Search Rooms & PGs', icon: Home },
    { id: 'matches', label: 'Roommate Compatibility', icon: Users },
    { id: 'calculator', label: 'Fair Rent Splitter', icon: Calculator },
    { id: 'agreement', label: 'Co-Living Agreement', icon: FileText },
    { 
      id: 'requests', 
      label: 'Connections', 
      icon: Send, 
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null 
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('listings')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Smart<span className="text-emerald-600">Rental</span></span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded ml-2 border border-emerald-200">Roommate Matching</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Demo User Switcher & User Profile */}
          <div className="flex items-center gap-3">
            {/* Demo User Switcher Dropdown (Crucial for live presentations) */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                title="Switch persona to test compatibility matching"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden lg:inline">Persona:</span>
                <span className="font-bold text-slate-900">{currentUser ? currentUser.full_name.split(' ')[0] : 'Demo Users'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showDemoMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setShowDemoMenu(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {demoUsers && demoUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchDemoUser(u);
                          setShowDemoMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-indigo-50/60 transition-colors text-xs ${
                          currentUser && currentUser.id === u.id ? 'bg-indigo-50/90 font-bold text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        <img src={u.avatar} alt={u.full_name} className="w-6 h-6 rounded-full object-cover" />
                        <div className="flex-1 truncate">
                          <div className="truncate">{u.full_name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.college_or_company || u.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Questionnaire Link */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all ${
                    activeTab === 'profile'
                      ? 'border-indigo-400 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  title="Edit Lifestyle Profile & Questionnaire"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.full_name}`}
                    alt={currentUser.full_name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-800 hidden sm:inline">My Habits</span>
                </button>
                {onRetakeQuiz && (
                  <button
                    onClick={onRetakeQuiz}
                    className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
                    title="Retake Habits Quiz"
                  >
                    Retake Quiz ↻
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold whitespace-nowrap ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
