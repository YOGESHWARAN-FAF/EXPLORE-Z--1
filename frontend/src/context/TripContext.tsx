import React, { createContext, useContext, useState } from 'react';

export interface MemberInput {
  name: string;
  age: number | string;
  gender: string; // Male, Female, Other
  medical_issues: string[]; // Asthma, Heart Disease, Diabetes, High BP, Wheelchair, Pregnancy, Arthritis, None
}

export interface PlaceItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews_count: number;
  latitude: number;
  longitude: number;
  address: string;
  website?: string;
  phone?: string;
  opening_hours?: string;
  is_open_now?: boolean;
  distance_from_route_km?: number;
  visit_duration?: string;
  parking_available?: boolean;
  family_friendly?: boolean;
  wifi_available?: boolean;
  images: string[];
  description?: string;
  safety_accessible?: boolean;
}

export interface WeatherInfo {
  temperature?: number;
  condition?: string;
  rain_probability?: number;
  humidity?: number;
  wind_speed?: number;
  air_quality?: string;
  sunrise?: string;
  sunset?: string;
  [key: string]: any;
}

export interface HealthRecommendation {
  member_name: string;
  walking_limit?: string;
  condition_summary?: string;
  medical_warnings?: string[];
  avoid_activities?: string[];
  recommended_activities?: string[];
  suitable_activities?: string[];
  special_care_tips?: string[];
  emergency_kit_items?: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  category: string;
  published_at: string;
}

export interface ScheduleItem {
  time: string;
  title?: string;
  activity?: string;
  location?: string;
  km_mark?: number;
  category?: string;
  duration?: string;
  description?: string;
  notes?: string;
  suitable_for_all?: boolean;
  health_advisory?: string;
  safety_tips?: string;
  latitude?: number;
  longitude?: number;
}

export interface SmartHotelRecommendation {
  day: string;
  target_km: number;
  hotel_name: string;
  location: string;
  rating: number;
  reasons: string[];
}

export interface RouteCheckpoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  km_mark: number;
}

export interface TripPlan {
  trip_id: string;
  origin: string;
  destination: string;
  travel_mode: string;
  duration: string;
  budget: number;
  total_distance_km: number;
  duration_hours: number;
  expected_arrival_time?: string;
  safety_score: number;
  trip_summary: string;
  route_geometry: [number, number][];
  checkpoints: RouteCheckpoint[];
  weather_overview: WeatherInfo;
  budget_breakdown: {
    accommodation: number;
    food_and_dining: number;
    transportation: number;
    activities_and_entry: number;
    emergency_fund: number;
    total: number;
  };
  health_recommendations: HealthRecommendation[];
  best_tourist_places: PlaceItem[];
  best_hotels: PlaceItem[];
  best_restaurants: PlaceItem[];
  tea_and_bakeries: PlaceItem[];
  hospitals: PlaceItem[];
  bus_stands?: PlaceItem[];
  ev_charging: PlaceItem[];
  parking: PlaceItem[];
  petrol_stations: PlaceItem[];
  viewpoints?: PlaceItem[];
  rest_stops?: PlaceItem[];
  smart_tea_stops?: PlaceItem[];
  smart_lunch_stops?: PlaceItem[];
  along_route_attractions?: PlaceItem[];
  emergency_stops?: PlaceItem[];
  destination_explorer_top3?: Record<string, PlaceItem[]>;
  travel_schedule: ScheduleItem[];
  daily_itineraries?: Record<string, ScheduleItem[]>;
  smart_hotel_plan?: SmartHotelRecommendation[];
  crowd_prediction: string;
  weather_advice: string | string[];
  emergency_suggestions: string[];
  hidden_gems: string[];
  local_foods: string[];
  photo_spots: string[];
  things_to_avoid: string[];
  recommended_route: string[];
  travel_tips: string[];
  news_articles: NewsArticle[];
  news_summary: string;
}

interface TripContextType {
  activeTrip: TripPlan | null;
  setActiveTrip: (trip: TripPlan | null) => void;
  savedTrips: TripPlan[];
  setSavedTrips: React.Dispatch<React.SetStateAction<TripPlan[]>>;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  selectedMapPlace: PlaceItem | null;
  setSelectedMapPlace: (place: PlaceItem | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState<TripPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedMapPlace, setSelectedMapPlace] = useState<PlaceItem | null>(null);

  return (
    <TripContext.Provider value={{
      activeTrip, setActiveTrip, savedTrips, setSavedTrips, isGenerating, setIsGenerating,
      selectedMapPlace, setSelectedMapPlace
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within TripProvider');
  return context;
};
