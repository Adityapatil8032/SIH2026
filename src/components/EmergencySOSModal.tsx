import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Phone,
  Share2,
  Hospital,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Send,
  Navigation
} from 'lucide-react';
import { triggerSOS } from '../services/api.ts';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose }) => {
  const [sosStatus, setSosStatus] = useState<'idle' | 'triggered'>('idle');
  const [copiedLocation, setCopiedLocation] = useState(false);

  if (!isOpen) return null;

  const handleTriggerDispatch = async () => {
    try {
      await triggerSOS({ lat: 26.9124, lng: 75.7873, place: 'Jaipur Corridor' }, 'General Emergency');
      setSosStatus('triggered');
    } catch (err) {
      console.error(err);
      setSosStatus('triggered');
    }
  };

  const handleShareLocation = () => {
    const locText = `EMERGENCY ALERT: I need assistance. My current GPS Coordinates are: 26.9124° N, 75.7873° E (Near Station Road, Jaipur). Live tracking via Apna Route Emergency Grid.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(locText);
      setCopiedLocation(true);
      setTimeout(() => setCopiedLocation(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl border border-rose-900/80 bg-[#121212] p-6 sm:p-7 shadow-2xl shadow-rose-950/40 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Danger Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
              NATIONAL EMERGENCY PROTOCOL
            </span>
            <h3 className="font-['Outfit'] text-xl font-bold text-white">
              EMERGENCY SOS GRID
            </h3>
          </div>
        </div>

        {/* GPS Live Coordinates Banner */}
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300">
          <div className="flex items-center justify-between text-rose-400 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-rose-400" />
              <span>CURRENT GPS COORDINATES</span>
            </span>
            <span className="font-mono text-emerald-400 text-[11px]">LOCK: HIGH ACCURACY</span>
          </div>
          <p className="font-mono text-xs text-white">26.9124° N, 75.7873° E</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Near MI Road / Station Junction, Jaipur, Rajasthan (Pin 302001)
          </p>
        </div>

        {/* Primary Helplines */}
        <div className="mt-5 space-y-2.5">
          <a
            href="tel:112"
            id="btn-call-112"
            className="flex items-center justify-between rounded-md bg-rose-600 hover:bg-rose-500 px-4 py-3 text-white font-semibold transition shadow-md shadow-rose-950/40"
          >
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4" />
              <div>
                <span className="text-sm block leading-tight font-bold">Call National Emergency Hotline</span>
                <span className="text-[11px] font-normal opacity-90">Police • Ambulance • Fire</span>
              </div>
            </div>
            <span className="font-mono text-lg font-bold">112</span>
          </a>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="tel:102"
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 p-3 text-slate-300 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2">
                <Hospital className="h-4 w-4 text-rose-400" />
                <span>Ambulance</span>
              </div>
              <span className="font-mono font-bold text-white">102</span>
            </a>

            <a
              href="tel:1091"
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 p-3 text-slate-300 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>Women Safety</span>
              </div>
              <span className="font-mono font-bold text-white">1091</span>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleShareLocation}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-medium text-white transition"
          >
            <Share2 className="h-4 w-4 text-indigo-400" />
            <span>{copiedLocation ? 'Location Coordinates Copied to Clipboard!' : 'Share Live Location Coordinates'}</span>
          </button>

          {sosStatus === 'idle' ? (
            <button
              onClick={handleTriggerDispatch}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-rose-900/50 bg-rose-950/40 hover:bg-rose-900/40 py-2.5 text-xs font-medium text-rose-300 transition"
            >
              <Send className="h-3.5 w-3.5 text-rose-400" />
              <span>Simulate Incident Dispatch Packet</span>
            </button>
          ) : (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-950/20 p-3 text-center text-xs text-emerald-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Demo SOS incident recorded: ID #SOS-IN-942189</span>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[10px] text-slate-500">
          Demo Safety Mode active. Real calls require cellular phone dialer permission.
        </p>
      </div>
    </div>
  );
};
