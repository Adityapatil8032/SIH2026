import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Compass,
  CloudSun,
  Wind,
  Droplets,
  CheckCircle2,
  Navigation,
  Bookmark,
  Share2,
  Play,
  Calendar,
  DollarSign,
  ChevronRight,
  Sun,
  ShieldAlert,
  Luggage,
  Layers,
  ArrowRight,
  Sliders,
  Users,
  BedDouble,
  Car,
  UtensilsCrossed,
  Activity
} from 'lucide-react';
import { GeneratedItinerary, PlanTier } from '../types.ts';

interface ItineraryViewProps {
  plan: GeneratedItinerary;
  onSavePlan: (plan: GeneratedItinerary) => void;
  onStartTrip: (plan: GeneratedItinerary) => void;
  onSelectStop?: (stopName: string) => void;
  isSaved?: boolean;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  plan,
  onSavePlan,
  onStartTrip,
  onSelectStop,
  isSaved = false
}) => {
  const [selectedTierKey, setSelectedTierKey] = useState<'budget' | 'balanced' | 'premium'>(
    plan.selectedTier || 'balanced'
  );
  const [activeDay, setActiveDay] = useState(1);
  const [checkedPackingItems, setCheckedPackingItems] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [highlightedStop, setHighlightedStop] = useState<string | null>(null);

  // Dynamic cost adjustment states
  const [dynamicTravelers, setDynamicTravelers] = useState<number>(plan.travelers || 2);
  const [dynamicDays, setDynamicDays] = useState<number>(plan.durationDays || 4);
  const [hotelStandard, setHotelStandard] = useState<'budget' | 'comfort' | 'heritage'>('comfort');
  const [transportMode, setTransportMode] = useState<'shared' | 'private_cab' | 'suv'>('private_cab');

  const activeDayData =
    plan.dailyItinerary.find((d) => d.dayNumber === activeDay) || plan.dailyItinerary[0];

  const handleTogglePacking = (idx: number) => {
    setCheckedPackingItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Apna Route: Check out my ${dynamicDays}-day trip from ${plan.from} to ${plan.destination}! Calculated Budget: ₹${recalculatedCost.total.toLocaleString('en-IN')}. Powered by Apna Route.`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleStopClick = (placeName: string) => {
    setHighlightedStop(placeName);
    onSelectStop?.(placeName);
    // Smooth scroll to map radar if available
    const el = document.getElementById('map-radar-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic Cost Calculation Algorithm
  const recalculatedCost = useMemo(() => {
    const roomsCount = Math.ceil(dynamicTravelers / 2);

    // Hotel daily rates
    const hotelRates = {
      budget: 1200,
      comfort: 2800,
      heritage: 6500
    };
    const stayCost = hotelRates[hotelStandard] * dynamicDays * roomsCount;

    // Transport daily rates
    const transportRates = {
      shared: 450 * dynamicTravelers,
      private_cab: 1800,
      suv: 3200
    };
    const transportCost = transportRates[transportMode] * dynamicDays;

    // Food cost per person per day
    const foodPerPersonDay = selectedTierKey === 'budget' ? 450 : selectedTierKey === 'balanced' ? 800 : 1600;
    const foodCost = foodPerPersonDay * dynamicTravelers * dynamicDays;

    // Activities entry and guides
    const activityPerPersonDay = selectedTierKey === 'budget' ? 300 : selectedTierKey === 'balanced' ? 650 : 1400;
    const activityCost = activityPerPersonDay * dynamicTravelers * dynamicDays;

    // Miscellaneous buffer (5% for emergency & tipping)
    const subtotal = stayCost + transportCost + foodCost + activityCost;
    const miscCost = Math.round(subtotal * 0.06);
    const total = subtotal + miscCost;

    return {
      stay: stayCost,
      transport: transportCost,
      food: foodCost,
      activities: activityCost,
      miscellaneous: miscCost,
      total,
      perPerson: Math.round(total / dynamicTravelers)
    };
  }, [dynamicTravelers, dynamicDays, hotelStandard, transportMode, selectedTierKey]);

  return (
    <section id="itinerary-view-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-[#121212] p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-400">
                ACTIVE ITINERARY & ROUTE PLAN
              </span>
              <span className="text-xs text-slate-400 font-medium">Verified by Apna Route AI</span>
            </div>
            <h1 className="mt-2 font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {plan.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              {dynamicDays} Days • {dynamicTravelers} {dynamicTravelers === 1 ? 'Traveler' : 'Travelers'} • {plan.style} • Total Recalculated Target: <strong className="text-emerald-400">₹{recalculatedCost.total.toLocaleString('en-IN')}</strong> (₹{recalculatedCost.perPerson.toLocaleString('en-IN')}/person)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-save-itinerary"
              onClick={() => onSavePlan({ ...plan, selectedTier: selectedTierKey })}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                isSaved
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
              <span>{isSaved ? 'Saved to My Trips ✓' : 'Save Trip'}</span>
            </button>

            <button
              id="btn-share-itinerary"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 border border-slate-800 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              id="btn-start-trip"
              onClick={() => onStartTrip({ ...plan, selectedTier: selectedTierKey })}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/30"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Start Trip (GPS Active)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Multi-tier Plan Cards: BUDGET / BALANCED / PREMIUM */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-['Outfit'] text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Select Travel Plan Tier</span>
          </h3>
          <span className="text-xs text-slate-400">All prices include local transit, permits & taxes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['budget', 'balanced', 'premium'] as const).map((tierKey) => {
            const tier = plan.tiers[tierKey];
            const isSelected = selectedTierKey === tierKey;
            return (
              <div
                key={tierKey}
                id={`tier-card-${tierKey}`}
                onClick={() => setSelectedTierKey(tierKey)}
                className={`cursor-pointer relative rounded-2xl p-5 transition-all flex flex-col justify-between border ${
                  isSelected
                    ? 'border-indigo-500 bg-slate-900/70 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                    : 'border-slate-800/80 bg-[#121212] hover:border-slate-700 hover:bg-slate-900/30'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2.5 right-4 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    ACTIVE TIER
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {tier.name}
                    </span>
                    <span className="text-[11px] font-medium text-indigo-400">{tier.tag}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white">
                      ₹{tier.estimatedCost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500">/ traveler</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed min-h-[38px]">
                    {tier.summary}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Stay:</span>
                      <span className="font-medium text-white">{tier.stayType}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Transit:</span>
                      <span className="font-medium text-white">{tier.transitType}</span>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1 text-[11px] text-slate-400">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTierKey(tierKey);
                  }}
                  className={`mt-5 w-full rounded-xl py-2 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected ? '✓ Current Selection' : 'Select Tier'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DYNAMIC COST BREAKDOWN RECALCULATOR */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#121212] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400">
                <DollarSign className="h-4 w-4" />
              </span>
              <h3 className="font-['Outfit'] text-base sm:text-lg font-bold text-white">
                DYNAMIC COST BREAKDOWN & BUDGET RECALCULATOR
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Adjust traveler counts, duration, hotel tier and transit mode in real time to recompute transparent itemized expenses.
            </p>
          </div>

          <span className="rounded-lg bg-emerald-950/70 border border-emerald-800/50 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
            0% Markup Verified
          </span>
        </div>

        {/* Dynamic Controls Strip */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
          {/* Travelers Counter */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between mb-1.5">
              <span>Travelers</span>
              <span className="text-white font-bold">{dynamicTravelers} Pax</span>
            </label>
            <div className="flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 p-1">
              {[1, 2, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDynamicTravelers(n)}
                  className={`flex-1 rounded py-1 text-xs font-semibold transition ${
                    dynamicTravelers === n ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Days */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between mb-1.5">
              <span>Duration</span>
              <span className="text-white font-bold">{dynamicDays} Days</span>
            </label>
            <div className="flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 p-1">
              {[2, 3, 5, 7, 10].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDynamicDays(d)}
                  className={`flex-1 rounded py-1 text-xs font-semibold transition ${
                    dynamicDays === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Hotel Standard */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5 block">
              Hotel Standard
            </label>
            <select
              value={hotelStandard}
              onChange={(e) => setHotelStandard(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="budget">Budget Homestay (₹1,200/n)</option>
              <option value="comfort">Comfort 3-Star (₹2,800/n)</option>
              <option value="heritage">Heritage Haveli / Resort (₹6,500/n)</option>
            </select>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5 block">
              Transit Preference
            </label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="shared">Shared Auto & Bus Depots</option>
              <option value="private_cab">Dedicated Sedan / Auto Cab</option>
              <option value="suv">Private Innova / 4x4 SUV</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Hotel & Stays', cost: recalculatedCost.stay, icon: BedDouble, color: 'bg-blue-500', barColor: 'bg-blue-500' },
            { label: 'Local Transit', cost: recalculatedCost.transport, icon: Car, color: 'bg-indigo-500', barColor: 'bg-indigo-500' },
            { label: 'Food & Dining', cost: recalculatedCost.food, icon: UtensilsCrossed, color: 'bg-amber-500', barColor: 'bg-amber-500' },
            { label: 'Activities & Entry', cost: recalculatedCost.activities, icon: Activity, color: 'bg-violet-500', barColor: 'bg-violet-500' },
            { label: 'Misc & Buffer', cost: recalculatedCost.miscellaneous, icon: ShieldAlert, color: 'bg-slate-500', barColor: 'bg-slate-500' }
          ].map((item) => {
            const pct = Math.round((item.cost / recalculatedCost.total) * 100);
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl border border-slate-800/80 bg-slate-950 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Icon className="h-3 w-3 text-slate-500" />
                      <span>{item.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{pct}%</span>
                  </div>
                  <div className="font-['Outfit'] text-lg font-bold text-white mt-1">
                    ₹{item.cost.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${item.barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between rounded-xl bg-slate-950 border border-slate-800/80 p-4 gap-3">
          <div>
            <span className="text-xs text-slate-400">
              Total Budget for <strong className="text-white">{dynamicTravelers} Travelers</strong> over <strong className="text-white">{dynamicDays} Days</strong>
            </span>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              Average: ₹{recalculatedCost.perPerson.toLocaleString('en-IN')} per traveler
            </div>
          </div>
          <div className="text-right">
            <span className="font-['Outfit'] text-2xl font-bold text-white">
              ₹{recalculatedCost.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Timing Conflict Checker & Route Safety Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Timing Conflict Checker */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#121212] p-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-['Outfit'] text-xs font-bold text-amber-400 uppercase tracking-wider">
                  TIMING CONFLICT CHECKER
                </h3>
                <span className="text-[11px] text-slate-400">
                  Intelligent transit delay & schedule synchronization
                </span>
              </div>
            </div>
            <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              {plan.timingConflicts.length} Potential Alert
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {plan.timingConflicts.map((conflict, i) => (
              <div
                key={i}
                className="rounded-xl border border-amber-500/20 bg-amber-950/15 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">{conflict.timeSlot}</span>
                  <span className="rounded bg-amber-950 border border-amber-800/40 px-1.5 py-0.2 text-[10px] text-amber-400 uppercase font-semibold">
                    {conflict.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{conflict.conflictDescription}</p>
                <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  💡 <strong>Smart AI Recommendation:</strong> {conflict.suggestedAdjustment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Route Safety & Weather */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#121212] p-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-['Outfit'] text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  ROUTE SAFETY & CONDITIONS
                </h3>
                <span className="text-[11px] text-slate-400">
                  Real-time surface terrain, elevation & climate
                </span>
              </div>
            </div>
            <span className="rounded bg-emerald-950 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              {plan.routeSafety.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-[10px] text-slate-500 uppercase block">Travel Distance</span>
              <span className="font-bold text-white text-sm">{plan.routeSafety.distance}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Est. {plan.routeSafety.travelTime}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-[10px] text-slate-500 uppercase block">Road Condition</span>
              <span className="font-bold text-white text-sm truncate block">{plan.routeSafety.roadCondition}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{plan.routeSafety.terrain}</span>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
            <span className="text-indigo-400 font-semibold block mb-1">Local Route Advisory:</span>
            {plan.routeSafety.advisory}
          </div>
        </div>
      </div>

      {/* 5. Day-by-Day Interactive Stops Waypoints (Links to Map Radar) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121212] p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="font-['Outfit'] text-base sm:text-lg font-bold text-white">
              DAY-BY-DAY ITINERARY STOPS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any stop to automatically pan, zoom and inspect verified tariffs on the Hyper-Local Map Radar.
            </p>
          </div>

          {/* Day Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {plan.dailyItinerary.map((day) => (
              <button
                key={day.dayNumber}
                id={`btn-itinerary-day-${day.dayNumber}`}
                onClick={() => setActiveDay(day.dayNumber)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
                  activeDay === day.dayNumber
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Active Day Waypoint Content */}
        {activeDayData && (
          <div className="mt-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 mb-5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {activeDayData.dayTitle}
              </span>
              <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                {activeDayData.highlight}
              </span>
            </div>

            <div className="space-y-3.5">
              {activeDayData.activities.map((act, index) => {
                const isSelected = highlightedStop === act.place;
                return (
                  <div
                    key={act.id || index}
                    id={`itinerary-activity-${index}`}
                    onClick={() => handleStopClick(act.place)}
                    className={`cursor-pointer relative rounded-xl border p-4 transition-all group ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                        : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-400">
                              {act.time}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] font-medium text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {act.category}
                            </span>
                            {isSelected && (
                              <span className="rounded bg-indigo-900 px-2 py-0.2 text-[10px] font-bold text-white animate-pulse">
                                VIEWING ON MAP
                              </span>
                            )}
                          </div>
                          <h4 className="mt-1 font-['Outfit'] text-base font-semibold text-white group-hover:text-indigo-300 transition">
                            {act.place}
                          </h4>
                          <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-2xl">
                            {act.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-500 block">Estimated Tariff</span>
                          <span className="text-xs font-semibold text-slate-200">{act.approxEntry}</span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-500 block">Distance</span>
                          <span className="text-xs font-semibold text-slate-400">{act.distance}</span>
                        </div>
                      </div>
                    </div>

                    {/* Safety note & map navigation */}
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-800/60 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>{act.safetyNote}</span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:underline">
                        <span>Pan to Stop on Radar</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 6. Smart Weather & Climate Packing Checklist */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#121212] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <Luggage className="h-4 w-4 text-indigo-400" />
          <h3 className="font-['Outfit'] text-base font-bold text-white">
            Smart Seasonal Packing Checklist ({plan.destination})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {plan.smartPacking.map((item, idx) => {
            const isChecked = !!checkedPackingItems[idx];
            return (
              <div
                key={idx}
                onClick={() => handleTogglePacking(idx)}
                className={`cursor-pointer flex items-center gap-2.5 rounded-xl border p-3 transition text-xs ${
                  isChecked
                    ? 'border-emerald-700/60 bg-emerald-950/20 text-slate-400 line-through'
                    : 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-600 text-white'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
