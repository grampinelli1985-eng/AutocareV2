
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Sparkles, Crown } from 'lucide-react';
import { ChatMessage, Vehicle, ServiceRecord, FuelLog } from '../types';
import { chatWithGemini } from '../services/geminiService';

interface ChatBotProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  userPlan: 'free' | 'premium';
  questionsRemaining: number;
  onMessageSent: () => void;
  onUpgrade: () => void;
  records?: ServiceRecord[];
  fuelLogs?: FuelLog[];
}

const ChatBot: React.FC<ChatBotProps> = ({ vehicle, isOpen, onClose, userPlan, questionsRemaining, onMessageSent, onUpgrade, records = [], fuelLogs = [] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    if (userPlan === 'free' && questionsRemaining <= 0) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    if (userPlan === 'free') onMessageSent();

    const responseText = await chatWithGemini([...messages, userMsg], vehicle, records, fuelLogs);

    const aiMsg: ChatMessage = {
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <>
      <div className={`fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 z-[110] w-full sm:w-[400px] h-full sm:h-[600px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-all duration-500 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        } sm:rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden`}>

        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-700 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Bot size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm uppercase tracking-tight">Manual Inteligente</h3>
                {userPlan === 'premium' && <Crown size={12} className="text-amber-400 fill-amber-400" />}
              </div>
              <p className="text-[10px] text-indigo-100 font-medium leading-none">Especialista AutoCare IA • Pro 1.5</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                <Sparkles size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Olá! Como posso ajudar?</p>
                <p className="text-xs text-slate-500 mt-2">
                  Pergunte sobre barulhos, intervalos de troca de peças ou peça dicas para seu {vehicle?.model || 'carro'}.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-600 border border-slate-100 dark:border-slate-700'
                  }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={userPlan === 'free' && questionsRemaining <= 0 ? "Limite diário atingido" : "Digite sua dúvida mecânica..."}
              disabled={userPlan === 'free' && questionsRemaining <= 0}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-90 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                {userPlan === 'free' ? `${questionsRemaining} perguntas restantes hoje` : 'Acesso Premium Ilimitado'}
              </p>
              {userPlan === 'premium' && <Crown size={8} className="text-amber-500 fill-amber-500" />}
            </div>

            {userPlan === 'free' && questionsRemaining <= 0 && (
              <button
                onClick={(e) => { e.preventDefault(); onUpgrade(); }}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-tighter hover:underline flex items-center justify-center gap-1"
              >
                Ficar sem limites com Premium <Sparkles size={10} className="animate-pulse" />
              </button>
            )}

            <p className="text-[8px] text-center text-slate-400 font-medium leading-tight px-4 mt-1">
              Alimentado por Gemini 1.5 Pro. IA pode conter erros.
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
