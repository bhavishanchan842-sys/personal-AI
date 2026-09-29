import React from 'react';
import { CheckCircle, ShieldCheck, Sparkles, AlertCircle, Compass, Send, Moon, Sun, DollarSign, HeartHandshake } from 'lucide-react';

export default function RoommateCard({ candidate, onOpenRadar, onConnect }) {
  const { user, profile, compatibility_score, passed_hard_constraints, green_flags, yellow_flags } = candidate;

  // Score styling
  const getScoreBadge = (score) => {
    if (score >= 85) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    if (score >= 70) return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
    if (score >= 50) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    return { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
  };

  const scoreBadge = getScoreBadge(compatibility_score);

  const getSleepLabel = (val) => {
    if (val <= 2) return 'Early Riser';
    if (val === 3) return 'Flexible Sleep';
    return 'Night Owl';
  };

  const getCleanLabel = (val) => {
    if (val <= 2) return 'Casual Clean';
    if (val === 3) return 'Moderate Clean';
    return 'Pristine / Neat';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        {/* Top Header: Avatar + Name + Score Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`}
              alt={user.full_name}
              className="w-13 h-13 rounded-full object-cover border-2 border-indigo-100 shadow-inner"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-800 text-base">{user.full_name}</h3>
                {user.is_verified && (
                  <span title="Verified Institutional ID / Edu" className="text-indigo-600">
                    <ShieldCheck className="w-4 h-4 fill-indigo-50" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{user.college_or_company || 'Independent Renter'}</p>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm ${scoreBadge.bg}`}>
            <span className={`w-2 h-2 rounded-full ${scoreBadge.dot}`}></span>
            <span>{compatibility_score}% Match</span>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs text-slate-600 mb-3.5 line-clamp-2 leading-relaxed italic bg-slate-50/70 p-2 rounded-lg border border-slate-100">
            "{user.bio}"
          </p>
        )}

        {/* Behavioral Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
            {profile.sleep_schedule >= 4 ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            {getSleepLabel(profile.sleep_schedule)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md">
            <Sparkles className="w-3 h-3" />
            {getCleanLabel(profile.cleanliness)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
            ₹{profile.budget_min.toLocaleString('en-IN')} - ₹{profile.budget_max.toLocaleString('en-IN')}/mo
          </span>
          {profile.dietary_preference && (
            <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md ${
              profile.dietary_preference === 'Pure Vegetarian' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-slate-100 text-slate-700'
            }`}>
              {profile.dietary_preference === 'Pure Vegetarian' ? '🌱 Pure Veg' : profile.dietary_preference}
            </span>
          )}
          {profile.has_pets && (
            <span className="inline-flex items-center text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">
              🐾 Has Pet
            </span>
          )}
          {profile.smoking && (
            <span className="inline-flex items-center text-[11px] font-medium bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md">
              Smoker
            </span>
          )}
        </div>

        {/* AI Compatibility Highlights (Green Flags) */}
        {green_flags && green_flags.length > 0 && (
          <div className="space-y-1 mb-4 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60">
            <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Why You Align:
            </div>
            {green_flags.slice(0, 2).map((flag, idx) => (
              <p key={idx} className="text-[11px] text-slate-700 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-emerald-500">
                {flag}
              </p>
            ))}
          </div>
        )}

        {/* Potential Friction (Yellow Flags) if any */}
        {yellow_flags && yellow_flags.length > 0 && (
          <div className="space-y-1 mb-4 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/60">
            <div className="text-[11px] font-semibold text-amber-800 flex items-center gap-1 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Points to Discuss:
            </div>
            {yellow_flags.slice(0, 1).map((flag, idx) => (
              <p key={idx} className="text-[11px] text-slate-600 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-amber-500">
                {flag}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
        <button
          onClick={() => onOpenRadar(candidate)}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-indigo-500" />
          Compare Radar
        </button>
        <button
          onClick={() => onConnect(candidate)}
          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Connect
        </button>
      </div>
    </div>
  );
}
