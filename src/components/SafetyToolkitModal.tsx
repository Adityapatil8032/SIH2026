import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  Phone,
  Share2,
  Volume2,
  PhoneCall,
  MapPin,
  Hospital,
  AlertTriangle,
  Radio,
  Check
} from 'lucide-react';

interface SafetyToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSOS: () => void;
}

export const SafetyToolkitModal: React.FC<SafetyToolkitModalProps> = ({
  isOpen,
  onClose,
  onTriggerSOS
}) => {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const toggleSiren = () => {
    setSirenPlaying(!sirenPlaying);
    if (!sirenPlaying) {
      // Audio synth beep using browser Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 1500);
      } catch (e) {
        console.log('Audio Context error', e);
      }
    }
  };

  const triggerFakeCall = () => {
    setFakeCallActive(true);
    setTimeout(() => {
      alert('Incoming Simulated Call: "Family / Emergency Contact" calling... Pick up to exit uncomfortable situation.');
      setFakeCallActive(false);
    }, 2000);
  };

  const handleShareLiveTrack = () => {
    const text = 'https://apnaroute.in/live-track?id=SAFE-TRIP-7491&loc=26.9124,75.7873';
    navigator.clipboard?.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl border border-slate-800/80 bg-[#121212] p-6 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 shadow-md">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-['Outfit'] text-lg font-bold text-white">
              Safety Quick-Toolkit
            </h3>
            <p className="text-xs text-slate-400">Emergency & Deterrent Controls</p>
          </div>
        </div>

        {/* Big SOS button */}
        <div className="mt-5">
          <button
            onClick={() => {
              onClose();
              onTriggerSOS();
            }}
            className="w-full rounded-md bg-rose-600 hover:bg-rose-500 p-3.5 text-center font-bold text-white shadow-md shadow-rose-950/40 transition flex items-center justify-center gap-2"
          >
            <AlertTriangle className="h-5 w-5" />
            <span>ACTIVATE EMERGENCY SOS</span>
          </button>
        </div>

        {/* Rapid Utility Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
          {/* Audio Siren */}
          <button
            onClick={toggleSiren}
            className={`rounded-lg border p-3 text-left transition flex flex-col justify-between ${
              sirenPlaying
                ? 'border-amber-400/80 bg-amber-500/15 text-amber-300'
                : 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-700'
            }`}
          >
            <Volume2 className="h-5 w-5 text-amber-400 mb-2" />
            <span className="font-semibold text-white">Loud Audio Alarm</span>
            <span className="text-[10px] text-slate-400">Audio deterrent trigger</span>
          </button>

          {/* Fake Call Generator */}
          <button
            onClick={triggerFakeCall}
            className={`rounded-lg border p-3 text-left transition flex flex-col justify-between ${
              fakeCallActive
                ? 'border-indigo-400/80 bg-indigo-500/15 text-indigo-300'
                : 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-700'
            }`}
          >
            <PhoneCall className="h-5 w-5 text-indigo-400 mb-2" />
            <span className="font-semibold text-white">Fake Call Generator</span>
            <span className="text-[10px] text-slate-400">Escape uncomfortable spots</span>
          </button>
        </div>

        {/* One-Tap Official Helplines */}
        <div className="mt-4 space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
            Direct Dial Helplines
          </span>
          <div className="grid grid-cols-3 gap-2">
            <a
              href="tel:112"
              className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-center text-white hover:border-slate-700 transition"
            >
              <span className="text-[10px] text-slate-400 block">Unified SOS</span>
              <span className="font-mono font-bold text-sm text-indigo-400">112</span>
            </a>
            <a
              href="tel:1091"
              className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-center text-white hover:border-slate-700 transition"
            >
              <span className="text-[10px] text-slate-400 block">Women</span>
              <span className="font-mono font-bold text-sm text-indigo-400">1091</span>
            </a>
            <a
              href="tel:1033"
              className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-center text-white hover:border-slate-700 transition"
            >
              <span className="text-[10px] text-slate-400 block">NHAI Highway</span>
              <span className="font-mono font-bold text-sm text-indigo-400">1033</span>
            </a>
          </div>
        </div>

        {/* Share Live Link */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={handleShareLiveTrack}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-800 bg-slate-900 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Live Route Tracking Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-indigo-400" />
                <span>Copy Live Corridor Tracking Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
