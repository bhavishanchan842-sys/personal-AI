import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Users, 
  DollarSign, 
  Calendar,
  Save,
  Loader2
} from 'lucide-react';
import { api } from '../api';

export default function RoommateAgreement({ currentUser, demoUsers }) {
  const [roommateId, setRoommateId] = useState('');
  const [address, setAddress] = useState('Flat 402, Tower 3, Prestige Falcon City, Bengaluru');
  const [totalRent, setTotalRent] = useState(32000);
  const [myShare, setMyShare] = useState(16000);
  const [roommateShare, setRoommateShare] = useState(16000);
  const [quietHours, setQuietHours] = useState('11:00 PM – 7:00 AM Weekdays, 12:00 AM Weekends');
  const [guestPolicy, setGuestPolicy] = useState('Overnight guests allowed up to 2 nights with 24-hour prior notice in flat WhatsApp group');
  const [choreSchedule, setChoreSchedule] = useState('Daily maid for sweeping/mopping; alternating weekends for deep cleaning');
  const [sharedExpenses, setSharedExpenses] = useState('Society maintenance (₹3,500), Cook (₹5,000), RO filter & groceries split 50/50 on 1st of month');
  
  const [savedAgreements, setSavedAgreements] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const potentialRoommates = (demoUsers || []).filter(u => u.id !== currentUser?.id && u.role !== 'landlord');

  useEffect(() => {
    if (potentialRoommates.length > 0 && !roommateId) {
      setRoommateId(potentialRoommates[0].id);
    }
  }, [demoUsers, currentUser]);

  const selectedRoommate = potentialRoommates.find(u => u.id === Number(roommateId)) || potentialRoommates[0];

  const handlePrint = () => {
    window.print();
  };

  const handleSignAndSave = async () => {
    if (!selectedRoommate) return;
    try {
      setSaving(true);
      await api.createAgreement({
        user2_id: selectedRoommate.id,
        property_address: address,
        total_rent: Number(totalRent),
        user1_share: Number(myShare),
        user2_share: Number(roommateShare),
        quiet_hours: quietHours,
        guest_policy: guestPolicy,
        chore_schedule: choreSchedule,
        special_terms: sharedExpenses,
      });
      setIsSigned(true);
      alert('Agreement digitally validated and recorded!');
    } catch (err) {
      alert(err.message || 'Failed to save agreement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            Co-Living Contract Generator
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Digital Roommate Agreement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formalize expectations before moving in together to protect security deposits and friendships.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
          <button
            onClick={handleSignAndSave}
            disabled={saving || isSigned}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSigned 
                ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {isSigned ? 'Digitally Signed ✓' : 'Validate & Sign Agreement'}
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Agreement Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Roommate Partner</label>
            <select
              value={roommateId}
              onChange={(e) => setRoommateId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {potentialRoommates.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.college_or_company || 'Seeker'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Property Rental Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Monthly Rent ($)</label>
            <input
              type="number"
              value={totalRent}
              onChange={(e) => {
                const total = Number(e.target.value);
                setTotalRent(total);
                setMyShare(Math.round(total / 2));
                setRoommateShare(Math.round(total / 2));
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Share ($)</label>
              <input
                type="number"
                value={myShare}
                onChange={(e) => setMyShare(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Their Share ($)</label>
              <input
                type="number"
                value={roommateShare}
                onChange={(e) => setRoommateShare(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quiet Hours Policy</label>
            <input
              type="text"
              value={quietHours}
              onChange={(e) => setQuietHours(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Overnight Guest Rules</label>
            <input
              type="text"
              value={guestPolicy}
              onChange={(e) => setGuestPolicy(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cleaning & Chores Division</label>
            <input
              type="text"
              value={choreSchedule}
              onChange={(e) => setChoreSchedule(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shared Household Supplies</label>
            <input
              type="text"
              value={sharedExpenses}
              onChange={(e) => setSharedExpenses(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Document Formal Preview */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-300 shadow-xl space-y-6 text-slate-900 font-serif">
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <div className="text-[11px] font-sans uppercase font-bold tracking-widest text-indigo-600 mb-1">
            NestMatch India • Verified Co-Living Memorandum
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            11-MONTH RESIDENTIAL FLATSHARE & CO-LIVING AGREEMENT
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Execution Date: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })} • Applicable for Indian Tenancy & Society Bylaws
          </p>
        </div>

        <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-700">
          <p>
            This Co-Living Flatshare Agreement (the <b>"Agreement"</b>) is executed between{' '}
            <span className="font-bold text-slate-900 underline">{currentUser?.full_name || 'Primary Cotenant'}</span>{' '}
            (Cotenant 1) and{' '}
            <span className="font-bold text-slate-900 underline">{selectedRoommate?.full_name || 'Roommate Partner'}</span>{' '}
            (Cotenant 2) for the shared residential flat situated at:
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-900 text-xs">
            📍 {address}
          </div>

          {/* Section 1 */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">1. Monthly Rent & Society Maintenance Allocation</h4>
            <p>
              The total agreed base flat rent is <b>₹{totalRent.toLocaleString('en-IN')}</b> per month. Cotenant 1 agrees to pay{' '}
              <b>₹{myShare.toLocaleString('en-IN')}</b> and Cotenant 2 agrees to pay <b>₹{roommateShare.toLocaleString('en-IN')}</b>,
              payable directly via UPI/NEFT on or before the 5th day of every calendar month.
            </p>
          </div>

          {/* Section 2 */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">2. Quiet Hours & Society Bylaws</h4>
            <p>
              Both parties strictly agree to observe quiet hours: <b>{quietHours}</b>, adhering to Resident Welfare Association (RWA) / Society guidelines. Loud music, shouting, or corridor disturbance is strictly prohibited.
            </p>
          </div>

          {/* Section 3 */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">3. Guest Policy & Visitors</h4>
            <p>
              <b>{guestPolicy}</b>. Extended family or friend stays exceeding 3 consecutive days require prior written consent from all cotenants.
            </p>
          </div>

          {/* Section 4 */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">4. House Help & Shared Expenses</h4>
            <p>
              <b>{sharedExpenses}</b>. Cleaning routine: <b>{choreSchedule}</b>.
            </p>
          </div>

          {/* Section 5 */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-900 uppercase text-xs mb-1">5. Notice Period & Security Deposit Refund</h4>
            <p>
              Either cotenant wishing to vacate must provide a mandatory <b>1-Month Advance Notice</b> or find an acceptable replacement cotenant. Security deposit refund is subject to handover in original clean condition minus standard painting charges.
            </p>
          </div>
        </div>

        {/* Signatures Area */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 font-sans">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold mb-1">TENANT 1 SIGNATURE</div>
            <div className="font-serif italic text-lg text-indigo-900 py-1">
              {currentUser?.full_name || 'Primary Tenant'}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Digitally Verified ({currentUser?.email})
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold mb-1">TENANT 2 SIGNATURE</div>
            <div className="font-serif italic text-lg text-slate-900 py-1">
              {selectedRoommate?.full_name || 'Roommate Partner'}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Digitally Verified ({selectedRoommate?.email})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
