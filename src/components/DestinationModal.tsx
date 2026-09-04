import React from 'react';
import { X, ShieldCheck, Calendar, Clock, MapPin, Sparkles, BookOpen, Sun, Info } from 'lucide-react';
import { Destination } from '../types.ts';
import { DestinationPhotoFeed } from './DestinationPhotoFeed.tsx';

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  onPlanTrip: (destName: string) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  onPlanTrip
}) => {
  if (!destination) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-800/80 bg-[#121212] p-6 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Hero */}
        <div className="relative h-56 rounded-lg overflow-hidden mb-6 border border-slate-800/80">
          <img
            src={destination.image}
            alt={destination.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/60" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {destination.state}
              </span>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white">
                {destination.name}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">{destination.tagline}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="inline h-3.5 w-3.5 mr-1" />
                {destination.safetyScore}% Safety Score
              </span>
            </div>
          </div>
        </div>

        {/* 1. Best Time to Visit Section */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950 p-4 mb-6">
          <h3 className="font-['Outfit'] text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Sun className="h-4 w-4" />
            <span>BEST TIME TO VISIT & CLIMATE PROFILE</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="rounded-md bg-slate-900/80 p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Prime Window</span>
              <span className="font-medium text-slate-200 mt-0.5 block">{destination.bestSeason}</span>
            </div>
            <div className="rounded-md bg-slate-900/80 p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Ideal Visiting Hours</span>
              <span className="font-medium text-indigo-300 mt-0.5 block">08:00 AM – 11:30 AM</span>
            </div>
            <div className="rounded-md bg-slate-900/80 p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Typical Temperature</span>
              <span className="font-medium text-slate-200 mt-0.5 block">{destination.temperature}</span>
            </div>
            <div className="rounded-md bg-slate-900/80 p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Crowd Level</span>
              <span className="font-medium text-amber-400 mt-0.5 block">{destination.crowdLevel}</span>
            </div>
          </div>
        </div>

        {/* 2. Heritage Background & Historical Briefing */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <h3 className="font-['Outfit'] text-xs font-bold text-white uppercase tracking-wider">
              HERITAGE BACKGROUND & HISTORICAL BRIEFING
            </h3>
          </div>

          <div className="space-y-3 text-slate-300 leading-relaxed text-xs sm:text-sm">
            <div>
              <span className="font-semibold text-white">Historical Epoch: </span>
              {destination.historicalBrief.history}
            </div>
            <div>
              <span className="font-semibold text-white">Cultural Fabric & Arts: </span>
              {destination.historicalBrief.culture}
            </div>
            <div>
              <span className="font-semibold text-white">Architectural Signatures: </span>
              {destination.historicalBrief.architecture}
            </div>
            <div>
              <span className="font-semibold text-white">Living Traditions: </span>
              {destination.historicalBrief.localTraditions}
            </div>
            <div className="rounded-md border border-amber-500/20 bg-amber-950/15 p-3 text-xs text-amber-200">
              <span className="font-semibold text-amber-300">Local Etiquette & Sensitivity: </span>
              {destination.historicalBrief.localEtiquette}
            </div>
          </div>

          {/* Popular Activities */}
          <div className="pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Verified Iconic Activities
            </span>
            <div className="flex flex-wrap gap-2">
              {destination.popularActivities.map((act, i) => (
                <span
                  key={i}
                  className="rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300"
                >
                  ✓ {act}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Automatic Date-Wise Destination Photo Feed */}
        <DestinationPhotoFeed
          destinationId={destination.id}
          destinationName={destination.name}
        />

        {/* Footer Actions */}
        <div className="mt-7 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Starting from <span className="font-bold text-white">₹{destination.startingBudget.toLocaleString('en-IN')}</span> per person
          </div>
          <button
            onClick={() => {
              onClose();
              onPlanTrip(destination.name);
            }}
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20"
          >
            Plan Itinerary for {destination.name} →
          </button>
        </div>
      </div>
    </div>
  );
};
