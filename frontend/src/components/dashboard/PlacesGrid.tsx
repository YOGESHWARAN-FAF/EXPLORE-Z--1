import React, { useState } from 'react';
import { Star, MapPin, Phone, Clock, ShieldCheck, Zap, Bus, Car, Building2, Utensils, Coffee, Cross, Train, Plane, Fuel, ShoppingBag, TreePine, AlertTriangle, ExternalLink } from 'lucide-react';
import { PlaceItem } from '../../context/TripContext';

interface PlacesProps {
  places: PlaceItem[];
  title?: string;
}

export const PlacesGrid: React.FC<PlacesProps> = ({ places, title = "Live Apify Scraped Places (17 Categories)" }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Tourist Attraction',
    'Hotel',
    'Restaurant',
    'Bakery',
    'Hospital',
    'Medical Shop',
    'Police Station',
    'Bus Stand',
    'Railway Station',
    'Airport',
    'Petrol Station',
    'EV Charging Station',
    'Parking Facility',
    'Public Toilet',
    'Shopping Mall',
    'Park',
    'Emergency Center'
  ];

  const filtered = selectedCategory === 'All'
    ? places
    : places.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(p.category.toLowerCase()));

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('tourist')) return <MapPin className="w-3.5 h-3.5 text-orange-600" />;
    if (c.includes('hotel')) return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
    if (c.includes('restaurant')) return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
    if (c.includes('bakery')) return <Coffee className="w-3.5 h-3.5 text-rose-600" />;
    if (c.includes('hospital')) return <Cross className="w-3.5 h-3.5 text-red-600" />;
    if (c.includes('medical')) return <Cross className="w-3.5 h-3.5 text-pink-600" />;
    if (c.includes('police')) return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
    if (c.includes('bus')) return <Bus className="w-3.5 h-3.5 text-sky-600" />;
    if (c.includes('rail')) return <Train className="w-3.5 h-3.5 text-purple-600" />;
    if (c.includes('airport')) return <Plane className="w-3.5 h-3.5 text-cyan-600" />;
    if (c.includes('petrol')) return <Fuel className="w-3.5 h-3.5 text-orange-600" />;
    if (c.includes('ev')) return <Zap className="w-3.5 h-3.5 text-teal-600" />;
    if (c.includes('parking')) return <Car className="w-3.5 h-3.5 text-slate-600" />;
    if (c.includes('toilet')) return <MapPin className="w-3.5 h-3.5 text-cyan-700" />;
    if (c.includes('shopping') || c.includes('mall')) return <ShoppingBag className="w-3.5 h-3.5 text-violet-600" />;
    if (c.includes('park')) return <TreePine className="w-3.5 h-3.5 text-emerald-700" />;
    if (c.includes('emergency')) return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
    return <MapPin className="w-3.5 h-3.5 text-orange-600" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-orange-600 font-bold">Apify Scraper Categories</span>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">{title}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-full overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel p-8 text-center text-slate-500 text-sm font-medium">
          No places found in category "{selectedCategory}". Select another tab to explore.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((place) => (
            <div key={place.id} className="glass-card overflow-hidden group border border-slate-200 flex flex-col justify-between hover:border-orange-400 bg-white p-5 space-y-3 rounded-2xl">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-900 border border-slate-200 flex items-center gap-1">
                    {getCategoryIcon(place.category)}
                    {place.category}
                  </span>

                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-slate-950" /> {place.rating}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {place.name}
                  </h4>
                  {place.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 font-medium">{place.description}</p>
                  )}

                  <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                    <div className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" /> {place.address}
                    </div>
                    {place.opening_hours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {place.opening_hours}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 text-xs">
                {place.phone ? (
                  <a href={`tel:${place.phone}`} className="text-orange-600 hover:underline flex items-center gap-1 font-bold">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px]">Contact on arrival</span>
                )}
                
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-orange-600 shadow-sm"
                >
                  <ExternalLink className="w-3 h-3" /> Map Nav
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
