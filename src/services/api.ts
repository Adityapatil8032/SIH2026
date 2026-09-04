import {
  Destination,
  GeneratedItinerary,
  POIMarker,
  VerifiedDriver,
  LocalGuide,
  ArtisanBazaar,
  TravelGroup,
  TravellerReview,
  SentimentAnalysisResult,
  AppNotification,
  TravelStyle,
  StateAdvisory,
  SeasonalDestinationInfo,
  TravelerCompanion,
  ActiveTripTrackingState,
  DestinationPhoto,
  AuthUser,
  AuthResponse
} from '../types.ts';

export async function fetchDestinations(category?: string, search?: string): Promise<Destination[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search) params.set('search', search);

    const res = await fetch(`/api/destinations?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch destinations');
    const data = await res.json();
    return data.destinations || [];
  } catch (err) {
    console.error('fetchDestinations error:', err);
    return [];
  }
}

export async function fetchDestinationById(id: string): Promise<Destination | null> {
  try {
    const res = await fetch(`/api/destinations/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.destination;
  } catch (err) {
    console.error('fetchDestinationById error:', err);
    return null;
  }
}

export async function generateTripPlan(params: {
  from: string;
  destination: string;
  startDate?: string;
  durationDays: number;
  budget: number;
  travelers: number;
  style: TravelStyle;
}): Promise<GeneratedItinerary> {
  const res = await fetch('/api/plan/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    throw new Error('Failed to generate trip plan');
  }
  const data = await res.json();
  return data.plan;
}

export async function sendConciergeMessage(
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  contextDestination?: string
): Promise<string> {
  const res = await fetch('/api/concierge/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, contextDestination })
  });
  if (!res.ok) throw new Error('Concierge request failed');
  const data = await res.json();
  return data.reply;
}

export async function fetchRadarPOIs(
  destination: string,
  category?: string,
  radiusKm?: number,
  centerLat?: number,
  centerLng?: number
): Promise<POIMarker[]> {
  try {
    const params = new URLSearchParams({ destination });
    if (category && category !== 'All') params.set('category', category);
    if (radiusKm) params.set('radiusKm', String(radiusKm));
    if (centerLat !== undefined && centerLng !== undefined) {
      params.set('centerLat', String(centerLat));
      params.set('centerLng', String(centerLng));
    }

    const res = await fetch(`/api/radar/pois?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.pois || [];
  } catch (err) {
    console.error('fetchRadarPOIs error:', err);
    return [];
  }
}

export async function fetchServices(): Promise<{
  drivers: VerifiedDriver[];
  guides: LocalGuide[];
  bazaars: ArtisanBazaar[];
  groups: TravelGroup[];
}> {
  try {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return await res.json();
  } catch (err) {
    console.error('fetchServices error:', err);
    return { drivers: [], guides: [], bazaars: [], groups: [] };
  }
}

export async function fetchVerifiedDrivers(): Promise<VerifiedDriver[]> {
  const s = await fetchServices();
  return s.drivers || [];
}

export async function fetchLocalGuides(): Promise<LocalGuide[]> {
  const s = await fetchServices();
  return s.guides || [];
}

export async function fetchArtisanBazaars(): Promise<ArtisanBazaar[]> {
  const s = await fetchServices();
  return s.bazaars || [];
}

export async function fetchTravelGroups(): Promise<TravelGroup[]> {
  const s = await fetchServices();
  return s.groups || [];
}

export async function triggerSOS(userLocation?: any, emergencyType?: string): Promise<any> {
  const res = await fetch('/api/sos/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userLocation, emergencyType })
  });
  if (!res.ok) throw new Error('SOS dispatch call failed');
  return await res.json();
}

export async function fetchReviews(): Promise<TravellerReview[]> {
  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews || [];
  } catch (err) {
    console.error('fetchReviews error:', err);
    return [];
  }
}

export async function submitReview(review: {
  userName: string;
  rating: number;
  destination: string;
  reviewText: string;
  travelType: string;
  image?: string;
}): Promise<TravellerReview | null> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.review;
  } catch (err) {
    console.error('submitReview error:', err);
    return null;
  }
}

export async function analyzeSentiment(): Promise<SentimentAnalysisResult | null> {
  try {
    const res = await fetch('/api/reviews/analyze-sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('analyzeSentiment error:', err);
    return null;
  }
}

export async function fetchSavedTrips(): Promise<GeneratedItinerary[]> {
  try {
    const res = await fetch('/api/trips/saved');
    if (!res.ok) return [];
    const data = await res.json();
    return data.savedTrips || [];
  } catch (err) {
    console.error('fetchSavedTrips error:', err);
    return [];
  }
}

export async function saveTrip(plan: GeneratedItinerary): Promise<boolean> {
  try {
    const res = await fetch('/api/trips/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    return res.ok;
  } catch (err) {
    console.error('saveTrip error:', err);
    return false;
  }
}

export async function deleteTrip(tripId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('deleteTrip error:', err);
    return false;
  }
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) return [];
    const data = await res.json();
    return data.notifications || [];
  } catch (err) {
    console.error('fetchNotifications error:', err);
    return [];
  }
}

export async function fetchStateAdvisories(): Promise<StateAdvisory[]> {
  try {
    const res = await fetch('/api/safety/advisories');
    if (!res.ok) return [];
    const data = await res.json();
    return data.advisories || [];
  } catch (err) {
    console.error('fetchStateAdvisories error:', err);
    return [];
  }
}

export async function fetchSeasons(season?: string): Promise<Record<string, SeasonalDestinationInfo>> {
  try {
    const params = new URLSearchParams();
    if (season) params.set('season', season);
    const res = await fetch(`/api/seasons?${params.toString()}`);
    if (!res.ok) return {};
    const data = await res.json();
    if (season && data.season) {
      return { [data.season.season]: data.season };
    }
    return data.seasons || {};
  } catch (err) {
    console.error('fetchSeasons error:', err);
    return {};
  }
}

export async function fetchTravelers(params?: {
  destination?: string;
  style?: string;
  budget?: number;
  groupType?: string;
  search?: string;
}): Promise<TravelerCompanion[]> {
  try {
    const q = new URLSearchParams();
    if (params?.destination) q.set('destination', params.destination);
    if (params?.style) q.set('style', params.style);
    if (params?.budget) q.set('budget', String(params.budget));
    if (params?.groupType) q.set('groupType', params.groupType);
    if (params?.search) q.set('search', params.search);

    const res = await fetch(`/api/travelers?${q.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.travelers || [];
  } catch (err) {
    console.error('fetchTravelers error:', err);
    return [];
  }
}

export async function matchTravelersWithAI(criteria: {
  destination?: string;
  dates?: string;
  budget?: any;
  interests?: string[];
  travelStyle?: string;
}): Promise<TravelerCompanion[]> {
  try {
    const res = await fetch('/api/travelers/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.matches || [];
  } catch (err) {
    console.error('matchTravelersWithAI error:', err);
    return [];
  }
}

export async function createTravelerRequest(companion: any): Promise<TravelerCompanion> {
  try {
    const res = await fetch('/api/travelers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companion)
    });
    if (!res.ok) throw new Error('Failed to create traveler profile');
    const data = await res.json();
    return data.traveler || data.companion;
  } catch (err) {
    console.error('createTravelerRequest error:', err);
    throw err;
  }
}

export const createTravelerProfile = createTravelerRequest;

export async function fetchActiveTripState(): Promise<ActiveTripTrackingState | null> {
  try {
    const res = await fetch('/api/trips/active');
    if (!res.ok) return null;
    const data = await res.json();
    return data.activeTripState;
  } catch (err) {
    console.error('fetchActiveTripState error:', err);
    return null;
  }
}

export async function updateActiveTripState(state: Partial<ActiveTripTrackingState>): Promise<ActiveTripTrackingState | null> {
  try {
    const res = await fetch('/api/trips/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.activeTripState;
  } catch (err) {
    console.error('updateActiveTripState error:', err);
    return null;
  }
}

export async function fetchDestinationPhotos(destinationId: string): Promise<DestinationPhoto[]> {
  try {
    const res = await fetch(`/api/destinations/${encodeURIComponent(destinationId)}/photos`);
    if (!res.ok) {
      if (res.status === 404) return [];
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch destination photos');
    }
    const data = await res.json();
    return data.photos || [];
  } catch (err) {
    console.error('fetchDestinationPhotos error:', err);
    throw err;
  }
}

export async function uploadDestinationPhoto(
  destinationId: string,
  payload: {
    photo_url: string;
    caption?: string;
    user_id?: string;
    user_name?: string;
  }
): Promise<{ success: boolean; photo: DestinationPhoto }> {
  const res = await fetch(`/api/destinations/${encodeURIComponent(destinationId)}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload photo');
  }
  return data;
}

// -------------------------------------------------------------
// Authentication Client Services
// -------------------------------------------------------------

export const AUTH_TOKEN_KEY = 'apna_route_auth_token';
export const AUTH_USER_KEY = 'apna_route_auth_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to persist auth to localStorage', e);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (e) {
    console.error('Failed to clear stored auth', e);
  }
}

export async function registerWithEmail(payload: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  if (data.token && data.user) {
    setStoredAuth(data.token, data.user);
  }
  return data;
}

export async function loginWithEmail(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  if (data.token && data.user) {
    setStoredAuth(data.token, data.user);
  }
  return data;
}

export async function getGoogleAuthUrl(): Promise<{
  url: string;
  redirectUri: string;
  configured: boolean;
  clientId: string | null;
  fullClientId?: string | null;
}> {
  const res = await fetch('/api/auth/google/url');
  if (!res.ok) {
    throw new Error('Failed to retrieve Google Auth URL');
  }
  return res.json();
}

export async function loginWithGoogle(payload: {
  code?: string;
  credential?: string;
  redirectUri?: string;
  profile?: any;
  email?: string;
  name?: string;
  picture?: string;
  avatar?: string;
}): Promise<AuthResponse> {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Google authentication failed');
  }
  if (data.token && data.user) {
    setStoredAuth(data.token, data.user);
  }
  return data;
}

export async function updateGoogleClientIdConfig(clientId: string, clientSecret?: string): Promise<{
  success: boolean;
  configured: boolean;
  clientId: string | null;
}> {
  const res = await fetch('/api/auth/google/set-client-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret })
  });
  return res.json();
}

export async function requestForgotPassword(payload: {
  email: string;
  newPassword?: string;
}): Promise<AuthResponse> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Password recovery request failed');
  }
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearStoredAuth();
      }
      return null;
    }

    const data = await res.json();
    if (data.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
    return null;
  } catch (e) {
    console.error('fetchCurrentUser error:', e);
    // Return cached user if network fails temporarily
    return getStoredUser();
  }
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  try {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  } catch (e) {
    // Non-fatal
  } finally {
    clearStoredAuth();
  }
}



