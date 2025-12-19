
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
import { LayoutDashboard, Workflow, Info, TrendingUp, ShieldCheck, History } from 'lucide-react';
import { piecesService } from './services/pieces';
import { ollamaService } from './services/ollama';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orchestrator');
  const [session, setSession] = useState<Session | null>(null);

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

  const handleContractComplete = async (contract: Contract) => {
    const isPiecesConnected = await piecesService.checkConnection();
    const isOllamaConnected = await ollamaService.checkConnection();
    
    setSession({
      id: Math.random().toString(36).substr(2, 9),
      contract,
      rounds: [],
      status: 'idle',
      convergenceThreshold: 75,
      activePartners: [...INITIAL_PARTNERS],
      activeTools: ['search'], 
      modelMetrics: {},
      isPiecesConnected,
      isOllamaConnected
    });
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">Total Rounds</h3>
              <div className="text-3xl font-bold text-slate-800">{session?.rounds.length || 0}</div>
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={12} />Active Gauntlet</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">Enabled Tools</h3>
              <div className="text-3xl font-bold text-slate-800">{session?.activeTools.length || 0}</div>
              <p className="text-xs text-slate-400 mt-2">Active Agentic Features</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">Lineage Sync</h3>
              <div className={`text-xl font-bold ${session?.isPiecesConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                {session?.isPiecesConnected ? 'Connected' : 'Sync Off'}
              </div>
              <p className="text-xs text-slate-400 mt-2">Pieces OS Archival</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">Local Logic</h3>
              <div className={`text-xl font-bold ${session?.isOllamaConnected ? 'text-blue-600' : 'text-slate-400'}`}>
                {session?.isOllamaConnected ? 'Ollama Live' : 'Not Detected'}
              </div>
              <p className="text-xs text-slate-400 mt-2">SLM Computation</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Gauntlet Performance Metrics</h3>
            <div className="space-y-4">
              {session && Object.keys(session.modelMetrics).length > 0 ? (
                (Object.values(session.modelMetrics) as ModelMetric[]).map(m => (
                  <div key={m.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                        <TrendingUp size={18} className={m.type === 'SLM' ? 'text-emerald-500' : 'text-blue-500'} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-slate-700">{m.name}</div>
                          <span className={`text-[8px] font-bold px-1 rounded ${m.type === 'SLM' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {m.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">{m.totalChars.toLocaleString()} chars generated</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      {m.avgRating ? m.avgRating.toFixed(1) : '—'} ★
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 text-sm">Waiting for the gauntlet to begin...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'governance') {
      if (!session) return <div className="py-20 text-center text-slate-400">Initialize a gauntlet session first.</div>;
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

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-20 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Maestro GOTME Info</h2>
        <p className="text-slate-500 leading-relaxed text-sm">
          GOTME (Governed Orchestrated Thought Machine Engine) is a sophisticated gauntlet for AI breeding. 
          It uses Gemini 3 Pro with thinking mode for guidance and Flash Lite for low-latency responses.
        </p>
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      <ChatBot />
    </Layout>
  );
};

export default App;
