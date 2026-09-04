import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Users,
  Sparkles,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
  X,
  MessageSquare,
  UserPlus
} from 'lucide-react';
import { Destination, TravelGroup, TravelerCompanion } from '../types.ts';
import { fetchTravelers, fetchTravelGroups } from '../services/api.ts';

interface HomeSearchBarProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onPlanDestination: (destName: string) => void;
  onSelectTraveler?: (traveler: TravelerCompanion) => void;
  onOpenConnectModal?: () => void;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  destinations,
  onSelectDestination,
  onPlanDestination,
  onSelectTraveler,
  onOpenConnectModal
}) => {
  const [searchMode, setSearchMode] = useState<'destinations' | 'travelers'>('destinations');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [travelers, setTravelers] = useState<TravelerCompanion[]>([]);
  const [groups, setGroups] = useState<TravelGroup[]>([]);
  const [selectedCompanionForModal, setSelectedCompanionForModal] = useState<TravelerCompanion | null>(null);
  const [connectMessageSent, setConnectMessageSent] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchTravelers().then((data) => setTravelers(data));
    fetchTravelGroups().then((data) => setGroups(data));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered destinations
  const filteredDestinations = destinations.filter((d) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.state.toLowerCase().includes(q) ||
      d.tagline.toLowerCase().includes(q) ||
      d.popularActivities.some((act) => act.toLowerCase().includes(q))
    );
  }).slice(0, 6);

  // Filtered travelers & groups
  const filteredTravelers = travelers.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.travelStyle.toLowerCase().includes(q) ||
      t.interests.some((i) => i.toLowerCase().includes(q))
    );
  }).slice(0, 5);

  const filteredGroups = groups.filter((g) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.destination.toLowerCase().includes(q) ||
      g.travelStyle.toLowerCase().includes(q)
    );
  }).slice(0, 3);

  const quickDestinationTags = ['Jaipur', 'Manali', 'Goa', 'Spiti Valley', 'Munnar', 'Varanasi'];
  const quickTravelerTags = ['Solo Heritage', 'Skiing & Snow', 'Women Only', 'Sahyadri Treks'];

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-4xl px-4 sm:px-6">
      {/* Search Box Wrapper with Elegant Dark Border */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#121212] p-2 shadow-2xl transition-all focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20">
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/70 px-2 pb-2 mb-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="tab-search-destinations"
              onClick={() => {
                setSearchMode('destinations');
                setIsOpen(true);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                searchMode === 'destinations'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Explore Destinations</span>
            </button>

            <button
              type="button"
              id="tab-search-travelers"
              onClick={() => {
                setSearchMode('travelers');
                setIsOpen(true);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                searchMode === 'travelers'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Find Travelers & Groups</span>
              <span className="rounded-full bg-indigo-950 border border-indigo-700/50 px-1.5 py-0.2 text-[9px] text-indigo-300 font-mono">
                {travelers.length + groups.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <span>Instant Autocomplete Active</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 px-3 py-1.5">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            id="homepage-master-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={
              searchMode === 'destinations'
                ? 'Search city, state, or interest (e.g. "Jaipur", "Himachal", "River Rafting")...'
                : 'Search travelers, travel styles, or groups (e.g. "Manali Snow", "Solo", "Heritage")...'
            }
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            id="homepage-search-submit-btn"
            onClick={() => setIsOpen(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-semibold shrink-0 transition flex items-center gap-1.5 shadow-md shadow-indigo-900/30"
          >
            <span>Search</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto px-2 pb-1 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap pl-1">
            {searchMode === 'destinations' ? 'Popular:' : 'Active Circles:'}
          </span>
          {(searchMode === 'destinations' ? quickDestinationTags : quickTravelerTags).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                setIsOpen(true);
              }}
              className="rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500/60 hover:text-white transition whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Autocomplete Dropdown Popup */}
      {isOpen && (
        <div
          id="homepage-search-autocomplete-dropdown"
          className="absolute left-4 right-4 sm:left-6 sm:right-6 top-full mt-2 z-50 rounded-2xl border border-slate-800/90 bg-[#121212] p-3 shadow-2xl backdrop-blur-xl max-h-[440px] overflow-y-auto"
        >
          {searchMode === 'destinations' ? (
            <div>
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-800/70 text-[11px] font-semibold text-slate-400">
                <span>DESTINATION MATCHES ({filteredDestinations.length})</span>
                <span className="text-indigo-400">Click to plan or preview</span>
              </div>

              {filteredDestinations.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No destinations found matching "{query}". Try "Jaipur", "Manali", or "Goa".
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="group flex items-center justify-between gap-3 rounded-xl p-2.5 hover:bg-slate-900 transition border border-transparent hover:border-slate-800"
                    >
                      <div
                        onClick={() => {
                          onSelectDestination(dest);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <img
                          src={dest.image}
                          alt={dest.name}
                          referrerPolicy="no-referrer"
                          className="h-11 w-11 rounded-lg object-cover border border-slate-800"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-['Outfit'] font-bold text-sm text-white group-hover:text-indigo-300 transition">
                              {dest.name}
                            </span>
                            <span className="text-[11px] text-slate-400">({dest.state})</span>
                            <span className="rounded bg-indigo-950 border border-indigo-800/50 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-300">
                              {dest.bestSeason}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {dest.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                          ₹{dest.startingBudget.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onPlanDestination(dest.name);
                            setIsOpen(false);
                          }}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-medium transition shadow-sm"
                        >
                          Plan Trip →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-800/70 text-[11px] font-semibold text-slate-400">
                <span>VERIFIED TRAVELERS & GROUPS ({filteredTravelers.length + filteredGroups.length})</span>
                <span className="text-emerald-400">Safe Matching Active</span>
              </div>

              {filteredTravelers.length === 0 && filteredGroups.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No travelers or groups found for "{query}". Try "Heritage", "Solo", or "Manali".
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Travelers */}
                  {filteredTravelers.map((trv) => (
                    <div
                      key={trv.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3 bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={trv.avatar}
                          alt={trv.name}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-full object-cover border border-indigo-500/40"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{trv.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">from {trv.location}</span>
                            {trv.isVerified && (
                              <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold">
                                <ShieldCheck className="h-3 w-3" />
                                <span>Verified</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-indigo-300 font-medium mt-0.5">
                            Heading to <strong className="text-white">{trv.destination}</strong> • {trv.dates} • {trv.budgetFormatted}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                            "{trv.bio}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="rounded-lg bg-emerald-950/70 border border-emerald-800/60 px-2 py-1 text-[11px] font-bold text-emerald-400">
                          {trv.compatibilityScore}% Match
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCompanionForModal(trv);
                            setConnectMessageSent(false);
                          }}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold transition"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Travel Groups */}
                  {filteredGroups.map((grp) => (
                    <div
                      key={grp.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3 bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{grp.name}</span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
                              {grp.travelStyle}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {grp.destination} • {grp.travelDates} • {grp.membersCount}/{grp.maxMembers} Members
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onPlanDestination(grp.destination);
                          setIsOpen(false);
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1.5 text-xs font-medium transition"
                      >
                        Join Route
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Direct Connect Modal */}
      {selectedCompanionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121212] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCompanionForModal.avatar}
                  alt={selectedCompanionForModal.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <h3 className="font-bold text-white text-base">{selectedCompanionForModal.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedCompanionForModal.location} → <strong className="text-indigo-400">{selectedCompanionForModal.destination}</strong>
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {selectedCompanionForModal.compatibilityScore}% Travel Compatibility
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompanionForModal(null)}
                className="text-slate-500 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <span className="text-slate-200 font-medium">{selectedCompanionForModal.dates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Budget:</span>
                <span className="text-slate-200 font-medium">{selectedCompanionForModal.budgetFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Style:</span>
                <span className="text-indigo-300 font-medium">{selectedCompanionForModal.travelStyle}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block mb-1">Interests:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCompanionForModal.interests.map((int, i) => (
                    <span key={i} className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                      {int}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-300 italic mb-3">"{selectedCompanionForModal.bio}"</p>

              {connectMessageSent ? (
                <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-3 text-center text-xs text-emerald-300 font-medium">
                  ✓ Connection invitation sent to {selectedCompanionForModal.name}! You will receive notification when they accept.
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    defaultValue={`Hi ${selectedCompanionForModal.name}, I'm planning a trip to ${selectedCompanionForModal.destination} around the same time. Let's split transport and explore!`}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setConnectMessageSent(true)}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/30"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Send Travel Invite</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
