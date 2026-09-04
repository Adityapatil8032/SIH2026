import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Compass,
  ShoppingBag,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Languages,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { LocalGuide, ArtisanBazaar, TravelGroup } from '../types.ts';

interface ServicesDirectoryProps {
  guides: LocalGuide[];
  bazaars: ArtisanBazaar[];
  groups: TravelGroup[];
}

export const ServicesDirectory: React.FC<ServicesDirectoryProps> = ({
  guides,
  bazaars,
  groups
}) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'bazaars' | 'groups'>('guides');
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({});
  const [followedGuides, setFollowedGuides] = useState<Record<string, boolean>>({});

  const handleJoinGroup = (groupId: string) => {
    setJoinedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleFollowGuide = (guideId: string) => {
    setFollowedGuides((prev) => ({ ...prev, [guideId]: !prev[guideId] }));
  };

  return (
    <section id="services-directory-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
              <Briefcase className="h-4 w-4" />
            </span>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Verified Local Services, Guides & Bazaars
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Direct connections to certified regional storytellers, zero-commission craft collectives, and verified travel groups.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('guides')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'guides'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Local Guides ({guides.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bazaars')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'bazaars'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Verified Bazaars ({bazaars.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'groups'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Travel Groups ({groups.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Local Guides */}
      {activeTab === 'guides' && (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((g) => {
            const isFollowing = Boolean(followedGuides[g.id]);
            return (
              <div
                key={g.id}
                id={`guide-card-${g.id}`}
                className="rounded-xl border border-slate-800/80 bg-[#121212] p-6 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <img
                      src={g.avatar}
                      alt={g.name}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-lg object-cover border border-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-['Outfit'] text-base font-bold text-white">
                          {g.name}
                        </h4>
                        <ShieldCheck className="h-4 w-4 text-indigo-400" />
                      </div>
                      <span className="text-xs text-indigo-400 font-medium block">
                        {g.region}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium mt-0.5">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{g.rating} ({g.reviewsCount} verified tours)</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3.5 text-xs text-slate-300 leading-relaxed italic">
                    "{g.speciality}"
                  </p>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {g.bio}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Languages className="h-3.5 w-3.5" /> Languages:
                      </span>
                      <span className="font-medium text-white">{g.languages.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Hourly Tariff:</span>
                      <span className="font-bold text-emerald-400">{g.hourlyRate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleFollowGuide(g.id)}
                    className={`flex-1 rounded-md py-2 text-xs font-medium transition ${
                      isFollowing
                        ? 'border border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                        : 'border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {isFollowing ? '✓ Connected' : 'Connect Guide'}
                  </button>
                  <button
                    onClick={() => alert(`Direct booking initiated for ${g.name}. Verified booking window opened.`)}
                    className="flex-1 rounded-md bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20"
                  >
                    Hire Guide
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Artisan Bazaars */}
      {activeTab === 'bazaars' && (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-6">
          {bazaars.map((bz) => (
            <div
              key={bz.id}
              id={`bazaar-card-${bz.id}`}
              className="rounded-xl border border-slate-800/80 bg-[#121212] overflow-hidden hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="relative h-44 w-full">
                <img
                  src={bz.image}
                  alt={bz.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-emerald-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-black">
                    ZERO COMMISSION
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] uppercase text-indigo-400 font-semibold block">
                    {bz.category}
                  </span>
                  <h4 className="font-['Outfit'] text-base font-bold text-white leading-tight">
                    {bz.name}
                  </h4>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {bz.description}
                  </p>

                  <div className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs mb-3">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Direct Weaver Benchmark
                    </span>
                    <span className="font-semibold text-emerald-400 text-xs mt-0.5 block">
                      {bz.priceGuidance}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {bz.specialties.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-950 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${bz.name} ${bz.location}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition border border-slate-800"
                  >
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Get Directions & Direct Contact</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Travel Groups */}
      {activeTab === 'groups' && (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((grp) => {
            const isJoined = Boolean(joinedGroups[grp.id]);
            return (
              <div
                key={grp.id}
                id={`group-card-${grp.id}`}
                className="rounded-xl border border-slate-800/80 bg-[#121212] p-6 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                      {grp.travelStyle} Circuit
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified Group</span>
                    </span>
                  </div>

                  <h4 className="mt-3 font-['Outfit'] text-base font-bold text-white">
                    {grp.name}
                  </h4>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{grp.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{grp.travelDates}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                    {grp.description}
                  </p>

                  <div className="mt-4 rounded-lg bg-slate-950 border border-slate-800 p-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Group Capacity:</span>
                    <span className="font-semibold text-indigo-400">
                      {grp.membersCount} / {grp.maxMembers} Travelers
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleJoinGroup(grp.id)}
                    className={`w-full rounded-md py-2.5 text-xs font-semibold transition ${
                      isJoined
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/20'
                    }`}
                  >
                    {isJoined ? '✓ Membership Requested' : 'Join Travel Group →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
