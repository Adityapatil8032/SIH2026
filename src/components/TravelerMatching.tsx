import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  MessageSquare,
  DollarSign,
  Compass,
  Filter,
  UserPlus,
  Send,
  X,
  CheckCircle2
} from 'lucide-react';
import { TravelerCompanion } from '../types.ts';
import { fetchTravelers, matchTravelersWithAI, createTravelerProfile } from '../services/api.ts';

interface TravelerMatchingProps {
  currentDestination?: string;
  onPlanDestination?: (destName: string) => void;
}

export const TravelerMatching: React.FC<TravelerMatchingProps> = ({
  currentDestination = 'Jaipur',
  onPlanDestination
}) => {
  const [travelers, setTravelers] = useState<TravelerCompanion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [matchingInProgress, setMatchingInProgress] = useState<boolean>(false);

  // Filter & Search states
  const [destFilter, setDestFilter] = useState<string>('');
  const [styleFilter, setStyleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Matchmaker custom inputs
  const [matchDest, setMatchDest] = useState<string>(currentDestination || 'Jaipur');
  const [matchDates, setMatchDates] = useState<string>('Dec 15 - Dec 20');
  const [matchBudget, setMatchBudget] = useState<string>('₹10,000 - ₹15,000');
  const [matchStyle, setMatchStyle] = useState<string>('Cultural & Heritage');
  const [matchInterests, setMatchInterests] = useState<string>('Forts, Photography, Street Food');

  // Direct Connect Modal
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerCompanion | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string>('');
  const [inviteSent, setInviteSent] = useState<boolean>(false);

  // New Post Modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newPostName, setNewPostName] = useState<string>('');
  const [newPostLocation, setNewPostLocation] = useState<string>('Delhi');
  const [newPostDest, setNewPostDest] = useState<string>('Manali');
  const [newPostDates, setNewPostDates] = useState<string>('Jan 10 - Jan 15');
  const [newPostBudget, setNewPostBudget] = useState<string>('₹8,000 - ₹12,000');
  const [newPostStyle, setNewPostStyle] = useState<string>('Adventure & Snow');
  const [newPostBio, setNewPostBio] = useState<string>('');
  const [newPostInterests, setNewPostInterests] = useState<string>('Trekking, Snowboarding, Cafes');
  const [postSuccess, setPostSuccess] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchTravelers().then((data) => {
      setTravelers(data);
      setLoading(false);
    });
  }, []);

  const handleRunAIMatch = async () => {
    setMatchingInProgress(true);
    try {
      const matched = await matchTravelersWithAI({
        destination: matchDest,
        dates: matchDates,
        budget: matchBudget,
        travelStyle: matchStyle,
        interests: matchInterests.split(',').map((s) => s.trim())
      });
      setTravelers(matched);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingInProgress(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostName || !newPostDest) return;

    try {
      const created = await createTravelerProfile({
        name: newPostName,
        age: 26,
        location: newPostLocation,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        destination: newPostDest,
        dates: newPostDates,
        budgetFormatted: newPostBudget,
        budgetMin: 8000,
        budgetMax: 15000,
        travelStyle: newPostStyle,
        interests: newPostInterests.split(',').map((s) => s.trim()),
        bio: newPostBio || `Excited to explore ${newPostDest}! Looking for friendly co-travelers to share memories and transport costs.`,
        isVerified: true
      });
      setTravelers([created, ...travelers]);
      setPostSuccess(true);
      setTimeout(() => {
        setPostSuccess(false);
        setCreateModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTravelers = travelers.filter((t) => {
    if (destFilter && !t.destination.toLowerCase().includes(destFilter.toLowerCase())) {
      return false;
    }
    if (styleFilter !== 'All' && !t.travelStyle.toLowerCase().includes(styleFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.interests.some((i) => i.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <section id="traveler-matching-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
              <Users className="h-4 w-4" />
            </span>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              AI TRAVELER COMPANION MATCHING
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Connect with verified solo travelers, carpool partners & trekking groups heading to the same destination.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs font-semibold transition shadow-lg shadow-indigo-900/30"
        >
          <UserPlus className="h-4 w-4" />
          <span>Post Travel Request</span>
        </button>
      </div>

      {/* AI Matchmaker Form Banner */}
      <div className="mt-6 rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-[#14141d] via-[#111116] to-[#14141d] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-white">
            Find High-Compatibility Travel Partners (AI Scored)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Target Destination
            </label>
            <input
              type="text"
              value={matchDest}
              onChange={(e) => setMatchDest(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Manali, Jaipur, Goa"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Travel Dates
            </label>
            <input
              type="text"
              value={matchDates}
              onChange={(e) => setMatchDates(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Dec 15 - Dec 20"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Travel Style
            </label>
            <select
              value={matchStyle}
              onChange={(e) => setMatchStyle(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Cultural & Heritage">Cultural & Heritage</option>
              <option value="Adventure & Trekking">Adventure & Trekking</option>
              <option value="Budget Backpacker">Budget Backpacker</option>
              <option value="Relaxed & Coastal">Relaxed & Coastal</option>
              <option value="Solo Female Traveler">Solo Female Traveler</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Your Interests
            </label>
            <input
              type="text"
              value={matchInterests}
              onChange={(e) => setMatchInterests(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Cafes, Hiking, Photography"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleRunAIMatch}
            disabled={matchingInProgress}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-semibold transition shadow-md shadow-indigo-900/30 disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${matchingInProgress ? 'animate-spin' : ''}`} />
            <span>{matchingInProgress ? 'Calculating Compatibility...' : 'Find Compatible Companions'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, destination, or interests..."
            className="w-full rounded-xl border border-slate-800 bg-[#121212] pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-500 text-[11px] whitespace-nowrap">Filter Style:</span>
          {['All', 'Heritage', 'Adventure', 'Backpacker', 'Relaxation'].map((st) => (
            <button
              key={st}
              onClick={() => setStyleFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition ${
                styleFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Travelers */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTravelers.map((trv) => (
          <div
            key={trv.id}
            className="rounded-2xl border border-slate-800/80 bg-[#121212] p-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-xl"
          >
            <div>
              {/* Header: Avatar, Name, Compatibility Score */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={trv.avatar}
                    alt={trv.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500/60 shadow"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-sm">{trv.name}</h4>
                      {trv.isVerified && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Govt ID</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">Based in {trv.location}</p>
                  </div>
                </div>

                <span className="rounded-lg bg-emerald-950/80 border border-emerald-800/60 px-2 py-1 text-[11px] font-bold text-emerald-400 shrink-0">
                  {trv.compatibilityScore}% Match
                </span>
              </div>

              {/* Destination & Dates Banner */}
              <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800/80 p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-indigo-400" />
                    <span>Destination:</span>
                  </span>
                  <strong className="text-white">{trv.destination}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>Dates:</span>
                  </span>
                  <span className="text-slate-300 font-medium">{trv.dates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-slate-500" />
                    <span>Target Budget:</span>
                  </span>
                  <span className="text-indigo-300 font-semibold">{trv.budgetFormatted}</span>
                </div>
              </div>

              {/* Bio & Travel Style */}
              <p className="mt-3 text-xs text-slate-300 italic line-clamp-2">
                "{trv.bio}"
              </p>

              {/* Interests Chips */}
              <div className="mt-3 flex flex-wrap gap-1">
                {trv.interests.map((int, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400"
                  >
                    {int}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTraveler(trv);
                  setInviteSent(false);
                  setInviteMessage(`Hi ${trv.name}, I'm also traveling to ${trv.destination}. Would love to connect and share transport!`);
                }}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/30"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Connect</span>
              </button>

              <button
                type="button"
                onClick={() => onPlanDestination?.(trv.destination)}
                className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-2 text-xs font-medium transition"
                title="Plan trip to this destination"
              >
                Plan Route
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Connect / Invite Modal */}
      {selectedTraveler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121212] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTraveler.avatar}
                  alt={selectedTraveler.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <h3 className="font-bold text-white text-base">{selectedTraveler.name}</h3>
                  <p className="text-xs text-slate-400">
                    Destination: <strong className="text-indigo-400">{selectedTraveler.destination}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTraveler(null)}
                className="text-slate-500 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              {inviteSent ? (
                <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-4 text-center text-xs text-emerald-300">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400 mb-1" />
                  Invitation dispatched! {selectedTraveler.name} will be alerted.
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs text-slate-400 block font-medium">
                    Send a personalized intro & route invitation:
                  </label>
                  <textarea
                    rows={3}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setInviteSent(true)}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Connection Request</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Travel Request Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#121212] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-['Outfit'] text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                <span>Post Travel Companion Request</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-500 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {postSuccess ? (
              <div className="py-8 text-center text-xs text-emerald-400 font-semibold space-y-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                <div>Travel request posted live! Other travelers can now discover and message you.</div>
              </div>
            ) : (
              <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newPostName}
                      onChange={(e) => setNewPostName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Your Home City
                    </label>
                    <input
                      type="text"
                      required
                      value={newPostLocation}
                      onChange={(e) => setNewPostLocation(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Destination
                    </label>
                    <input
                      type="text"
                      required
                      value={newPostDest}
                      onChange={(e) => setNewPostDest(e.target.value)}
                      placeholder="e.g. Manali"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Travel Dates
                    </label>
                    <input
                      type="text"
                      required
                      value={newPostDates}
                      onChange={(e) => setNewPostDates(e.target.value)}
                      placeholder="e.g. Jan 10 - Jan 15"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Target Budget
                  </label>
                  <input
                    type="text"
                    value={newPostBudget}
                    onChange={(e) => setNewPostBudget(e.target.value)}
                    placeholder="e.g. ₹10,000 - ₹15,000"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Bio & Travel Preferences
                  </label>
                  <textarea
                    rows={2}
                    value={newPostBio}
                    onChange={(e) => setNewPostBio(e.target.value)}
                    placeholder="Describe your travel pace, what you're looking for in a companion..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 font-semibold shadow-md shadow-indigo-900/30"
                  >
                    Post Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
