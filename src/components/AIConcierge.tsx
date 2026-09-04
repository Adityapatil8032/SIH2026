import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Shield, Compass, Loader2, ArrowRight } from 'lucide-react';
import { sendConciergeMessage } from '../services/api.ts';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

interface AIConciergeProps {
  currentDestination?: string;
  onSelectDestination?: (dest: string) => void;
}

export const AIConcierge: React.FC<AIConciergeProps> = ({
  currentDestination = 'All India',
  onSelectDestination
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Namaste! I am your **Apna Route AI Concierge**, calibrated specifically for travel, routes, and safety across India. 

Ask me anything about destination feasibility, mountain road conditions, seasonal weather, packing essentials, or verified scam-free local transport!`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Where should I travel this month?',
    'Create a 5-day trip to Rajasthan.',
    'Find budget-friendly places.',
    'Is this route safe?',
    'What should I pack?',
    'Best time to visit this place?',
    'Find nearby food.',
    'Find local transport.'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const replyText = await sendConciergeMessage(query, history, currentDestination);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          text: 'Apna Route intelligence service is momentarily refreshing. Please ask again in a moment!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-concierge-section" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-xl border border-slate-800/80 bg-[#121212] shadow-2xl overflow-hidden flex flex-col h-[650px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 shadow-md">
              <Bot className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit'] text-base font-bold text-white">
                  Apna Route AI Concierge
                </h3>
                <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-indigo-400 border border-slate-800">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Context: <span className="text-indigo-300 font-medium">{currentDestination}</span> • Trained on 500+ Indian routes
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            <span>Safety Checked Guidance</span>
          </div>
        </div>

        {/* Suggested Prompts Pills */}
        <div className="border-b border-slate-800/80 bg-slate-950/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-medium text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" /> Suggested:
          </span>
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              id={`suggested-prompt-${i}`}
              onClick={() => handleSend(prompt)}
              className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 shrink-0 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-indigo-400 border border-slate-800">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'border border-slate-800 bg-slate-950 text-slate-300'
                      : 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-900/20'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-normal space-y-2">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h4 key={lIdx} className="font-bold text-white text-sm mt-2 mb-1">
                            {line.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('- **') || line.startsWith('1. **') || line.startsWith('2. **')) {
                        return (
                          <div key={lIdx} className="pl-2">
                            {line}
                          </div>
                        );
                      }
                      return <p key={lIdx}>{line}</p>;
                    })}
                  </div>
                  <span
                    className={`block mt-2 text-[10px] text-right ${
                      isBot ? 'text-slate-500' : 'text-indigo-200'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {!isBot && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-indigo-400 border border-slate-800">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span>Apna Route AI is cross-referencing route safety, weather & local tariffs...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-800/80 bg-slate-950 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="concierge-input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about destinations, timing conflicts, mountain passes, local food, or safety..."
              className="flex-1 rounded-md border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              id="concierge-send-btn"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
