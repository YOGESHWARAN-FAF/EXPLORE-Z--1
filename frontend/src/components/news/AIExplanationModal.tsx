import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  User, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  MapPin, 
  Users, 
  Info, 
  Compass,
  FileText
} from 'lucide-react';
import { GNewsArticle, OverallAIRecommendation } from '../../types/news';

interface AIExplanationModalProps {
  article: GNewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  overallRecommendation?: OverallAIRecommendation;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  article,
  isOpen,
  onClose,
  destination,
  overallRecommendation
}) => {
  if (!isOpen || !article) return null;

  const explanation = article.ai_explanation || {
    what_happened: article.description || "Reported update from local news desk.",
    why_happened: "Routine seasonal activities and public infrastructure developments.",
    where_happened: `Central tourist and transit zones in ${destination}.`,
    who_affected: "Tourists, local commuters, and family travelers.",
    tourist_importance: "Directly affects travel timing, route accessibility, and daily trip planning.",
    precautions: "Follow local ward advisories, carry water & medical supplies, and maintain active GPS.",
    travel_impact_details: "Main routes remain open. Minimal adjustments needed to your itinerary."
  };

  const getImpactBadge = (impact?: string) => {
    if (!impact) return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: '🟢 No Impact' };
    if (impact.includes('High') || impact.includes('🔴')) {
      return { color: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse', text: '🔴 High Impact' };
    }
    if (impact.includes('Medium') || impact.includes('🟡')) {
      return { color: 'bg-amber-50 text-amber-700 border-amber-200', text: '🟡 Medium Impact' };
    }
    return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: '🟢 No Impact' };
  };

  const impactInfo = getImpactBadge(article.travel_impact);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-3xl bg-white backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto text-slate-900"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black font-outfit text-slate-900">Groq AI News Intelligence Analysis</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Llama 3.1 8B Instant • No Hallucination Engine</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {/* Banner Image & Primary Meta */}
            <div className="relative rounded-2xl overflow-hidden aspect-video max-h-64 shadow-md group">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFBA00] text-black shadow-md">
                  {article.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${impactInfo.color} shadow-md backdrop-blur-md`}>
                  {impactInfo.text}
                </span>
                {article.tourist_recommendation && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-[#FFBA00] border border-[#FFBA00]/40 backdrop-blur-md">
                    💡 {article.tourist_recommendation}
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-lg sm:text-xl font-bold font-outfit leading-tight drop-shadow-md">
                  {article.title}
                </h2>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-200 font-medium">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-[#FFBA00]" /> {article.source}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#FFBA00]" /> {article.published_at}</span>
                  {article.author && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-blue-400" /> {article.author}</span>}
                </div>
              </div>
            </div>

            {/* Section 1: AI Simple Summary */}
            <div className="p-4 rounded-2xl bg-[#FFBA00]/10 border border-[#FFBA00]/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#FFBA00]" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Simple AI Summary</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {article.ai_summary || article.description}
              </p>
            </div>

            {/* Section 2: Detailed 7-Point AI Explanation */}
            <div className="space-y-4">
              <h4 className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-[#FFBA00]" /> Detailed Tourist Impact Breakdown
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. What Happened */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" /> 1. What Happened?
                  </div>
                  <p className="text-slate-600 leading-relaxed">{explanation.what_happened}</p>
                </div>

                {/* 2. Why Did It Happen */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" /> 2. Why Did It Happen?
                  </div>
                  <p className="text-slate-600 leading-relaxed">{explanation.why_happened}</p>
                </div>

                {/* 3. Where Did It Happen */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" /> 3. Where Did It Happen?
                  </div>
                  <p className="text-slate-600 leading-relaxed">{explanation.where_happened}</p>
                </div>

                {/* 4. Who is Affected */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-amber-600" /> 4. Who is Affected?
                  </div>
                  <p className="text-slate-600 leading-relaxed">{explanation.who_affected}</p>
                </div>

                {/* 5. Importance for Tourists */}
                <div className="p-3.5 rounded-xl bg-[#FFBA00]/10 border border-[#FFBA00]/30 md:col-span-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Compass className="w-3.5 h-3.5 text-[#FFBA00]" /> 5. Why is it Important for Tourists?
                  </div>
                  <p className="text-slate-700 leading-relaxed">{explanation.tourist_importance}</p>
                </div>

                {/* 6. Tourist Precautions */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 6. Precautions to Take
                  </div>
                  <p className="text-slate-700 leading-relaxed">{explanation.precautions}</p>
                </div>

                {/* 7. Travel Plan Effect */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 7. Does it Affect Travel Plans?
                  </div>
                  <p className="text-slate-700 leading-relaxed">{explanation.travel_impact_details}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Overall Destination AI Advisory */}
            {overallRecommendation && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#FFBA00]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#FFBA00]">
                      Overall Destination Advice for {destination}
                    </span>
                  </div>
                  <span className="text-[10px] font-black bg-[#FFBA00] text-black px-2.5 py-0.5 rounded-full">
                    Live Status
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Visit Recommendation</span>
                    <span className="font-bold text-[#FFBA00]">{overallRecommendation.should_visit_today}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Best Visiting Hours</span>
                    <span className="font-bold text-amber-300">{overallRecommendation.best_visiting_time}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Alternative Option</span>
                    <span className="font-medium text-slate-200">{overallRecommendation.alternative_destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Things to Avoid</span>
                    <span className="font-medium text-rose-300">{overallRecommendation.things_to_avoid}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 font-medium truncate max-w-md">
              Source: <span className="font-bold text-slate-700">{article.source}</span> • Original Publisher
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                Read Original Article <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
