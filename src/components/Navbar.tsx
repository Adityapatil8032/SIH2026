import React, { useState } from 'react';
import {
  Navigation,
  Compass,
  Bot,
  MapPin,
  Briefcase,
  Bookmark,
  Bell,
  User,
  Menu,
  X,
  Shield,
  Search,
  Sparkles,
  Users,
  LogOut
} from 'lucide-react';
import { BrandLogoIcon } from './BrandLogoIcon.tsx';
import { AuthUser } from '../types.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedTripsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onOpenSOS: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedTripsCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenSearch,
  onOpenSOS,
  currentUser,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'travelers', label: 'Travelers & Circles', icon: Users },
    { id: 'concierge', label: 'AI Concierge', icon: Bot },
    { id: 'map', label: 'Live POI Map', icon: Navigation },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'saved', label: 'Saved Trips', icon: Bookmark, badge: savedTripsCount > 0 ? savedTripsCount : undefined },
    { id: 'safety', label: 'Safety Center', icon: Shield }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Title */}
        <div
          id="nav-brand"
          onClick={() => handleNavClick('home')}
          className="flex cursor-pointer items-center gap-2.5 sm:gap-3 group"
        >
          <div className="relative transition-transform group-hover:scale-105">
            <BrandLogoIcon size={42} />
          </div>
          <div className="flex flex-col">
            <span className="font-['Outfit'] text-base sm:text-lg font-bold tracking-tight text-white leading-none">
              APNA ROUTE
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400/90 leading-tight mt-1">
              AI GRID
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/60 text-white border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-transparent border border-slate-600'}`}></span>
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 rounded-full bg-indigo-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <button
            id="nav-search-btn"
            onClick={onOpenSearch}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800/50 hover:text-white transition"
            title="Search destinations, transit, bazaars"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {/* Emergency SOS Quick Button */}
          <button
            id="nav-emergency-sos-btn"
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-950/40 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-900/40 transition shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
            <span>SOS</span>
          </button>

          {/* Notifications */}
          <button
            id="nav-notifications-btn"
            onClick={onOpenNotifications}
            className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800/50 hover:text-white transition"
            title="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-[#0a0a0a]" />
          </button>

          {/* User Profile & Account */}
          <div className="flex items-center gap-1.5">
            <button
              id="nav-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-slate-300 hover:border-slate-700 hover:text-white transition text-xs font-medium cursor-pointer"
              title="User Dashboard & Preferences"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  className="h-4 w-4 rounded-full object-cover"
                />
              ) : (
                <User className="h-3.5 w-3.5 text-indigo-400" />
              )}
              <span className="hidden md:inline max-w-[100px] truncate text-[11px] font-semibold text-slate-200">
                {currentUser?.fullName || 'Traveler'}
              </span>
            </button>

            {onLogout && (
              <button
                id="nav-logout-btn"
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-rose-950/40 hover:border-rose-800/50 hover:text-rose-400 transition text-xs font-medium cursor-pointer"
                title="Sign Out (Return to Login)"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Primary CTA */}
          <button
            id="nav-primary-cta"
            onClick={() => handleNavClick('destinations')}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/20"
          >
            <span>Explore India</span>
            <span>→</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            id="nav-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-400"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#0d0d0d] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-800/60 text-white border border-slate-700/60'
                      : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-transparent border border-slate-600'}`}></span>
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick('destinations')}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-500"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore 500+ Indian Destinations</span>
            </button>

            {currentUser && onLogout && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 font-bold text-xs">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{currentUser.fullName}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[160px]">{currentUser.email}</span>
                  </div>
                </div>
                <button
                  id="mobile-nav-logout-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-rose-900/50 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-900/40 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
