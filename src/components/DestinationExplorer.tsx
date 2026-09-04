import React, { useState } from 'react';
import { Search, Compass, ShieldCheck, MapPin, Sparkles, Filter } from 'lucide-react';
import { Destination, DestinationCategory } from '../types.ts';

interface DestinationExplorerProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onPlanDestination: (destName: string) => void;
}

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  destinations,
  onSelectDestination,
  onPlanDestination
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DestinationCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: DestinationCategory[] = [
    'All',
    'Heritage',
    'Adventure',
    'Nature',
    'Beaches',
    'Mountains',
    'Food',
    'Spiritual',
    'Hidden Gems'
  ];

  const filtered = destinations.filter((d) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      d.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase());
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.state.toLowerCase().includes(q) ||
      d.tagline.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="destinations-explorer-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
              <Compass className="h-4 w-4" />
            </span>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Curated Destination Discovery
            </h2>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Explore 500+ Indian destinations with real-time route safety scores, local artisan grids & heritage briefings.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            id="destination-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, state, or style..."
            className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Destination Grid */}
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((dest) => (
          <div
            key={dest.id}
            id={`dest-card-${dest.id}`}
            className="group relative rounded-xl border border-slate-800/80 bg-[#121212] overflow-hidden hover:border-slate-700 transition-all hover:shadow-xl flex flex-col justify-between"
          >
            {/* Image Banner */}
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={dest.image}
                alt={dest.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/50" />

              <div className="absolute top-2.5 right-2.5">
                <span className="flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{dest.safetyScore}% Safe</span>
                </span>
              </div>

              <div className="absolute bottom-2.5 left-3">
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                  {dest.state}
                </span>
                <h3 className="font-['Outfit'] text-lg font-bold text-white leading-tight">
                  {dest.name}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {dest.tagline}
                </p>

                <div className="grid grid-cols-2 gap-2 text-center rounded-lg bg-slate-950 border border-slate-800/80 p-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Best Season</span>
                    <span className="font-medium text-slate-200 text-[11px] truncate block">
                      {dest.bestSeason}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Starts At</span>
                    <span className="font-bold text-white text-[11px] block">
                      ₹{dest.startingBudget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Top Activities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dest.popularActivities.slice(0, 2).map((act, i) => (
                      <span
                        key={i}
                        className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  id={`btn-dest-view-${dest.id}`}
                  onClick={() => onSelectDestination(dest)}
                  className="flex-1 rounded-md border border-slate-800 bg-slate-900/60 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white transition text-center"
                >
                  View Details
                </button>
                <button
                  type="button"
                  id={`btn-dest-plan-${dest.id}`}
                  onClick={() => onPlanDestination(dest.name)}
                  className="flex-1 rounded-md bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20 text-center"
                >
                  Plan Trip →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center py-12 rounded-xl border border-slate-800/80 bg-[#121212]">
          <p className="text-slate-400 text-sm">No destinations found matching your criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-medium text-indigo-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
