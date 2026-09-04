import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { TripPlanner } from './components/TripPlanner.tsx';
import { ItineraryView } from './components/ItineraryView.tsx';
import { SeasonalIntelligence } from './components/SeasonalIntelligence.tsx';
import { DestinationExplorer } from './components/DestinationExplorer.tsx';
import { DestinationModal } from './components/DestinationModal.tsx';
import { MapRadar } from './components/MapRadar.tsx';
import { VerifiedTransport } from './components/VerifiedTransport.tsx';
import { ServicesDirectory } from './components/ServicesDirectory.tsx';
import { LiveTripMonitor } from './components/LiveTripMonitor.tsx';
import { SafetyCenter } from './components/SafetyCenter.tsx';
import { SafetyMapAdvisory } from './components/SafetyMapAdvisory.tsx';
import { ReviewsSection } from './components/ReviewsSection.tsx';
import { AIConcierge } from './components/AIConcierge.tsx';
import { EmergencySOSModal } from './components/EmergencySOSModal.tsx';
import { SafetyToolkitModal } from './components/SafetyToolkitModal.tsx';
import { HomeSearchBar } from './components/HomeSearchBar.tsx';
import { TravelerMatching } from './components/TravelerMatching.tsx';
import { LoginPage } from './components/LoginPage.tsx';

import {
  Destination,
  GeneratedItinerary,
  VerifiedDriver,
  LocalGuide,
  ArtisanBazaar,
  TravelGroup,
  SystemNotification,
  AuthUser
} from './types.ts';

import {
  fetchDestinations,
  fetchVerifiedDrivers,
  fetchLocalGuides,
  fetchArtisanBazaars,
  fetchTravelGroups,
  fetchNotifications,
  getStoredToken,
  getStoredUser,
  fetchCurrentUser,
  logoutUser
} from './services/api.ts';

import {
  ShieldAlert,
  Radio,
  Bookmark,
  Sparkles,
  Calendar,
  X,
  Search,
  Bell,
  CheckCircle2,
  Trash2,
  ArrowRight,
  User,
  Heart
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('home');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getStoredToken()));
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // App Data State
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [drivers, setDrivers] = useState<VerifiedDriver[]>([]);
  const [guides, setGuides] = useState<LocalGuide[]>([]);
  const [bazaars, setBazaars] = useState<ArtisanBazaar[]>([]);
  const [groups, setGroups] = useState<TravelGroup[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Active Trip & Saved Itineraries
  const [currentPlan, setCurrentPlan] = useState<GeneratedItinerary | null>(null);
  const [savedPlans, setSavedPlans] = useState<GeneratedItinerary[]>([]);
  const [prefillDest, setPrefillDest] = useState<string>('Jaipur');
  const [activeMonitoringTrip, setActiveMonitoringTrip] = useState<GeneratedItinerary | null>(null);
  const [selectedStopName, setSelectedStopName] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState<Destination | null>(null);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [safetyToolkitOpen, setSafetyToolkitOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const plannerRef = useRef<HTMLDivElement>(null);

  // Verify authentication session on startup
  useEffect(() => {
    const verifySession = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setAuthChecking(false);
        return;
      }

      try {
        const user = await fetchCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (err) {
        const local = getStoredUser();
        if (local) {
          setCurrentUser(local);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, []);

  // Logout handler returning user to Login page
  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('home');
    setProfileModalOpen(false);
  };

  // Load Initial Data from Backend API
  useEffect(() => {
    fetchDestinations().then(setDestinations);
    fetchVerifiedDrivers().then(setDrivers);
    fetchLocalGuides().then(setGuides);
    fetchArtisanBazaars().then(setBazaars);
    fetchTravelGroups().then(setGroups);
    fetchNotifications().then(setNotifications);

    // Load saved plans from localStorage if present
    try {
      const stored = localStorage.getItem('apna_route_saved_plans');
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error reading local saved trips', e);
    }
  }, []);

  // Save plan handler
  const handleSavePlan = (plan: GeneratedItinerary) => {
    setSavedPlans((prev) => {
      const exists = prev.some((p) => p.id === plan.id);
      const updated = exists ? prev.filter((p) => p.id !== plan.id) : [plan, ...prev];
      try {
        localStorage.setItem('apna_route_saved_plans', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteSavedPlan = (planId: string) => {
    setSavedPlans((prev) => {
      const updated = prev.filter((p) => p.id !== planId);
      try {
        localStorage.setItem('apna_route_saved_plans', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleStartTrip = (plan: GeneratedItinerary) => {
    setActiveMonitoringTrip(plan);
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('live-trip-monitor-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handlePlanDestination = (destName: string) => {
    setPrefillDest(destName);
    setActiveTab('home');
    setTimeout(() => {
      plannerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };

  const itineraryStops = currentPlan
    ? currentPlan.dailyItinerary.flatMap((d) =>
        d.activities.map((a, idx) => ({
          sequenceNumber: idx + 1,
          name: a.place,
          location: currentPlan.destination,
          time: a.time,
          activity: a.description
        }))
      )
    : [];

  const filteredSearchItems = destinations.filter(
    (d) =>
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. Session verification splash
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="font-mono text-xs tracking-widest text-indigo-400">
            CONNECTING TO APNA ROUTE GRID...
          </span>
        </div>
      </div>
    );
  }

  // 2. Gatekeeper: Login page is the starting screen when application starts
  if (!isAuthenticated) {
    return (
      <LoginPage
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setActiveTab('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedTripsCount={savedPlans.length}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenSOS={() => setSosModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area Based on Active Tab */}
      <main className="relative pb-24">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div>
            <Hero
              onExploreClick={() => setActiveTab('destinations')}
              onConciergeClick={() => setActiveTab('concierge')}
              onSelectTrending={(dest) => handlePlanDestination(dest)}
              onScrollToPlanner={() => plannerRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />

            {/* Homepage Destination & Traveler Search Bar with Autocomplete */}
            <div className="-mt-8 mb-10 relative z-30">
              <HomeSearchBar
                destinations={destinations}
                onSelectDestination={(dest) => setSelectedDestinationForModal(dest)}
                onPlanDestination={handlePlanDestination}
                onOpenConnectModal={() => setActiveTab('travelers')}
              />
            </div>

            {/* Core AI Trip Planner Form */}
            <div ref={plannerRef}>
              <TripPlanner
                prefillDestination={prefillDest}
                onPlanGenerated={(plan) => {
                  setCurrentPlan(plan);
                  setTimeout(() => {
                    const el = document.getElementById('itinerary-view-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }}
              />
            </div>

            {/* Render Itinerary View if plan is available */}
            {currentPlan && (
              <ItineraryView
                plan={currentPlan}
                onSavePlan={handleSavePlan}
                onStartTrip={handleStartTrip}
                onSelectStop={(stop) => setSelectedStopName(stop)}
                isSaved={savedPlans.some((p) => p.id === currentPlan.id)}
              />
            )}

            {/* Live GPS Trip Monitor Component */}
            <LiveTripMonitor
              activeTrip={activeMonitoringTrip || currentPlan}
              onOpenSOS={() => setSosModalOpen(true)}
            />

            {/* Seasonal Travel Intelligence Radar & AI Planner */}
            <SeasonalIntelligence
              destinations={destinations}
              onSelectDestination={(dest) => setSelectedDestinationForModal(dest)}
              onPlanDestination={handlePlanDestination}
              onPlanGenerated={(plan) => {
                setCurrentPlan(plan);
                setTimeout(() => {
                  const el = document.getElementById('itinerary-view-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }}
            />

            {/* Hyper-Local Mini-Map Radar with Numbered Itinerary Markers and Live GPS */}
            <MapRadar
              destination={currentPlan ? currentPlan.destination.toLowerCase() : prefillDest.toLowerCase()}
              itineraryStops={itineraryStops}
              selectedStopName={selectedStopName}
              onSelectStop={(stop) => setSelectedStopName(stop)}
            />

            {/* Verified Local Drivers & Ride Radar */}
            <VerifiedTransport drivers={drivers} />

            {/* AI Traveler Companion & Circle Matching */}
            <TravelerMatching
              currentDestination={currentPlan ? currentPlan.destination : prefillDest}
              onPlanDestination={handlePlanDestination}
            />

            {/* Travel Safety Center Summary & Risk Scanner */}
            <SafetyCenter onOpenSOS={() => setSosModalOpen(true)} />

            {/* Reviews & AI Sentiment */}
            <ReviewsSection />
          </div>
        )}

        {/* TAB 2: DESTINATIONS */}
        {activeTab === 'destinations' && (
          <div className="pt-4">
            <DestinationExplorer
              destinations={destinations}
              onSelectDestination={(dest) => setSelectedDestinationForModal(dest)}
              onPlanDestination={handlePlanDestination}
            />
            <SeasonalIntelligence
              destinations={destinations}
              onSelectDestination={(dest) => setSelectedDestinationForModal(dest)}
              onPlanDestination={handlePlanDestination}
              onPlanGenerated={(plan) => {
                setCurrentPlan(plan);
                setActiveTab('home');
                setTimeout(() => {
                  const el = document.getElementById('itinerary-view-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }}
            />
          </div>
        )}

        {/* TAB: TRAVELERS & CIRCLES */}
        {activeTab === 'travelers' && (
          <div className="pt-4">
            <TravelerMatching
              currentDestination={currentPlan ? currentPlan.destination : prefillDest}
              onPlanDestination={handlePlanDestination}
            />
          </div>
        )}

        {/* TAB 3: AI CONCIERGE */}
        {activeTab === 'concierge' && (
          <div className="pt-6">
            <AIConcierge
              currentDestination={currentPlan ? currentPlan.destination : prefillDest}
              onSelectDestination={handlePlanDestination}
            />
          </div>
        )}

        {/* TAB 4: LIVE POI MAP */}
        {activeTab === 'map' && (
          <div className="pt-4">
            <MapRadar
              destination={currentPlan ? currentPlan.destination.toLowerCase() : prefillDest.toLowerCase()}
              itineraryStops={itineraryStops}
              selectedStopName={selectedStopName}
              onSelectStop={(stop) => setSelectedStopName(stop)}
            />
            <VerifiedTransport drivers={drivers} />
          </div>
        )}

        {/* TAB 5: SERVICES & BAZAARS */}
        {activeTab === 'services' && (
          <div className="pt-4">
            <ServicesDirectory guides={guides} bazaars={bazaars} groups={groups} />
            <VerifiedTransport drivers={drivers} />
          </div>
        )}

        {/* TAB 6: SAVED TRIPS */}
        {activeTab === 'saved' && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
              <div>
                <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Your Saved Trips & Itineraries
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Access generated multi-tier itineraries, packing lists, and timing conflict alerts offline.
                </p>
              </div>
              <span className="rounded-md bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-medium text-indigo-400">
                {savedPlans.length} Trips Saved
              </span>
            </div>

            {savedPlans.length === 0 ? (
              <div className="mt-10 rounded-xl border border-slate-800/80 bg-[#121212] p-12 text-center">
                <Bookmark className="mx-auto h-10 w-10 text-slate-600" />
                <h3 className="mt-4 font-['Outfit'] text-base font-bold text-white">No Saved Trips Yet</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  Create a custom itinerary with our AI Trip Planner and click "Save Trip" to keep it here.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setTimeout(() => {
                      plannerRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                  }}
                  className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/20"
                >
                  Plan Your First Trip →
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedPlans.map((sp) => (
                  <div
                    key={sp.id}
                    className="rounded-xl border border-slate-800/80 bg-[#121212] p-5 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                          {sp.durationDays} Days • {sp.travelers || (sp as any).travelersCount || 1} Travelers
                        </span>
                        <button
                          onClick={() => handleDeleteSavedPlan(sp.id)}
                          className="text-slate-500 hover:text-rose-400 transition p-1"
                          title="Delete Saved Plan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="mt-3 font-['Outfit'] text-lg font-semibold text-white">
                        {sp.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {sp.from} → <strong className="text-slate-200">{sp.destination}</strong>
                      </p>

                      <div className="mt-4 rounded-lg bg-slate-900/50 border border-slate-800/80 p-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block">Balanced Tier</span>
                          <span className="font-semibold text-white">
                            ₹{sp.tiers?.balanced?.estimatedCost?.toLocaleString('en-IN') || '14,500'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block">Safety Score</span>
                          <span className="font-semibold text-emerald-400">
                            {(sp as any).safetyScore || sp.routeSafety?.score || 94}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPlan(sp);
                          setActiveTab('home');
                          setTimeout(() => {
                            const el = document.getElementById('itinerary-view-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }, 200);
                        }}
                        className="flex-1 rounded-md bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20"
                      >
                        Open Itinerary
                      </button>
                      <button
                        onClick={() => handleStartTrip(sp)}
                        className="flex-1 rounded-md border border-slate-800 bg-slate-900/80 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                      >
                        Start GPS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 7: SAFETY CENTER */}
        {activeTab === 'safety' && (
          <div className="pt-4">
            <SafetyCenter onOpenSOS={() => setSosModalOpen(true)} />
            <SafetyMapAdvisory />
            <LiveTripMonitor
              activeTrip={activeMonitoringTrip || currentPlan}
              onOpenSOS={() => setSosModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Floating Safety Toolkit Action Button */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5">
        <button
          id="floating-safety-toolkit-btn"
          onClick={() => setSafetyToolkitOpen(true)}
          className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#121212]/90 backdrop-blur-md px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition shadow-xl"
        >
          <ShieldAlert className="h-4 w-4 text-indigo-400" />
          <span>Safety Toolkit</span>
        </button>

        <button
          id="floating-emergency-sos-btn"
          onClick={() => setSosModalOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-600 text-white font-bold hover:bg-rose-500 transition shadow-lg shadow-rose-950/60 text-xs"
          title="Activate Emergency SOS"
        >
          SOS
        </button>
      </div>

      {/* Destination Heritage Briefing Modal */}
      <DestinationModal
        destination={selectedDestinationForModal}
        onClose={() => setSelectedDestinationForModal(null)}
        onPlanTrip={handlePlanDestination}
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />

      {/* Safety Toolkit Modal (Siren, Fake Call, etc.) */}
      <SafetyToolkitModal
        isOpen={safetyToolkitOpen}
        onClose={() => setSafetyToolkitOpen(false)}
        onTriggerSOS={() => setSosModalOpen(true)}
      />

      {/* Notifications Drawer */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0d0d0d] border-l border-slate-800/80 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="font-['Outfit'] text-base font-bold text-white">Live Grid Broadcasts</h3>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="rounded-md bg-slate-900 border border-slate-800 p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="rounded-lg border border-slate-800/80 bg-[#121212] p-4 space-y-1 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-mono font-bold text-indigo-400 uppercase">
                        {notif.type}
                      </span>
                      <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                    </div>
                    <h4 className="font-medium text-xs text-white pt-1">{notif.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80">
              <button
                onClick={() => setNotificationsOpen(false)}
                className="w-full rounded-md bg-slate-900 border border-slate-800 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                Close Broadcast Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800/80 bg-[#121212] p-5 shadow-2xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, state advisories, verified bazaars, or transit..."
                className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2 px-1">
                Matching Destinations ({filteredSearchItems.length})
              </span>
              {filteredSearchItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedDestinationForModal(item);
                    setSearchModalOpen(false);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-white/[0.02] cursor-pointer border border-transparent hover:border-slate-800/60 transition"
                >
                  <div>
                    <h4 className="font-medium text-xs text-white">{item.name}</h4>
                    <span className="text-[11px] text-slate-500">{item.state} • {item.bestSeason}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-300 block">
                      ₹{item.startingBudget.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">{item.safetyScore}% Safe</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800/80 bg-[#121212] p-5 shadow-2xl relative">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-4">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  className="h-11 w-11 rounded-full object-cover border border-indigo-500/50 shadow-md"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-base shadow-md shadow-indigo-950/50">
                  {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'AR'}
                </div>
              )}
              <div>
                <h3 className="font-['Outfit'] text-base font-bold text-white">
                  {currentUser?.fullName || 'Explorer Profile'}
                </h3>
                <p className="text-xs text-slate-400">{currentUser?.email || 'apnaroute.explorer@india.travel'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 text-[9px] font-semibold text-indigo-300">
                    {currentUser?.provider === 'google' ? 'Google Authenticated' : 'Verified Email Account'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-lg bg-slate-900/50 border border-slate-800/80 p-3">
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Emergency Contact</span>
                <span className="font-medium text-slate-200 block mt-0.5">
                  {currentUser?.emergencyContact || '+91 98765 43210 (Family - Primary)'}
                </span>
              </div>
              <div className="rounded-lg bg-slate-900/50 border border-slate-800/80 p-3">
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Saved Itineraries</span>
                <span className="font-semibold text-indigo-400 block mt-0.5">{savedPlans.length} Active Trips</span>
              </div>
              <div className="rounded-lg bg-slate-900/50 border border-slate-800/80 p-3">
                <span className="text-slate-500 uppercase font-bold text-[10px] block">Safety Status</span>
                <span className="font-semibold text-emerald-400 block mt-0.5">High Protection Verified (Corridor ID Active)</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                id="profile-sign-out-btn"
                onClick={handleLogout}
                className="flex-1 rounded-md border border-rose-900/50 bg-rose-950/30 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-900/40 transition cursor-pointer"
              >
                Sign Out (Return to Login)
              </button>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="flex-1 rounded-md bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer styled as in Elegant Dark design */}
      <footer className="h-12 bg-slate-900/50 border-t border-slate-800/80 flex items-center px-6 sm:px-8 text-[11px] text-slate-500 justify-between">
        <div className="flex items-center gap-2">
          <span className="font-['Outfit'] font-bold text-xs text-white tracking-wider">APNA ROUTE</span>
          <span className="hidden sm:inline">• India's Travel & Safety Grid</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider text-slate-500">
          <span className="hidden md:inline">Govt 112 / 1091 Active</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
            Grid Online
          </span>
        </div>
      </footer>
    </div>
  );
}
