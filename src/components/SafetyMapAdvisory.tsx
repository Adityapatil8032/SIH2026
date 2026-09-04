import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Layers,
  FileText,
  Phone,
  Eye,
  CheckCircle2,
  HelpCircle,
  Navigation
} from 'lucide-react';
import { StateAdvisory } from '../types.ts';
import { fetchStateAdvisories } from '../services/api.ts';

export const SafetyMapAdvisory: React.FC = () => {
  const [advisories, setAdvisories] = useState<StateAdvisory[]>([]);
  const [selectedState, setSelectedState] = useState<StateAdvisory | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'safe_corridors' | 'hazards' | 'rest_stops'>('all');

  React.useEffect(() => {
    fetchStateAdvisories().then((data) => {
      setAdvisories(data);
      if (data.length > 0) {
        setSelectedState(data[0]);
      }
    });
  }, []);

  const routeSegments = [
    { name: 'Delhi – Jaipur (NH-48 Expressway)', status: 'SAFE', color: 'text-emerald-400', risk: 'Low', speed: '90 km/h avg' },
    { name: 'Chandigarh – Manali (NH-21)', status: 'SAFE WITH ADVISORY', color: 'text-amber-400', risk: 'Monitored Ghat Curves', speed: '45 km/h avg' },
    { name: 'Srinagar – Leh (NH-1D Zoji La)', status: 'CAUTION', color: 'text-amber-400', risk: 'High Altitude Pass / 1-Way Timings', speed: '25 km/h avg' },
    { name: 'Mumbai – Goa (NH-66)', status: 'SAFE', color: 'text-emerald-400', risk: 'Scenic 4-lane stretch complete', speed: '75 km/h avg' }
  ];

  return (
    <section id="safety-map-advisory-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              INTERACTIVE SAFETY MAP & STATE ADVISORIES
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Live hazard telemetry, Inner Line Permit (ILP) guidance & state-by-state road status.
          </p>
        </div>

        {/* Map Layers Filter */}
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 border border-slate-800 p-1">
          <button
            onClick={() => setActiveLayer('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeLayer === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Grid Data
          </button>
          <button
            onClick={() => setActiveLayer('safe_corridors')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeLayer === 'safe_corridors'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Safe Corridors
          </button>
          <button
            onClick={() => setActiveLayer('hazards')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeLayer === 'hazards'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Hazards
          </button>
        </div>
      </div>

      {/* Grid: Safety Corridor Visualizer + State Selector */}
      <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Map Stage */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800/80 bg-[#121212] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Navigation className="h-4 w-4" />
                <span>Monitored Highway Corridors</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">LIVE FEED ACTIVE</span>
            </div>

            <div className="space-y-3">
              {routeSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <h4 className="font-semibold text-xs sm:text-sm text-white">{seg.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{seg.risk}</p>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1">
                    <span className={`text-xs font-semibold ${seg.color}`}>{seg.status}</span>
                    <span className="text-[10px] text-slate-500">{seg.speed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>NHAI Highway Incident SOS Hotline: <strong className="text-white">1033</strong></span>
            </span>
            <span className="text-indigo-400 font-mono">100% Monitored</span>
          </div>
        </div>

        {/* Right: State Advisory Inspector */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800/80 bg-[#121212] p-6 flex flex-col justify-between">
          {selectedState ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
                    State Advisory Profile
                  </span>
                  <h3 className="font-['Outfit'] text-xl sm:text-2xl font-bold text-white">
                    {selectedState.state}
                  </h3>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${
                    selectedState.advisoryLevel === 'Green'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {selectedState.advisoryLevel} ADVISORY
                </span>
              </div>

              {/* State Permit Requirements */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs">
                <span className="text-[10px] uppercase text-slate-500 font-medium block mb-1">
                  Permit Requirements (ILP / Protected Area)
                </span>
                <p className="font-medium text-slate-200">{selectedState.permitsRequired}</p>
              </div>

              {/* Road Condition & Weather */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase text-slate-500 block">Road Condition</span>
                  <span className="font-semibold text-emerald-400 block mt-0.5">
                    {selectedState.roadConditionRating}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] uppercase text-slate-500 block">Season Advisory</span>
                  <span className="font-medium text-slate-200 block mt-0.5 truncate">
                    {selectedState.seasonalAdvisory}
                  </span>
                </div>
              </div>

              {/* Cultural Sensitivity */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300">
                <span className="font-semibold text-indigo-400 block mb-1">
                  Cultural Norms & Protocol:
                </span>
                {selectedState.culturalNorms}
              </div>

              {/* Emergency Contacts */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400">State Helpline:</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {selectedState.emergencyNumbers.touristPolice}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">Loading State Profiles...</div>
          )}

          {/* State Selector Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-2">
              Select State to Inspect:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {advisories.map((st) => (
                <button
                  key={st.stateCode}
                  onClick={() => setSelectedState(st)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    selectedState?.stateCode === st.stateCode
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                      : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {st.state}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

