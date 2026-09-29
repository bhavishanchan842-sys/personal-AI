import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Save, 
  Check, 
  Loader2, 
  Moon, 
  Sun, 
  ShieldCheck, 
  DollarSign, 
  Volume2, 
  Coffee, 
  Utensils, 
  Users 
} from 'lucide-react';
import { api } from '../api';
import { INDIAN_LOCATIONS } from '../data/indianCities';

export default function MyProfile({ currentUser, onProfileUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profile, setProfile] = useState({
    sleep_schedule: 3,
    cleanliness: 3,
    social_battery: 3,
    work_routine: 3,
    noise_tolerance: 3,
    kitchen_sharing: 3,
    smoking: false,
    drinking: false,
    has_pets: false,
    pet_friendly: true,
    dietary_preference: 'Pure Vegetarian',
    budget_min: 8000,
    budget_max: 22000,
    user_gender: 'Male',
    gender_preference: 'Any',
    preferred_city: 'Bengaluru',
    move_in_date: 'Immediate',
    weights: {
      cleanliness: 3.0,
      sleep_schedule: 2.5,
      social_battery: 2.0,
      noise_tolerance: 2.0,
      work_routine: 1.5,
      kitchen_sharing: 1.0,
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getMyProfile();
        if (data) {
          setProfile(prev => ({
            ...prev,
            ...data,
            weights: data.weights || prev.weights,
          }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateMyProfile(profile);
      setSaveSuccess(true);
      if (onProfileUpdated) onProfileUpdated(updated);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateWeight = (dimension, weightValue) => {
    setProfile(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [dimension]: weightValue,
      }
    }));
  };

  const dimensionsConfig = [
    {
      key: 'cleanliness',
      label: 'Cleanliness & Chores',
      icon: Sparkles,
      minLabel: 'Relaxed / Casual clean',
      maxLabel: 'Pristine / Deep clean daily',
    },
    {
      key: 'sleep_schedule',
      label: 'Sleep & Wake Rhythm',
      icon: Moon,
      minLabel: 'Early Riser (5am - 9pm)',
      maxLabel: 'Night Owl (2am - 10am)',
    },
    {
      key: 'social_battery',
      label: 'Social Energy & Guest Policy',
      icon: Users,
      minLabel: 'Quiet sanctuary (No visitors)',
      maxLabel: 'Frequent gatherings & friends',
    },
    {
      key: 'noise_tolerance',
      label: 'Noise & Background Audio',
      icon: Volume2,
      minLabel: 'Silent library atmosphere',
      maxLabel: 'Music / TV ambient background',
    },
    {
      key: 'work_routine',
      label: 'Work / Study Location',
      icon: Coffee,
      minLabel: '100% Campus / Office',
      maxLabel: '100% WFH / In-Room Study',
    },
    {
      key: 'kitchen_sharing',
      label: 'Kitchen & Meal Sharing',
      icon: Utensils,
      minLabel: 'Strict separate cookware',
      maxLabel: 'Shared cooking & dining',
    },
  ];

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs">Loading your lifestyle habits...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            Compatibility Calibration Studio
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Lifestyle Habits & Priority Weights
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrate your personal habits and tell the algorithm which factors matter most to you.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saveSuccess ? 'Profile Updated!' : 'Save Habits'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: The 6 Core Lifestyle Dimensions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">1. Behavioral Lifestyle Vectors</h2>
            <p className="text-xs text-slate-500">Rate your personal preference on a 1–5 scale and assign its relative priority weight.</p>
          </div>

          <div className="space-y-6">
            {dimensionsConfig.map((dim) => {
              const Icon = dim.icon;
              const val = profile[dim.key] || 3;
              const weight = profile.weights?.[dim.key] || 2.0;

              return (
                <div key={dim.key} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">{dim.label}</span>
                    </div>

                    {/* Priority Weight Selector */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px]">
                      <span className="text-slate-400 px-1.5 font-medium">Priority:</span>
                      <button
                        type="button"
                        onClick={() => updateWeight(dim.key, 1.0)}
                        className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                          weight === 1.0 ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Low (1x)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateWeight(dim.key, 2.0)}
                        className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                          weight === 2.0 ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Normal (2x)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateWeight(dim.key, 3.0)}
                        className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                          weight === 3.0 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        High (3x)
                      </button>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="pt-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                      <span className="text-[11px] text-slate-400 font-normal">{dim.minLabel}</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        Level {val} / 5
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">{dim.maxLabel}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={val}
                      onChange={(e) => setProfile({ ...profile, [dim.key]: Number(e.target.value) })}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Budget & Dealbreakers (Hard Constraints) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">2. Budget & Dealbreakers (Hard Constraints)</h2>
            <p className="text-xs text-slate-500">Mismatches on these criteria will result in a 0% compatibility score.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Budget Range (INR) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Budget (₹/mo)</label>
              <input
                type="number"
                value={profile.budget_min}
                onChange={(e) => setProfile({ ...profile, budget_min: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Budget (₹/mo)</label>
              <input
                type="number"
                value={profile.budget_max}
                onChange={(e) => setProfile({ ...profile, budget_max: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            {/* Dietary Preference (Crucial for India) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dietary & Kitchen Habit</label>
              <select
                value={profile.dietary_preference || 'Flexible'}
                onChange={(e) => setProfile({ ...profile, dietary_preference: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
              >
                <option value="Pure Vegetarian">🌱 Pure Vegetarian (No egg/meat)</option>
                <option value="Eggetarian">🥚 Eggetarian (Eggs allowed)</option>
                <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
                <option value="Flexible">✨ Flexible / Any Kitchen</option>
              </select>
            </div>

            {/* Target Indian City */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Location (Pan-India)</label>
              <select
                value={profile.preferred_city}
                onChange={(e) => setProfile({ ...profile, preferred_city: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
              >
                {INDIAN_LOCATIONS.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.cities.map((city) => (
                      <option key={city} value={city}>
                        {city === "All India" ? "🇮🇳 All Over India (Willing to Relocate)" : city}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Gender Preferences */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Gender</label>
              <select
                value={profile.user_gender}
                onChange={(e) => setProfile({ ...profile, user_gender: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Any">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roommate Gender Preference</label>
              <select
                value={profile.gender_preference}
                onChange={(e) => setProfile({ ...profile, gender_preference: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Any">No Preference (Any)</option>
                <option value="Male">Male Roommates Only</option>
                <option value="Female">Female Roommates Only</option>
              </select>
            </div>

            {/* Target City */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Location / City</label>
              <input
                type="text"
                value={profile.preferred_city}
                onChange={(e) => setProfile({ ...profile, preferred_city: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Move-In Date</label>
              <input
                type="text"
                value={profile.move_in_date || ''}
                onChange={(e) => setProfile({ ...profile, move_in_date: e.target.value })}
                placeholder="e.g. Aug 1, 2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.smoking}
                onChange={(e) => setProfile({ ...profile, smoking: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="font-medium text-slate-700">I am a smoker (Cigarette / Vape)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.has_pets}
                onChange={(e) => setProfile({ ...profile, has_pets: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="font-medium text-slate-700">I have pets (Dog / Cat)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.pet_friendly}
                onChange={(e) => setProfile({ ...profile, pet_friendly: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="font-medium text-slate-700">I am pet-friendly (Comfortable with animals)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.drinking}
                onChange={(e) => setProfile({ ...profile, drinking: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="font-medium text-slate-700">Social drinker</span>
            </label>
          </div>
        </div>

        {/* Bottom Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Updating...' : saveSuccess ? 'Saved Successfully!' : 'Save All Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
