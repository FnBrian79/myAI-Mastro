
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ContractBuilder from './components/ContractBuilder';
import OrchestrationView from './components/OrchestrationView';
import GovernanceView from './components/GovernanceView';
import LineageView from './components/LineageView';
import AutomationView from './components/AutomationView';
import ChatBot from './components/ChatBot';
import { Session, Contract, ModelMetric } from './types';
import { INITIAL_PARTNERS, MODEL_POOL } from './constants';
import { TrendingUp, History, FileText, ClipboardCheck, ShieldAlert, Lock } from 'lucide-react';
import { piecesService } from './services/pieces';
import { ollamaService } from './services/ollama';
import { generateMasterAuditReport } from './services/audit';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orchestrator');
  const [session, setSession] = useState<Session | null>(null);
  const [isAuditCopied, setIsAuditCopied] = useState(false);

  useEffect(() => {
    const checkServices = async () => {
      const isPiecesConnected = await piecesService.checkConnection();
      const isOllamaConnected = await ollamaService.checkConnection();
      if (session) {
        setSession({ ...session, isPiecesConnected, isOllamaConnected });
      }
    };
    checkServices();
  }, []);

  const copyMasterAudit = () => {
    if (!session) return;
    const report = generateMasterAuditReport(session);
    navigator.clipboard.writeText(report);
    setIsAuditCopied(true);
    setTimeout(() => setIsAuditCopied(false), 2000);
  };

  const handleContractComplete = async (contract: Contract) => {
    const isPiecesConnected = await piecesService.checkConnection();
    const isOllamaConnected = await ollamaService.checkConnection();
    
    setSession({
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      contract,
      rounds: [],
      status: 'idle',
      phase: 'initial',
      convergenceThreshold: 75,
      activePartners: [...INITIAL_PARTNERS],
      activeTools: ['search'], 
      modelMetrics: {},
      isPiecesConnected,
      isOllamaConnected
    });
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      headerExtra={session && (
        <button 
          onClick={copyMasterAudit}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-[10px] tracking-widest transition-all active:scale-95 border-2 ${isAuditCopied ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'}`}
        >
          {isAuditCopied ? <ClipboardCheck size={14} /> : <Lock size={14} />}
          {isAuditCopied ? 'NIHILO SEALED' : 'MASTER FORENSIC SNAPSHOT'}
        </button>
      )}
    >
      {(() => {
        if (activeTab === 'dashboard') {
          return (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                 <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">System State Telemetry</h2>
                    <p className="text-slate-500 text-sm">Real-time monitoring of the Protocol-Delta engine.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Total Generations</h3>
                  <div className="text-3xl font-bold text-slate-800">{session?.rounds.length || 0}</div>
                  <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={12} />Swarm Active</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Delta Protocol</h3>
                  <div className="text-3xl font-bold text-slate-800">v01.D</div>
                  <p className="text-xs text-indigo-500 mt-2">Nihilo Filter Live</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Lineage Sync</h3>
                  <div className={`text-xl font-bold ${session?.isPiecesConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {session?.isPiecesConnected ? 'Connected' : 'Sync Off'}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">IAT Verification</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-4 tracking-widest">Local Slm</h3>
                  <div className={`text-xl font-bold ${session?.isOllamaConnected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {session?.isOllamaConnected ? 'Ollama Live' : 'Not Detected'}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Edge Computation</p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-indigo-600" />
                  Unit Convergence Metrics
                </h3>
                <div className="space-y-4">
                  {session && Object.keys(session.modelMetrics).length > 0 ? (
                    (Object.values(session.modelMetrics) as ModelMetric[]).map(m => (
                      <div key={m.name} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                            <TrendingUp size={18} className={m.type === 'SLM' ? 'text-emerald-500' : 'text-blue-500'} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-bold text-slate-700">{m.name}</div>
                              <span className={`text-[8px] font-bold px-1.5 rounded ${m.type === 'SLM' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                {m.type}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">{m.totalChars.toLocaleString()} chars processed</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-1 rounded-full">
                          {m.avgRating ? m.avgRating.toFixed(1) : '—'} ★
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-3xl">
                      <History size={48} className="text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm">Awaiting lab ignition for telemetry capture.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (activeTab === 'governance') {
          if (!session) return <div className="py-20 text-center text-slate-400">Initialize a delta session first.</div>;
          return <GovernanceView session={session} onUpdate={setSession} />;
        }

        if (activeTab === 'orchestrator') {
          if (!session) return <ContractBuilder onComplete={handleContractComplete} />;
          return <OrchestrationView session={session} onUpdate={setSession} />;
        }

        if (activeTab === 'automation') {
          return <AutomationView />;
        }

        if (activeTab === 'lineage') {
          if (!session) return <div className="py-20 text-center text-slate-400">No lineage without a session.</div>;
          return <LineageView session={session} />;
        }

        return <div className="py-20 text-center text-slate-400">Maestro Info Ready.</div>;
      })()}
      <ChatBot session={session} />
    </Layout>
  );
};

export default App;
