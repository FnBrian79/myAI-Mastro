
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
  Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Session, Round, AIRun } from '../types';
import { simulateParallelAIs, synthesizeDebrief } from '../services/gemini';
import { PARTNER_MODELS } from '../constants';
import ConvergenceChart from './ConvergenceChart';

interface OrchestrationViewProps {
  session: Session;
  onUpdate: (session: Session) => void;
}

const OrchestrationView: React.FC<OrchestrationViewProps> = ({ session, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoEvolving, setIsAutoEvolving] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'parallel' | 'synthesis'>('idle');
  const [threshold, setThreshold] = useState(session.convergenceThreshold || 75);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.rounds]);

  // Effect to handle auto-evolution
  useEffect(() => {
    let timer: number;
    if (isAutoEvolving && !isProcessing && session.status !== 'converged') {
      timer = window.setTimeout(() => {
        runNextRound();
      }, 1500); // Small delay between rounds for visibility
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
    const baseTopic = lastRound ? lastRound.synthesis : session.contract.topic;
    const currentRoundNum = session.rounds.length + 1;

    try {
      // Dispatch in Parallel
      const runs: AIRun[] = await simulateParallelAIs(
        session.contract.context,
        baseTopic,
        PARTNER_MODELS
      );

      setCurrentStep('synthesis');
      
      // Debrief & Synthesize
      const synthesis = await synthesizeDebrief(runs, lastRound?.synthesis);
      
      const newRound: Round = {
        roundNumber: currentRoundNum,
        topic: baseTopic,
        runs,
        synthesis,
        synthesisCharCount: synthesis.length,
        timestamp: new Date().toISOString()
      };

      const updatedRounds = [...session.rounds, newRound];
      let updatedStatus = session.status;
      
      const currentPeak = Math.max(...updatedRounds.map(r => r.synthesisCharCount));
      const currentChars = synthesis.length;
      
      // Convergence Logic: Dwindle Detection
      // If current synthesis is below X% of the peak, the conversation has "stalled" or "over-summarized"
      const dwindleLimit = (currentPeak * (threshold / 100));
      
      if (updatedRounds.length >= 3 && currentChars < dwindleLimit) {
        updatedStatus = 'converged';
      }

      onUpdate({
        ...session,
        rounds: updatedRounds,
        status: updatedStatus,
        convergencePeak: currentPeak,
        convergenceThreshold: threshold
      });

    } catch (error) {
      console.error(error);
      setIsAutoEvolving(false);
    } finally {
      setIsProcessing(false);
      setCurrentStep('idle');
    }
  };

  const latestRound = session.rounds[session.rounds.length - 1];
  const peak = session.convergencePeak || 0;
  const currentSignal = latestRound ? (latestRound.synthesisCharCount / peak) * 100 : 0;
  const isNearConvergence = latestRound && currentSignal < threshold + 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Evolution Timeline */}
      <div className="lg:col-span-2 space-y-8 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Evolution Engine</h2>
            <p className="text-slate-500">
              Auto-stopping when synthesis signal falls below <span className="font-bold text-indigo-600">{threshold}%</span> of peak.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {session.status !== 'converged' && (
              <button
                onClick={() => setIsAutoEvolving(!isAutoEvolving)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all border-2 ${
                  isAutoEvolving 
                    ? 'bg-amber-50 border-amber-200 text-amber-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {isAutoEvolving ? <StopCircle size={18} /> : <RotateCw size={18} />}
                {isAutoEvolving ? 'Stop Auto' : 'Auto-Run'}
              </button>
            )}

            <button
              onClick={runNextRound}
              disabled={isProcessing || session.status === 'converged'}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                session.status === 'converged' 
                  ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200' 
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95'
              } disabled:opacity-50`}
            >
              {session.status === 'converged' ? (
                <>
                  <Check size={18} />
                  Converged
                </>
              ) : isProcessing ? (
                <>
                  <RotateCw size={18} className="animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  {session.rounds.length === 0 ? 'Initialize' : 'Next Round'}
                </>
              )}
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-4 pb-20"
        >
          {session.rounds.length === 0 && (
            <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center space-y-4">
              <Brain size={48} className="mx-auto text-slate-300" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-400">Context Loaded</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Breeding signals are ready. Start the evolution to generate insights.
                </p>
              </div>
            </div>
          )}

          {session.rounds.map((round, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-3xl border ${session.status === 'converged' && idx === session.rounds.length - 1 ? 'border-emerald-200 ring-4 ring-emerald-500/5' : 'border-slate-200'} shadow-sm overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500`}
            >
              <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-600 uppercase tracking-widest text-xs">Round {round.roundNumber}</span>
                  {idx === session.rounds.length - 1 && session.status === 'converged' && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">CONVERGENCE POINT</span>
                  )}
                </div>
                <span className="text-slate-400 text-xs font-mono">{new Date(round.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {round.runs.map((run, rIdx) => (
                    <div key={rIdx} className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">{run.aiName}</div>
                      <div className="text-xs font-mono font-bold text-slate-700">{run.charCount}</div>
                    </div>
                  ))}
                </div>

                <div className="prose prose-slate prose-sm max-w-none">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-slate-600 leading-relaxed">
                    <ReactMarkdown>{round.synthesis}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="bg-white rounded-3xl border-2 border-dashed border-indigo-200 p-8 flex flex-col items-center gap-4 animate-pulse">
              <Zap size={32} className="text-indigo-400" />
              <div className="text-center space-y-1">
                <div className="font-bold text-indigo-500">
                  {currentStep === 'parallel' ? 'Generating Partner Perspectives' : 'Debriefing & Consolidating'}
                </div>
                <div className="text-xs text-slate-400">
                  {currentStep === 'parallel' ? 'Sub-agents are analyzing the current contract...' : 'Gemini is looking for contradictions and new breeding paths...'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats & Metadata Sidebar */}
      <div className="space-y-6">
        <ConvergenceChart rounds={session.rounds} />

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Settings2 size={16} className="text-slate-400" />
              Stall Detection
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
              {threshold}%
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Sensitivity</span>
                <span>Stop Earlier</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="95" 
                value={threshold} 
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-400 leading-tight">
                Lower % = Runs longer (more tolerant of summarizing).<br/>
                Higher % = Stops sooner when signal drops.
              </p>
            </div>

            {session.rounds.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Breeding Signal</span>
                  <span className={`text-xs font-mono font-bold ${latestRound && latestRound.synthesisCharCount >= peak ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {latestRound?.synthesisCharCount} / {peak}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isNearConvergence ? 'bg-amber-400' : 'bg-indigo-500'}`}
                    style={{ width: `${currentSignal}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Target size={10} />
                  <span>Stop at {Math.round(peak * (threshold/100))} chars</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs">Governance</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</div>
              <div className={`text-xs font-bold px-2 py-1 rounded-lg inline-block ${
                session.status === 'converged' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {session.status === 'converged' ? 'SIGNAL CONVERGED' : isProcessing ? 'BREEDING...' : 'AWAITING SIGNAL'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Signal Peak</div>
              <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                {peak} <span className="text-[10px] text-slate-500">CHARS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Catfish Hooks Injection */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-bold text-amber-900">Catfish Intervention</h3>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">Interrupt the loop manually if it deviates or plateaus unexpectedly.</p>
          <textarea 
            placeholder="Inject corrective directive..."
            className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs outline-none focus:border-amber-400 transition-all placeholder:text-amber-300"
            rows={2}
          />
          <button className="w-full bg-amber-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-amber-700 transition-all shadow-sm">
            Execute Signal Override
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrchestrationView;
