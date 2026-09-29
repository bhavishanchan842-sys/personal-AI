import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Bath, 
  Calendar, 
  ShieldCheck, 
  X, 
  Check, 
  Loader2, 
  Utensils, 
  Users, 
  Sparkles, 
  CheckCircle,
  Clock,
  Building,
  RotateCcw
} from 'lucide-react';
import ListingCard from '../components/ListingCard';
import RadarComparison from '../components/RadarComparison';
import { api } from '../api';
import { INDIAN_LOCATIONS } from '../data/indianCities';

export default function PropertyListings({ currentUser, onRetakeQuiz }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Category Segment
  const [selectedCategory, setSelectedCategory] = useState('All'); // All, PG / Co-Living, Private Room, Entire Flat
  
  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pgGender, setPgGender] = useState('All'); // All, Boys PG, Girls PG, Co-ed PG
  const [sharingType, setSharingType] = useState('All'); // All, Single Occupancy, Double Sharing, Triple Sharing
  const [foodIncluded, setFoodIncluded] = useState('All'); // All, Meals Included, Self-Cooking
  const [maxRent, setMaxRent] = useState('');
  const [searchCity, setSearchCity] = useState('');

  // Modals
  const [selectedListing, setSelectedListing] = useState(null);
  const [radarOccupant, setRadarOccupant] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitBookedSuccess, setVisitBookedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emptyBookingSuccess, setEmptyBookingSuccess] = useState(false);
  const [emptyUserHabits, setEmptyUserHabits] = useState({
    name: currentUser?.full_name || 'Aravind Sharma',
    phone: currentUser?.phone || '+91 98765 43210',
    sleep: 'Night Owl (1 AM - 9 AM)',
    cleanliness: 'High',
    diet: 'Non-Smoker, Veg/Non-Veg OK'
  });

  // Visit Form State
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('11:00 AM - 1:00 PM');
  const [visitPhone, setVisitPhone] = useState(currentUser?.phone || '+91 98765 43210');

  // New Listing Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'Private Room',
    category: 'PG / Co-Living',
    pg_gender: 'Boys PG',
    sharing_type: 'Double Sharing',
    food_included: '3 Meals (Breakfast, Lunch, Dinner)',
    curfew: 'No Curfew (24/7 Access)',
    housekeeping: 'Daily Housekeeping',
    notice_period: '15 Days',
    rent: '',
    deposit: '',
    bedrooms: 1,
    bathrooms: 1,
    address: '',
    city: 'Bengaluru',
    amenities: '3 Homestyle Meals, High-Speed WiFi (200 Mbps), Attached Washroom, Daily Housekeeping, 100% DG Power Backup',
    images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
    available_from: 'Immediate'
  });

  const fetchListings = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory && selectedCategory !== 'All') filters.category = selectedCategory;
      if (pgGender && pgGender !== 'All') filters.pg_gender = pgGender;
      if (sharingType && sharingType !== 'All') filters.sharing_type = sharingType;
      if (foodIncluded && foodIncluded !== 'All') filters.food_included = foodIncluded;
      if (maxRent) filters.max_rent = Number(maxRent);
      if (searchCity && searchCity !== 'All India') filters.city = searchCity;

      const data = await api.getListings(filters);
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, pgGender, sharingType, foodIncluded, maxRent, searchCity, currentUser]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setPgGender('All');
    setSharingType('All');
    setFoodIncluded('All');
    setMaxRent('');
    setSearchCity('');
    setSearchKeyword('');
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const amenitiesList = formData.amenities.split(',').map(s => s.trim()).filter(Boolean);
      const imagesList = formData.images.split(',').map(s => s.trim()).filter(Boolean);

      await api.createListing({
        ...formData,
        rent: Number(formData.rent),
        deposit: Number(formData.deposit || 0),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        amenities: amenitiesList,
        images: imagesList,
        roommate_ids: currentUser ? [currentUser.id] : []
      });

      setShowCreateModal(false);
      fetchListings();
      alert('Listing published successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookVisit = (e) => {
    e.preventDefault();
    setVisitBookedSuccess(true);
    setTimeout(() => {
      setVisitBookedSuccess(false);
      setShowVisitModal(false);
    }, 2000);
  };

  // Filter listings by search keyword client-side
  const filteredListings = listings.filter((l) => {
    if (!searchKeyword.trim()) return true;
    const term = searchKeyword.toLowerCase();
    return (
      l.title.toLowerCase().includes(term) ||
      l.city.toLowerCase().includes(term) ||
      l.address.toLowerCase().includes(term) ||
      l.category.toLowerCase().includes(term) ||
      l.sharing_type.toLowerCase().includes(term)
    );
  });

  // Sort listings: listings with highest compatibility score come first!
  const sortedAndFilteredListings = [...filteredListings].sort((a, b) => {
    const scoreA = a.avg_roommate_compatibility !== null && a.avg_roommate_compatibility !== undefined ? a.avg_roommate_compatibility : -1;
    const scoreB = b.avg_roommate_compatibility !== null && b.avg_roommate_compatibility !== undefined ? b.avg_roommate_compatibility : -1;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Verified PGs, Hostels & Roommate Spaces
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Find Rooms & PGs with High Compatibility
          </h1>
          <p className="text-emerald-50 text-xs sm:text-sm leading-relaxed">
            Search verified boys, girls & co-ed PGs, private rooms, and flats. See your real-time compatibility match with current flatmates before booking!
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 sm:absolute sm:top-8 sm:right-8 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          List a Room or PG
        </button>
      </div>

      {/* Category Segment Selector */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
        {[
          { id: 'All', label: 'All Accommodations' },
          { id: 'PG / Co-Living', label: '🏢 PGs & Co-Living' },
          { id: 'Private Room', label: '🛏️ Private Rooms in Flats' },
          { id: 'Entire Flat', label: '🏠 Entire Flats' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        {/* Search Input & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <label className="block font-semibold text-slate-700 mb-1">Search by Locality or PG Name</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Koramangala, Cyber City, Powai, Double Sharing..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* City Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
            <select
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {INDIAN_LOCATIONS.map((group) => (
                <optgroup key={group.category} label={group.category}>
                  {group.cities.map((c) => (
                    <option key={c} value={c === 'All India' ? '' : c}>
                      {c === 'All India' ? '🇮🇳 All India' : c}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Max Rent */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Max Rent</span>
              <span className="text-emerald-600 font-bold">{maxRent ? `₹${Number(maxRent).toLocaleString('en-IN')}` : 'Any Budget'}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="60000"
              step="1000"
              value={maxRent || 60000}
              onChange={(e) => setMaxRent(e.target.value === '60000' ? '' : e.target.value)}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Secondary PG Filters (Gender, Sharing, Food) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* PG Gender */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Gender:</span>
              <select
                value={pgGender}
                onChange={(e) => setPgGender(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Types</option>
                <option value="Boys PG">Boys PG</option>
                <option value="Girls PG">Girls PG</option>
                <option value="Co-ed PG">Co-Ed PG</option>
              </select>
            </div>

            {/* Sharing Type */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Occupancy:</span>
              <select
                value={sharingType}
                onChange={(e) => setSharingType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">Any Sharing</option>
                <option value="Single Occupancy">Single Room</option>
                <option value="Double Sharing">2 Sharing</option>
                <option value="Triple Sharing">3 Sharing</option>
              </select>
            </div>

            {/* Food Included */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Meals:</span>
              <select
                value={foodIncluded}
                onChange={(e) => setFoodIncluded(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">Any Meal Plan</option>
                <option value="Meals Included">🍲 Meals Provided</option>
                <option value="Self-Cooking">🍳 Self Cooking / Kitchen</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-600 font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Habits Compatibility Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">
            Rooms ranked by compatibility with your habits (Sleep, Cleanliness & Food)
          </span>
        </div>
        {onRetakeQuiz && (
          <button
            onClick={onRetakeQuiz}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition cursor-pointer text-[11px]"
          >
            Update Habits Quiz ↻
          </button>
        )}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading verified PGs and rooms...</p>
        </div>
      ) : sortedAndFilteredListings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Accommodations Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Try adjusting your search criteria, sharing occupancy, or clear rent filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredListings.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              onSelect={(l) => setSelectedListing(l)}
            />
          ))}
        </div>
      )}

      {/* Listing Details Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Top */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {selectedListing.category || 'PG'}
                  </span>
                  {selectedListing.pg_gender && selectedListing.pg_gender !== 'Any' && (
                    <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                      {selectedListing.pg_gender}
                    </span>
                  )}
                  {selectedListing.sharing_type && (
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                      {selectedListing.sharing_type}
                    </span>
                  )}
                  <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    ⚡ Zero Brokerage
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                  {selectedListing.title}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedListing.address}, {selectedListing.city}
                </p>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos Gallery */}
            <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedListing.images && selectedListing.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={selectedListing.title}
                  className="w-full h-48 object-cover rounded-2xl border border-slate-100"
                />
              ))}
            </div>

            {/* Financial & Accommodation Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
                <div className="text-[11px] text-emerald-800 font-medium">Monthly Rent</div>
                <div className="text-base font-extrabold text-emerald-700 mt-0.5">₹{selectedListing.rent.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-emerald-600">Includes maintenance</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Security Deposit</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">₹{selectedListing.deposit.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400">100% Refundable</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Food / Meals</div>
                <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{selectedListing.food_included || 'No Food'}</div>
                <div className="text-[10px] text-slate-400">Hygienic prep</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Gate Curfew</div>
                <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{selectedListing.curfew || 'No Curfew'}</div>
                <div className="text-[10px] text-slate-400">Biometric access</div>
              </div>
            </div>

            {/* ⭐ CORE HIGHLIGHT: CURRENT ROOMMATES & COMPATIBILITY ⭐ */}
            {selectedListing.roommates && selectedListing.roommates.length > 0 && (
              <div className="my-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Current Flatmates Living in this Property ({selectedListing.roommates.length})</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    Roommate Compatibility Check
                  </span>
                </div>

                {/* Rent Share Info */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center mb-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">👥 1 Person Already Living Here</span>
                    <span className="text-[11px] text-emerald-700">Total rent ₹{selectedListing.rent.toLocaleString('en-IN')}, split equally per person</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-700">
                      ₹{Math.round(selectedListing.rent / (selectedListing.roommates.length + 1)).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">/ month (Your Share)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedListing.roommates.map((occ) => (
                    <div
                      key={occ.id}
                      className="p-3 bg-white rounded-xl border border-indigo-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={occ.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${occ.full_name}`}
                          alt={occ.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {occ.full_name}
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({occ.college_or_company || occ.role})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                            {occ.sleep_schedule && (
                              <span className="bg-slate-100 px-1.5 py-0.2 rounded">
                                {occ.sleep_schedule >= 4 ? '🦉 Night Owl' : '🌅 Early Bird'}
                              </span>
                            )}
                            {occ.dietary_preference && (
                              <span className="bg-slate-100 px-1.5 py-0.2 rounded">
                                🥗 {occ.dietary_preference}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Compatibility Badge & Radar Action */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {occ.compatibility_score !== null && occ.compatibility_score !== undefined ? (
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-sm ${
                              occ.compatibility_score >= 80 
                                ? 'bg-emerald-600 text-white' 
                                : occ.compatibility_score >= 60 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-rose-600 text-white'
                            }`}>
                              <Sparkles className="w-3 h-3" />
                              {occ.compatibility_score}% Match
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Match score active</span>
                        )}

                        <button
                          onClick={async () => {
                            try {
                              const details = await api.getCandidateDetails(occ.id);
                              setRadarOccupant({
                                user: occ,
                                dimension_scores: details.dimension_scores,
                                green_flags: details.green_flags,
                                yellow_flags: details.yellow_flags,
                                score: details.compatibility_score
                              });
                            } catch (e) {
                              alert('Please log in to view detailed radar breakdown.');
                            }
                          }}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          Compare Lifestyle →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ⭐ IF EMPTY ROOM: BOOK & SAVE HABITS FOR FUTURE ROOMMATES ⭐ */}
            {(!selectedListing.roommates || selectedListing.roommates.length === 0) && (
              <div className="my-5 p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Empty Room — Be the First Occupant!</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    Save Habits for Future Flatmates
                  </span>
                </div>
                <p className="text-xs text-blue-800 mb-3">
                  No one is living here yet! Enter your lifestyle habits below so the next person booking can check their compatibility with you.
                </p>

                {emptyBookingSuccess ? (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center">
                    ✓ Booking Confirmed! Your lifestyle profile has been saved for future roommates.
                  </div>
                ) : (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-blue-100 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Your Full Name</label>
                        <input
                          type="text"
                          value={emptyUserHabits.name}
                          onChange={(e) => setEmptyUserHabits({...emptyUserHabits, name: e.target.value})}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={emptyUserHabits.phone}
                          onChange={(e) => setEmptyUserHabits({...emptyUserHabits, phone: e.target.value})}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Sleep Rhythm</label>
                        <select
                          value={emptyUserHabits.sleep}
                          onChange={(e) => setEmptyUserHabits({...emptyUserHabits, sleep: e.target.value})}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none"
                        >
                          <option>Night Owl (1 AM - 9 AM)</option>
                          <option>Early Bird (10 PM - 6 AM)</option>
                          <option>Flexible / Regular</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Food Preference</label>
                        <select
                          value={emptyUserHabits.diet}
                          onChange={(e) => setEmptyUserHabits({...emptyUserHabits, diet: e.target.value})}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none"
                        >
                          <option>Non-Smoker, Veg/Non-Veg OK</option>
                          <option>Strictly Pure Vegetarian</option>
                          <option>Eggetarian</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEmptyBookingSuccess(true);
                        setTimeout(() => {
                          alert(`Booking Confirmed for ₹${selectedListing.rent.toLocaleString('en-IN')}! Your habits as '${emptyUserHabits.name}' are now saved for the next flatmate.`);
                        }, 200);
                      }}
                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      Confirm Booking & Save Profile (₹{selectedListing.rent.toLocaleString('en-IN')}) ✓
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="my-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Property & Room Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {selectedListing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="my-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Included Amenities & Services</h4>
              <div className="flex flex-wrap gap-2">
                {selectedListing.amenities && selectedListing.amenities.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-xl font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* House Rules & Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-700">Notice Period: </span>
                <span className="text-slate-600">{selectedListing.notice_period || '30 Days'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Daily Housekeeping: </span>
                <span className="text-slate-600">{selectedListing.housekeeping || 'Daily'}</span>
              </div>
            </div>

            {/* Host & Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <img
                  src={selectedListing.owner_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedListing.owner_name}`}
                  alt={selectedListing.owner_name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-100"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {selectedListing.owner_name}
                    {selectedListing.owner_verified && (
                      <span className="text-emerald-700 flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Host
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{selectedListing.owner_email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    alert(`Direct WhatsApp/Phone contact for ${selectedListing.owner_name}: +91 98765 43210`);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                >
                  Contact Host
                </button>
                <button
                  onClick={() => setShowVisitModal(true)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Visit / Book Bed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Schedule Free Property Visit
              </h3>
              <button
                onClick={() => setShowVisitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {visitBookedSuccess ? (
              <div className="py-8 text-center space-y-2 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Visit Scheduled!</h4>
                <p className="text-xs text-slate-500">
                  A confirmation SMS & WhatsApp with the PG manager's phone number has been sent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookVisit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Visit Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
                  <select
                    value={visitSlot}
                    onChange={(e) => setVisitSlot(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="10:00 AM - 12:00 PM">Morning: 10:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 3:00 PM">Afternoon: 12:00 PM - 3:00 PM</option>
                    <option value="4:00 PM - 7:00 PM">Evening: 4:00 PM - 7:00 PM</option>
                    <option value="7:00 PM - 9:00 PM">Night: 7:00 PM - 9:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Mobile Number (for OTP & Gates)</label>
                  <input
                    type="tel"
                    required
                    value={visitPhone}
                    onChange={(e) => setVisitPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] leading-relaxed">
                  ✓ Free tour with zero brokerage.<br />
                  ✓ Meet current flatmates and inspect room cleanliness.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all mt-2"
                >
                  Confirm Free Visit
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Radar Comparison Modal from Roommate card */}
      {radarOccupant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src={radarOccupant.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${radarOccupant.user.full_name}`}
                  alt={radarOccupant.user.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Compatibility with {radarOccupant.user.full_name}
                  </h3>
                  <p className="text-[11px] text-slate-500">6-Axis Lifestyle Habit Radar</p>
                </div>
              </div>
              <button
                onClick={() => setRadarOccupant(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4">
              <RadarComparison
                dimensionScores={radarOccupant.dimension_scores}
                candidateName={radarOccupant.user.full_name.split(' ')[0]}
              />
            </div>

            {/* Green & Yellow Flags */}
            <div className="space-y-2 text-xs">
              {radarOccupant.green_flags && radarOccupant.green_flags.length > 0 && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="font-bold text-emerald-800 block mb-1">✨ Mutual Alignments:</span>
                  <ul className="list-disc list-inside text-emerald-700 space-y-0.5">
                    {radarOccupant.green_flags.map((gf, i) => (
                      <li key={i}>{gf}</li>
                    ))}
                  </ul>
                </div>
              )}

              {radarOccupant.yellow_flags && radarOccupant.yellow_flags.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="font-bold text-amber-800 block mb-1">⚠️ Differences to Discuss:</span>
                  <ul className="list-disc list-inside text-amber-700 space-y-0.5">
                    {radarOccupant.yellow_flags.map((yf, i) => (
                      <li key={i}>{yf}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setRadarOccupant(null)}
              className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Post a Room or PG Listing
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Listing Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Luxury Double Sharing Boys PG in Koramangala (Food Included)"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category, PG Gender & Sharing Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PG / Co-Living">PG / Co-Living</option>
                    <option value="Private Room">Private Room in Flat</option>
                    <option value="Entire Flat">Entire Flat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Gender</label>
                  <select
                    value={formData.pg_gender}
                    onChange={(e) => setFormData({ ...formData, pg_gender: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Boys PG">Boys PG / Male Only</option>
                    <option value="Girls PG">Girls PG / Female Only</option>
                    <option value="Co-ed PG">Co-Ed / Unisex</option>
                    <option value="Any">Any / Family</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Occupancy / Sharing</label>
                  <select
                    value={formData.sharing_type}
                    onChange={(e) => setFormData({ ...formData, sharing_type: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Single Occupancy">Single Occupancy</option>
                    <option value="Double Sharing">Double Sharing (2 Beds)</option>
                    <option value="Triple Sharing">Triple Sharing (3 Beds)</option>
                    <option value="Private Room">Private Room</option>
                  </select>
                </div>
              </div>

              {/* Food & Curfew */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Food / Meals Service</label>
                  <select
                    value={formData.food_included}
                    onChange={(e) => setFormData({ ...formData, food_included: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="3 Meals (Breakfast, Lunch, Dinner)">3 Meals (Breakfast, Lunch, Dinner)</option>
                    <option value="2 Meals (Breakfast + Dinner)">2 Meals (Breakfast + Dinner)</option>
                    <option value="Breakfast Only">Breakfast Only</option>
                    <option value="Self-Cooking / Kitchen">Self-Cooking / Kitchen</option>
                    <option value="No Food">No Food Provided</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Curfew / Gate Timing</label>
                  <select
                    value={formData.curfew}
                    onChange={(e) => setFormData({ ...formData, curfew: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="No Curfew (24/7 Access)">No Curfew (24/7 Access)</option>
                    <option value="11:00 PM">11:00 PM</option>
                    <option value="10:00 PM">10:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Rent, Deposit & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    placeholder="12000"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    placeholder="12000"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Locality Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 80 Feet Road, 4th Block, Koramangala"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe meal options, WiFi speed, power backup, distance to tech parks..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="3 Homestyle Meals, High-Speed WiFi, Attached Washroom, Daily Housekeeping"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition-all"
                >
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
