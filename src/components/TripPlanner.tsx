import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Compass,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { TravelStyle, GeneratedItinerary } from '../types.ts';
import { generateTripPlan } from '../services/api.ts';

interface TripPlannerProps {
  onPlanGenerated: (plan: GeneratedItinerary) => void;
  prefillDestination?: string;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  onPlanGenerated,
  prefillDestination
}) => {
  const [from, setFrom] = useState('New Delhi');
  const [destination, setDestination] = useState(prefillDestination || 'Jaipur');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetType, setBudgetType] = useState<'10k' | '25k' | '50k' | 'custom'>('10k');
  const [customBudget, setCustomBudget] = useState(15000);
  const [travelers, setTravelers] = useState(1);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('Heritage');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Update if prefill changes
  React.useEffect(() => {
    if (prefillDestination) {
      setDestination(prefillDestination);
    }
  }, [prefillDestination]);

  const travelStyles: { name: TravelStyle; label: string }[] = [
    { name: 'Heritage', label: 'Heritage' },
    { name: 'Adventure', label: 'Adventure' },
    { name: 'Nature', label: 'Nature' },
    { name: 'Food', label: 'Food & Cuisine' },
    { name: 'Budget', label: 'Budget' },
    { name: 'Luxury', label: 'Luxury' },
    { name: 'Family', label: 'Family' },
    { name: 'Spiritual', label: 'Spiritual' },
    { name: 'Backpacking', label: 'Backpacking' }
  ];

  const getEffectiveBudget = () => {
    if (budgetType === '10k') return 10000;
    if (budgetType === '25k') return 25000;
    if (budgetType === '50k') return 50000;
    return customBudget;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const steps = [
      'Analyzing seasonal weather, road conditions & high-altitude passes...',
      'Checking timing conflicts (sleeper train arrival vs hotel check-in)...',
      'Synthesizing verified prepaid local transit and zero-commission bazaars...',
      'Computing multi-tier budget models and safety risk score...'
    ];

    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 700);

    try {
      const budget = getEffectiveBudget();
      const plan = await generateTripPlan({
        from,
        destination,
        startDate,
        durationDays,
        budget,
        travelers,
        style: travelStyle
      });
      clearInterval(interval);
      onPlanGenerated(plan);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      alert('Unable to generate plan right now. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <section id="trip-planner-section" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative rounded-xl border border-slate-800/80 bg-[#121212] p-5 sm:p-7 shadow-2xl">
        {/* Subtle top atmospheric glow */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-tr-xl bg-indigo-900/10 blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h2 className="font-['Outfit'] text-xl sm:text-2xl font-bold text-white tracking-tight">
                Smart Transit & Itinerary Generator
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              AI-optimized routes with timing conflict detection, route risk score & hyper-local tariffs.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-[11px] font-medium text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
            <span>0% Scam • Verified Tariffs</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="mt-6 space-y-5">
          {/* Row 1: Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                From (Origin City)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                <input
                  type="text"
                  id="input-from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="e.g., New Delhi, Mumbai, Bengaluru"
                  required
                  className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Destination in India
              </label>
              <div className="relative">
                <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                <input
                  type="text"
                  id="input-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Jaipur, Manali, Spiti, Munnar, Goa, Leh"
                  required
                  className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Dates & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="date"
                  id="input-start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Trip Duration: <span className="text-indigo-400 font-bold">{durationDays} Days</span>
              </label>
              <div className="flex items-center gap-2 pt-0.5">
                {[3, 4, 5, 7].map((days) => (
                  <button
                    type="button"
                    key={days}
                    id={`btn-duration-${days}`}
                    onClick={() => setDurationDays(days)}
                    className={`flex-1 rounded-md py-2 text-xs font-medium transition ${
                      durationDays === days
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                        : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Budget Selector & Travelers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Budget Selector
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '10k', label: '₹10K' },
                  { id: '25k', label: '₹25K' },
                  { id: '50k', label: '₹50K' },
                  { id: 'custom', label: 'Custom' }
                ].map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    id={`btn-budget-${b.id}`}
                    onClick={() => setBudgetType(b.id as any)}
                    className={`rounded-md py-2 text-xs font-medium transition ${
                      budgetType === b.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                        : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              {budgetType === 'custom' && (
                <div className="mt-2.5">
                  <input
                    type="number"
                    min={3000}
                    max={300000}
                    step={1000}
                    value={customBudget}
                    onChange={(e) => setCustomBudget(Number(e.target.value))}
                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter custom budget in INR"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Number of Travelers
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    type="button"
                    key={num}
                    id={`btn-travelers-${num}`}
                    onClick={() => setTravelers(num)}
                    className={`rounded-md py-2 text-xs font-medium transition ${
                      travelers === num
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                        : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {num === 6 ? '6+' : num} {num === 1 ? 'Solo' : 'Pax'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Travel Styles */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Travel Style / Archetype
            </label>
            <div className="flex flex-wrap gap-2">
              {travelStyles.map((style) => {
                const isSelected = travelStyle === style.name;
                return (
                  <button
                    type="button"
                    key={style.name}
                    id={`btn-style-${style.name.toLowerCase()}`}
                    onClick={() => setTravelStyle(style.name)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? 'border border-indigo-500/80 bg-indigo-950/50 text-indigo-300 shadow-sm'
                        : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-indigo-400" />}
                    <span>{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-generate-plan"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-medium text-white transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Generating Intelligent Route...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-white" />
                  <span>Generate Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Loading status notification box */}
          {loading && (
            <div className="rounded-md border border-slate-800 bg-slate-900/80 p-4 text-center">
              <p className="text-xs font-medium text-indigo-300">
                AI is analyzing routes, season, weather, safety and local experiences...
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{loadingStep}</p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};
