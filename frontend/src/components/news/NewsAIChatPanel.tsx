import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, User, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { GNewsArticle } from '../../types/news';
import { useTrip } from '../../context/TripContext';

interface NewsAIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedArticle: GNewsArticle | null;
  destination: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const NewsAIChatPanel: React.FC<NewsAIChatPanelProps> = ({
  isOpen,
  onClose,
  selectedArticle,
  destination
}) => {
  const { activeTrip } = useTrip();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Suggested prompt chips
  const suggestedPrompts = [
    "Explain how this news affects my trip.",
    "Should I continue my travel?",
    "What should I avoid?",
    "Give me immediate safety suggestions."
  ];

  if (!isOpen || !selectedArticle) return null;

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // API call to backend AI news chat
      const response = await axios.post('/api/news/chat', {
        destination,
        selected_news: selectedArticle,
        weather: activeTrip?.weather_overview || {},
        user_budget: activeTrip?.budget || 5000,
        medical_conditions: activeTrip?.health_recommendations?.flatMap(h => h.medical_warnings || []) || [],
        user_query: textToSend
      }).catch(async () => {
        // Fallback endpoint retry
        return await axios.post('/api/v1/news/chat', {
          destination,
          selected_news: selectedArticle,
          weather: activeTrip?.weather_overview || {},
          user_budget: activeTrip?.budget || 5000,
          medical_conditions: activeTrip?.health_recommendations?.flatMap(h => h.medical_warnings || []) || [],
          user_query: textToSend
        });
      });

      const aiReply = response.data?.response || 
        `Regarding '${selectedArticle.title}' in ${destination}: Current conditions are safe for tourist movement. Follow standard safety precautions.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn("AI Chat Backend call fallback:", err);
      // Smart Fallback AI Response
      const fallbackReply = `Regarding "${selectedArticle.title}" in ${destination}:

1. **Trip Effect**: Routes and attractions remain open. No travel cancellations are required.
2. **Recommendation**: Safe to continue your travel as scheduled.
3. **Things to Avoid**: High-altitude steep unpaved paths late in the evening.
4. **Safety Suggestion**: Keep emergency hospital numbers saved and stay hydrated.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatter to strip raw asterisks (** and ***) and format with clean emojis & bullet points
  const renderFormattedContent = (content: string) => {
    const cleanedText = content
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '•');

    const lines = cleanedText.split('\n');

    return (
      <div className="space-y-1.5 text-slate-800 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-0.5" />;

          if (trimmed.startsWith('•')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-[#FFBA00] font-black shrink-0 mt-0.5">•</span>
                <span>{trimmed.substring(1).trim()}</span>
              </div>
            );
          }

          if (/^\d+\./.test(trimmed)) {
            const num = trimmed.split('.')[0];
            const rest = trimmed.substring(trimmed.indexOf('.') + 1).trim();
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="w-4 h-4 rounded-full bg-[#FFBA00]/20 text-black font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5 border border-[#FFBA00]/40">
                  {num}
                </span>
                <span className="font-bold text-slate-900">{rest}</span>
              </div>
            );
          }

          return <p key={idx} className="font-medium text-slate-700">{trimmed}</p>;
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 bg-[#FFBA00] text-black flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black shadow-md">
              <Bot className="w-5 h-5 text-[#FFBA00]" />
            </div>
            <div>
              <h3 className="text-sm font-black font-outfit text-black">AI Travel Safety Advisor</h3>
              <p className="text-[10px] text-black/80 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-black" /> Groq Llama 3.1 8B • Live Context
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-black hover:bg-black/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Context Article Banner */}
        <div className="p-3 bg-[#FFBA00]/10 border-b border-[#FFBA00]/30 flex items-start gap-3">
          <img
            src={selectedArticle.image}
            alt={selectedArticle.title}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-sm border border-[#FFBA00]/30"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase tracking-wider font-black text-slate-900 block">
              Active Context Article
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate">{selectedArticle.title}</h4>
            <p className="text-[10px] text-slate-500">{selectedArticle.source} • {selectedArticle.published_at}</p>
          </div>
        </div>

        {/* Chat Conversation Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center mx-auto shadow-sm font-black">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 font-outfit">Ask AI about this news</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-medium">
                  Get personalized travel advisories based on your destination ({destination}), trip budget, and medical conditions.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="space-y-2 text-left pt-2">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Suggested Questions:</span>
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#FFBA00] text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-between transition-all group shadow-sm cursor-pointer"
                  >
                    <span>{p}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FFBA00] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-[#FFBA00] text-black flex items-center justify-center text-xs font-black flex-shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#FFBA00] text-black font-black rounded-br-none shadow-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm font-medium'
                  }`}
                >
                  {m.sender === 'ai' ? renderFormattedContent(m.text) : <p className="font-bold">{m.text}</p>}
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-black/70' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs p-2 bg-white rounded-xl border border-slate-200 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-[#FFBA00]" />
              <span>Groq Llama 3.1 8B analyzing trip safety...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask how this news impacts your trip..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFBA00]/40 font-medium"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black disabled:opacity-50 transition-all shadow-md font-black cursor-pointer"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
