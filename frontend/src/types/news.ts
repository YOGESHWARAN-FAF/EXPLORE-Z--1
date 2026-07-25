export interface AIExplanation {
  what_happened: string;
  why_happened: string;
  where_happened: string;
  who_affected: string;
  tourist_importance: string;
  precautions: string;
  travel_impact_details: string;
}

export interface GNewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  publishedAt?: string;
  published_at: string;
  source: string;
  author?: string;
  url: string;
  image: string;
  category: string;
  language?: string;
  country?: string;
  reading_time?: string;
  ai_summary?: string;
  travel_impact?: string; // "🟢 No Impact" | "🟡 Medium" | "🔴 High"
  tourist_recommendation?: string;
  ai_explanation?: AIExplanation;
}

export interface OverallAIRecommendation {
  should_visit_today: string;
  best_visiting_time: string;
  alternative_destination: string;
  things_to_avoid: string;
  emergency_suggestions: string[];
}

export interface NewsFeedResponse {
  destination: string;
  news_summary: string;
  overall_ai_recommendation: OverallAIRecommendation;
  articles: GNewsArticle[];
  news: GNewsArticle[];
}
