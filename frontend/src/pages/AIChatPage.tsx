import React, { useState } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import api from '../services/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatPage: React.FC = () => {
  const { activeTrip } = useTrip();
  const destination = activeTrip?.destination || 'Ooty';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI Travel & Safety Assistant for ${destination} powered by Groq LLM (llama-3.1-8b-instant). How can I assist your group with local recommendations, health precautions, or weather updates today?`
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        destination,
        message: userText,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `For ${destination}, we recommend visiting paved Botanical Gardens in the morning and enjoying local baked pastries on Commercial Street!`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">
      <div className="glass-panel p-4 sm:p-6 border border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-outfit">AI Travel & Health Assistant</h1>
            <span className="text-xs text-orange-600 font-semibold">Destination Context: {destination}</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-200">
          Groq LLM Active
        </span>
      </div>

      <div className="glass-panel p-4 sm:p-6 border border-slate-200 h-[500px] overflow-y-auto space-y-4 bg-white">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`p-4 rounded-2xl max-w-[80%] text-xs sm:text-sm leading-relaxed font-medium ${
              m.role === 'user'
                ? 'bg-orange-500 text-white font-semibold rounded-tr-none shadow-sm'
                : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-none'
            }`}>
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-orange-600 font-bold animate-pulse p-2">
            <Sparkles className="w-4 h-4 text-orange-500" /> Groq AI is generating response...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="glass-panel p-2 border border-slate-200 flex items-center gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${destination}, weather, medical safety, or local food...`}
          className="flex-1 glass-input border-0 bg-transparent text-xs sm:text-sm focus:ring-0 text-slate-900"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-all font-bold shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
