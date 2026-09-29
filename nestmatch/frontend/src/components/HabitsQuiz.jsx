import React, { useState } from 'react';
import { Sparkles, Moon, Sun, Utensils, Laptop, Sparkle, Check, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function HabitsQuiz({ onComplete, currentUser }) {
  const [sleepSchedule, setSleepSchedule] = useState('night_owl'); // 'early_bird' or 'night_owl'
  const [cleanliness, setCleanliness] = useState('high'); // 'high' or 'normal'
  const [diet, setDiet] = useState('non_veg'); // 'pure_veg' or 'non_veg'
  const [workRoutine, setWorkRoutine] = useState('wfh'); // 'wfh' or 'office'
  const [smoking, setSmoking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      sleep_schedule: sleepSchedule === 'night_owl' ? 5 : 1,
      cleanliness: cleanliness === 'high' ? 5 : 3,
      social_battery: 3,
      work_schedule: workRoutine === 'wfh' ? 5 : 1,
      noise_tolerance: 3,
      cooking_frequency: 3,
      dietary_preference: diet === 'pure_veg' ? 'Pure Veg' : 'Non-Veg',
      smoking: smoking,
      drinking: false,
      pets: false,
    };

    try {
      if (api.getToken()) {
        await api.updateMyProfile(payload);
      }
    } catch (err) {
      console.warn('Could not save to API, saving locally:', err);
    } finally {
      localStorage.setItem('smart_rental_quiz_completed', 'true');
      localStorage.setItem('smart_rental_user_habits', JSON.stringify(payload));
      setSubmitting(false);
      onComplete(payload);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1 pb-2 border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold mb-1 border border-emerald-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Tell Us Your General Habits</h2>
          <p className="text-xs text-slate-500">We will show rooms & roommates that match your daily lifestyle.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Question 1: Sleep Schedule */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1.5">1. What is your sleep timing?</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSleepSchedule('night_owl')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  sleepSchedule === 'night_owl'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>🦉 Night Owl</span>
                  {sleepSchedule === 'night_owl' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[11px] mt-1 ${sleepSchedule === 'night_owl' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Sleep late (1 AM - 9 AM)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSleepSchedule('early_bird')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  sleepSchedule === 'early_bird'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>🌅 Early Bird</span>
                  {sleepSchedule === 'early_bird' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[11px] mt-1 ${sleepSchedule === 'early_bird' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Sleep early (10 PM - 6 AM)
                </span>
              </button>
            </div>
          </div>

          {/* Question 2: Cleanliness */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1.5">2. How clean do you like your room?</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setCleanliness('high')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  cleanliness === 'high'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>✨ Very Clean</span>
                  {cleanliness === 'high' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[11px] mt-1 ${cleanliness === 'high' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Clean daily, wash dishes fast
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCleanliness('normal')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  cleanliness === 'normal'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>🧹 Normal</span>
                  {cleanliness === 'normal' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[11px] mt-1 ${cleanliness === 'normal' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Clean on weekends, relaxed
                </span>
              </button>
            </div>
          </div>

          {/* Question 3: Food Preference */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1.5">3. Food & Diet Preference</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDiet('pure_veg')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  diet === 'pure_veg'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>🥗 Strictly Pure Veg</span>
                  {diet === 'pure_veg' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[11px] mt-1 ${diet === 'pure_veg' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Only vegetarian roommates
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDiet('non_veg')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  diet === 'non_veg'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>🍗 Non-Veg & Veg OK</span>
                  {diet === 'non_veg' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[11px] mt-1 ${diet === 'non_veg' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Comfortable with any food
                </span>
              </button>
            </div>
          </div>

          {/* Question 4: Work / Study Location */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1.5">4. Where do you spend your day?</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setWorkRoutine('wfh')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  workRoutine === 'wfh'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>💻 WFH / Study at Home</span>
                  {workRoutine === 'wfh' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[11px] mt-1 ${workRoutine === 'wfh' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Need quiet daytime room
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWorkRoutine('office')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  workRoutine === 'office'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>🏢 College or Office</span>
                  {workRoutine === 'office' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[11px] mt-1 ${workRoutine === 'office' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Away during daytime
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{submitting ? 'Saving Habits...' : 'Show Matching Rooms & Roommates'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
