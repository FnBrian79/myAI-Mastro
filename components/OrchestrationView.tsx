
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  RotateCw, 
  ShieldCheck, 
  MessagesSquare, 
  GitMerge, 
  Zap, 
  Lock, 
  Globe, 
  FileText, 
  HardDriveDownload, 
  ClipboardCheck, 
  Fingerprint, 
  PanelRight, 
  Minimize2, 
  BarChart3, 
  Terminal, 
  Microscope,
  TestTube2,
  History,
  Activity,
  ShieldAlert,
  Dna,
  Workflow,
  RefreshCcw,
  Cpu,
  ListChecks,
  Swords,
  Timer,
  ZapOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Session, Round, ModelMetric, OrchestrationPhase } from '../types';
import { simulateParallelAIs, simulateSequentialAIs, synthesizeDebrief, synthesizeCompetitiveDebrief } from '../services/gemini';
import { piecesService } from '../services/pieces';
import { generateMasterAuditReport } from '../services/audit';
import { MODEL_POOL } from '../constants';
import ConvergenceChart from './ConvergenceChart';

interface OrchestrationViewProps {
  session: Session;
  onUpdate: (session: Session) => void;
}

const OrchestrationView: React.FC<OrchestrationViewProps> = ({ session, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [diagTab, setDiagTab] = useState<'analytics' | 'control'>('analytics');
  const [isAuditCopied, setIsAuditCopied] = useState(false);
  const [iatLogs, setIatLogs] = useState<string[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const themeStyles = useMemo(() => {
    const topic = session.contract.topic.toLowerCase();
    if (topic.includes('security') || topic.includes('risk') || topic.includes('shield')) {
      return { accent: 'emerald', bg: 'slate-950', icon: <ShieldCheck size={20} className="text-emerald-400" /> };
    }
    return { accent: 'indigo', bg: 'slate-50', icon: <Workflow size={20} className="text-indigo-600" /> };
  }, [session.contract.topic]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [session.rounds.length]);

  const addIatLog = (msg: string) => {
    setIatLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const downloadForensicLedger = () => {
    const report = generateMasterAuditReport(session);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FORENSIC_LEDGER_${session.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsAuditCopied(true);
    setTimeout(() => setIsAuditCopied(false), 2000);
    addIatLog("FORENSIC LEDGER EXPORTED: PROTOCOL 01-DELTA HANDOVER COMPLETE.");
  };

  const runNextRound = async () => {
    if (isProcessing || session.status === 'converged') return;
    setIsProcessing(true);
    
    const lastRound = session.rounds[session.rounds.length - 1];
    const currentRoundNum = session.rounds.length + 1;
    
    // Determine Phase & Budget
    let currentPhase: OrchestrationPhase = session.phase;
    let budget = 1000;

    if (currentRoundNum === 1) {
      currentPhase = 'initial';
      budget = 10000;
      addIatLog("PROTOCOL 01-DELTA: INITIATING INITIAL PASS [BUDGET: 10,000]");
    } else if (lastRound && lastRound.synthesisCharCount < 950) {
      currentPhase = 'parallel_convergence';
      budget = 1000;
      addIatLog("PROTOCOL 01-DELTA: TRIGGERING PARALLEL CONVERGENCE [BUDGET EXHAUSTED]");
    } else {
      currentPhase = 'series';
      budget = 1000;
      addIatLog(`PROTOCOL 01-DELTA: SERIES PASS ${currentRoundNum} [BUDGET: 1,000]`);
    }

    const activeContract = lastRound?.evolvedContract || session.contract.context;
    const baseTopic = lastRound ? lastRound.synthesis : session.contract.topic;

    try {
      const activePartnerObjects = session.activePartners.map(name => {
        const poolMatch = MODEL_POOL.find(m => m.name === name);
        return { name, type: (poolMatch?.type || 'LLM') as 'SLM' | 'LLM', isLocal: poolMatch?.isLocal };
      });

      let runs;
      // Execute based on phase logic
      if (currentPhase === 'initial' || currentPhase === 'parallel_convergence') {
        runs = await simulateParallelAIs(activeContract, baseTopic, activePartnerObjects, session.activeTools, budget);
      } else {
        // Series Phase: Run sequential passes building on previous
        runs = await simulateSequentialAIs(activeContract, baseTopic, activePartnerObjects, session.activeTools, budget);
      }
      
      let synthesisRes: { synthesis: string, evolvedContract: string };
      if (session.contract.schema === 'competitive' && currentPhase !== 'initial') {
        synthesisRes = await synthesizeCompetitiveDebrief(runs, activeContract, baseTopic, budget);
      } else {
        synthesisRes = await synthesizeDebrief(runs, activeContract, budget);
      }
      
      const iatSig = piecesService.generateIATSignature(currentRoundNum, session.contract.topic);
      const newRound: Round = {
        roundNumber: currentRoundNum,
        topic: baseTopic,
        runs,
        synthesis: synthesisRes.synthesis,
        evolvedContract: synthesisRes.evolvedContract,
        synthesisCharCount: synthesisRes.synthesis.length + synthesisRes.evolvedContract.length,
        timestamp: new Date().toISOString(),
        iatSignature: iatSig,
        phase: currentPhase
      };

      if (session.isPiecesConnected) {
        newRound.piecesId = await piecesService.archiveRound(newRound, session.contract);
      }

      onUpdate({ 
        ...session, 
        rounds: [...session.rounds, newRound],
        phase: currentPhase === 'parallel_convergence' ? 'completed' : currentPhase,
        status: currentPhase === 'parallel_convergence' ? 'converged' : 'orchestrating'
      });
      
      addIatLog(`NIHILO SEALED: GEN ${currentRoundNum} [${newRound.synthesisCharCount} chars]`);

    } catch (error) {
      addIatLog(`CRITICAL ERROR: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const latestRound = session.rounds[session.rounds.length - 1];
  const leaderboard = (Object.values(session.modelMetrics) as ModelMetric[]).sort((a, b) => b.totalChars - a.totalChars);

  const getPhaseIcon = (phase: OrchestrationPhase) => {
    switch (phase) {
      case 'initial': return <Zap size={14} className="text-amber-400" />;
      case 'series': return <ListChecks size={14} className="text-indigo-400" />;
      case 'parallel_convergence': return <Swords size={14} className="text-red-400" />;
      case 'completed': return <ShieldCheck size={14} className="text-emerald-400" />;
      default: return null;
    }
  };

  const budgetProgress = useMemo(() => {
    if (!latestRound) return 0;
    const limit = latestRound.roundNumber === 1 ? 10000 : 1000;
    return Math.min((latestRound.synthesisCharCount / limit) * 100, 100);
  }, [latestRound]);

  return (
    <div className={`flex flex-col lg:flex-row gap-6 h-full min-h-0 transition-colors duration-1000 ${themeStyles.bg === 'slate-950' ? 'text-slate-100 bg-slate-950' : 'text-slate-900'}`}>
      
      {/* HARDENED SNAPSHOT TRIGGER */}
      <div className="fixed bottom-10 left-10 z-[100] group">
        <button 
          onClick={downloadForensicLedger}
          className={`flex items-center gap-4 px-10 py-6 rounded-[2.5rem] font-black shadow-2xl transition-all active:scale-95 border-4 ${isAuditCopied ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-700 text-white hover:border-indigo-500 hover:bg-slate-800'}`}
        >
          <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
            {isAuditCopied ? <ClipboardCheck size={28} /> : <HardDriveDownload size={28} />}
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-slate-500">Forensic Handover</span>
            <span className="text-lg uppercase tracking-tight">{isAuditCopied ? 'Ledger Ready' : 'Download Snapshot'}</span>
          </div>
        </button>
      </div>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showInsights ? 'lg:w-2/3' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-0 z-20 py-4 px-2 bg-inherit backdrop-blur-md border-b border-slate-200/10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg`}>
              {themeStyles.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tighter">Distributed Laboratory</h2>
              <div className="flex items-center gap-3 mt-0.5 opacity-60">
                <Dna size={12} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  Protocol {session.phase.toUpperCase()} Active {getPhaseIcon(session.phase)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {latestRound && (
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Timer size={12} /> Budget Efficiency
                </div>
                <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${budgetProgress > 90 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                    style={{ width: `${budgetProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {!showInsights && (
              <button onClick={() => setShowInsights(true)} className="p-3 rounded-2xl bg-white/10 border border-slate-200/20 text-inherit hover:bg-white/20 transition-all active:scale-95 shadow-sm"><PanelRight size={20} /></button>
            )}
            <button
              onClick={runNextRound}
              disabled={isProcessing || session.status === 'converged'}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${session.status === 'converged' ? 'bg-emerald-600' : 'bg-indigo-600'} text-white shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50`}
            >
              {isProcessing ? <><RotateCw size={18} className="animate-spin" />Syncing Gate...</> : session.status === 'converged' ? <><ShieldCheck size={18} />Gauntlet Complete</> : <><Zap size={18} fill="currentColor" />{session.rounds.length === 0 ? 'Ignite Lab' : 'Execute Pass'}</>}
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-12 pb-32 custom-scrollbar">
          {!latestRound ? (
            <div className="bg-white/5 border border-slate-200/20 rounded-[3rem] p-24 text-center space-y-8 backdrop-blur-sm">
               <div className="relative w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"><TestTube2 size={48} className="text-white" /></div>
               <h3 className="text-3xl font-bold uppercase tracking-widest text-slate-400">Awaiting Lab Ignition</h3>
               <div className="p-10 bg-white/5 rounded-[2rem] border border-white/10 text-left shadow-inner max-w-2xl mx-auto">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Initial Proposal:</p>
                  <p className="text-lg leading-relaxed font-mono opacity-90">{session.contract.topic}</p>
               </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
               <div className={`bg-white rounded-[3rem] border border-slate-200/20 shadow-2xl overflow-hidden backdrop-blur-xl ${themeStyles.bg === 'slate-950' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white'}`}>
                  <div className={`bg-indigo-600 px-12 py-8 flex justify-between items-center text-white`}>
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                           <Lock size={24} />
                        </div>
                        <div>
                           <span className="text-[10px] font-bold opacity-70 uppercase tracking-[0.3em] block mb-2">Gen {latestRound.roundNumber} Optimized Intelligence</span>
                           <span className="text-xl font-bold">Structural Evolution State [PHASE: {latestRound.phase}]</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] block opacity-60 uppercase font-bold tracking-widest mb-1 text-white/50">IAT Receipt</span>
                        <span className="text-xs font-mono bg-black/20 px-4 py-1.5 rounded-lg border border-white/10">{latestRound.iatSignature}</span>
                     </div>
                  </div>
                  
                  <div className="p-12 space-y-16">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {latestRound.runs.map((run, i) => (
                           <div key={i} className={`p-6 rounded-[2rem] bg-slate-500/5 border border-white/10 space-y-4 hover:border-indigo-500/50 transition-all shadow-sm ${latestRound.phase === 'series' ? 'relative after:content-["→"] after:absolute after:-right-4 after:top-1/2 after:-translate-y-1/2 after:text-indigo-400/30 after:font-bold last:after:hidden' : ''}`}>
                              <span className="text-[10px] font-bold uppercase text-indigo-400">{run.aiName.split('(')[1]?.replace(')', '') || 'Specialist'}</span>
                              <p className="text-[11px] opacity-70 line-clamp-6 italic leading-relaxed">{run.response}</p>
                              <div className="text-[9px] font-bold text-slate-500 mt-2">{run.charCount.toLocaleString()} chars</div>
                           </div>
                        ))}
                     </div>

                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                        <div className="space-y-6">
                           <div className="flex items-center gap-4 px-2">
                              <MessagesSquare size={24} className="text-indigo-400" />
                              <h4 className="font-bold text-lg uppercase tracking-widest opacity-80">Strategic Debrief</h4>
                           </div>
                           <div className="bg-slate-900/40 rounded-[3rem] p-10 border border-white/10 text-sm shadow-inner min-h-[350px] leading-relaxed relative">
                              <div className="absolute top-6 right-8 text-[10px] font-mono text-slate-600 bg-black/20 px-3 py-1 rounded-full">
                                {latestRound.synthesis.length.toLocaleString()} bytes
                              </div>
                              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{latestRound.synthesis}</ReactMarkdown>
                           </div>
                        </div>
                        <div className="space-y-6">
                           <div className="flex items-center gap-4 px-2">
                              <GitMerge size={24} className="text-emerald-400" />
                              <h4 className="font-bold text-lg uppercase tracking-widest opacity-80">Hardened Thesis (Evolved)</h4>
                           </div>
                           <div className="bg-emerald-500/5 rounded-[3rem] p-10 border border-emerald-500/20 text-sm shadow-inner min-h-[350px] leading-relaxed font-mono relative">
                              <div className="absolute top-6 right-8 text-[10px] font-mono text-emerald-600/60 bg-white/5 px-3 py-1 rounded-full">
                                {latestRound.evolvedContract?.length.toLocaleString() || 0} bytes
                              </div>
                              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                 <Zap size={12} fill="currentColor" /> Mutation Logic
                              </div>
                              <ReactMarkdown className="prose prose-invert prose-emerald prose-sm max-w-none">{latestRound.evolvedContract || "Thesis stable."}</ReactMarkdown>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {showInsights && (
        <div className="lg:w-96 space-y-6 flex-shrink-0 animate-in slide-in-from-right duration-500 pb-12 flex flex-col sticky top-0 h-full">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xs font-bold opacity-40 uppercase tracking-[0.3em]">Lab Terminal</h3>
            <button onClick={() => setDiagTab(diagTab === 'analytics' ? 'control' : 'analytics')} className="opacity-40 hover:opacity-100 transition-opacity"><RefreshCcw size={16} /></button>
          </div>

          <div className={`border border-slate-200/20 rounded-[3rem] flex flex-col min-h-0 flex-1 shadow-2xl overflow-hidden backdrop-blur-xl ${themeStyles.bg === 'slate-950' ? 'bg-slate-800/80' : 'bg-white'}`}>
            <div className="flex border-b border-white/10">
              <button onClick={() => setDiagTab('analytics')} className={`flex-1 flex flex-col items-center py-6 gap-2 transition-all ${diagTab === 'analytics' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'opacity-40'}`}>
                <BarChart3 size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Convergence</span>
              </button>
              <button onClick={() => setDiagTab('control')} className={`flex-1 flex flex-col items-center py-6 gap-2 transition-all ${diagTab === 'control' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'opacity-40'}`}>
                <Terminal size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Audit Logs</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {diagTab === 'analytics' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <ConvergenceChart rounds={session.rounds} />
                  <div className="space-y-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] opacity-40">Gauntlet Efficiency</h4>
                    {latestRound ? (
                       <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                            <span>Current Phase</span>
                            <span className="text-indigo-400">{latestRound.phase}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                            <span>Utilized Budget</span>
                            <span className={budgetProgress > 90 ? 'text-indigo-400' : 'text-amber-400'}>
                              {latestRound.synthesisCharCount.toLocaleString()} / {latestRound.roundNumber === 1 ? '10k' : '1k'}
                            </span>
                          </div>
                       </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 italic text-center py-10">Awaiting data...</div>
                    )}
                  </div>
                </div>
              )}

              {diagTab === 'control' && (
                <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                     <ShieldAlert size={16} className="text-amber-400" />
                     <h4 className="font-bold text-[11px] uppercase tracking-widest text-amber-400">Forensic Integrity Trace</h4>
                  </div>
                  <div className="bg-black/40 rounded-[1.5rem] p-6 flex-1 font-mono text-[10px] text-emerald-500/80 space-y-2 overflow-y-auto border border-emerald-500/20 shadow-inner">
                     {iatLogs.length === 0 ? <div className="opacity-30 italic">Awaiting lab ignition...</div> : iatLogs.map((log, i) => <div key={i} className="leading-relaxed border-l border-emerald-500/10 pl-3">{log}</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrchestrationView;
