export type BudgetLevel = 'economique' | 'modere' | 'confortable' | 'premium';
export type TravelTime = 'heures' | 'journee' | 'weekend' | '3jours' | '4-5jours' | 'semaine';
export type TravellerProfile = 'seul' | 'couple' | 'amis' | 'famille';
export type TransportMode = 'voiture' | 'bus' | 'avion' | 'peu-importe';

export interface City {
  id: string;
  name: string;
  slug: string;
  region: string;
  latitude: number;
  longitude: number;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  minDays: number;
  maxDays: number;
  averageBudgetXof: number;
  tags: string[];
  highlights: string[];
  active: boolean;
  source: string;
  verified?: boolean;
  sourceUrl?: string;
  confidence?: number;
  verifiedAt: string;
}

export interface Attraction {
  id: string;
  citySlug: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string;
  visitDurationMinutes: number;
  priceLevel: 'gratuit' | 'faible' | 'modere' | 'eleve' | 'inconnu';
  childFriendly?: boolean;
  source: string;
  sourceUrl?: string;
  verified: boolean;
}

export interface RecommendationInput {
  origin?: { latitude: number; longitude: number; cityName?: string };
  availableTime?: TravelTime;
  budget?: BudgetLevel;
  budgetMaxXof?: number;
  transport?: TransportMode;
  interests?: string[];
  travellers?: TravellerProfile;
  children?: boolean;
  rejectedDestinations?: string[];
  previousDestinations?: string[];
}

export interface ScoredCity extends City {
  recommendationScore: number;
  reasons: string[];
  distanceKm?: number;
}

export interface ItineraryItem {
  time: string;
  title: string;
  type: string;
  attractionId?: string;
}

export interface ItineraryDay {
  day: number;
  items: ItineraryItem[];
}

export interface GeneratedItinerary {
  destination?: string;
  days: ItineraryDay[];
  note: string;
}
