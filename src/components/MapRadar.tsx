import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Navigation,
  MapPin,
  ShieldCheck,
  Phone,
  Clock,
  Crosshair,
  Bus,
  Car,
  ShoppingBag,
  Hospital,
  Fuel,
  Utensils,
  AlertCircle,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Compass,
  Radio,
  ExternalLink,
  Layers,
  Sparkles,
  BedDouble
} from 'lucide-react';
import L from 'leaflet';
import { POIMarker, POICategory } from '../types.ts';
import { fetchRadarPOIs } from '../services/api.ts';

export interface ItineraryMapStop {
  id?: string;
  name: string;
  time?: string;
  location: string;
  lat?: number;
  lng?: number;
  sequenceNumber: number;
  activity?: string;
}

interface MapRadarProps {
  destination?: string;
  itineraryStops?: ItineraryMapStop[];
  selectedStopName?: string;
  onSelectStop?: (stopName: string) => void;
}

export const MapRadar: React.FC<MapRadarProps> = ({
  destination = 'jaipur',
  itineraryStops = [],
  selectedStopName,
  onSelectStop
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const radarCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [pois, setPois] = useState<POIMarker[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [selectedPOI, setSelectedPOI] = useState<POIMarker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Scanning perimeter');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRadarPulseActive, setIsRadarPulseActive] = useState<boolean>(true);
  const radarSectionRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(() => [
    { id: 'All', label: 'All Markers', icon: MapPin },
    { id: 'Rickshaws', label: 'Rickshaws & Autos', icon: Car },
    { id: 'Buses', label: 'Bus Depots', icon: Bus },
    { id: 'Bazaars', label: 'Artisan Bazaars', icon: ShoppingBag },
    { id: 'Hotels', label: 'Hotels & Stays', icon: BedDouble },
    { id: 'Food', label: 'Verified Food', icon: Utensils },
    { id: 'Hospitals', label: 'Hospitals & Medical', icon: Hospital },
    { id: 'Fuel', label: 'Fuel & EV Hubs', icon: Fuel },
    { id: 'Emergency', label: 'Emergency & Police', icon: AlertCircle }
  ], []);

  const radii = [1, 3, 5, 10];

  // Default coordinate centers for top destinations
  const destinationCenters: Record<string, { lat: number; lng: number; zoom: number }> = {
    jaipur: { lat: 26.9124, lng: 75.7873, zoom: 13 },
    manali: { lat: 32.2432, lng: 77.1892, zoom: 13 },
    goa: { lat: 15.2993, lng: 74.1240, zoom: 12 },
    udaipur: { lat: 24.5854, lng: 73.7125, zoom: 13 },
    varanasi: { lat: 25.3176, lng: 82.9739, zoom: 13 },
    munnar: { lat: 10.0889, lng: 77.0595, zoom: 13 },
    spiti: { lat: 32.2461, lng: 78.0349, zoom: 11 },
    leh: { lat: 34.1526, lng: 77.5771, zoom: 12 },
    meghalaya: { lat: 25.5788, lng: 91.8933, zoom: 12 },
    kashmir: { lat: 34.0837, lng: 74.7973, zoom: 12 }
  };

  const currentCenter = useMemo(() => {
    const key = destination.toLowerCase().trim();
    return destinationCenters[key] || { lat: 26.9124, lng: 75.7873, zoom: 13 };
  }, [destination]);

  // Fetch POIs dynamically based on destination, category, and radius
  useEffect(() => {
    const lat = userLocation ? userLocation.lat : currentCenter.lat;
    const lng = userLocation ? userLocation.lng : currentCenter.lng;

    fetchRadarPOIs(destination, selectedCategory, radiusKm, lat, lng).then((data) => {
      setPois(data);
      if (data.length > 0 && !selectedPOI) {
        setSelectedPOI(data[0]);
      }
    });
  }, [destination, selectedCategory, radiusKm, userLocation, currentCenter]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization on already attached DOM element
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentCenter.lat, currentCenter.lng],
      zoom: currentCenter.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Matter CartoDB Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Initial resize trigger to render correctly inside flex/grid containers
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [destination]);

  // Handle User Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by browser');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring real-time GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setUserLocation(newCoords);
        setIsLocating(false);
        setLocationStatus(`GPS Active • ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(`GPS unavailable (${err.message}) - using city center`);
        // Fallback to city center
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([currentCenter.lat, currentCenter.lng], currentCenter.zoom);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!radarSectionRef.current) return;
    if (!document.fullscreenElement) {
      radarSectionRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Update Markers, Routes, and Radar Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const centerLat = userLocation ? userLocation.lat : currentCenter.lat;
    const centerLng = userLocation ? userLocation.lng : currentCenter.lng;

    // 1. Radar Perimeter Circle
    if (radarCircleRef.current) {
      map.removeLayer(radarCircleRef.current);
    }
    const radarCircle = L.circle([centerLat, centerLng], {
      radius: radiusKm * 1000,
      color: '#6366F1',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#6366F1',
      fillOpacity: 0.05
    }).addTo(map);
    radarCircleRef.current = radarCircle;

    // 2. User Location Marker (Pulsing Beacon)
    const userDivIcon = L.divIcon({
      className: 'custom-user-gps-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2.5 rounded-full bg-indigo-500/30 ${isRadarPulseActive ? 'animate-ping' : ''}"></div>
          <div class="relative h-7 w-7 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-lg shadow-indigo-900/60">
            <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const userMarker = L.marker([centerLat, centerLng], { icon: userDivIcon })
      .bindPopup(`
        <div class="bg-slate-950 text-slate-200 p-2 text-xs font-sans rounded border border-slate-800">
          <div class="font-bold text-indigo-400 flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            CURRENT RADAR CENTER
          </div>
          <div class="text-[11px] text-slate-400 mt-1">Lat: ${centerLat.toFixed(4)}, Lng: ${centerLng.toFixed(4)}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Perimeter: ${radiusKm} km radius scan active</div>
        </div>
      `)
      .addTo(layer);
    userMarkerRef.current = userMarker;

    // 3. Category marker icon color mapping
    const getCategoryStyles = (cat: POICategory) => {
      switch (cat) {
        case 'Rickshaws':
          return { bg: 'bg-amber-500/90', border: 'border-amber-400', symbol: '🛺', color: '#f59e0b' };
        case 'Buses':
          return { bg: 'bg-blue-600/90', border: 'border-blue-400', symbol: '🚌', color: '#3b82f6' };
        case 'Bazaars':
          return { bg: 'bg-emerald-600/90', border: 'border-emerald-400', symbol: '🛍️', color: '#10b981' };
        case 'Hospitals':
          return { bg: 'bg-rose-600/90', border: 'border-rose-400', symbol: '🏥', color: '#f43f5e' };
        case 'Fuel':
          return { bg: 'bg-orange-600/90', border: 'border-orange-400', symbol: '⛽', color: '#ea580c' };
        case 'Food':
          return { bg: 'bg-purple-600/90', border: 'border-purple-400', symbol: '🍲', color: '#a855f7' };
        case 'Emergency':
          return { bg: 'bg-red-600/90', border: 'border-red-400', symbol: '🚨', color: '#ef4444' };
        case 'Hotels':
          return { bg: 'bg-cyan-600/90', border: 'border-cyan-400', symbol: '🏨', color: '#06b6d4' };
        default:
          return { bg: 'bg-indigo-600/90', border: 'border-indigo-400', symbol: '📍', color: '#6366f1' };
      }
    };

    // 4. Render POIs from database
    pois.forEach((poi) => {
      const style = getCategoryStyles(poi.category);
      const isSelected = selectedPOI?.id === poi.id;

      const poiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div class="group relative cursor-pointer transform transition-transform hover:scale-125 ${isSelected ? 'scale-125' : ''}">
            <div class="flex h-7 w-7 items-center justify-center rounded-full ${style.bg} text-white border ${isSelected ? 'border-white ring-4 ring-indigo-500/50' : style.border} shadow-md text-xs">
              <span>${style.symbol}</span>
            </div>
            <div class="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-black/90 text-[10px] text-white whitespace-nowrap pointer-events-none border border-slate-700">
              ${poi.name}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([poi.coordinates.lat, poi.coordinates.lng], { icon: poiIcon });

      const popupHtml = `
        <div class="bg-[#121212] text-slate-200 p-3 rounded-lg border border-slate-800 font-sans min-w-[210px] max-w-[260px]">
          <div class="flex items-center justify-between gap-1 border-b border-slate-800 pb-1.5 mb-1.5">
            <span class="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-slate-800">
              ${poi.category}
            </span>
            ${poi.isVerified ? '<span class="text-[10px] font-bold text-emerald-400">🛡️ Verified</span>' : ''}
          </div>
          <h4 class="font-bold text-white text-xs leading-tight mb-1">${poi.name}</h4>
          <p class="text-[11px] text-slate-400 mb-2">${poi.address}</p>
          <div class="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-950 p-1.5 rounded border border-slate-800/80 mb-2">
            <div>
              <span class="text-slate-500 block uppercase">Distance</span>
              <span class="font-bold text-indigo-400">${poi.distance}</span>
            </div>
            <div>
              <span class="text-slate-500 block uppercase">Tariff</span>
              <span class="font-bold text-slate-200 truncate block">${poi.estimatedPrice}</span>
            </div>
          </div>
          <div class="text-[10px] text-slate-400 mb-2 space-y-0.5">
            <div>🕒 ${poi.openingHours}</div>
            ${poi.contactNumber ? `<div class="font-mono text-indigo-300">📞 ${poi.contactNumber}</div>` : ''}
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.name} ${poi.address}`)}"
            target="_blank"
            rel="noopener noreferrer"
            class="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white rounded py-1 text-[11px] font-medium"
          >
            Open in Google Maps ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedPOI(poi);
      });

      marker.addTo(layer);
    });

    // 5. Render Numbered Itinerary Markers & Dashed Route Line
    if (itineraryStops.length > 0) {
      const routePoints: L.LatLngExpression[] = [];

      itineraryStops.forEach((stop, index) => {
        // Fallback or mapped coords for itinerary stops
        const stopLat = stop.lat || centerLat + (Math.sin(index * 1.5) * 0.015);
        const stopLng = stop.lng || centerLng + (Math.cos(index * 1.5) * 0.018);
        routePoints.push([stopLat, stopLng]);

        const isStopSelected = selectedStopName && selectedStopName.toLowerCase().includes(stop.name.toLowerCase());

        const stopIcon = L.divIcon({
          className: 'itinerary-stop-marker',
          html: `
            <div class="cursor-pointer group transform transition-transform hover:scale-125 ${isStopSelected ? 'scale-130' : ''}">
              <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-extrabold text-xs shadow-xl border-2 ${isStopSelected ? 'border-amber-400 ring-4 ring-amber-400/40 bg-indigo-500' : 'border-white'}">
                <span>${stop.sequenceNumber || index + 1}</span>
              </div>
              <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-indigo-950/90 text-[10px] text-white whitespace-nowrap font-semibold border border-indigo-700 shadow-md">
                ${stop.name}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const stopMarker = L.marker([stopLat, stopLng], { icon: stopIcon });
        stopMarker.bindPopup(`
          <div class="bg-[#121212] text-slate-200 p-3 rounded-lg border border-indigo-800 font-sans max-w-[240px]">
            <div class="flex items-center justify-between border-b border-indigo-900/60 pb-1 mb-1.5">
              <span class="rounded bg-indigo-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                STOP #${stop.sequenceNumber || index + 1}
              </span>
              <span class="text-[10px] text-indigo-300">${stop.time || 'Day Plan'}</span>
            </div>
            <h4 class="font-bold text-white text-xs mb-1">${stop.name}</h4>
            <p class="text-[11px] text-slate-400 mb-1.5">${stop.location}</p>
            ${stop.activity ? `<p class="text-[10px] text-slate-300 italic mb-2">"${stop.activity}"</p>` : ''}
            <a
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name} ${stop.location}`)}"
              target="_blank"
              rel="noopener noreferrer"
              class="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white rounded py-1 text-[11px] font-medium"
            >
              Directions to Stop ↗
            </a>
          </div>
        `);

        stopMarker.on('click', () => {
          onSelectStop?.(stop.name);
        });

        stopMarker.addTo(layer);
      });

      // Render Dashed Route Polyline connecting stops
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }

      if (routePoints.length > 1) {
        const routeLine = L.polyline(routePoints, {
          color: '#818cf8',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.85
        }).addTo(map);
        routePolylineRef.current = routeLine;
      }
    }
  }, [pois, itineraryStops, selectedStopName, radiusKm, userLocation, isRadarPulseActive, selectedPOI, currentCenter]);

  // Pan to highlighted stop if selectedStopName changes
  useEffect(() => {
    if (!selectedStopName || !mapInstanceRef.current) return;
    const match = pois.find((p) => p.name.toLowerCase().includes(selectedStopName.toLowerCase()));
    if (match) {
      mapInstanceRef.current.flyTo([match.coordinates.lat, match.coordinates.lng], 15, { duration: 1.2 });
      setSelectedPOI(match);
    }
  }, [selectedStopName, pois]);

  return (
    <section
      ref={radarSectionRef}
      id="map-radar-section"
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 ${isFullscreen ? 'fixed inset-0 z-50 max-w-none bg-[#0a0a0a] p-6 overflow-y-auto' : ''}`}
    >
      {/* Dark Rounded Map Header */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#121212] p-4 sm:p-5 shadow-2xl mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
                <Crosshair className="h-4 w-4" />
              </span>
              <h2 className="font-['Outfit'] text-xl sm:text-2xl font-bold text-white tracking-tight">
                HYPER-LOCAL MINI-MAP RADAR
              </h2>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/50 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE GPS SCANNING</span>
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-2">
              <span>Center: <strong className="text-slate-200">{destination.toUpperCase()}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[11px] text-indigo-300">{locationStatus}</span>
            </p>
          </div>

          {/* Action Bar: Radius Selector & Locate Me & Fullscreen */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Radius selector */}
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 border border-slate-800 p-1">
              <span className="text-[11px] text-slate-400 pl-2 pr-1 font-medium">Radius:</span>
              {radii.map((r) => (
                <button
                  key={r}
                  id={`radar-radius-${r}km`}
                  onClick={() => setRadiusKm(r)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                    radiusKm === r
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>

            {/* Locate Me button */}
            <button
              id="radar-locate-me-btn"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition shadow-sm"
              title="Detect my current location via GPS"
            >
              <Navigation className={`h-3.5 w-3.5 text-indigo-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
            </button>

            {/* Radar Pulse Sweep Toggle */}
            <button
              id="radar-pulse-toggle"
              onClick={() => setIsRadarPulseActive(!isRadarPulseActive)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition ${
                isRadarPulseActive
                  ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Live Radar pulse sweep"
            >
              <Radio className="h-3.5 w-3.5" />
              <span>{isRadarPulseActive ? 'Pulse On' : 'Pulse Off'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="radar-fullscreen-toggle"
              onClick={toggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Category Filters Pill Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                id={`radar-filter-${c.id.toLowerCase()}`}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Leaflet Stage + POI Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Stage */}
        <div className="lg:col-span-2 relative h-[500px] sm:h-[550px] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl bg-[#080808]">
          {/* Leaflet Map Div Container */}
          <div ref={mapContainerRef} className="h-full w-full z-0" style={{ background: '#0a0a0a' }} />

          {/* Radar HUD Sweep Overlay */}
          {isRadarPulseActive && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div
                className="h-[380px] w-[380px] rounded-full border border-indigo-500/15 pointer-events-none animate-spin"
                style={{
                  animationDuration: '8s',
                  background: 'conic-gradient(from 0deg, transparent 0deg 310deg, rgba(99, 102, 241, 0.18) 360deg)'
                }}
              />
            </div>
          )}

          {/* Floating Map Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/90 text-white border border-slate-800 hover:bg-slate-800 shadow-md backdrop-blur transition"
              title="Zoom In"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/90 text-white border border-slate-800 hover:bg-slate-800 shadow-md backdrop-blur transition"
              title="Zoom Out"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Map Legend Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/90 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-indigo-600 border border-white" />
                <span className="font-medium">You (GPS)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white text-[9px] font-bold">1</span>
                <span>Itinerary Stop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Auto / Rickshaws</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>Buses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Bazaars</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Emergency</span>
              </div>
            </div>

            <div className="font-mono text-[10px] text-indigo-300">
              {pois.length} POIs Found
            </div>
          </div>
        </div>

        {/* POI Details & Fast Action Card */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#121212] p-5 sm:p-6 flex flex-col justify-between shadow-2xl">
          {selectedPOI ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="rounded-lg bg-indigo-950/70 border border-indigo-800/50 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                  {selectedPOI.category}
                </span>
                {selectedPOI.isVerified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified Spot</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-['Outfit'] text-lg sm:text-xl font-bold text-white leading-snug">
                  {selectedPOI.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{selectedPOI.address}</span>
                </p>
              </div>

              {/* Quick Distance & Tariff Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Radar Distance
                  </span>
                  <span className="font-['Outfit'] text-lg font-bold text-indigo-400">
                    {selectedPOI.distance}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">from GPS center</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Verified Tariff
                  </span>
                  <span className="font-medium text-slate-200 text-xs block truncate mt-1">
                    {selectedPOI.estimatedPrice}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Anti-scam standard</span>
                </div>
              </div>

              {/* Hours & Contact */}
              <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>{selectedPOI.openingHours}</span>
                </div>
                {selectedPOI.contactNumber && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>Contact</span>
                    </span>
                    <a
                      href={`tel:${selectedPOI.contactNumber}`}
                      className="font-mono text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      {selectedPOI.contactNumber}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedPOI.name} ${selectedPOI.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/20"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Navigate to Spot</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>

                {selectedPOI.contactNumber && (
                  <a
                    href={`tel:${selectedPOI.contactNumber}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Direct Call Helpline</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              <MapPin className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              Click any marker on the radar to inspect verified tariffs, emergency contacts, and live route directions.
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Real-Time Coordinates Active</span>
            </span>
            <span className="text-indigo-400 font-semibold">{pois.length} In Perimeter</span>
          </div>
        </div>
      </div>
    </section>
  );
};
