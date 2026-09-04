import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Navigation,
  ShieldCheck,
  Radio,
  MapPin,
  Clock,
  Gauge,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Check
} from 'lucide-react';
import { GeneratedItinerary } from '../types.ts';

interface LiveTripMonitorProps {
  activeTrip?: GeneratedItinerary | null;
  onOpenSOS: () => void;
}

export const LiveTripMonitor: React.FC<LiveTripMonitorProps> = ({
  activeTrip,
  onOpenSOS
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [progressPercent, setProgressPercent] = useState(24);
  const [currentSpeed, setCurrentSpeed] = useState(62);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(212);
  const [etaMinutes, setEtaMinutes] = useState(205);
  const [gpsSignal, setGpsSignal] = useState<'STRONG' | 'MODERATE' | 'WEAK'>('STRONG');

  const tripTitle = activeTrip ? activeTrip.title : 'NEW DELHI → JAIPUR';
  const destination = activeTrip ? activeTrip.destination : 'Jaipur';

  useEffect(() => {
    let interval: any;
    if (isTracking) {
      interval = setInterval(() => {
        setProgressPercent((p) => {
          if (p >= 100) {
            setIsTracking(false);
            return 100;
          }
          return p + 1;
        });
        setDistanceRemainingKm((d) => Math.max(d - 1.5, 0));
        setEtaMinutes((m) => Math.max(m - 1, 0));
        setCurrentSpeed(Math.floor(58 + Math.random() * 12));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const stages = [
    { label: 'Start Trip', done: true },
    { label: 'GPS Tracking', done: isTracking },
    { label: 'Corridor Monitor', done: isTracking },
    { label: 'Safety Grid', done: isTracking },
    { label: 'Destination Reached', done: progressPercent >= 100 }
  ];

  return (
    <section id="live-trip-monitor-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-xl border border-slate-800/80 bg-[#121212] p-6 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
                <Radio className="h-4 w-4" />
              </span>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
                LIVE TRIP MONITOR
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Corridor telemetry, speed monitoring, continuous timing conflict alerts & GPS heartbeat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition shadow-md ${
                isTracking
                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20'
              }`}
            >
              {isTracking ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause Monitor</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Trip Monitoring</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/25 transition shadow-sm animate-pulse"
            >
              <span>EMERGENCY SOS</span>
            </button>
          </div>
        </div>

        {/* Trip Stage Stepper */}
        <div className="mt-6">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 text-xs font-medium">
            {stages.map((stg, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                    stg.done
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}
                >
                  {stg.done ? <Check className="h-3 w-3 stroke-[3]" /> : i + 1}
                </div>
                <span className={stg.done ? 'text-indigo-300' : 'text-slate-500'}>
                  {stg.label}
                </span>
                {i < stages.length - 1 && <span className="text-slate-700 ml-2">→</span>}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-900 border border-slate-800/80 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Real-time Telemetry Dashboard Cards */}
        <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-lg border border-slate-800/80 bg-slate-950 p-4 text-center">
            <span className="text-[10px] uppercase text-slate-500 block font-medium">
              Current Location
            </span>
            <span className="font-['Outfit'] text-sm sm:text-base font-semibold text-white block mt-1 truncate">
              NH-48 Corridor (Kotputli)
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">27.7088° N, 76.1983° E</span>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950 p-4 text-center">
            <span className="text-[10px] uppercase text-slate-500 block font-medium">
              Distance to {destination}
            </span>
            <span className="font-['Outfit'] text-2xl font-bold text-indigo-400 block mt-1">
              {Math.round(distanceRemainingKm)} km
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              ETA: {Math.floor(etaMinutes / 60)}h {etaMinutes % 60}m
            </span>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950 p-4 text-center">
            <span className="text-[10px] uppercase text-slate-500 block font-medium">
              Cruising Speed
            </span>
            <span className="font-['Outfit'] text-2xl font-bold text-white block mt-1">
              {isTracking ? currentSpeed : 0} <span className="text-xs text-slate-500 font-normal">km/h</span>
            </span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">Speed Limit: 90 km/h</span>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950 p-4 text-center">
            <span className="text-[10px] uppercase text-slate-500 block font-medium">
              Safety Corridor Status
            </span>
            <span className="font-['Outfit'] text-sm sm:text-base font-bold text-emerald-400 block mt-1">
              SAFE ✓ (Green Line)
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              GPS Signal: <span className="text-slate-300 font-medium">{gpsSignal}</span>
            </span>
          </div>
        </div>

        {/* Live Safety Monitoring Status Banner */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div>
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                {isTracking ? 'Trip Monitoring Active' : 'Trip Monitor Ready'}
              </span>
              <p className="text-xs text-slate-400">
                Continuous satellite & cellular telemetry. All police check-posts and NHAI patrol units mapped along your route.
              </p>
            </div>
          </div>

          <div className="text-xs text-indigo-400 font-mono font-medium self-start sm:self-auto">
            Grid ID: APNA-CORRIDOR-8492
          </div>
        </div>
      </div>
    </section>
  );
};
