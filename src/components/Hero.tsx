import React from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Compass,
  Flame,
  ArrowRight,
  Zap,
  CloudSun,
  Navigation,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onConciergeClick: () => void;
  onSelectTrending: (destination: string) => void;
  onScrollToPlanner: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onConciergeClick,
  onSelectTrending,
  onScrollToPlanner
}) => {
  const trendingTags = [
    { name: 'Sikkim Valley', tag: 'High Altitude' },
    { name: 'Munnar', tag: 'Tea Trails' },
    { name: 'Manali', tag: 'Snow Passes' },
    { name: 'Goa', tag: 'Coastal Escape' },
    { name: 'Jaipur', tag: 'Heritage' }
  ];

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20">
      {/* Subtle atmospheric glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[750px] -translate-x-1/2 rounded-full bg-indigo-900/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 -z-10 h-[300px] w-[500px] -translate-y-1/2 rounded-full bg-cyan-900/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Live Grid Status Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          </span>
          <span className="text-slate-300">India's Next-Gen Tourism & Safety Grid</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-emerald-400 font-medium">LIVE PLATFORM</span>
        </div>

        {/* Main Heading & Tagline */}
        <div className="mt-6 space-y-3">
          <h1 className="font-['Outfit'] text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl leading-none">
            ApnaRoute
          </h1>
          <p className="font-['Outfit'] text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-slate-300">
            Your journey, Your route
          </p>
        </div>

        {/* Supporting Value Proposition */}
        <p className="mx-auto mt-5 max-w-3xl text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
          Eliminate travel uncertainty across India. Get personalized day-by-day itineraries,
          verified local services, intelligent route planning, real-time safety information and instant
          emergency assistance in one platform.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            id="hero-explore-btn"
            onClick={onExploreClick}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/25 cursor-pointer"
          >
            <Compass className="h-4 w-4" />
            <span>Explore 500+ Destinations</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            id="hero-concierge-btn"
            onClick={onConciergeClick}
            className="flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-950/40 px-5 py-2.5 text-sm font-medium text-blue-200 hover:bg-blue-900/40 hover:text-white transition-colors cursor-pointer"
          >
            <Bot className="h-4 w-4 text-blue-400" />
            <span>Plan with AI Concierge</span>
          </button>

          <button
            id="hero-smart-planner-shortcut"
            onClick={onScrollToPlanner}
            className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#161822] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Generate Itinerary ↓</span>
          </button>
        </div>

        {/* Core Overview & Feature Cards Directly Below Action Buttons */}
        <div className="mt-10 mx-auto max-w-5xl space-y-6">
          {/* Integrated Quick-Feature 3-Column Grid Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-800/90 bg-[#121622]/80 p-5 shadow-lg hover:border-indigo-500/40 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-800/50 text-indigo-400 group-hover:scale-105 transition-transform">
                  <Navigation className="h-5 w-5" />
                </div>
                <span className="rounded bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-[9px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
                  AI ENGINE
                </span>
              </div>
              <h3 className="font-['Outfit'] text-base font-bold text-white mb-1.5 group-hover:text-indigo-200 transition-colors">
                Smart Route Optimization
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI day-by-day itineraries tailored across 28 Indian states, factoring travel pace, mountain curves, and multi-modal transit links.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center gap-1.5 text-[11px] font-medium text-indigo-400">
                <span>Curated Transit Logistics</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-800/90 bg-[#121622]/80 p-5 shadow-lg hover:border-emerald-500/40 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="rounded bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  24/7 ACTIVE
                </span>
              </div>
              <h3 className="font-['Outfit'] text-base font-bold text-white mb-1.5 group-hover:text-emerald-200 transition-colors">
                Safety & Emergency Grid
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous GPS telemetry monitoring, one-tap SOS integration, live district risk alerts, and direct medical & police responder tie-ins.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span>Instant Emergency Shield</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-800/90 bg-[#121622]/80 p-5 shadow-lg hover:border-cyan-500/40 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="rounded bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  ZERO COMMISSION
                </span>
              </div>
              <h3 className="font-['Outfit'] text-base font-bold text-white mb-1.5 group-hover:text-cyan-200 transition-colors">
                Verified Local Services
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Handpicked background-checked cab drivers, certified ASI heritage guides, local homestays, and fair-trade authentic artisan bazaars.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center gap-1.5 text-[11px] font-medium text-cyan-400">
                <span>Direct Regional Partners</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Seasonal Travel Index Active Banner */}
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#121212] px-4 py-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
                  <CloudSun className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Seasonal Travel Index Active
                    </span>
                    <span className="rounded bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.2 text-[10px] font-mono font-medium text-indigo-300">
                      September - 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    September travel insights active. Curated high-altitude & coastal itineraries ready.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center text-xs font-medium text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] mr-1.5"></span>
                <span>Verified Safe</span>
              </div>
            </div>
          </div>

          {/* Trending Now Section */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium uppercase tracking-wider text-[11px] mr-1">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>Trending Now:</span>
            </div>
            {trendingTags.map((item) => (
              <button
                key={item.name}
                id={`trending-pill-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectTrending(item.name)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-800/80 bg-[#121212] px-3 py-1.5 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer"
              >
                <span className="font-medium text-slate-200">{item.name}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500 text-[11px]">{item.tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
