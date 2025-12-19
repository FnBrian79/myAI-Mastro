
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, 
  Bot, 
  Loader2, 
  X, 
  Sparkles, 
  Camera, 
  Zap, 
  Target, 
  Quote, 
  ShieldCheck, 
  Dna,
  ClipboardCheck,
  Share2,
  ChevronRight,
  BrainCircuit,
  Fingerprint,
  Lock,
  Terminal,
  Activity,
  Award
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askGeminiComplex } from '../services/gemini';
import { Session, Round } from '../types';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface AdaptiveMorphingAssistantProps {
  session: Session | null;
  onIntervene?: (context: string) => void;
}

const ChatBot: React.FC<AdaptiveMorphingAssistantProps> = ({ session, onIntervene }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const latestRound = session?.rounds[session.rounds.length - 1];

  // Intent Sensing Morphing Logic
  const intentTheme = useMemo(() => {
    if (!session) return { color: 'indigo', label: 'IDLE' };
    const topic = session.contract.topic.toLowerCase();
    if (topic.includes('security') || topic.includes('risk') || topic.includes('shield')) 
      return { color: 'emerald', label: 'HARDENED SANCTUM' };
    if (topic.includes('creative') || topic.includes('innovate') || topic.includes('paradigm')) 
      return { color: 'violet', label: 'ETHEREAL INNOVATION' };
    if (topic.includes('logic') || topic.includes('architecture')) 
      return { color: 'amber', label: 'LOGIC ENGINE' };
    return { color: 'indigo', label: 'RESEARCH CORE' };
  }, [session]);

  const colorMap = {
    indigo: 'from-indigo-600 to-blue-600',
    emerald: 'from-emerald-600 to-teal-600',
    violet: 'from-violet-600 to-purple-600',
    amber: 'from-amber-500 to-orange-600',
  };

  const accentColor = {
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
    amber: 'text-amber-500',
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: textToSend }] };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const contextPrompt = `
        ### INTENT ARCHITECT PROTOCOL
        Role: Adaptive Research Arbiter
        Liturgy: Nihilo Sealed / Auditable Integrity Trace
        
        CURRENT LAB CONTEXT:
        Topic: ${session?.contract.topic}
        Current Gen: ${latestRound?.roundNumber || 0}
        Latest Synthesis: ${latestRound?.synthesis || 'No synthesis recorded yet.'}
        
        USER COMMAND: ${textToSend}
        
        MISSION: Evaluate the command against the Auditable Integrity Trace. Provide a strategic "pivot" or "destructive critique" that helps the user judge the machine's output. Maintain a cold, precise, and authoritative tone.
      `;
      const response = await askGeminiComplex(contextPrompt, currentMessages);
      setMessages([...currentMessages, { role: 'model', parts: [{ text: response || '' }] }]);
    } catch (error) {
      setMessages([...currentMessages, { role: 'model', parts: [{ text: "CRITICAL: IAT Sync Failure. External intelligence core unreachable." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const captureCatfishBriefing = () => {
    if (!latestRound) return;
    const report = `
# 🧊 INDEPENDENT CATFISH BRIEFING: GEN ${latestRound.roundNumber}
**Auditable Integrity Trace (IAT):** ${latestRound.iatSignature || 'PENDING_SEAL'}
**Synchronization Receipt:** ${latestRound.piecesId || 'LOCAL_ONLY'}
**Status:** NIHILO SEALED

## 🧬 EVOLVED THESIS
${latestRound.evolvedContract}

## 🧠 STRATEGIC SYNTHESIS
${latestRound.synthesis}

---
*Generated for Trusted Opinion Review by the GOTME Intent Architect.*
    `.trim();
    navigator.clipboard.writeText(report);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Predictive Intent Pips based on research state
  const intentPips = useMemo(() => {
    if (!latestRound) return ["Define Scope", "Analyze Risks", "Force Mutation"];
    if (latestRound.roundNumber < 3) return ["Attack Synthesis", "Predict Failures", "Audit Logic"];
    return ["10x Potential Gap", "Draft IAT Briefing", "Seal Generation"];
  }, [latestRound]);

  return (
    <>
      {/* Morphing Bubble with IAT Pulse */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-8 right-8 w-20 h-20 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group bg-slate-900 border-2 border-slate-800`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[intentTheme.color]} opacity-20 blur-xl animate-pulse group-hover:opacity-40 transition-opacity`} />
          <div className="relative flex flex-col items-center">
            <BrainCircuit size={32} className={`mb-1 ${accentColor[intentTheme.color]}`} />
            <span className="text-[8px] font-bold tracking-[0.2em] text-white/40 uppercase">IAT Active</span>
          </div>
          {latestRound && (
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-white text-slate-900 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xl border-2 border-slate-900 animate-in zoom-in">
              {latestRound.roundNumber}
            </div>
          )}
        </button>
      )}

      {/* Adaptive Intent Architect Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[450px] h-[750px] max-h-[90vh] bg-slate-950 border border-slate-800 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] flex flex-col z-50 animate-in slide-in-from-bottom-12 duration-500 overflow-hidden">
          
          {/* Header: Morphing State */}
          <div className={`bg-gradient-to-br ${colorMap[intentTheme.color]} p-10 text-white relative overflow-hidden shrink-0`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150"><Dna size={120} /></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                  <Fingerprint size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-tighter">Intent Architect</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    <span className="text-[10px] text-white/70 font-bold uppercase tracking-[0.25em]">{intentTheme.label}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/10 rounded-2xl transition-all active:scale-90">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* IAT Status / Catfish Hub Bar */}
          <div className="bg-slate-900/50 px-8 py-5 flex items-center justify-between border-b border-slate-800/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Lock size={14} className={accentColor[intentTheme.color]} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nihilo Sealed protocol</span>
            </div>
            <button 
              onClick={captureCatfishBriefing}
              disabled={!latestRound}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95 disabled:opacity-20 ${isCopied ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {isCopied ? <ClipboardCheck size={14} /> : <Camera size={14} />}
              {isCopied ? 'IAT SEED COPIED' : 'Snap Catfish Brief'}
            </button>
          </div>

          {/* Intelligence Feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-[radial-gradient(circle_at_bottom_right,rgba(15,23,42,1),rgba(2,6,23,1))] custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-20 space-y-8 opacity-40 group">
                <div className="relative mx-auto w-24 h-24">
                  <div className={`absolute inset-0 bg-${intentTheme.color}-500 rounded-[2.5rem] blur-3xl opacity-20 animate-pulse`} />
                  <div className="relative w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                    <Bot size={40} className={accentColor[intentTheme.color]} />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-300 tracking-wide uppercase tracking-[0.2em]">"Awaiting Logical Pivot..."</p>
                  <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto leading-relaxed italic">
                    I have deconstructed your current laboratory state. Feed me a command or select an Intent Pip to judge the machine's convergence.
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
                <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${
                  m.role === 'user' 
                    ? `bg-slate-800 border border-slate-700 text-white rounded-tr-none` 
                    : 'bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-none backdrop-blur-md'
                }`}>
                  <div className="flex items-center gap-2 mb-3 opacity-30">
                    {m.role === 'user' ? <Fingerprint size={12} /> : <Terminal size={12} />}
                    <span className="text-[9px] font-bold uppercase tracking-widest">{m.role === 'user' ? 'User Intent' : 'Arbiter Trace'}</span>
                  </div>
                  <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-strong:text-indigo-400">
                    {m.parts[0].text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] rounded-tl-none shadow-2xl flex items-center gap-4 animate-pulse">
                  <Activity size={16} className={`animate-pulse ${accentColor[intentTheme.color]}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sensing Atomic Movements...</span>
                </div>
              </div>
            )}
          </div>

          {/* Adaptive Controls */}
          <div className="p-10 bg-slate-950 border-t border-slate-900 space-y-8">
            <div className="flex flex-wrap gap-2.5">
              {intentPips.map((pip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(pip)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-800 hover:text-white hover:border-indigo-500/50 transition-all flex items-center gap-2.5 group active:scale-95"
                >
                  <Target size={12} className="text-slate-600 group-hover:text-indigo-500" />
                  {pip}
                </button>
              ))}
            </div>

            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Direct IAT Command..."
                className="w-full pl-8 pr-16 py-5 bg-slate-900/50 border border-slate-800 rounded-[1.8rem] text-sm text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all shadow-inner placeholder:text-slate-700 font-mono"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className={`absolute right-2.5 top-2.5 w-12 h-12 rounded-2xl transition-all shadow-2xl active:scale-90 disabled:opacity-20 flex items-center justify-center text-white bg-gradient-to-br ${colorMap[intentTheme.color]}`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Auditable Integrity Trace Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
