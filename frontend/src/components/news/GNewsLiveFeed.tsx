import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Bookmark,
  Share2,
  MessageSquare,
  Clock,
  Building2,
  ShieldAlert,
  Flame,
  Filter,
  CheckCircle2,
  AlertCircle,
  Compass,
  MapPin,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../../services/api';
import { GNewsArticle, OverallAIRecommendation, NewsFeedResponse } from '../../types/news';
import { AIExplanationModal } from './AIExplanationModal';
import { NewsAIChatPanel } from './NewsAIChatPanel';
import { useSearchParams } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';

interface GNewsLiveFeedProps {
  initialDestination?: string;
  showTitleSection?: boolean;
}

export const GNewsLiveFeed: React.FC<GNewsLiveFeedProps> = ({
  initialDestination = 'Ooty',
  showTitleSection = true
}) => {
  const { activeTrip } = useTrip();
  const [searchParams] = useSearchParams();
  const urlDestination = searchParams.get('destination');

  // State Management
  const [destination, setDestination] = useState<string>(
    urlDestination || activeTrip?.destination || initialDestination
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeDateFilter, setActiveDateFilter] = useState<string>('All');

  const [articles, setArticles] = useState<GNewsArticle[]>([]);
  const [newsSummary, setNewsSummary] = useState<string>('');
  const [overallRecommendation, setOverallRecommendation] = useState<OverallAIRecommendation | undefined>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gnews_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal & AI Chat States
  const [selectedArticleForModal, setSelectedArticleForModal] = useState<GNewsArticle | null>(null);
  const [selectedArticleForChat, setSelectedArticleForChat] = useState<GNewsArticle | null>(null);

  // Auto-refresh countdown timer (seconds)
  const [refreshCountdown, setRefreshCountdown] = useState<number>(180);

  // Popular Destinations List
  const popularDestinations = [
    'Yercaud', 'Ooty', 'Manali', 'Goa', 'Munnar', 'Kodaikanal', 'Shimla', 'Rishikesh', 'Jaipur', 'Darjeeling', 'Coimbatore', 'Bengaluru'
  ];

  const [customLocInput, setCustomLocInput] = useState<string>('');
  const [showCustomLocInput, setShowCustomLocInput] = useState<boolean>(false);

  // Filter Options
  const categoryFilters = [
    'All', 'Breaking', 'Tourism', 'Weather', 'Safety', 'Transport', 'Events', 'Food'
  ];

  const dateFilters = ['All', 'Today', 'Yesterday', 'This Week'];

  // Fetch Live News from FastAPI Backend
  const fetchNews = async (targetDest: string) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await api.get<NewsFeedResponse>(`/news/feed?destination=${encodeURIComponent(targetDest)}`).catch(async () => {
        return await api.get<NewsFeedResponse>(`/news/latest?destination=${encodeURIComponent(targetDest)}`);
      }).catch(async () => {
        return await axios.get<NewsFeedResponse>(`/api/v1/news/feed?destination=${encodeURIComponent(targetDest)}`);
      });

      const data = response.data;
      setArticles(data.articles || (data as any).news || []);
      setNewsSummary(data.news_summary || (data as any).summary || '');
      setOverallRecommendation(data.overall_ai_recommendation);
      setRefreshCountdown(180); // Reset timer
    } catch (err) {
      console.error("Failed to fetch news from backend:", err);
      setIsError(true);
      toast.error(`Failed to fetch live GNews for ${targetDest}. Showing cached news.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep destination in sync with prop or active trip changes
  useEffect(() => {
    const target = urlDestination || activeTrip?.destination || initialDestination;
    if (target && target !== destination) {
      setDestination(target);
    }
  }, [initialDestination, activeTrip?.destination, urlDestination]);

  useEffect(() => {
    if (destination) {
      fetchNews(destination);
    }
  }, [destination]);

  // Auto Refresh Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          fetchNews(destination);
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [destination]);

  // Toggle Bookmarks
  const toggleBookmark = (article: GNewsArticle) => {
    const isSaved = bookmarkedIds.includes(article.id);
    let updated: string[];

    if (isSaved) {
      updated = bookmarkedIds.filter(id => id !== article.id);
      toast.success("Removed from saved news");
    } else {
      updated = [...bookmarkedIds, article.id];
      toast.success("Saved to bookmarks!");
    }

    setBookmarkedIds(updated);
    try {
      localStorage.setItem('gnews_bookmarks', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Share Article
  const handleShare = (article: GNewsArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(article.url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Custom Place Search Submit
  const handleCustomLocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLocInput.trim()) {
      setDestination(customLocInput.trim());
      setShowCustomLocInput(false);
      setCustomLocInput('');
    }
  };

  // Filtered Articles Computation
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q);

      const matchesCategory =
        activeCategory === 'All' ||
        (activeCategory === 'Breaking' && (a.travel_impact?.includes('High') || a.travel_impact?.includes('🔴'))) ||
        a.category.toLowerCase() === activeCategory.toLowerCase();

      const matchesDate =
        activeDateFilter === 'All' ||
        (activeDateFilter === 'Today' && a.published_at.toLowerCase().includes('today')) ||
        (activeDateFilter === 'Yesterday' && a.published_at.toLowerCase().includes('yesterday')) ||
        (activeDateFilter === 'This Week' && !a.published_at.toLowerCase().includes('4 days'));

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [articles, searchQuery, activeCategory, activeDateFilter]);

  // Breaking headlines for horizontal live ticker
  const breakingHeadlines = useMemo(() => {
    return articles.slice(0, 5).map(a => `${a.source}: ${a.title}`);
  }, [articles]);

  return (
    <div className="space-y-6">
      {/* ── TOP SECTION: Header & Destination Switcher ── */}
      {showTitleSection && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xl text-slate-900 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFBA00] text-black shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                Live GNews Feed
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Auto-refetches in {Math.floor(refreshCountdown / 60)}m {refreshCountdown % 60}s
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight text-slate-900 flex items-center gap-2">
              Today's News Briefing <Newspaper className="w-7 h-7 text-[#FFBA00]" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Real-time Google News collected and analyzed by Groq LLM (Llama 3.1 8B Instant).
            </p>
          </div>

          {/* Destination Selector Controls */}
          <div className="flex flex-wrap items-center gap-2 relative z-10">
            {showCustomLocInput ? (
              <form onSubmit={handleCustomLocSubmit} className="flex items-center gap-1.5 bg-slate-50 border border-[#FFBA00] p-1 rounded-2xl">
                <input
                  type="text"
                  value={customLocInput}
                  onChange={(e) => setCustomLocInput(e.target.value)}
                  placeholder="Type any place (e.g. Yercaud)..."
                  className="bg-transparent text-slate-900 text-xs px-2.5 py-1 focus:outline-none w-40 font-medium"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black text-xs font-black transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomLocInput(false)}
                  className="px-2 py-1 text-slate-400 hover:text-slate-900 text-xs font-bold"
                >
                  ×
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#FFBA00]" />
                <span className="text-slate-500 font-semibold">Location:</span>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-transparent text-slate-900 font-black focus:outline-none cursor-pointer pr-2"
                >
                  {!popularDestinations.includes(destination) && (
                    <option value={destination} className="bg-white text-slate-900">{destination}</option>
                  )}
                  {popularDestinations.map(d => (
                    <option key={d} value={d} className="bg-white text-slate-900">{d}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCustomLocInput(true)}
                  className="text-[10px] text-[#FFBA00] font-black underline ml-1"
                  title="Search custom place"
                >
                  + Change
                </button>
              </div>
            )}

            <button
              onClick={() => fetchNews(destination)}
              disabled={isLoading}
              className="p-2.5 rounded-2xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black border border-[#FFBA00] transition-all flex items-center gap-1 text-xs font-black"
              title="Refresh News"
            >
              <RefreshCw className={`w-4 h-4 text-black ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* ── ANIMATED HORIZONTAL NEWS BANNER (LIVE TICKER) ── */}
      {breakingHeadlines.length > 0 && (
        <div className="relative rounded-2xl bg-white text-slate-900 p-2.5 border border-slate-200 shadow-md overflow-hidden flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-[11px] tracking-wider uppercase shadow-md animate-pulse">
            <Flame className="w-3.5 h-3.5" /> Breaking News
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-800 flex-shrink-0 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" /> LIVE
          </div>

          <div className="flex-1 overflow-hidden relative text-xs text-slate-700 font-bold whitespace-nowrap">
            <motion.div
              animate={{ x: ['100%', '-100%'] }}
              transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
              className="inline-block whitespace-nowrap"
            >
              {breakingHeadlines.join("  •  ")}
            </motion.div>
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (Rain, Traffic, Festival, Hotel...)"
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFBA00]/40 transition-all font-medium text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs w-full sm:w-auto overflow-x-auto">
            {dateFilters.map(df => (
              <button
                key={df}
                onClick={() => setActiveDateFilter(df)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                  activeDateFilter === df
                    ? 'bg-[#FFBA00] text-black font-black shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {df}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3 h-3 text-[#FFBA00]" /> Categories:
          </span>
          {categoryFilters.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#FFBA00] text-black border-[#FFBA00] shadow-md scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {cat === 'Breaking' ? '🔥 Breaking' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GROQ LLM OVERALL DESTINATION AI BRIEFING BOX ── */}
      {newsSummary && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-[#FFBA00]/10 border border-[#FFBA00]/30 shadow-md relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFBA00] text-black flex items-center justify-center shadow-md font-black">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 font-outfit">
                  Groq LLM Intelligence Briefing for {destination}
                </h3>
                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                  Combined Analysis of Live News Reports
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-[#FFBA00] text-black px-2.5 py-1 rounded-full border border-[#FFBA00]">
              Llama 3.1 8B Instant
            </span>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
            {newsSummary}
          </p>

          {overallRecommendation && (
            <div className="mt-4 pt-3 border-t border-[#FFBA00]/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Visit Status Today</span>
                <span className="font-extrabold text-emerald-700 block mt-0.5">{overallRecommendation.should_visit_today}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Best Visiting Hours</span>
                <span className="font-extrabold text-[#FFBA00] block mt-0.5">{overallRecommendation.best_visiting_time}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Alternative Location</span>
                <span className="font-extrabold text-slate-800 block mt-0.5 truncate">{overallRecommendation.alternative_destination}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Things to Avoid</span>
                <span className="font-extrabold text-rose-600 block mt-0.5 truncate">{overallRecommendation.things_to_avoid}</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── LOADING STATE: SKELETON CARDS ── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md space-y-4 animate-pulse">
              <div className="h-48 bg-slate-200 rounded-2xl w-full" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
              <div className="h-8 bg-slate-200 rounded-xl w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* ── ERROR STATE ── */}
      {isError && !isLoading && (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Failed to Load GNews Feed</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Unable to connect to GNews API server. Please check your connection or retry.
          </p>
          <button
            onClick={() => fetchNews(destination)}
            className="px-5 py-2.5 rounded-2xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs shadow-md transition-all"
          >
            Retry News Search
          </button>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!isLoading && !isError && filteredArticles.length === 0 && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-[#FFBA00]/20 text-[#FFBA00] flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 font-outfit">No Recent News Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No news articles match your filter "{searchQuery || activeCategory}". Try resetting your filters or searching another destination.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setActiveDateFilter('All');
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs shadow-md"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── NEWS CARDS GRID (3 cols) ── */}
      {!isLoading && !isError && filteredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => {
            const isBookmarked = bookmarkedIds.includes(article.id);
            const impactScore = article.travel_impact || '🟢 No Impact';
            const isHighImpact = impactScore.includes('High') || impactScore.includes('🔴');

            return (
              <motion.div
                key={article.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative bg-white rounded-3xl border border-slate-200 shadow-md hover:border-[#FFBA00] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden text-slate-900"
              >
                <div className="relative h-52 overflow-hidden bg-slate-900">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFBA00] text-black shadow-md">
                      {article.category}
                    </span>

                    <button
                      onClick={() => toggleBookmark(article)}
                      className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                        isBookmarked
                          ? 'bg-[#FFBA00] text-black font-black'
                          : 'bg-slate-900/60 text-white hover:bg-slate-900'
                      }`}
                      title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200 font-semibold z-10">
                    <span className="flex items-center gap-1 text-[#FFBA00]">
                      <Building2 className="w-3.5 h-3.5" /> {article.source}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-[#FFBA00]" /> {article.published_at}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 font-outfit line-clamp-2 leading-snug group-hover:text-[#FFBA00] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                      {article.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-xl font-bold text-[11px] border ${
                      isHighImpact
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : impactScore.includes('Medium') || impactScore.includes('🟡')
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      Impact: {impactScore}
                    </span>

                    {article.tourist_recommendation && (
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {article.tourist_recommendation}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedArticleForModal(article)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>AI Explanation</span>
                    </button>

                    <button
                      onClick={() => setSelectedArticleForChat(article)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-[#FFBA00] text-slate-700 hover:text-black transition-all cursor-pointer"
                      title="Ask AI about this article"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShare(article)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                      title="Share Article"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black transition-all shadow-md cursor-pointer"
                      title="Read Full Article on Publisher Site (New Tab)"
                    >
                      <ExternalLink className="w-4 h-4 text-black" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AI Explanation Modal */}
      <AIExplanationModal
        article={selectedArticleForModal}
        isOpen={!!selectedArticleForModal}
        onClose={() => setSelectedArticleForModal(null)}
        destination={destination}
        overallRecommendation={overallRecommendation}
      />

      {/* AI Chat Side Panel */}
      <NewsAIChatPanel
        isOpen={!!selectedArticleForChat}
        onClose={() => setSelectedArticleForChat(null)}
        selectedArticle={selectedArticleForChat}
        destination={destination}
      />
    </div>
  );
};
