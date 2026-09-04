export type TravelStyle =
  | 'Heritage'
  | 'Adventure'
  | 'Nature'
  | 'Food'
  | 'Budget'
  | 'Luxury'
  | 'Family'
  | 'Spiritual'
  | 'Backpacking';

export type DestinationCategory =
  | 'All'
  | 'Heritage'
  | 'Adventure'
  | 'Nature'
  | 'Beaches'
  | 'Mountains'
  | 'Food'
  | 'Spiritual'
  | 'Wildlife'
  | 'Hidden Gems';

export interface Destination {
  id: string;
  name: string;
  state: string;
  tagline: string;
  image: string;
  bestSeason: string;
  startingBudget: number;
  safetyScore: number; // 0 - 100
  categories: DestinationCategory[];
  temperature: string;
  weatherStatus: string;
  crowdLevel: 'Low' | 'Moderate' | 'High';
  popularActivities: string[];
  historicalBrief: {
    history: string;
    culture: string;
    architecture: string;
    localTraditions: string;
    localEtiquette: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface WaypointActivity {
  id: string;
  time: string;
  place: string;
  category: string;
  approxEntry: string;
  distance: string;
  description: string;
  safetyNote: string;
  coordinates?: { lat: number; lng: number };
}

export interface DayItinerary {
  dayNumber: number;
  dayTitle: string;
  dateStr?: string;
  highlight: string;
  activities: WaypointActivity[];
}

export interface TimingConflict {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  issue: string;
  solution: string;
  timeSlot?: string;
}

export interface RouteSafetyInfo {
  status: 'SAFE' | 'MODERATE RISK' | 'HIGH RISK';
  score: number; // 0 - 100
  travelTime: string;
  distance: string;
  roadCondition: string;
  terrain: string;
  riskFactors: string[];
  advisory: string;
  alternativeSaferRoute?: {
    name: string;
    extraTime: string;
    description: string;
  };
}

export interface ClimateRadar {
  temperature: number;
  feelsLike: number;
  skyCondition: string;
  rainChance: number;
  humidity: number;
  windSpeed: number;
  aqi: {
    value: number;
    status: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  };
  warnings: string[];
}

export interface CostBreakdown {
  transport: number;
  stay: number;
  food: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface PlanTier {
  id: 'budget' | 'balanced' | 'premium';
  name: string;
  tag: string;
  estimatedCost: number;
  summary: string;
  stayType: string;
  transitType: string;
  perks: string[];
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  from: string;
  destination: string;
  durationDays: number;
  travelers: number;
  style: TravelStyle;
  selectedTier: 'budget' | 'balanced' | 'premium';
  tiers: {
    budget: PlanTier;
    balanced: PlanTier;
    premium: PlanTier;
  };
  dailyItinerary: DayItinerary[];
  timingConflicts: TimingConflict[];
  routeSafety: RouteSafetyInfo;
  climate: ClimateRadar;
  smartPacking: string[];
  costBreakdown: CostBreakdown;
  bestVisitingTime: {
    months: string;
    visitingHours: string;
    crowd: string;
    weather: string;
    safety: string;
  };
  createdAt: string;
}

export type POICategory =
  | 'Rickshaws'
  | 'Buses'
  | 'Bazaars'
  | 'Hotels'
  | 'Hospitals'
  | 'Fuel'
  | 'Food'
  | 'Tourist Places'
  | 'Emergency';

export interface POIMarker {
  id: string;
  name: string;
  category: POICategory;
  distance: string;
  distanceKm: number;
  openingHours: string;
  isVerified: boolean;
  estimatedPrice?: string;
  contactNumber?: string;
  rating?: number;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
    x?: number; // legacy percentage
    y?: number;
  };
}

export type SeasonName = 'Winter' | 'Summer' | 'Monsoon' | 'Autumn';

export interface SeasonalDestinationInfo {
  season: SeasonName;
  months: string;
  description: string;
  climateHighlights: string;
  temperatureRange: string;
  recommendedDestinations: {
    id: string;
    name: string;
    state: string;
    tagline: string;
    startingBudget: number;
    image: string;
    whyVisit: string;
    safetyAdvisory: string;
  }[];
}

export interface TravelerCompanion {
  id: string;
  name: string;
  avatar: string;
  location: string;
  destination: string;
  dates: string;
  budget: number;
  budgetFormatted: string;
  travelStyle: TravelStyle;
  interests: string[];
  bio: string;
  compatibilityScore: number; // 0-100%
  isVerified: boolean;
  groupType: 'Solo' | 'Duo' | 'Small Group (3-5)' | 'Women Only';
  contactAvailable: boolean;
}

export interface ActiveTripTrackingState {
  isActive: boolean;
  activeTripId: string | null;
  currentDay: number;
  currentStopIndex: number;
  lastKnownGPS?: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: string;
  };
  trackingStatus: 'IDLE' | 'TRACKING' | 'PAUSED' | 'EMERGENCY';
}

export interface VerifiedDriver {
  id: string;
  name: string;
  vehicleType: string;
  isVerified: boolean;
  tariffType: string;
  estimatedFare: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  availability: 'Available Now' | 'In 10 Mins' | 'Scheduled Only';
  unionBadge: string;
}

export interface TravelService {
  id: string;
  name: string;
  category: 'Hotels' | 'Homestays' | 'Hostels' | 'Flights' | 'Trains' | 'Buses' | 'Cabs' | 'Bike Rentals' | 'Tour Guides' | 'Activities';
  location: string;
  rating: number;
  pricePerNightOrTrip: string;
  availability: string;
  isVerified: boolean;
  image: string;
  amenities: string[];
}

export interface LocalGuide {
  id: string;
  name: string;
  avatar: string;
  region: string;
  speciality: string;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  languages: string[];
  bio: string;
  hourlyRate: string;
  followersCount: number;
}

export interface ArtisanBazaar {
  id: string;
  name: string;
  category: string;
  location: string;
  isVerified: boolean;
  priceGuidance: string;
  description: string;
  zeroCommission: boolean;
  specialties: string[];
  image: string;
}

export interface TravelGroup {
  id: string;
  name: string;
  destination: string;
  travelDates: string;
  membersCount: number;
  maxMembers: number;
  travelStyle: TravelStyle;
  leaderName: string;
  description: string;
  isVerifiedGroup: boolean;
}

export interface TravellerReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  travelType: string;
  reviewText: string;
  verifiedVisit: boolean;
  destination: string;
  images: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SentimentAnalysisResult {
  overallScorePercent: number; // e.g., 92
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  popularHighlights: string[];
  commonConcerns: string[];
  recentExperienceScore: number; // out of 10
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: 'warning' | 'success' | 'info' | 'danger';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export type SystemNotification = AppNotification;

export interface StateAdvisory {
  state: string;
  stateCode: string;
  advisoryLevel: 'Green' | 'Yellow' | 'Orange';
  permitsRequired: string;
  monsoonWinterAdvisories: string;
  roadConditionRating: string;
  culturalNorms: string;
  emergencyNumbers: {
    police: string;
    ambulance: string;
    touristPolice: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  travelPreferences: TravelStyle[];
  budgetPreference: string;
  savedTripsCount: number;
  reviewsGiven: number;
}

export interface DestinationPhoto {
  id: string;
  destination_id: string;
  destination_name?: string;
  user_id: string;
  user_name?: string;
  photo_url: string;
  caption?: string;
  created_at: string; // ISO timestamp generated automatically by server
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  provider: 'local' | 'google';
  createdAt?: string;
  emergencyContact?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  error?: string;
  resetCodeHint?: string;
}


