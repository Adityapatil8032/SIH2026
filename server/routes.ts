import { Router, Request, Response } from 'express';
import {
  DESTINATIONS,
  POI_DATABASE,
  VERIFIED_DRIVERS,
  VERIFIED_GUIDES,
  ARTISAN_BAZAARS,
  TRAVEL_GROUPS,
  TRAVELLER_REVIEWS,
  DEFAULT_NOTIFICATIONS,
  STATE_ADVISORIES,
  SEASONAL_DATA,
  TRAVELER_COMPANIONS,
  DESTINATION_PHOTOS,
  calculateHaversineKm
} from './data.ts';
import {
  generateItineraryWithAI,
  chatConciergeWithAI,
  analyzeSentimentWithAI
} from './gemini.ts';
import {
  GeneratedItinerary,
  TravellerReview,
  TravelerCompanion,
  ActiveTripTrackingState,
  DestinationPhoto
} from '../src/types.ts';
import authRouter from './auth.ts';

const router = Router();

// Mount authentication API (/api/auth/register, /api/auth/login, /api/auth/google, /api/auth/forgot-password, /api/auth/me, /api/auth/logout)
router.use('/auth', authRouter);

// In-memory store for saved trips, active tracking, travelers, reviews, and destination photos
let savedTripsStore: GeneratedItinerary[] = [];
let reviewsStore: TravellerReview[] = [...TRAVELLER_REVIEWS];
let travelersStore: TravelerCompanion[] = [...TRAVELER_COMPANIONS];
let destinationPhotosStore: DestinationPhoto[] = [...DESTINATION_PHOTOS];
let activeTripState: ActiveTripTrackingState = {
  isActive: false,
  activeTripId: null,
  currentDay: 1,
  currentStopIndex: 0,
  trackingStatus: 'IDLE'
};

// 1. Health check & Database Status
router.get('/health', async (_req: Request, res: Response) => {
  const { getDbStatus } = await import('./db.ts');
  const dbStatus = await getDbStatus();
  res.json({
    status: 'healthy',
    system: 'APNA ROUTE — Your Journey. Your Route.',
    version: '2.4.0',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

router.get('/db-status', async (_req: Request, res: Response) => {
  const { getDbStatus } = await import('./db.ts');
  const dbStatus = await getDbStatus();
  res.json(dbStatus);
});

// 2. Destinations directory
router.get('/destinations', (req: Request, res: Response) => {
  const { category, search, season, maxBudget } = req.query;
  let list = [...DESTINATIONS];

  if (category && category !== 'All') {
    list = list.filter((d) =>
      d.categories.some((c) => c.toLowerCase() === String(category).toLowerCase())
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q)
    );
  }

  if (maxBudget) {
    const budgetNum = Number(maxBudget);
    if (!isNaN(budgetNum) && budgetNum > 0) {
      list = list.filter((d) => d.startingBudget <= budgetNum);
    }
  }

  res.json({ destinations: list, total: list.length });
});

// 3. Destination details
router.get('/destinations/:id', (req: Request, res: Response) => {
  const dest = DESTINATIONS.find((d) => d.id === req.params.id || d.name.toLowerCase() === req.params.id.toLowerCase());
  if (!dest) {
    return res.status(404).json({ error: 'Destination not found in Apna Route database' });
  }
  res.json({ destination: dest });
});

// 3a. Destination Photos Feed - GET /api/destinations/:destinationId/photos
// Returns photos strictly for this destination, sorted ORDER BY created_at DESC (newest first)
router.get('/destinations/:destinationId/photos', (req: Request, res: Response) => {
  const { destinationId } = req.params;
  const targetId = destinationId.toLowerCase().trim();

  // Find destination by id or name
  const dest = DESTINATIONS.find(
    (d) => d.id.toLowerCase() === targetId || d.name.toLowerCase() === targetId
  );

  if (!dest) {
    return res.status(404).json({ error: 'Invalid destination' });
  }

  // Filter photos strictly belonging to this destination ID
  const destinationPhotos = destinationPhotosStore.filter(
    (p) => p.destination_id.toLowerCase() === dest.id.toLowerCase()
  );

  // Automatic sorting by server timestamp: newest to oldest (descending order)
  const sortedPhotos = [...destinationPhotos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  res.json({
    destination_id: dest.id,
    destination_name: dest.name,
    total: sortedPhotos.length,
    photos: sortedPhotos
  });
});

// 3b. Destination Photos Feed - POST /api/destinations/:destinationId/photos
// Validates file type, size, generates created_at automatically, and stores photo
router.post('/destinations/:destinationId/photos', (req: Request, res: Response) => {
  const { destinationId } = req.params;
  const targetId = destinationId.toLowerCase().trim();

  // Validate destination
  const dest = DESTINATIONS.find(
    (d) => d.id.toLowerCase() === targetId || d.name.toLowerCase() === targetId
  );

  if (!dest) {
    return res.status(404).json({ error: 'Invalid destination' });
  }

  const { photo_url, caption, user_id, user_name } = req.body;

  // Validation: photo_url presence
  if (!photo_url || typeof photo_url !== 'string' || !photo_url.trim()) {
    return res.status(400).json({ error: 'Photo is required' });
  }

  const trimmedUrl = photo_url.trim();

  // Security: File type validation (accept common image formats only: JPG, JPEG, PNG, WEBP)
  const isDataUrl = trimmedUrl.startsWith('data:');
  const isHttpUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');

  if (isDataUrl) {
    const isAllowedFormat =
      trimmedUrl.startsWith('data:image/jpeg;') ||
      trimmedUrl.startsWith('data:image/jpg;') ||
      trimmedUrl.startsWith('data:image/png;') ||
      trimmedUrl.startsWith('data:image/webp;');

    if (!isAllowedFormat) {
      return res.status(400).json({
        error: 'Invalid image format. Only JPG, JPEG, PNG, and WEBP images are accepted.'
      });
    }

    // Size validation: max ~5MB file (7MB base64 string)
    if (trimmedUrl.length > 7 * 1024 * 1024) {
      return res.status(400).json({
        error: 'File size exceeds 5MB limit.'
      });
    }
  } else if (isHttpUrl) {
    // Check against executable / malicious file extensions
    const lower = trimmedUrl.toLowerCase();
    const disallowedExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.ts', '.html', '.php', '.py', '.zip', '.tar', '.pdf', '.bin'];
    if (disallowedExts.some((ext) => lower.includes(ext))) {
      return res.status(400).json({
        error: 'Executable or non-image files are strictly prohibited.'
      });
    }
  } else {
    return res.status(400).json({
      error: 'Invalid photo URL or image data provided.'
    });
  }

  // Automatic date/time generation by the server (user cannot provide or override created_at)
  const serverTimestamp = new Date().toISOString();

  const newPhoto: DestinationPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    destination_id: dest.id,
    destination_name: dest.name,
    user_id: user_id && typeof user_id === 'string' ? user_id.trim() : 'usr_ar_8932',
    user_name: user_name && typeof user_name === 'string' ? user_name.trim() : 'Apna Route Explorer',
    photo_url: trimmedUrl,
    caption: typeof caption === 'string' ? caption.trim().slice(0, 300) : '',
    created_at: serverTimestamp
  };

  // Add to store (newest first)
  destinationPhotosStore.unshift(newPhoto);

  res.status(201).json({
    success: true,
    message: 'Photo uploaded successfully',
    photo: newPhoto
  });
});

// 4. Generate trip plan
router.post('/plan/generate', async (req: Request, res: Response) => {
  try {
    const { from, destination, startDate, durationDays, budget, travelers, style } = req.body;
    const plan = await generateItineraryWithAI({
      from: from || 'New Delhi',
      destination: destination || 'Jaipur',
      startDate,
      durationDays: Number(durationDays) || 4,
      budget: Number(budget) || 10000,
      travelers: Number(travelers) || 1,
      style: style || 'Heritage'
    });
    res.json({ success: true, plan });
  } catch (err: any) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: 'Failed to generate itinerary', details: err.message });
  }
});

// 5. AI Concierge Chat
router.post('/concierge/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, contextDestination } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }
    const reply = await chatConciergeWithAI(message, history || [], contextDestination);
    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Concierge chat error:', err);
    res.status(500).json({ error: 'Failed to process concierge inquiry' });
  }
});

// 6. Hyper-local Mini-Map Radar POIs
router.get('/radar/pois', (req: Request, res: Response) => {
  const { destination = 'jaipur', category, radiusKm, centerLat, centerLng } = req.query;
  const destKey = String(destination).toLowerCase();
  const rawPois = POI_DATABASE[destKey] || POI_DATABASE['jaipur'] || [];
  const destInfo = DESTINATIONS.find((d) => d.id.toLowerCase() === destKey || d.name.toLowerCase() === destKey);

  // Determine center point for distance calculation (user coordinates or city center)
  const cLat = centerLat ? Number(centerLat) : destInfo?.coordinates.lat || 26.9124;
  const cLng = centerLng ? Number(centerLng) : destInfo?.coordinates.lng || 75.7873;

  // Calculate real Haversine distance for each POI
  let calculatedPois = rawPois.map((p) => {
    const distKm = calculateHaversineKm(cLat, cLng, p.coordinates.lat, p.coordinates.lng);
    return {
      ...p,
      distanceKm: distKm,
      distance: `${distKm} km`
    };
  });

  // Filter by category
  if (category && category !== 'All') {
    calculatedPois = calculatedPois.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }

  // Filter by radius (1km, 3km, 5km, etc.)
  if (radiusKm) {
    const maxR = Number(radiusKm);
    if (!isNaN(maxR) && maxR > 0) {
      calculatedPois = calculatedPois.filter((p) => p.distanceKm <= maxR);
    }
  }

  // Sort by closest first
  calculatedPois.sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    pois: calculatedPois,
    destination: destKey,
    count: calculatedPois.length,
    center: { lat: cLat, lng: cLng }
  });
});

// 6b. Seasonal Intelligence & Recommendations
router.get('/seasons', (req: Request, res: Response) => {
  const { season } = req.query;
  if (season && typeof season === 'string') {
    const capitalized = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
    const data = SEASONAL_DATA[capitalized] || SEASONAL_DATA['Winter'];
    return res.json({ season: data });
  }
  res.json({ seasons: SEASONAL_DATA });
});

// 6c. Connect Travelers & Companion Matching
router.get('/travelers', (req: Request, res: Response) => {
  const { destination, style, budget, groupType, search } = req.query;
  let list = [...travelersStore];

  if (destination && destination !== 'All') {
    const dQuery = String(destination).toLowerCase();
    list = list.filter((t) => t.destination.toLowerCase().includes(dQuery));
  }

  if (style && style !== 'All') {
    list = list.filter((t) => t.travelStyle.toLowerCase() === String(style).toLowerCase());
  }

  if (groupType && groupType !== 'All') {
    list = list.filter((t) => t.groupType === groupType);
  }

  if (budget) {
    const maxB = Number(budget);
    if (!isNaN(maxB) && maxB > 0) {
      list = list.filter((t) => t.budget <= maxB);
    }
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.interests.some((i) => i.toLowerCase().includes(q))
    );
  }

  res.json({ travelers: list, total: list.length });
});

router.post('/travelers/match', (req: Request, res: Response) => {
  const { destination, dates, budget, interests, travelStyle } = req.body;
  const userInterests: string[] = Array.isArray(interests) ? interests.map((i: string) => i.toLowerCase()) : [];
  const userBudget = Number(budget) || 12000;
  const userDest = String(destination || '').toLowerCase();
  const userStyle = String(travelStyle || '').toLowerCase();

  const scored = travelersStore.map((t) => {
    let score = 50; // base score

    // Destination match: +25%
    if (userDest && t.destination.toLowerCase().includes(userDest)) {
      score += 25;
    }

    // Travel style match: +15%
    if (userStyle && t.travelStyle.toLowerCase() === userStyle) {
      score += 15;
    }

    // Budget proximity: within 30%: +10%
    const budgetDiff = Math.abs(t.budget - userBudget) / userBudget;
    if (budgetDiff < 0.3) {
      score += 10;
    }

    // Shared interests: up to +15%
    if (userInterests.length > 0) {
      const common = t.interests.filter((i) => userInterests.includes(i.toLowerCase()));
      score += Math.min(common.length * 5, 15);
    }

    // Clamp score
    const finalScore = Math.min(Math.max(score, 45), 98);
    return {
      ...t,
      compatibilityScore: finalScore
    };
  });

  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  res.json({ success: true, matches: scored });
});

router.post('/travelers/create', (req: Request, res: Response) => {
  const { name, location, destination, dates, budget, travelStyle, interests, bio, groupType } = req.body;
  const newCompanion: TravelerCompanion = {
    id: `trv-${Date.now()}`,
    name: name || 'Solo Nomad',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    location: location || 'India',
    destination: destination || 'Jaipur',
    dates: dates || 'Next Month',
    budget: Number(budget) || 10000,
    budgetFormatted: `₹${(Number(budget) || 10000).toLocaleString('en-IN')} / person`,
    travelStyle: travelStyle || 'Heritage',
    interests: Array.isArray(interests) && interests.length > 0 ? interests : ['Heritage', 'Local Food'],
    bio: bio || 'Excited to explore India with responsible fellow travelers!',
    compatibilityScore: 95,
    isVerified: true,
    groupType: groupType || 'Solo',
    contactAvailable: true
  };
  travelersStore.unshift(newCompanion);
  res.json({ success: true, companion: newCompanion, total: travelersStore.length });
});

// 6d. Active Trip Tracking State
router.get('/trips/active', (_req: Request, res: Response) => {
  res.json({ activeTripState });
});

router.post('/trips/active', (req: Request, res: Response) => {
  const { tripId, isActive, currentDay, currentStopIndex, lastKnownGPS, trackingStatus } = req.body;
  activeTripState = {
    isActive: isActive ?? true,
    activeTripId: tripId ?? activeTripState.activeTripId,
    currentDay: currentDay ?? activeTripState.currentDay,
    currentStopIndex: currentStopIndex ?? activeTripState.currentStopIndex,
    lastKnownGPS: lastKnownGPS || activeTripState.lastKnownGPS,
    trackingStatus: trackingStatus || 'TRACKING'
  };
  res.json({ success: true, activeTripState });
});

// 7. Verified services & transport
router.get('/services', (_req: Request, res: Response) => {
  res.json({
    drivers: VERIFIED_DRIVERS,
    guides: VERIFIED_GUIDES,
    bazaars: ARTISAN_BAZAARS,
    groups: TRAVEL_GROUPS
  });
});

// 8. Emergency SOS trigger
router.post('/sos/trigger', (req: Request, res: Response) => {
  const { userLocation, emergencyType, contactsNotified } = req.body;
  const responseData = {
    incidentId: `SOS-IN-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'DISPATCH_TRIGGERED',
    timestamp: new Date().toISOString(),
    location: userLocation || { lat: 26.9124, lng: 75.7873, place: 'Jaipur, Rajasthan' },
    emergencyHelplines: [
      { name: 'All India Emergency Hotline', number: '112', type: 'Police / Fire / Ambulance' },
      { name: 'National Medical Ambulance', number: '102', type: 'Medical' },
      { name: 'Women Safety Helpline', number: '1091', type: 'Specialized Patrol' },
      { name: 'Tourist Police Helpline', number: '1363', type: 'Tourist Assistance' }
    ],
    nearestFacility: {
      name: 'SMS Government Multi-Speciality Trauma Center',
      distance: '1.4 km',
      ambulanceETA: '6 minutes',
      contact: '102'
    },
    safetySteps: [
      'Stay in a well-lit, public location if safe to do so.',
      'Keep your phone battery conservation mode ON.',
      'Your live GPS coordinates have been packaged for sharing.'
    ]
  };
  res.json(responseData);
});

// 8b. State-by-State Travel Advisories
router.get('/safety/advisories', (_req: Request, res: Response) => {
  res.json({ advisories: STATE_ADVISORIES });
});

// 9. Reviews & Sentiment
router.get('/reviews', (_req: Request, res: Response) => {
  res.json({ reviews: reviewsStore });
});

router.post('/reviews', (req: Request, res: Response) => {
  const { userName, rating, destination, reviewText, travelType, image } = req.body;
  const newRev: TravellerReview = {
    id: `rev-${Date.now()}`,
    userName: userName || 'Apna Traveller',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    rating: Number(rating) || 5,
    date: 'Just now',
    travelType: travelType || 'Explorer',
    destination: destination || 'Jaipur',
    reviewText: reviewText || 'Great experience with Apna Route!',
    verifiedVisit: true,
    sentiment: (Number(rating) || 5) >= 4 ? 'positive' : (Number(rating) || 5) === 3 ? 'neutral' : 'negative',
    images: image ? [image] : []
  };
  reviewsStore.unshift(newRev);
  res.json({ success: true, review: newRev });
});

router.post('/reviews/analyze-sentiment', async (req: Request, res: Response) => {
  try {
    const result = await analyzeSentimentWithAI(reviewsStore);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed sentiment analysis' });
  }
});

// 10. Saved Trips
router.get('/trips/saved', (_req: Request, res: Response) => {
  res.json({ savedTrips: savedTripsStore });
});

router.post('/trips/save', (req: Request, res: Response) => {
  const { plan } = req.body;
  if (!plan || !plan.id) {
    return res.status(400).json({ error: 'Valid plan object required' });
  }
  const existingIdx = savedTripsStore.findIndex((t) => t.id === plan.id);
  if (existingIdx >= 0) {
    savedTripsStore[existingIdx] = plan;
  } else {
    savedTripsStore.unshift(plan);
  }
  res.json({ success: true, savedTripsCount: savedTripsStore.length });
});

router.delete('/trips/:id', (req: Request, res: Response) => {
  const tripId = req.params.id;
  savedTripsStore = savedTripsStore.filter((t) => t.id !== tripId);
  res.json({ success: true, remaining: savedTripsStore.length });
});

// 11. Notifications
router.get('/notifications', (_req: Request, res: Response) => {
  res.json({ notifications: DEFAULT_NOTIFICATIONS });
});

export default router;
