import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CloudSun,
  ShieldCheck,
  Users,
  ArrowRight,
  Thermometer,
  Droplets,
  Sparkles,
  Compass,
  AlertTriangle,
  Zap,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Destination, GeneratedItinerary, TravelStyle } from '../types.ts';
import { fetchSeasons, generateTripPlan } from '../services/api.ts';

interface SeasonalIntelligenceProps {
  destinations: Destination[];
  onSelectDestination: (destination: Destination) => void;
  onPlanDestination: (destName: string) => void;
  onPlanGenerated?: (plan: GeneratedItinerary) => void;
}

export const SeasonalIntelligence: React.FC<SeasonalIntelligenceProps> = ({
  destinations,
  onSelectDestination,
  onPlanDestination,
  onPlanGenerated
}) => {
  const [activeSeason, setActiveSeason] = useState<'Winter' | 'Summer' | 'Monsoon' | 'Autumn'>('Winter');
  const [seasonalData, setSeasonalData] = useState<any>(null);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);

  // Seasonal AI Planner form states
  const [planDestination, setPlanDestination] = useState('Jaipur');
  const [planDates, setPlanDates] = useState('Dec 15 – Dec 19');
  const [planBudget, setPlanBudget] = useState(15000);
  const [planTravelers, setPlanTravelers] = useState(2);
  const [planInterests, setPlanInterests] = useState<string[]>(['Heritage', 'Local Food']);
  const [planStyle, setPlanStyle] = useState<TravelStyle>('Balanced');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [seasonalGeneratedPlan, setSeasonalGeneratedPlan] = useState<GeneratedItinerary | null>(null);

  const seasonsList: Array<'Winter' | 'Summer' | 'Monsoon' | 'Autumn'> = [
    'Winter',
    'Summer',
    'Monsoon',
    'Autumn'
  ];

  useEffect(() => {
    setIsLoadingSeason(true);
    fetchSeasons(activeSeason).then((data) => {
      setSeasonalData(data[activeSeason] || null);
      setIsLoadingSeason(false);
    });

    // Preset suggested destination based on season
    if (activeSeason === 'Winter') {
      setPlanDestination('Jaipur');
      setPlanDates('Dec 18 – Dec 22');
    } else if (activeSeason === 'Summer') {
      setPlanDestination('Manali');
      setPlanDates('May 10 – May 15');
    } else if (activeSeason === 'Monsoon') {
      setPlanDestination('Meghalaya');
      setPlanDates('Jul 14 – Jul 19');
    } else if (activeSeason === 'Autumn') {
      setPlanDestination('Kashmir');
      setPlanDates('Oct 20 – Oct 25');
    }
  }, [activeSeason]);

  const interestOptions = [
    'Heritage',
    'Snow & Skiing',
    'Trekking',
    'Local Food',
    'Photography',
    'Beaches',
    'Waterfalls',
    'Spiritual & Yoga'
  ];

  const toggleInterest = (interest: string) => {
    if (planInterests.includes(interest)) {
      setPlanInterests(planInterests.filter((i) => i !== interest));
    } else {
      setPlanInterests([...planInterests, interest]);
    }
  };

  const handleGenerateSeasonalItinerary = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await generateTripPlan({
        from: 'Delhi',
        destination: planDestination,
        startDate: planDates,
        durationDays: 4,
        budget: planBudget,
        travelers: planTravelers,
        style: planStyle
      });
      setSeasonalGeneratedPlan(plan);
      if (onPlanGenerated) {
        onPlanGenerated(plan);
      }
    } catch (err) {
      console.error('Failed to generate seasonal plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <section id="seasonal-intelligence-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
              <Calendar className="h-4 w-4" />
            </span>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              SEASON-WISE TRAVEL PLANNING
            </h2>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-2xl">
            AI-generated destination recommendations, climate indices & personalized itineraries for Winter, Summer, Monsoon & Autumn.
          </p>
        </div>

        {/* 4 Season Tabs */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 p-1.5">
          {seasonsList.map((season) => (
            <button
              key={season}
              id={`btn-season-${season.toLowerCase()}`}
              onClick={() => setActiveSeason(season)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeSeason === season
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {/* Season Intelligence Banner */}
      {seasonalData && (
        <div className="mt-6 rounded-2xl border border-slate-800/80 bg-[#121212] p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-950 border border-indigo-800/50 px-2.5 py-1 text-xs font-bold text-indigo-300">
                  {seasonalData.season} Season ({seasonalData.months})
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Avg Range: {seasonalData.temperatureRange}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-2 font-normal max-w-3xl">
                {seasonalData.description}
              </p>
              <p className="text-xs text-indigo-300/90 mt-1">
                <strong>Climate Highlights:</strong> {seasonalData.climateHighlights}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 rounded-xl bg-slate-950 border border-slate-800 p-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Safety Grid</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Optimal Season
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Curated Picks</span>
                <span className="text-xs font-bold text-white mt-0.5 block">
                  {seasonalData.recommendedDestinations?.length || 4} Destinations
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Destinations Grid for Current Season */}
      {seasonalData?.recommendedDestinations && (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {seasonalData.recommendedDestinations.map((dest: any) => (
            <div
              key={dest.id}
              className="group rounded-2xl border border-slate-800/80 bg-[#121212] overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />

                <div className="absolute top-3 left-3">
                  <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    {activeSeason} Top Pick
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3 className="font-['Outfit'] text-lg font-bold text-white leading-tight">
                    {dest.name}
                  </h3>
                  <span className="text-[11px] text-slate-300">{dest.state}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {dest.whyVisit}
                </p>

                <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-2.5 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Starting Budget:</span>
                    <span className="font-bold text-slate-200">₹{dest.startingBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[10px] text-amber-400 flex items-start gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{dest.safetyAdvisory}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlanDestination(dest.name);
                      const el = document.getElementById('seasonal-planner-box');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-white py-2 text-xs font-medium transition text-center"
                  >
                    Select for AI Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => onPlanDestination(dest.name)}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 text-xs font-semibold transition"
                    title="Launch Full Trip Planner"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dedicated Season AI Travel Planner Widget */}
      <div id="seasonal-planner-box" className="mt-10 rounded-2xl border border-indigo-900/40 bg-gradient-to-b from-[#14141c] to-[#0f0f14] p-5 sm:p-7 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-900/40">
            <Sparkles className="h-4 w-4" />
          </span>
          <h3 className="font-['Outfit'] text-xl sm:text-2xl font-bold text-white">
            Personalized {activeSeason} AI Itinerary Generator
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mb-6">
          Generate an intelligent, weather-resilient itinerary tailored for {activeSeason} conditions with exact timing conflict avoidance, local gear requirements, and anti-scam budget allocations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Destination */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1.5">
              Destination
            </label>
            <input
              type="text"
              value={planDestination}
              onChange={(e) => setPlanDestination(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Jaipur, Manali, Goa..."
            />
          </div>

          {/* Travel Dates */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1.5">
              Travel Dates
            </label>
            <input
              type="text"
              value={planDates}
              onChange={(e) => setPlanDates(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Dec 18 – Dec 22"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1.5">
              Budget (₹{planBudget.toLocaleString('en-IN')})
            </label>
            <input
              type="range"
              min={5000}
              max={60000}
              step={1000}
              value={planBudget}
              onChange={(e) => setPlanBudget(Number(e.target.value))}
              className="w-full accent-indigo-500 mt-2"
            />
          </div>

          {/* Travelers */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1.5">
              Travelers ({planTravelers})
            </label>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 border border-slate-800 p-1">
              {[1, 2, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPlanTravelers(num)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    planTravelers === num
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {num === 6 ? '6+' : num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-2">
            Interests & Experiences
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => {
              const isSelected = planInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Includes timing conflict alerts, verified prepaid auto fares & safety guidelines</span>
          </div>

          <button
            type="button"
            id="btn-generate-seasonal-ai-plan"
            onClick={handleGenerateSeasonalItinerary}
            disabled={isGeneratingPlan}
            className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
            <span>{isGeneratingPlan ? `Generating ${activeSeason} Plan...` : `Generate ${activeSeason} Itinerary`}</span>
          </button>
        </div>

        {/* Display Generated Plan Card if ready */}
        {seasonalGeneratedPlan && (
          <div className="mt-6 rounded-xl border border-emerald-800/60 bg-slate-950 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  AI SEASONAL PLAN READY
                </span>
                <h4 className="font-['Outfit'] text-lg font-bold text-white mt-1">
                  {seasonalGeneratedPlan.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {seasonalGeneratedPlan.from} → <strong className="text-indigo-400">{seasonalGeneratedPlan.destination}</strong> • {seasonalGeneratedPlan.durationDays} Days • {seasonalGeneratedPlan.travelersCount} Travelers
                </p>
              </div>

              <button
                onClick={() => {
                  if (onPlanGenerated) onPlanGenerated(seasonalGeneratedPlan);
                  const el = document.getElementById('itinerary-view-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-semibold transition shadow-md shadow-indigo-900/20 whitespace-nowrap"
              >
                View Full Itinerary Breakdown ↓
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Balanced Budget</span>
                <span className="font-bold text-white text-sm">₹{seasonalGeneratedPlan.tiers.balanced.estimatedCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Safety Score</span>
                <span className="font-bold text-emerald-400 text-sm">{seasonalGeneratedPlan.safetyScore}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Total Stops</span>
                <span className="font-bold text-indigo-300 text-sm">
                  {seasonalGeneratedPlan.days.reduce((acc, d) => acc + d.stops.length, 0)} Verified Stops
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Timing Conflicts</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {seasonalGeneratedPlan.timingConflictAlerts?.length || 0} Flagged & Resolved
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
