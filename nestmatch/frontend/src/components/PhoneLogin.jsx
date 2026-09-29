import React, { useState } from 'react';
import { Phone, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PhoneLogin({ onLoginSuccess, demoUsers }) {
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    if (phoneNumber.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (otp !== '1234') {
      setError('Invalid OTP! Please enter demo OTP: 1234');
      return;
    }
    setLoading(true);

    // Pick first demo user or match user, attach phone
    const defaultUser = demoUsers && demoUsers.length > 0 ? demoUsers[0] : {
      id: 1,
      full_name: 'Aravind Sharma',
      email: 'aravind@smartrental.com',
      phone: `+91 ${phoneNumber}`,
      role: 'seeker'
    };

    localStorage.setItem('smart_rental_phone', `+91 ${phoneNumber}`);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(defaultUser, `+91 ${phoneNumber}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-lg mb-2 shadow-sm">
            SR
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Smart Rental</h1>
          <p className="text-xs text-slate-500">Find Rooms, PGs & Check Roommate Compatibility</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Phone Input */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Mobile Number
              </label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-slate-800 transition-colors">
                <span className="bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-600 flex items-center border-r border-slate-200">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="w-full px-3 py-2.5 text-sm font-medium text-slate-900 outline-none bg-white"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">We will send a 4-digit verification OTP.</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Send OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: OTP Input */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">OTP sent to: <b>+91 {phoneNumber}</b></span>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                Enter 4-Digit OTP
              </label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="1 2 3 4"
                className="w-full tracking-widest text-center text-xl font-bold py-2.5 border border-slate-200 rounded-xl outline-none focus:border-slate-800 bg-white"
                autoFocus
              />
              <div className="flex justify-between items-center mt-1 text-[11px]">
                <span className="text-emerald-600 font-medium">Demo OTP is: <b>1234</b></span>
                <button
                  type="button"
                  onClick={() => setOtp('1234')}
                  className="text-slate-500 hover:text-slate-900 font-medium"
                >
                  Auto-fill
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verify & Browse Rooms</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Minimal Footer */}
        <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          Smart Rental & Roommate Compatibility Platform
        </div>
      </div>
    </div>
  );
}
