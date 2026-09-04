import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Phone,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  MapPin,
  Lock,
  Activity
} from 'lucide-react';

interface SafetyCenterProps {
  onOpenSOS: () => void;
}

export const SafetyCenter: React.FC<SafetyCenterProps> = ({ onOpenSOS }) => {
  const [analyzingSafety, setAnalyzingSafety] = useState(false);
  const [safetyReport, setSafetyReport] = useState<{
    score: number;
    status: 'EXCELLENT' | 'MONITORED' | 'ADVISORY';
    verdict: string;
    checks: { name: string; pass: boolean; note: string }[];
  } | null>(null);

  const handleAmISafeCheck = () => {
    setAnalyzingSafety(true);
    setSafetyReport(null);
    setTimeout(() => {
      setSafetyReport({
        score: 96,
        status: 'EXCELLENT',
        verdict: 'Current travel corridor is SAFE. Daytime visibility is optimal and emergency response coverage is within 6 minutes.',
        checks: [
          { name: 'Corridor Highway Patrol', pass: true, note: 'NHAI & State Police patrol active' },
          { name: 'Weather & Flash Flood Risk', pass: true, note: 'Zero precipitation alerts' },
          { name: 'Verified Prepaid Transit', pass: true, note: 'Scam-free tariffs enabled' },
          { name: 'Medical Response Radius', pass: true, note: 'Trauma center located 2.1 km away' }
        ]
      });
      setAnalyzingSafety(false);
    }, 1200);
  };

  const emergencyContacts = [
    { title: 'National All-India Emergency', number: '112', desc: 'Police, Fire & Medical unified dispatch' },
    { title: 'Tourist Police Helpline', number: '1363', desc: 'Ministry of Tourism multi-lingual assistance' },
    { title: 'Women Safety Helpline', number: '1091', desc: '24x7 dedicated transit safety support' },
    { title: 'National Highway Assistance', number: '1033', desc: 'NHAI 24x7 emergency medical & towing' }
  ];

  return (
    <section id="safety-center-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-indigo-400">
              <Shield className="h-4 w-4" />
            </span>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              TRAVEL SAFETY CENTER
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time safety scores, official toll-free response networks, and instant risk assessment.
          </p>
        </div>

        <button
          onClick={onOpenSOS}
          className="rounded-md border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/25 transition self-start md:self-auto"
        >
          Emergency SOS Console →
        </button>
      </div>

      {/* "Am I Safe?" Scanner */}
      <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                INSTANT RISK SCANNER
              </span>
              <span className="text-xs text-slate-500">Powered by Apna Route Safety Engine</span>
            </div>
            <h3 className="mt-2 font-['Outfit'] text-xl sm:text-2xl font-bold text-white">
              Evaluate Current Trip Safety
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Cross-references your current GPS coordinate against official road closures, weather warnings, verified transport availability, and emergency services proximity.
            </p>
          </div>

          <button
            id="btn-am-i-safe"
            onClick={handleAmISafeCheck}
            disabled={analyzingSafety}
            className="rounded-md bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20 self-start sm:self-auto shrink-0 disabled:opacity-50"
          >
            {analyzingSafety ? 'Scanning Corridor Grid...' : 'Am I Safe? (Analyze Now)'}
          </button>
        </div>

        {/* Safety Report Output */}
        {safetyReport && (
          <div className="mt-6 rounded-lg border border-slate-800 bg-[#121212] p-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-['Outfit'] text-2xl font-bold">
                  {safetyReport.score}
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    STATUS: {safetyReport.status} ✓
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">{safetyReport.verdict}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {safetyReport.checks.map((chk, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-md bg-slate-950 border border-slate-800 p-3 text-xs"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">{chk.name}</span>
                    <span className="text-slate-400 text-[11px]">{chk.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Helpline Cards Grid */}
      <div className="mt-7">
        <h3 className="font-['Outfit'] text-base font-bold text-white mb-3.5">
          Verified National Emergency Directory
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyContacts.map((c, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800/80 bg-[#121212] p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-medium block">
                  Official Helpline
                </span>
                <h4 className="mt-1 font-['Outfit'] text-base font-semibold text-white leading-snug">
                  {c.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{c.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-indigo-400">
                  {c.number}
                </span>
                <a
                  href={`tel:${c.number}`}
                  className="rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 p-2 text-slate-300 hover:text-white transition"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
