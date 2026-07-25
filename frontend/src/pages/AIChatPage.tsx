import React, { useState } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { SaaSCard } from '../components/ui/SaaSCard';
import { SaaSButton } from '../components/ui/SaaSButton';
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
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-4 text-slate-900 bg-white min-h-[85vh]">
      <SaaSCard className="p-4 sm:p-6 flex items-center justify-between border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 font-outfit">AI Travel & Health Assistant</h1>
            <span className="text-xs text-[#FFBA00] font-black">Destination Context: {destination}</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFBA00] text-black border border-[#FFBA00]">
          Groq LLM Active
        </span>
      </SaaSCard>

      <SaaSCard className="p-4 sm:p-6 h-[500px] overflow-y-auto space-y-4 border-slate-200 bg-white">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[#FFBA00] border border-[#FFBA00] flex items-center justify-center text-black font-black shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`p-4 rounded-2xl max-w-[80%] text-xs sm:text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#FFBA00] text-black font-black rounded-tr-none shadow-md'
                : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-tl-none font-medium'
            }`}>
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#FFBA00] font-black animate-pulse p-2">
            <Sparkles className="w-4 h-4 text-[#FFBA00]" /> Groq AI is generating response...
          </div>
        )}
      </SaaSCard>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${destination} route, weather, hotels, or health tips...`}
          className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFBA00]/40"
        />
        <SaaSButton
          type="submit"
          disabled={loading || !input.trim()}
          variant="gold"
          size="md"
        >
          <Send className="w-4 h-4 text-black" />
        </SaaSButton>
      </form>
    </div>
  );
};
