import React, { useState } from 'react';
import {
  Car,
  ShieldCheck,
  Star,
  Clock,
  Navigation,
  CheckCircle2,
  Bike,
  Bus,
  Zap,
  PhoneCall
} from 'lucide-react';
import { VerifiedDriver } from '../types.ts';

interface VerifiedTransportProps {
  drivers: VerifiedDriver[];
  currentLocationName?: string;
}

export const VerifiedTransport: React.FC<VerifiedTransportProps> = ({
  drivers,
  currentLocationName = 'Jaipur Walled City'
}) => {
  const [requestedDriver, setRequestedDriver] = useState<string | null>(null);

  const rideModes = [
    { name: 'Auto Rickshaw', status: 'Available', eta: '3 mins', price: '₹40 base + ₹12/km', icon: '🛺' },
    { name: 'AC Sedan / Cab', status: 'Available', eta: '5 mins', price: '₹14/km fixed', icon: '🚕' },
    { name: 'Mountain 4×4', status: 'Available', eta: '15 mins', price: '₹2,200 / day', icon: '🚙' },
    { name: 'Bike Rental', status: 'Available', eta: 'Instant', price: '₹600 / day', icon: '🏍️' },
    { name: 'Electric City Bus', status: 'On Schedule', eta: '8 mins', price: '₹15 – ₹35', icon: '🚌' }
  ];

  const handleBook = (driverId: string) => {
    setRequestedDriver(driverId);
    setTimeout(() => {
      alert('Local driver dispatch requested! Verified contact & OTP issued directly to driver console.');
      setRequestedDriver(null);
    }, 1200);
  };

  return (
    <section id="verified-transport-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
              <Car className="h-4 w-4" />
            </span>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Verified Local Transport & Ride Radar
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Official union tariffs, background-checked mountain drivers, and zero-scam prepaid quotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-medium text-indigo-300">
            Scam-Free Local Tariff Guarantee
          </span>
        </div>
      </div>

      {/* Ride Availability Radar Quick Bar */}
      <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <h3 className="font-['Outfit'] text-xs font-bold text-white uppercase tracking-wider">
              LOCAL RIDE RADAR • {currentLocationName.toUpperCase()}
            </h3>
          </div>
          <span className="text-xs text-slate-500">All local modes monitored</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {rideModes.map((mode, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center hover:border-slate-700 transition"
            >
              <span className="text-2xl block mb-1">{mode.icon}</span>
              <span className="font-medium text-xs text-white block">{mode.name}</span>
              <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                <span>{mode.status}</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">ETA: {mode.eta}</span>
              <span className="text-[10px] font-mono text-indigo-300 block mt-1">{mode.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drivers List */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {drivers.map((drv) => (
          <div
            key={drv.id}
            id={`driver-card-${drv.id}`}
            className="rounded-xl border border-slate-800/80 bg-[#121212] p-5 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                  VERIFIED FARE
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{drv.rating}</span>
                </span>
              </div>

              <h4 className="mt-3 font-['Outfit'] text-base font-semibold text-white">
                {drv.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{drv.vehicleType}</p>
              <p className="text-[11px] text-slate-500 mt-1">{drv.unionBadge}</p>

              <div className="mt-4 rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">Tariff:</span>
                  <span className="font-semibold text-indigo-400">{drv.estimatedFare}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">Distance:</span>
                  <span className="font-medium text-slate-200">{drv.distance}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-medium text-emerald-400">{drv.availability}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                id={`btn-request-driver-${drv.id}`}
                onClick={() => handleBook(drv.id)}
                disabled={requestedDriver === drv.id}
                className="w-full rounded-md bg-indigo-600 py-2.5 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20 disabled:opacity-50"
              >
                {requestedDriver === drv.id ? 'Connecting to Driver...' : 'Request Ride / Quote'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
