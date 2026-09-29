import React from 'react';
import { MapPin, Bed, Bath, ShieldCheck, Check, DollarSign, Calendar, Utensils, Users, Sparkles } from 'lucide-react';

export default function ListingCard({ listing, onSelect }) {
  const primaryImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80';

  // Badge styling based on PG gender and category
  const getBadgeStyle = () => {
    if (listing.category === 'PG / Co-Living' || listing.pg_gender !== 'Any') {
      if (listing.pg_gender === 'Boys PG') return 'bg-blue-600/90 text-white';
      if (listing.pg_gender === 'Girls PG') return 'bg-pink-600/90 text-white';
      if (listing.pg_gender === 'Co-ed PG') return 'bg-purple-600/90 text-white';
      return 'bg-emerald-600/90 text-white';
    }
    if (listing.category === 'Private Room') return 'bg-indigo-600/90 text-white';
    return 'bg-slate-900/80 text-white';
  };

  const getCategoryLabel = () => {
    if (listing.pg_gender && listing.pg_gender !== 'Any') {
      return listing.pg_gender;
    }
    return listing.category || listing.property_type || 'PG / Room';
  };

  const hasFood = listing.food_included && listing.food_included !== 'No Food';

  return (
    <div 
      onClick={() => onSelect(listing)}
      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail Image */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-100">
          <img
            src={primaryImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Category & Sharing Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span className={`backdrop-blur-md text-[11px] font-bold px-3 py-1 rounded-full shadow-sm ${getBadgeStyle()}`}>
              {getCategoryLabel()}
            </span>
            {listing.sharing_type && listing.sharing_type !== 'Private Room' && (
              <span className="bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                {listing.sharing_type}
              </span>
            )}
          </div>

          {/* Zero Brokerage or Occupancy Status */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {listing.roommates && listing.roommates.length > 0 ? (
              <span className="bg-amber-600/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow">
                👥 {listing.roommates.length} Flatmate Living Here
              </span>
            ) : (
              <span className="bg-blue-600/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow">
                ✨ Empty Room
              </span>
            )}
            <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow">
              ⚡ Zero Brokerage
            </span>
          </div>

          {/* Price Tag with Share Indicator */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-xl shadow flex flex-col items-end">
            {listing.roommates && listing.roommates.length > 0 ? (
              <>
                <span className="text-emerald-700 font-black text-sm">
                  ₹{Math.round(listing.rent / (listing.roommates.length + 1)).toLocaleString('en-IN')}
                  <span className="text-[10px] font-normal text-slate-500"> /share</span>
                </span>
                <span className="text-[9px] text-slate-400 font-normal">Total: ₹{listing.rent.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <>
                <span className="text-slate-900 font-black text-sm">
                  ₹{listing.rent.toLocaleString('en-IN')}
                  <span className="text-[10px] font-normal text-slate-500"> /mo</span>
                </span>
                <span className="text-[9px] text-blue-600 font-medium">Be 1st Occupant</span>
              </>
            )}
          </div>

          {/* Roommate Match Badge if available */}
          {listing.avg_roommate_compatibility !== null && listing.avg_roommate_compatibility !== undefined && (
            <div className="absolute bottom-3 left-3 bg-emerald-600/95 text-white backdrop-blur-md text-[11px] font-bold px-2.5 py-1 rounded-xl shadow flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{listing.avg_roommate_compatibility}% Roommate Match</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {listing.title}
          </h3>
          
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{listing.address}, {listing.city}</span>
          </p>

          {/* Key Specs Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs text-slate-600">
            {hasFood && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-200/60">
                <Utensils className="w-3 h-3 text-amber-600" />
                {listing.food_included.split('(')[0].trim()}
              </span>
            )}

            {listing.roommates && listing.roommates.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-indigo-200/60">
                <Users className="w-3 h-3 text-indigo-600" />
                {listing.roommates.length} Current {listing.roommates.length === 1 ? 'Roommate' : 'Roommates'}
              </span>
            )}

            {listing.curfew && (
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                🚪 {listing.curfew.split('(')[0].trim()}
              </span>
            )}
          </div>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1 mb-2">
            {listing.amenities && listing.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                {amenity}
              </span>
            ))}
            {listing.amenities && listing.amenities.length > 3 && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                +{listing.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Owner Info & Action */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={listing.owner_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.owner_name}`}
            alt={listing.owner_name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <div className="text-[11px] flex items-center gap-1">
            <span className="font-semibold text-slate-700">{listing.owner_name}</span>
            {listing.owner_verified && (
              <ShieldCheck className="w-3 h-3 text-emerald-600" title="Verified Host" />
            )}
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          View Details →
        </span>
      </div>
    </div>
  );
}
