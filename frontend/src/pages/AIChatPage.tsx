import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Bot, User, Copy, Check, Plus, 
  History, Trash2, MapPin, X, MessageSquare, Clock, ArrowRight, PanelLeft, ChevronRight
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  saveChatSessionToFirebase, 
  fetchUserChatSessionsFromFirebase, 
  deleteUserChatSessionFromFirebase,
  ChatSession 
} from '../services/firebase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIChatPage: React.FC = () => {
  const { activeTrip } = useTrip();
  const { user } = useAuth();
  const destination = activeTrip?.destination || 'Ooty';

  // Current session state
  const [sessionId, setSessionId] = useState<string>(`session_${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `👋 Hello ${user?.name ? user.name.split(' ')[0] : 'Traveler'}! I am your professional AI Tourist & Route Assistant for ${destination} ⛰️\n\nI can help you with:\n• 🌟 Must-visit scenic places and hidden spots\n• 🍲 Authentic local foods and famous bakery stops\n• 🌦️ Live weather updates and packing recommendations\n• 🏥 24/7 Hospitals, pharmacies, and medical assistance\n• 🚶 Accessibility and senior-friendly travel advice\n\nWhat would you like to explore today for ${destination}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Left Sidebar State for Mobile Drawer Toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch saved chat sessions from Firebase under user UID on load
  useEffect(() => {
    if (user?.uid) {
      fetchUserChatSessionsFromFirebase(user.uid)
        .then(sessions => {
          if (sessions && sessions.length > 0) {
            setSavedSessions(sessions);
          }
        })
        .catch(err => console.log('Firebase fetch chat sessions error:', err));
    }
  }, [user?.uid]);

  // Persist current chat session to Firebase
  const persistSession = (currentMsgs: ChatMessage[], currentSessId: string) => {
    if (!user?.uid || currentMsgs.length <= 1) return;

    const firstUserMsg = currentMsgs.find(m => m.role === 'user')?.content || `Chat for ${destination}`;
    const title = firstUserMsg.length > 28 ? `${firstUserMsg.slice(0, 28)}...` : firstUserMsg;

    const sessionData: ChatSession = {
      id: currentSessId,
      title: `💬 ${title}`,
      destination,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_uid: user.uid,
      messages: currentMsgs
    };

    saveChatSessionToFirebase(user.uid, sessionData)
      .then(() => {
        setSavedSessions(prev => {
          const filtered = prev.filter(s => s.id !== currentSessId);
          return [sessionData, ...filtered];
        });
      })
      .catch(err => console.log('Error persisting chat session:', err));
  };

  const handleSend = async (userQuery?: string) => {
    const textToSend = (userQuery || input).trim();
    if (!textToSend || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp
    };

    const updatedMsgs = [...messages, newUserMsg];
    setMessages(updatedMsgs);
    if (!userQuery) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome-msg')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/ai/chat', {
        session_id: sessionId,
        destination,
        message: textToSend,
        history: historyPayload
      });

      const assistantReply = res.data.reply || `Here are our AI recommendations for ${destination}!`;

      const finalMsgs: ChatMessage[] = [
        ...updatedMsgs,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];

      setMessages(finalMsgs);
      persistSession(finalMsgs, sessionId);
    } catch (err) {
      console.error('Chat API Error:', err);
      const fallbackMsgs: ChatMessage[] = [
        ...updatedMsgs,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `🌲 For ${destination}:\n• Visit paved garden trails during morning hours for clear mountain views 🌄\n• Enjoy fresh hot tea and bakery pastries at central checkpoints ☕\n• Keep light woolens handy as evening temperatures drop pleasantly 🧣`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(fallbackMsgs);
      persistSession(fallbackMsgs, sessionId);
    } finally {
      setLoading(false);
    }
  };

  // Option 1: Start New Chat
  const handleStartNewChat = () => {
    const newSessId = `session_${Date.now()}`;
    setSessionId(newSessId);
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `👋 New Chat Started! How can I assist you with your trip to ${destination} ⛰️?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsMobileSidebarOpen(false);
    toast.success('Started a new chat session! 🚀');
  };

  // Option 2: Select a Chat Session from Left Sidebar History
  const handleSelectHistorySession = (session: ChatSession) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setIsMobileSidebarOpen(false);
    toast.success(`Loaded chat: ${session.title}`);
  };

  // Delete Chat Session from Firebase
  const handleDeleteSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    await deleteUserChatSessionFromFirebase(user.uid, sessId);
    setSavedSessions(prev => prev.filter(s => s.id !== sessId));
    toast.success('Deleted chat session');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Message copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clean Markdown & Remove raw asterisks (NO **, ***)
  const renderFormattedContent = (content: string) => {
    const cleanedText = content
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '•');

    const lines = cleanedText.split('\n');

    return (
      <div className="space-y-2 text-slate-800 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          if (trimmed.startsWith('•')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#FFBA00] font-black shrink-0 mt-0.5">•</span>
                <span>{trimmed.substring(1).trim()}</span>
              </div>
            );
          }

          if (/^\d+\./.test(trimmed)) {
            const num = trimmed.split('.')[0];
            const rest = trimmed.substring(trimmed.indexOf('.') + 1).trim();
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-5 h-5 rounded-full bg-[#FFBA00]/20 text-black font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-[#FFBA00]/40">
                  {num}
                </span>
                <span className="font-semibold text-slate-900">{rest}</span>
              </div>
            );
          }

          return <p key={idx} className="font-medium text-slate-700">{trimmed}</p>;
        })}
      </div>
    );
  };

  const promptSuggestions = [
    { label: `⛰️ Top 3 Attractions in ${destination}`, query: `What are the top 3 must-visit tourist places in ${destination}?` },
    { label: `🍲 Local Foods & Bakeries`, query: `Recommend best local dishes, tea spots, and bakeries in ${destination}.` },
    { label: `🌦️ Weather & Packing Advice`, query: `What is the current weather condition and recommended clothing for ${destination}?` },
    { label: `🏥 Emergency Medical Care`, query: `Where is the nearest 24/7 hospital or trauma care desk in ${destination}?` },
    { label: `❤️ Senior Health Precautions`, query: `What are safety and walking recommendations for senior group members traveling in ${destination}?` }
  ];

  return (
    <div className="max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-4 md:px-6 bg-white text-slate-900 min-h-[85vh] animate-fadeIn">
      {/* ChatGPT / Gemini 2-Column Responsive Layout */}
      <div className="flex flex-col md:flex-row gap-4 h-[80vh] sm:h-[82vh] relative">

        {/* LEFT SIDEBAR: Chat History & New Chat (ChatGPT / Gemini Style) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white md:bg-slate-50/90 border-r border-slate-200/90 p-4 flex flex-col justify-between shadow-2xl md:shadow-none transition-transform duration-300 md:static md:translate-x-0 md:rounded-3xl md:border md:z-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            {/* Sidebar Top: Mobile Close Button & Brand */}
            <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#FFBA00]" />
                <span className="font-black font-outfit text-sm text-slate-900">Chat History</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* "+ New Chat" Button */}
            <button
              onClick={handleStartNewChat}
              className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#FFBA00]/20 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>+ New Chat</span>
            </button>

            {/* Chat History Header Label */}
            <div className="flex items-center justify-between px-2 pt-2 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/80 pb-2">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#FFBA00]" /> History
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-mono font-bold">
                {savedSessions.length}
              </span>
            </div>

            {/* Scrollable Chat Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {savedSessions.length === 0 ? (
                <div className="p-4 text-center space-y-2 bg-white/60 rounded-2xl border border-dashed border-slate-300 mt-4">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">No chat history yet</p>
                  <p className="text-[10px] text-slate-400">Ask questions to automatically record chat history under your UID.</p>
                </div>
              ) : (
                savedSessions.map((sess) => {
                  const isCurrent = sess.id === sessionId;
                  const formattedDate = sess.updated_at
                    ? new Date(sess.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectHistorySession(sess)}
                      className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                        isCurrent
                          ? 'bg-white border-[#FFBA00] ring-2 ring-[#FFBA00]/30 shadow-md font-bold text-slate-900'
                          : 'bg-white/70 hover:bg-white border-slate-200 text-slate-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-[#FFBA00]' : 'text-slate-400'}`} />
                          <span className="text-xs font-extrabold text-slate-900 truncate block">
                            {sess.title.replace('💬 ', '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{sess.destination}</span>
                          <span>•</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar Footer User Info */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-[#FFBA00] text-black font-black flex items-center justify-center text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="font-bold text-slate-800 truncate">{user?.name || 'Active User'}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Synced
            </span>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          />
        )}

        {/* RIGHT MAIN CHAT WINDOW (ChatGPT / Gemini Viewport) */}
        <main className="flex-1 flex flex-col justify-between border border-slate-200 rounded-2xl sm:rounded-3xl bg-white shadow-xl relative overflow-hidden">
          {/* Header Bar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mobile Sidebar Toggle Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 hover:text-[#FFBA00] transition flex items-center justify-center shrink-0"
                title="Open Chat History Sidebar"
              >
                <PanelLeft className="w-5 h-5 text-[#FFBA00]" />
              </button>

              <div className="w-9 h-9 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shadow-[#FFBA00]/20 shrink-0">
                <Bot className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black font-outfit text-slate-900 truncate">AI Tourist Assistant</h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFBA00] text-black text-[9px] font-black uppercase tracking-wider shrink-0">
                    Groq LLM
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#FFBA00] shrink-0" /> Context: <span className="font-bold text-slate-800 truncate">{destination}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleStartNewChat}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#FFBA00] text-slate-800 hover:text-black font-extrabold text-xs transition items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-5 p-3 sm:p-5 bg-slate-50/40 relative scrollbar-thin">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 sm:gap-3.5 ${isAssistant ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                >
                  {/* Bot Avatar */}
                  {isAssistant && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shrink-0 mt-0.5 shadow-md shadow-[#FFBA00]/20">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </div>
                  )}

                  {/* Message Content Bubble */}
                  <div className="space-y-1 max-w-[88%] sm:max-w-[80%]">
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm shadow-sm transition-all ${
                        isAssistant
                          ? 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-none space-y-2'
                          : 'bg-[#FFBA00] text-black font-semibold rounded-tr-none shadow-md shadow-[#FFBA00]/20'
                      }`}
                    >
                      {isAssistant ? renderFormattedContent(m.content) : <p className="leading-relaxed font-bold">{m.content}</p>}
                    </div>

                    <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 font-mono font-bold ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                      <span>{m.timestamp}</span>
                      {isAssistant && (
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-slate-700 transition flex items-center gap-1 text-slate-400 cursor-pointer ml-1"
                          title="Copy Message"
                        >
                          {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {!isAssistant && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0 mt-0.5 shadow-md">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Gemini Style Animated Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600 animate-fadeIn p-2">
                <div className="w-8 h-8 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black shadow-md shrink-0">
                  <Sparkles className="w-4 h-4 text-black animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#FFBA00] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#FFBA00] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#FFBA00] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 font-mono font-extrabold ml-1">AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Bottom Area: Prompt Suggestion Chips & Floating Input Bar */}
          <div className="p-3 border-t border-slate-100 bg-white space-y-2">
            {/* Quick Prompt Suggestion Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-extrabold">
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.query)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-[#FFBA00] text-slate-700 hover:text-black border border-slate-200/90 whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 shadow-sm cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Floating Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2 sm:p-2.5 rounded-3xl bg-white border border-slate-300 shadow-xl flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask AI anything about ${destination} route, food, weather, or health...`}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFBA00] hover:bg-[#FF9F00] disabled:bg-slate-200 text-black disabled:text-slate-400 font-black flex items-center justify-center transition-all duration-200 shadow-md shadow-[#FFBA00]/20 active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </main>

      </div>
    </div>
  );
};
