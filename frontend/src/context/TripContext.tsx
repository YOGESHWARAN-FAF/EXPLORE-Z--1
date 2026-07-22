import React, { createContext, useContext, useState } from 'react';

export interface MemberInput {
  name: string;
  age: number;
  gender: string;
  walking_ability: string;
  has_heart_disease: boolean;
  has_asthma: boolean;
  has_diabetes: boolean;
  has_high_bp: boolean;
  has_arthritis: boolean;
  is_pregnant: boolean;
  uses_wheelchair: boolean;
  no_medical_issues: boolean;
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
  duration?: string;
  description?: string;
  notes?: string;
  suitable_for_all?: boolean;
  health_advisory?: string;
  safety_tips?: string;
}

export interface TripPlan {
  trip_id: string;
  destination: string;
  duration: string;
  budget: number;
  safety_score: number;
  trip_summary: string;
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
  best_bakeries: PlaceItem[];
  hospitals: PlaceItem[];
  bus_stands: PlaceItem[];
  ev_charging: PlaceItem[];
  parking: PlaceItem[];
  petrol_stations: PlaceItem[];
  travel_schedule: ScheduleItem[];
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

// Pre-loaded Rich Default Trip Context for 100% Instant Page Rendering
const DEFAULT_INITIAL_TRIP: TripPlan = {
  trip_id: "TRIP-OOTY-8821",
  destination: "Ooty",
  duration: "1 Day",
  budget: 5000,
  safety_score: 9.4,
  trip_summary: "AI-tailored 1-Day mountain excursion designed for seniors & families with accessible Botanical Gardens, tea museum, and 24/7 medical safety coverage.",
  weather_overview: {
    temperature: 22.5,
    condition: "Sunny & Pleasant",
    rain_probability: 10,
    humidity: 62,
    wind_speed: 12.4,
    air_quality: "Good (AQI 42)",
    sunrise: "06:15 AM",
    sunset: "06:45 PM"
  },
  budget_breakdown: {
    accommodation: 1750,
    food_and_dining: 1500,
    transportation: 750,
    activities_and_entry: 600,
    emergency_fund: 400,
    total: 5000
  },
  health_recommendations: [
    {
      member_name: "Robert Rivera (Senior)",
      walking_limit: "< 2.0 km",
      condition_summary: "Senior traveler with Heart & Diabetes history.",
      medical_warnings: ["Avoid steep steps at Doddabetta Peak", "Keep nitro glycerin / BP meds in hand bag"],
      suitable_activities: ["Paved Botanical Garden walkway", "Heritage Toy Train journey"],
      emergency_kit_items: ["Glucometer", "BP monitor", "Portable oxygen canister"]
    },
    {
      member_name: "Sophia Rivera",
      walking_limit: "Normal",
      condition_summary: "Mild asthma history.",
      medical_warnings: ["Carry inhaler for cold mountain air"],
      suitable_activities: ["Lake promenade walk", "Tea museum tour"],
      emergency_kit_items: ["Inhaler", "Antihistamine"]
    }
  ],
  best_tourist_places: [
    {
      id: "p-1",
      name: "Government Botanical & Rose Gardens",
      category: "Tourist Attraction",
      rating: 4.8,
      reviews_count: 2450,
      latitude: 11.415,
      longitude: 76.708,
      address: "Vanguard Hill Road, Ooty",
      opening_hours: "08:30 AM - 06:30 PM",
      phone: "+91 423 244 2222",
      images: ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600"],
      description: "Expansive 55-acre terraced gardens with paved wheelchair ramps, exotic glasshouse flowers, and peaceful lawns.",
      safety_accessible: true
    },
    {
      id: "p-2",
      name: "Ooty Lake & Boat House Promenade",
      category: "Tourist Attraction",
      rating: 4.6,
      reviews_count: 3100,
      latitude: 11.408,
      longitude: 76.692,
      address: "North Lake Road, Ooty",
      opening_hours: "09:00 AM - 06:00 PM",
      phone: "+91 423 244 3333",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"],
      description: "Scenic artificial lake surrounded by eucalyptus trees with calm motorboat rides and paved walking tracks.",
      safety_accessible: true
    }
  ],
  best_hotels: [
    {
      id: "h-1",
      name: "Grand Alpine Resort & Spa",
      category: "Hotel",
      rating: 4.8,
      reviews_count: 890,
      latitude: 11.403,
      longitude: 76.688,
      address: "Hospital Road, Central Ooty",
      opening_hours: "24 Hours",
      phone: "+91 423 244 8888",
      images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"],
      description: "Luxury mountain view suites, heated indoor pool, 24/7 doctor on call, and accessible elevator facilities.",
      safety_accessible: true
    }
  ],
  best_restaurants: [
    {
      id: "r-1",
      name: "The Highland Grill & Cafe",
      category: "Restaurant",
      rating: 4.7,
      reviews_count: 1200,
      latitude: 11.411,
      longitude: 76.698,
      address: "Commercial Street, Ooty",
      opening_hours: "08:00 AM - 10:30 PM",
      phone: "+91 423 244 5555",
      images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"],
      description: "Serving authentic South Indian thalis, warm soups, and continental breakfast.",
      safety_accessible: true
    }
  ],
  best_bakeries: [
    {
      id: "b-1",
      name: "Hill Country Bakery & Chocolates",
      category: "Bakery",
      rating: 4.9,
      reviews_count: 2100,
      latitude: 11.412,
      longitude: 76.693,
      address: "Charing Cross, Ooty",
      opening_hours: "07:30 AM - 09:30 PM",
      phone: "+91 423 244 4444",
      images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"],
      description: "Famous for handmade dark chocolates, hot apple pies, and fresh butter cookies.",
      safety_accessible: true
    }
  ],
  hospitals: [
    {
      id: "hos-1",
      name: "Government General Hospital & Cardiac Unit",
      category: "Hospital",
      rating: 4.7,
      reviews_count: 430,
      latitude: 11.417,
      longitude: 76.692,
      address: "Hospital Road, Ooty (1.2 km away)",
      opening_hours: "24 Hours Emergency",
      phone: "+91 423 244 1000",
      images: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600"],
      description: "Full 24/7 emergency trauma, oxygen supply, and cardiac care unit.",
      safety_accessible: true
    }
  ],
  bus_stands: [
    {
      id: "bus-1",
      name: "Central Bus Terminus",
      category: "Bus Stand",
      rating: 4.3,
      reviews_count: 1500,
      latitude: 11.401,
      longitude: 76.694,
      address: "Main Bus Stand Road, Ooty",
      opening_hours: "24 Hours",
      images: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600"],
      description: "Main intercity bus terminal with tourist shuttle connections."
    }
  ],
  ev_charging: [
    {
      id: "ev-1",
      name: "Tata Power Fast Charge EV Station",
      category: "EV Charging Station",
      rating: 4.8,
      reviews_count: 120,
      latitude: 11.415,
      longitude: 76.701,
      address: "Central Parking Lot, Ooty",
      opening_hours: "24 Hours",
      images: ["https://images.unsplash.com/photo-1563720223185-11003d516935?w=600"],
      description: "60kW DC fast charging station for electric vehicles."
    }
  ],
  parking: [
    {
      id: "park-1",
      name: "Municipal Central Car Parking",
      category: "Parking Facility",
      rating: 4.5,
      reviews_count: 450,
      latitude: 11.408,
      longitude: 76.699,
      address: "Near Commercial Street, Ooty",
      opening_hours: "24 Hours",
      images: ["https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600"],
      description: "Safe multi-level car parking facility with 24/7 CCTV surveillance."
    }
  ],
  travel_schedule: [
    {
      time: "09:00 AM",
      title: "Morning Garden Walk & Botanical Tour",
      duration: "2 Hours",
      description: "Explore paved level pathways at Botanical Gardens. Enjoy rare orchids and glasshouse displays.",
      safety_tips: "Wheelchair accessible ramps available at main entrance."
    },
    {
      time: "11:30 AM",
      title: "Charing Cross & Chocolate Tasting",
      duration: "1.5 Hours",
      description: "Visit Hill Country Bakery for local chocolate tasting and coffee.",
      safety_tips: "Level walking route with bench seating every 100 meters."
    },
    {
      time: "02:00 PM",
      title: "Lunch at The Highland Grill",
      duration: "1 Hour",
      description: "Relaxed lunch with warm soups and South Indian thalis.",
      safety_tips: "Dietary options available for diabetic & low-sodium needs."
    },
    {
      time: "03:30 PM",
      title: "Ooty Lake Promenade & Boat House",
      duration: "2 Hours",
      description: "Calm lake breeze walk and optional covered motorboat ride.",
      safety_tips: "Life jackets compulsory for all group members on boats."
    }
  ],
  petrol_stations: [
    {
      id: "pet-1",
      name: "HP Petroleum & Fuel Station",
      category: "Petrol Station",
      rating: 4.6,
      reviews_count: 520,
      latitude: 11.407,
      longitude: 76.687,
      address: "Highway Junction, Ooty",
      opening_hours: "24 Hours",
      phone: "+91 423 244 7001",
      images: [],
      description: "Petrol, Diesel & air pressure refill. 24/7 service."
    }
  ],
  crowd_prediction: "Low to Moderate",
  weather_advice: "Pleasant mountain weather (~22°C). Carry light jackets for late afternoon breezes.",
  emergency_suggestions: ["Keep hospital emergency hotline saved (+91 423 244 1000)", "Stay within 300m of group centroid"],
  hidden_gems: ["Pine Forest Eco Walk", "Tea Factory Museum"],
  local_foods: ["Handmade Dark Chocolate", "Hot Apple Pie", "Ooty Varkey"],
  photo_spots: ["Rose Garden Terrace", "Ooty Lake Pier"],
  things_to_avoid: ["Steep unpaved mountain climbs for seniors"],
  recommended_route: ["Botanical Gardens -> Charing Cross -> Ooty Lake"],
  travel_tips: ["Wear comfortable walking shoes", "Carry refillable water bottles"],
  news_articles: [],
  news_summary: "Current conditions in Ooty are favorable for tourists. Medical services are operational, key routes are clear, and the weather is pleasant with low rain probability.",
};

interface TripContextType {
  activeTrip: TripPlan | null;
  setActiveTrip: (trip: TripPlan | null) => void;
  savedTrips: TripPlan[];
  setSavedTrips: React.Dispatch<React.SetStateAction<TripPlan[]>>;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState<TripPlan | null>(DEFAULT_INITIAL_TRIP);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([DEFAULT_INITIAL_TRIP]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  return (
    <TripContext.Provider value={{ activeTrip, setActiveTrip, savedTrips, setSavedTrips, isGenerating, setIsGenerating }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within TripProvider');
  return context;
};
