
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCw, 
  AlertTriangle, 
  Brain, 
  Zap, 
  Check,
  ShieldCheck,
  Settings2,
  StopCircle,
  TrendingDown,
  Target,
  Star,
  Trophy,
  ArrowUpRight,
  Globe,
  Code,
  Database,
  Wand2,
  PanelRight,
  Maximize2,
  Minimize2,
  FileText,
  MessagesSquare,
  Archive,
  Search,
  HardDrive,
  Cpu,
  ListChecks,
  Swords,
  RefreshCcw,
  Volume2,
  ExternalLink,
  GitMerge,
  Edit3,
  Dna,
  ShieldQuestion,
  Microscope,
  Atom,
  TestTube2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Session, Round, AIRun, ModelMetric } from '../types';
import { simulateParallelAIs, synthesizeDebrief, synthesizeCompetitiveDebrief, conductSession, generateSpeech } from '../services/gemini';
import { piecesService } from '../services/pieces';
import { ollamaService } from '../services/ollama';
import { MODEL_POOL, AVAILABLE_TOOLS, SCHEMAS } from '../constants';
import ConvergenceChart from './ConvergenceChart';

interface OrchestrationViewProps {
  session: Session;
  onUpdate: (session: Session) => void;
}

const OrchestrationView: React.FC<OrchestrationViewProps> = ({ session, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoEvolving, setIsAutoEvolving] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [currentStep, setCurrentStep] = useState<'idle' | 'parallel' | 'synthesis' | 'archiving'>('idle');
  const [threshold, setThreshold] = useState(session.convergenceThreshold || 75);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [manualContract, setManualContract] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.rounds]);

  useEffect(() => {
    let timer: number;
    if (isAutoEvolving && !isProcessing && session.status !== 'converged') {
      timer = window.setTimeout(() => {
        runNextRound();
      }, 1500);
    } else if (session.status === 'converged') {
      setIsAutoEvolving(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoEvolving, isProcessing, session.status]);

  const runNextRound = async () => {
    if (isProcessing || session.status === 'converged') return;
    setIsProcessing(true);
    setCurrentStep('parallel');

    const lastRound = session.rounds[session.rounds.length - 1];
    const activeContract = lastRound?.evolvedContract || session.contract.context;
    const baseTopic = lastRound ? lastRound.synthesis : session.contract.topic;
    const currentRoundNum = session.rounds.length + 1;
    const schema = session.contract.schema;

    try {
      const activePartnerObjects = session.activePartners.map(name => {
        const poolMatch = MODEL_POOL.find(m => m.name === name);
        return { 
          name, 
          type: (poolMatch?.type || 'LLM') as 'SLM' | 'LLM',
          isLocal: poolMatch?.isLocal 
        };
      });

      let runs: AIRun[] = [];
      let synthesisRes: { synthesis: string, evolvedContract: string };

      if (schema === 'sequential') {
        let chainContext = activeContract;
        for (const partner of activePartnerObjects) {
          const runResults = await simulateParallelAIs(chainContext, baseTopic, [partner], session.activeTools);
          const singleRun = runResults[0];
          runs.push(singleRun);
          chainContext += `\n\nPREVIOUS MODEL OUTPUT (${partner.name}):\n${singleRun.response}`;
        }
        setCurrentStep('synthesis');
        synthesisRes = await synthesizeDebrief(runs, activeContract, lastRound?.synthesis);
      } else {
        runs = await simulateParallelAIs(
          activeContract,
          baseTopic,
          activePartnerObjects,
          session.activeTools
        );

        setCurrentStep('synthesis');
        if (schema === 'competitive') {
          synthesisRes = await synthesizeCompetitiveDebrief(runs, activeContract, baseTopic);
        } else {
          synthesisRes = await synthesizeDebrief(runs, activeContract, lastRound?.synthesis);
        }
      }
      
      const newRound: Round = {
        roundNumber: currentRoundNum,
        topic: baseTopic,
        runs,
        synthesis: synthesisRes.synthesis,
        evolvedContract: synthesisRes.evolvedContract,
        synthesisCharCount: synthesisRes.synthesis.length,
        timestamp: new Date().toISOString()
      };

      if (session.isPiecesConnected) {
        setCurrentStep('archiving');
        const piecesId = await piecesService.archiveRound(newRound, session.contract);
        newRound.piecesId = piecesId;
      }

      const newMetrics = { ...session.modelMetrics };
      runs.forEach(run => {
        if (!newMetrics[run.aiName]) {
          newMetrics[run.aiName] = { name: run.aiName, totalChars: 0, avgRating: 0, runs: 0, type: run.modelType };
        }
        if (!run.response.startsWith('[OLLAMA_')) {
          newMetrics[run.aiName].totalChars += run.charCount;
          newMetrics[run.aiName].runs += 1;
        }
      });

      const updatedRounds = [...session.rounds, newRound];
      let updatedStatus = session.status;
      const currentPeak = Math.max(...updatedRounds.map(r => r.synthesisCharCount));
      const currentChars = synthesisRes.synthesis.length;
      const dwindleLimit = (currentPeak * (threshold / 100));
      
      if (updatedRounds.length >= 3 && currentChars < dwindleLimit) {
        updatedStatus = 'converged';
      }

      onUpdate({
        ...session,
        rounds: updatedRounds,
        status: updatedStatus,
        convergencePeak: currentPeak,
        convergenceThreshold: threshold,
        modelMetrics: newMetrics
      });

    } catch (error) {
      console.error(error);
      setIsAutoEvolving(false);
    } finally {
      setIsProcessing(false);
      setCurrentStep('idle');
    }
  };

  const handleSpeak = async (text: string, id: string) => {
    if (isPlaying === id) return;
    setIsPlaying(id);
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        const audio = new Audio(`data:audio/pcm;base64,${base64}`);
        // Audio playback logic placeholder
      }
    } catch (e) {
      console.error("TTS Error", e);
    } finally {
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

  const latestRound = session.rounds[session.rounds.length - 1];
  const peak = session.convergencePeak || 0;
  const leaderboard = (Object.values(session.modelMetrics) as ModelMetric[]).sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0) || b.totalChars - a.totalChars);
  const currentSchema = SCHEMAS.find(s => s.id === session.contract.schema);

  const applyIntervention = () => {
    if (!manualContract) return;
    const updatedRounds = [...session.rounds];
    if (updatedRounds.length > 0) {
      updatedRounds[updatedRounds.length - 1].evolvedContract = manualContract;
      onUpdate({ ...session, rounds: updatedRounds });
    } else {
      onUpdate({ ...session, contract: { ...session.contract, context: manualContract } });
    }
    setManualContract('');
  };

  const pullToLab = (contract: string) => {
    setManualContract(contract);
    setShowInsights(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showInsights ? 'lg:w-2/3' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Microscope size={24} className="text-indigo-600" />
                R&D Department Gauntlet
              </h2>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                <Dna size={12} className="animate-spin-slow" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Evolution Lab</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Lab Generation {session.rounds.length}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 text-xs italic flex items-center gap-1"><Atom size={12} /> Breeding optimal failure resistance</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!showInsights && (
              <button onClick={() => setShowInsights(true)} className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"><PanelRight size={20} /></button>
            )}
            {session.status !== 'converged' && (
              <button
                onClick={() => setIsAutoEvolving(!isAutoEvolving)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all border-2 ${isAutoEvolving ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                {isAutoEvolving ? <StopCircle size={18} /> : <RotateCw size={18} />}
                <span className="hidden sm:inline tracking-tight">{isAutoEvolving ? 'Halt Breeding' : 'Auto-Breed'}</span>
              </button>
            )}
            <button
              onClick={runNextRound}
              disabled={isProcessing || session.status === 'converged'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all ${session.status === 'converged' ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200 shadow-sm' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95'} disabled:opacity-50`}
            >
              {session.status === 'converged' ? <><Check size={18} />Study Finalized</> : isProcessing ? <><RotateCw size={18} className="animate-spin" />Simulating Next Gen...</> : <><Play size={18} fill="currentColor" />{session.rounds.length === 0 ? 'Ignite Genesis' : 'Breed Next Generation'}</>}
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-12 pb-20 custom-scrollbar">
          {session.rounds.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-16 text-center space-y-8 shadow-sm">
              <div className="relative mx-auto w-24 h-24">
                 <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-2xl opacity-10 animate-pulse" />
                 <div className="relative w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center border border-indigo-100"><TestTube2 size={48} className="text-indigo-600" /></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight uppercase tracking-widest">Ancestral Thesis Deployed</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed italic">"Initiating Generation 0. Conductor is awaiting sub-agent destructive review to begin the selective breeding process."</p>
                <div className="mt-10 p-8 bg-slate-50 rounded-3xl border border-slate-100 text-left shadow-inner group relative">
                   <div className="absolute top-4 right-4"><Zap size={16} className="text-amber-400 opacity-20" /></div>
                   <div className="flex items-center gap-2 mb-3">
                     <ShieldCheck size={14} className="text-emerald-600" />
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Baseline Research Parameters</div>
                   </div>
                   <p className="text-sm text-slate-600 leading-relaxed font-mono opacity-80 group-hover:opacity-100 transition-opacity">{session.contract.context}</p>
                </div>
              </div>
            </div>
          )}

          {session.rounds.map((round, idx) => (
            <div key={idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1" />
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-5 py-1.5 border border-slate-200 rounded-full bg-white shadow-sm">
                  <Dna size={12} className="text-indigo-500" />
                  <span>R&D Cycle {round.roundNumber} / Selective Hardening</span>
                </div>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:border-indigo-100">
                <div className="bg-slate-50/50 px-10 py-5 border-b border-slate-100 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                       <ShieldQuestion size={16} />
                     </div>
                     <div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1">Peer Review Phase</span>
                       <span className="text-xs font-bold text-slate-700">Agents attempting logical deconstruction</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-slate-400 text-[10px] font-mono bg-white px-3 py-1 rounded-lg border border-slate-100">{new Date(round.timestamp).toLocaleTimeString()}</span>
                   </div>
                </div>
                
                <div className="p-10 space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {round.runs.map((run, rIdx) => (
                      <div key={rIdx} className="p-5 rounded-[2rem] border space-y-4 bg-slate-50 border-slate-100 hover:bg-white hover:border-indigo-200 transition-all hover:-translate-y-1 group">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col min-w-0">
                            <div className="text-[11px] font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{run.aiName}</div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded inline-block w-fit mt-1.5 ${run.modelType === 'SLM' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{run.modelType} | {run.source.toUpperCase()}</span>
                          </div>
                          <button onClick={() => handleSpeak(run.response, `run-${idx}-${rIdx}`)} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <Volume2 size={12} />
                          </button>
                        </div>
                        <div className="h-px bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => {}} className={`transition-colors ${run.rating && run.rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}>
                              <Star size={11} fill={run.rating && run.rating >= star ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Synthesis Column */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <MessagesSquare size={20} />
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Research Update</h4>
                        </div>
                        <button onClick={() => handleSpeak(round.synthesis, `syn-${idx}`)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Volume2 size={16} />
                        </button>
                      </div>
                      <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 text-slate-700 text-sm shadow-inner min-h-[180px] leading-relaxed relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform"><Trophy size={64} className="text-indigo-900" /></div>
                        <ReactMarkdown className="prose prose-slate prose-sm max-w-none relative z-10">{round.synthesis}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Evolved Contract Column */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <GitMerge size={20} />
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Hardened Thesis</h4>
                        </div>
                        {round.evolvedContract && (
                          <button 
                            onClick={() => pullToLab(round.evolvedContract || '')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95"
                          >
                            <Microscope size={12} /> Refine in Lab
                          </button>
                        )}
                      </div>
                      <div className="bg-emerald-50/30 rounded-[2.5rem] p-10 border border-emerald-100 text-emerald-900 text-sm shadow-inner min-h-[180px] leading-relaxed font-mono relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform"><Wand2 size={64} className="text-emerald-900" /></div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Zap size={10} fill="currentColor" /> Target for next peer review generation
                        </div>
                        <ReactMarkdown className="prose prose-emerald prose-sm max-w-none opacity-90 relative z-10">{round.evolvedContract || "Thesis remains static."}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-indigo-200 p-16 flex flex-col items-center gap-8 animate-pulse shadow-sm">
              <div className="relative">
                <Microscope size={64} className="text-indigo-600 animate-bounce" />
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-ping" />
              </div>
              <div className="text-center space-y-3">
                <div className="font-bold text-indigo-600 text-xl uppercase tracking-[0.3em]">
                  {currentStep === 'parallel' ? 'Trial Simulations' : 
                   currentStep === 'synthesis' ? 'Thesis Mutation' : 
                   'Recording Genetic Map'}
                </div>
                <p className="text-slate-400 text-sm italic max-w-xs mx-auto">"Synthesizing logical mutations for the next R&D iteration..."</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showInsights && (
        <div className="lg:w-80 space-y-6 flex-shrink-0 animate-in slide-in-from-right duration-300 pb-12">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Lab Diagnostics</h3>
            <button onClick={() => setShowInsights(false)} className="text-slate-400 hover:text-slate-600 transition-colors active:scale-95"><Minimize2 size={16} /></button>
          </div>
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            <ConvergenceChart rounds={session.rounds} />
            
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl space-y-6 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-amber-500/20">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-amber-500">Director Override</h3>
                  <span className="text-[10px] text-slate-500">Manual Pressure Control</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">Directly steer the next generation's thesis if the machine drift stalls.</p>
              <textarea 
                value={manualContract}
                onChange={(e) => setManualContract(e.target.value)}
                placeholder="Inject manual constraints or steer the thesis..."
                className="w-full p-5 bg-slate-800/50 border border-slate-700 rounded-2xl text-xs outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-600 leading-relaxed text-slate-300 shadow-inner font-mono"
                rows={6}
              />
              <button 
                onClick={applyIntervention}
                className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
              >
                <ShieldCheck size={16} /> Update Next Gen Thesis
              </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest"><Trophy size={16} className="text-amber-500" />Fitness Rank</h3>
              <div className="space-y-3">
                {leaderboard.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-indigo-100">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-slate-700 truncate">{m.name}</div>
                      <div className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">{m.totalChars.toLocaleString()} chars Preserved</div>
                    </div>
                    <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100"><Star size={10} fill="currentColor" />{m.avgRating ? m.avgRating.toFixed(1) : '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrchestrationView;
