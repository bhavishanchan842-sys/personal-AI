import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Bath, 
  Sparkles, 
  DollarSign, 
  CheckCircle, 
  Car, 
  Maximize2,
  Info
} from 'lucide-react';
import { api } from '../api';

export default function FairRentCalculator() {
  const [totalRent, setTotalRent] = useState(38000);
  const [rooms, setRooms] = useState([
    {
      name: 'Master Bedroom (Attached Balcony)',
      assigned_to: 'Flatmate 1',
      sqft: 220,
      private_bath: true,
      balcony: true,
      parking: true,
    },
    {
      name: 'Second Bedroom (Attached Bath)',
      assigned_to: 'Flatmate 2',
      sqft: 180,
      private_bath: true,
      balcony: false,
      parking: false,
    },
    {
      name: 'Third Bedroom (Common Bath)',
      assigned_to: 'Flatmate 3',
      sqft: 140,
      private_bath: false,
      balcony: false,
      parking: false,
    },
  ]);

  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCalculation = async () => {
    try {
      setLoading(true);
      const res = await api.calculateFairRent(Number(totalRent), rooms);
      setCalculationResult(res);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCalculation();
  }, [totalRent, rooms]);

  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      {
        name: `Bedroom ${rooms.length + 1}`,
        assigned_to: `Roommate ${String.fromCharCode(65 + rooms.length)}`,
        sqft: 150,
        private_bath: false,
        balcony: false,
        parking: false,
      },
    ]);
  };

  const handleRemoveRoom = (index) => {
    if (rooms.length <= 1) return;
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const updateRoom = (index, field, value) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            Fair Division Mathematics
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Fair Rent & Room Splitter
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prevent roommate disputes with a mathematically equitable rent division based on square footage, en-suite bathrooms, and balcony access.
          </p>
        </div>

        {/* Total Rent Input */}
        <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100 flex items-center gap-3">
          <span className="text-xs font-bold text-indigo-900">Total Monthly Rent:</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600">₹</span>
            <input
              type="number"
              value={totalRent}
              onChange={(e) => setTotalRent(Math.max(1000, Number(e.target.value)))}
              className="w-32 pl-6 pr-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Room Configuration List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Apartment Rooms & Features</h2>
            <p className="text-xs text-slate-500">Configure room size and premium perks for each occupant.</p>
          </div>
          <button
            onClick={handleAddRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Room
          </button>
        </div>

        <div className="space-y-3">
          {rooms.map((room, index) => (
            <div
              key={index}
              className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Room Label</label>
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) => updateRoom(index, 'name', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Occupant Name</label>
                  <input
                    type="text"
                    value={room.assigned_to}
                    onChange={(e) => updateRoom(index, 'assigned_to', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Area & Perks */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-24">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    value={room.sqft}
                    onChange={(e) => updateRoom(index, 'sqft', Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border cursor-pointer font-medium text-[11px] transition-all ${
                    room.private_bath ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={room.private_bath}
                      onChange={(e) => updateRoom(index, 'private_bath', e.target.checked)}
                      className="hidden"
                    />
                    <Bath className="w-3 h-3" />
                    Private Bath (+25%)
                  </label>

                  <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border cursor-pointer font-medium text-[11px] transition-all ${
                    room.balcony ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={room.balcony}
                      onChange={(e) => updateRoom(index, 'balcony', e.target.checked)}
                      className="hidden"
                    />
                    <Sparkles className="w-3 h-3" />
                    Balcony (+12%)
                  </label>

                  <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border cursor-pointer font-medium text-[11px] transition-all ${
                    room.parking ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={room.parking}
                      onChange={(e) => updateRoom(index, 'parking', e.target.checked)}
                      className="hidden"
                    />
                    <Car className="w-3 h-3" />
                    Parking (+8%)
                  </label>

                  {rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculated Breakdown Results */}
      {calculationResult && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800/80 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                Mathematical Result
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Equitable Rent Breakdown (INR)
              </h3>
            </div>
            <div className="text-xs text-indigo-200">
              Total: <b className="text-white text-base">₹{totalRent.toLocaleString('en-IN')}</b> / month
            </div>
          </div>

          {/* Allocation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculationResult.allocations.map((alloc, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">{alloc.room_name}</h4>
                      <p className="text-xs text-indigo-200">{alloc.assigned_to}</p>
                    </div>
                    <span className="text-xs font-extrabold bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-lg border border-indigo-400/30">
                      {alloc.rent_percentage}%
                    </span>
                  </div>

                  <div className="my-3 space-y-1 text-xs text-indigo-100/80">
                    <div>• Area: <b>{alloc.sqft} sqft</b></div>
                    <div>• Bath: <b>{alloc.private_bath ? 'Attached Washroom' : 'Common Washroom'}</b></div>
                    <div>• Balcony: <b>{alloc.balcony ? 'Private Balcony' : 'None'}</b></div>
                    <div>• Parking: <b>{alloc.parking ? 'Covered Spot' : 'None'}</b></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
                  <span className="text-xs text-indigo-200">Fair Monthly Share:</span>
                  <span className="text-xl font-extrabold text-white">
                    ₹{alloc.calculated_rent.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Explanation Footer */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-indigo-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-white">Fair Division Methodology:</b> Allocations are derived using a multi-attribute weighted valuation algorithm. Square footage establishes base living area proportion (60%), with mathematical valuation multipliers added for attached private bathrooms (+25%), private balcony views (+12%), and dedicated parking (+8%).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
