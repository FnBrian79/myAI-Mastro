
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCw, 
  Brain, 
  Zap, 
  Check,
  ShieldCheck,
  StopCircle,
  Trophy,
  MessagesSquare,
  Cpu,
  RefreshCcw,
  Volume2,
  GitMerge,
  Edit3,
  Dna,
  ShieldQuestion,
  Microscope,
  Atom,
  TestTube2,
  Activity,
  Terminal,
  VolumeX,
  Radio,
  BarChart3,
  Minimize2,
  PanelRight,
  Sparkles
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
  const [diagTab, setDiagTab] = useState<'analytics' | 'control' | 'intelligence'>('analytics');
  const [currentStep, setCurrentStep] = useState<'idle' | 'parallel' | 'synthesis' | 'archiving'>('idle');
  const [threshold, setThreshold] = useState(session.convergenceThreshold || 75);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isAutoBriefing, setIsAutoBriefing] = useState(false);
  const [manualContract, setManualContract] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

      if (isAutoBriefing) {
        handleSpeak(synthesisRes.synthesis, `auto-brief-${currentRoundNum}`);
      }

    } catch (error) {
      console.error(error);
      setIsAutoEvolving(false);
    } finally {
      setIsProcessing(false);
      setCurrentStep('idle');
    }
  };

  const decodeAudioData = async (base64: string): Promise<AudioBuffer> => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = audioContextRef.current.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const handleSpeak = async (text: string, id: string) => {
    if (isPlaying) return;
    setIsPlaying(id);
    try {
      const base64 = await generateSpeech(text);
      if (base64 && audioContextRef.current) {
        const audioBuffer = await decodeAudioData(base64);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(null);
        source.start();
      } else {
        setIsPlaying(null);
      }
    } catch (e) {
      console.error("TTS Error", e);
      setIsPlaying(null);
    }
  };

  const handleSelfOptimize = () => {
    if (!latestRound) return;
    const metaTopic = `Optimization of GOTME Logic for Round ${latestRound.roundNumber + 1}`;
    const metaContext = `CURRENT THESIS:\n${latestRound.evolvedContract}\n\nLATEST SYNTHESIS:\n${latestRound.synthesis}\n\nMETA-GOAL: Identify the architectural flaws in the 'Lab Architect' prompts and 'Synthesis' logic that led to the current results. Propose a more 'adversarial' and 'feasibility-focused' engine mutation.`;
    
    onUpdate({
      ...session,
      contract: {
        ...session.contract,
        topic: metaTopic,
        context: metaContext,
        schema: 'competitive'
      },
      rounds: [] // Reset rounds for the new meta-session
    });
    setDiagTab('analytics');
  };

  const latestRound = session.rounds[session.rounds.length - 1];
  const peak = session.convergencePeak || 0;
  const leaderboard = (Object.values(session.modelMetrics) as ModelMetric[]).sort((a, b) => b.totalChars - a.totalChars);

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
    setDiagTab('control');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showInsights ? 'lg:w-2/3' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <Microscope size={24} className="text-indigo-600" />
                  R&D Department
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  <Radio size={12} className={isAutoEvolving ? "animate-pulse" : ""} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Lab Active</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Experiment Round {session.rounds.length}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAutoBriefing(!isAutoBriefing)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${isAutoBriefing ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
              title="Speak synthesis report automatically"
            >
              {isAutoBriefing ? <Volume2 size={12} /> : <VolumeX size={12} />}
              Auto-Briefing {isAutoBriefing ? 'ON' : 'OFF'}
            </button>
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
              {session.status === 'converged' ? <><Check size={18} />Trial Complete</> : isProcessing ? <><RotateCw size={18} className="animate-spin" />Processing...</> : <><Play size={18} fill="currentColor" />{session.rounds.length === 0 ? 'Ignite Lab' : 'Breed Generation'}</>}
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
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight uppercase tracking-widest">Awaiting Breeding Proposal</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed italic">"Initiate the first R&D cycle to begin destructive peer review and feasibility assessment."</p>
                <div className="mt-10 p-8 bg-slate-50 rounded-3xl border border-slate-100 text-left shadow-inner group relative">
                   <div className="absolute top-4 right-4"><Zap size={16} className="text-amber-400 opacity-20" /></div>
                   <div className="flex items-center gap-2 mb-3">
                     <ShieldCheck size={14} className="text-emerald-600" />
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Research Topic</div>
                   </div>
                   <p className="text-sm text-slate-600 leading-relaxed font-mono opacity-80 group-hover:opacity-100 transition-opacity font-bold">{session.contract.topic}</p>
                   <p className="text-xs text-slate-500 mt-2 font-mono opacity-80 group-hover:opacity-100 transition-opacity">{session.contract.context}</p>
                </div>
              </div>
            </div>
          )}

          {session.rounds.map((round, idx) => (
            <div key={idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1" />
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-5 py-1.5 border border-slate-200 rounded-full bg-white shadow-sm">
                  <Atom size={12} className="text-indigo-500" />
                  <span>Cycle {round.roundNumber} / Laboratory Phase</span>
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
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1">Destructive Peer Review</span>
                       <span className="text-xs font-bold text-slate-700">Multi-Agent Stress Test</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-slate-400 text-[10px] font-mono bg-white px-3 py-1 rounded-lg border border-slate-100">{new Date(round.timestamp).toLocaleTimeString()}</span>
                   </div>
                </div>
                
                <div className="p-10 space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {round.runs.map((run, rIdx) => (
                      <div key={rIdx} className="p-4 rounded-[1.5rem] border space-y-3 bg-slate-50 border-slate-100 hover:bg-white hover:border-indigo-200 transition-all group overflow-hidden">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col min-w-0">
                            <div className="text-[10px] font-bold text-slate-800 truncate">{run.aiName.split('(')[0]}</div>
                            <span className="text-[8px] text-indigo-500 font-bold uppercase truncate">{run.aiName.split('(')[1]?.replace(')', '') || 'Specialist'}</span>
                          </div>
                          <button onClick={() => handleSpeak(run.response, `run-${idx}-${rIdx}`)} className={`p-1 transition-all rounded-lg ${isPlaying === `run-${idx}-${rIdx}` ? 'text-indigo-600 bg-indigo-50 animate-pulse' : 'text-slate-300 hover:text-indigo-600'}`}>
                            <Volume2 size={10} />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-600 line-clamp-4 italic leading-relaxed">
                          {run.response}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <MessagesSquare size={20} />
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Synthesis Report</h4>
                        </div>
                        <button 
                          onClick={() => handleSpeak(round.synthesis, `syn-${idx}`)} 
                          className={`p-2 transition-all rounded-xl ${isPlaying === `syn-${idx}` ? 'text-indigo-600 bg-indigo-50 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                      <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 text-slate-700 text-sm shadow-inner min-h-[180px] leading-relaxed relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform"><Activity size={64} className="text-indigo-900" /></div>
                        <ReactMarkdown className="prose prose-slate prose-sm max-w-none relative z-10 prose-headings:text-indigo-900 prose-strong:text-indigo-700">{round.synthesis}</ReactMarkdown>
                      </div>
                    </div>

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
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                          >
                            <Edit3 size={12} /> Pull to Lab
                          </button>
                        )}
                      </div>
                      <div className="bg-emerald-50/30 rounded-[2.5rem] p-8 border border-emerald-100 text-emerald-900 text-sm shadow-inner min-h-[180px] leading-relaxed font-mono relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform"><Wand2 size={64} className="text-emerald-900" /></div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Zap size={10} fill="currentColor" /> Targeted Evolution
                        </div>
                        <ReactMarkdown className="prose prose-emerald prose-sm max-w-none opacity-90 relative z-10">{round.evolvedContract || "Thesis stable."}</ReactMarkdown>
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
                <Atom size={64} className="text-indigo-600 animate-spin-slow" />
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <div className="font-bold text-indigo-600 text-xl uppercase tracking-[0.3em]">
                  {currentStep === 'parallel' ? 'Peer Analysis' : 
                   currentStep === 'synthesis' ? 'Synthesizing Mutation' : 
                   'Archiving Genome'}
                </div>
                <p className="text-slate-400 text-sm italic max-w-xs mx-auto">"Evaluating feasibility and deconstructing logic..."</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showInsights && (
        <div className="lg:w-80 space-y-6 flex-shrink-0 animate-in slide-in-from-right duration-300 pb-12 flex flex-col">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Lab Diagnostics</h3>
            <button onClick={() => setShowInsights(false)} className="text-slate-400 hover:text-slate-600 transition-colors active:scale-95"><Minimize2 size={16} /></button>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] flex flex-col min-h-0 flex-1 shadow-sm overflow-hidden">
            {/* Lab Tabs */}
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setDiagTab('analytics')}
                className={`flex-1 flex flex-col items-center py-4 gap-1 transition-all ${diagTab === 'analytics' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <BarChart3 size={18} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Analysis</span>
              </button>
              <button 
                onClick={() => setDiagTab('intelligence')}
                className={`flex-1 flex flex-col items-center py-4 gap-1 transition-all ${diagTab === 'intelligence' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Brain size={18} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Intelligence</span>
              </button>
              <button 
                onClick={() => setDiagTab('control')}
                className={`flex-1 flex flex-col items-center py-4 gap-1 transition-all ${diagTab === 'control' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Terminal size={18} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Control</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {diagTab === 'analytics' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <ConvergenceChart rounds={session.rounds} />
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                      <Trophy size={14} className="text-amber-500" /> Model Fitness
                    </h4>
                    <div className="space-y-3">
                      {leaderboard.length > 0 ? (
                        leaderboard.map((m, i) => (
                          <div key={m.name} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-indigo-100">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm">{i + 1}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-slate-700 truncate">{m.name}</div>
                              <div className="text-[8px] text-slate-400 mt-0.5 uppercase tracking-tighter">{m.totalChars.toLocaleString()} chars preserved</div>
                            </div>
                            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">{m.avgRating ? m.avgRating.toFixed(1) : '—'} ★</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 italic text-center py-4">Awaiting lab results...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {diagTab === 'intelligence' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {latestRound ? (
                    <div className="space-y-6">
                      <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 space-y-3">
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-indigo-600" />
                          <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Latest Briefing</h4>
                        </div>
                        <p className="text-[11px] text-indigo-900 leading-relaxed italic">
                          {latestRound.synthesis.substring(0, 200)}...
                        </p>
                        <button 
                          onClick={() => handleSpeak(latestRound.synthesis, 'brief-tab')}
                          className="w-full bg-white text-indigo-600 font-bold py-2 rounded-xl text-[10px] uppercase border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                        >
                          <Volume2 size={12} /> Speak Full Report
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialist Snapshots</h4>
                        {latestRound.runs.map((run, i) => (
                          <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-slate-700 uppercase">{run.aiName.split('(')[1]?.replace(')', '') || 'Specialist'}</span>
                              <span className="text-[8px] font-mono text-slate-400">{run.charCount}ch</span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 italic leading-relaxed">"{run.response}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 space-y-4">
                      <Brain size={48} className="mx-auto text-slate-100" />
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Awaiting Intelligence</p>
                    </div>
                  )}
                </div>
              )}

              {diagTab === 'control' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Meta-Optimization Action */}
                  <div className="bg-indigo-600 text-white rounded-[2rem] p-6 space-y-4 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform"><Dna size={48} /></div>
                     <div className="flex items-center gap-2">
                       <Sparkles size={16} className="text-amber-400" />
                       <h4 className="font-bold text-[10px] uppercase tracking-widest">Self-Optimization</h4>
                     </div>
                     <p className="text-[10px] text-indigo-100 leading-relaxed italic">Use the Lab results to 'fix' the app's own orchestration logic.</p>
                     <button 
                       onClick={handleSelfOptimize}
                       disabled={!latestRound}
                       className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl text-[10px] uppercase hover:bg-indigo-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/10 disabled:opacity-50"
                     >
                       <RefreshCcw size={14} /> Meta-Optimize Logic
                     </button>
                  </div>

                  <div className="bg-slate-900 text-white rounded-[2rem] p-6 space-y-4 shadow-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
                        <Edit3 size={16} />
                      </div>
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-amber-500">Director Override</h4>
                    </div>
                    <textarea 
                      value={manualContract}
                      onChange={(e) => setManualContract(e.target.value)}
                      placeholder="Inject manual constraints or steer the thesis..."
                      className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-[11px] outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-600 leading-relaxed text-slate-300 shadow-inner font-mono"
                      rows={6}
                    />
                    <button 
                      onClick={applyIntervention}
                      className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-xl text-[10px] uppercase hover:bg-amber-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                    >
                      <ShieldCheck size={14} /> Update Lab Genome
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-inner">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experiment Variables</h4>
                    <div className="space-y-4">
                       <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                           <span>Convergence Threshold</span>
                           <span>{threshold}%</span>
                         </div>
                         <input 
                           type="range" 
                           min="50" 
                           max="95" 
                           value={threshold} 
                           onChange={(e) => setThreshold(parseInt(e.target.value))}
                           className="w-full accent-indigo-600"
                         />
                       </div>
                    </div>
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
