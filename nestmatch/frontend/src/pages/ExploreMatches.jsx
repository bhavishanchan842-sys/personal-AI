import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Filter, 
  Sparkles, 
  Compass, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import RoommateCard from '../components/RoommateCard';
import RadarComparison from '../components/RadarComparison';
import { api } from '../api';
import { INDIAN_LOCATIONS } from '../data/indianCities';

export default function ExploreMatches({ currentUser }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [cityFilter, setCityFilter] = useState('');
  const [lifestyleFilter, setLifestyleFilter] = useState('All');
  
  // Modals
  const [radarModalCandidate, setRadarModalCandidate] = useState(null);
  const [connectModalCandidate, setConnectModalCandidate] = useState(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (minScore > 0) params.min_score = minScore;
      if (cityFilter) params.city = cityFilter;

      const data = await api.getRecommendations(params);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load roommate recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [minScore, cityFilter, currentUser]);

  const filteredCandidates = candidates.filter((c) => {
    if (lifestyleFilter === 'Pure Veg') return c.profile.dietary_preference === 'Pure Vegetarian';
    if (lifestyleFilter === 'Night Owl') return c.profile.sleep_schedule >= 4;
    if (lifestyleFilter === 'Early Bird') return c.profile.sleep_schedule <= 2;
    if (lifestyleFilter === 'Non-Smoker') return c.profile.smoking === false;
    if (lifestyleFilter === 'WFH') return c.profile.work_routine >= 4;
    return true;
  });

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!connectModalCandidate) return;

    try {
      setSendingRequest(true);
      await api.sendMatchRequest(connectModalCandidate.user.id, connectMessage);
      setRequestSuccess(`Invitation sent to ${connectModalCandidate.user.full_name}!`);
      setTimeout(() => {
        setConnectModalCandidate(null);
        setRequestSuccess('');
        setConnectMessage('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            NestMate Roommate Compatibility Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Discover Compatible Roommates & Flatmates
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Quantified 6-axis compatibility based on sleep rhythms, cleanliness standards, dietary sharing, work routines, and guest policies.
          </p>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Min Compatibility Slider */}
            <div className="flex items-center gap-3 min-w-[240px]">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Min Match: <span className="text-indigo-600 font-bold">{minScore}%</span>
              </span>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Pan-India City Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Location:</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none max-w-[200px]"
              >
                {INDIAN_LOCATIONS.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.cities.map((city) => (
                      <option key={city} value={city === "All India" ? "" : city}>
                        {city === "All India" ? "🇮🇳 All Over India" : city}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Results Counter & Refresh */}
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>Showing <b>{filteredCandidates.length}</b> compatible profiles</span>
            <button 
              onClick={fetchRecommendations}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
              title="Refresh candidates"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Lifestyle Habit Chips */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="font-semibold text-slate-500 shrink-0">Filter Habits:</span>
          {[
            { id: 'All', label: 'All Roommates' },
            { id: 'Pure Veg', label: '🥗 Pure Veg' },
            { id: 'Night Owl', label: '🦉 Night Owls' },
            { id: 'Early Bird', label: '🌅 Early Birds' },
            { id: 'Non-Smoker', label: '🚭 Non-Smokers' },
            { id: 'WFH', label: '💻 Remote / WFH' },
          ].map((trait) => (
            <button
              key={trait.id}
              onClick={() => setLifestyleFilter(trait.id)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap ${
                lifestyleFilter === trait.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {trait.label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-semibold text-slate-600">Computing lifestyle vector similarities...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Matching Roommates Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Try relaxing your minimum compatibility score filter or lifestyle habit filter.
          </p>
          <button
            onClick={() => { setMinScore(0); setCityFilter(''); setLifestyleFilter('All'); }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <RoommateCard
              key={candidate.user.id}
              candidate={candidate}
              onOpenRadar={(c) => setRadarModalCandidate(c)}
              onConnect={(c) => {
                setConnectModalCandidate(c);
                setConnectMessage(`Hi ${c.user.full_name.split(' ')[0]}! Our NestMate compatibility score is ${c.compatibility_score}%. Let's connect!`);
              }}
            />
          ))}
        </div>
      )}

      {/* Radar Comparison Modal */}
      {radarModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={radarModalCandidate.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${radarModalCandidate.user.full_name}`}
                  alt={radarModalCandidate.user.full_name}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-100"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    You vs. {radarModalCandidate.user.full_name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold">
                    {radarModalCandidate.compatibility_score}% Overall Compatibility
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRadarModalCandidate(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Radar Chart Display */}
            <div className="py-2">
              <div className="text-center text-xs text-slate-500 font-medium mb-1">
                Visual Lifestyle Alignment (Scale 1 to 5)
              </div>
              <RadarComparison
                dimensionScores={radarModalCandidate.dimension_scores}
                candidateName={radarModalCandidate.user.full_name.split(' ')[0]}
              />
            </div>

            {/* Side by Side Dimensional Breakdown */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Detailed Dimension Comparison
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(radarModalCandidate.dimension_scores || {}).map(([key, info]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex justify-between items-center font-semibold text-slate-800 mb-1">
                      <span>{info.label}</span>
                      <span className={`text-[11px] font-bold ${info.similarity >= 80 ? 'text-emerald-600' : info.similarity >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {info.similarity}% match
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>You: <b className="text-slate-700">{info.user_val}/5</b></span>
                      <span>Them: <b className="text-slate-700">{info.candidate_val}/5</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setRadarModalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = radarModalCandidate;
                  setRadarModalCandidate(null);
                  setConnectModalCandidate(target);
                  setConnectMessage(`Hi ${target.user.full_name.split(' ')[0]}! Our NestMatch score is ${target.compatibility_score}%. Let's connect!`);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Send Connect Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Invitation Modal */}
      {connectModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Connect with {connectModalCandidate.user.full_name}
              </h3>
              <button
                onClick={() => setConnectModalCandidate(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="py-8 text-center text-emerald-600">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="text-xs font-bold">{requestSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Personalized Message
                  </label>
                  <textarea
                    rows={4}
                    value={connectMessage}
                    onChange={(e) => setConnectMessage(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 resize-none"
                    placeholder="Introduce yourself and mention your desired move-in date..."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your phone number and email will be shared only once they accept.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConnectModalCandidate(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingRequest}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    {sendingRequest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
