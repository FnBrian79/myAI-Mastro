
import React, { useState } from 'react';
import Layout from './components/Layout';
import ContractBuilder from './components/ContractBuilder';
import OrchestrationView from './components/OrchestrationView';
import { Session, Contract } from './types';
import { LayoutDashboard, Workflow, Info, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orchestrator');
  const [session, setSession] = useState<Session | null>(null);

  const handleContractComplete = (contract: Contract) => {
    setSession({
      id: Math.random().toString(36).substr(2, 9),
      contract,
      rounds: [],
      status: 'idle',
      convergenceThreshold: 75 // Default sensitivity
    });
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">Total Runs</h3>
              <div className="text-3xl font-bold text-slate-800">12</div>
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                <TrendingUp size={12} />
                +2 from yesterday
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">M2M Efficiency</h3>
              <div className="text-3xl font-bold text-slate-800">94.2%</div>
              <p className="text-xs text-slate-400 mt-2">Machine comprehension score</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">Convergence Rate</h3>
              <div className="text-3xl font-bold text-slate-800">4.2 Rounds</div>
              <p className="text-xs text-indigo-500 mt-2">Average evolution speed</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Recent Lineage Log</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                      <Workflow size={18} className="text-slate-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">Evolution Task #{1024 + i}</div>
                      <div className="text-xs text-slate-400">Converged at Round 5 • 12,402 Chars</div>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">View Artifact</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'orchestrator') {
      if (!session) {
        return <ContractBuilder onComplete={handleContractComplete} />;
      }
      return <OrchestrationView session={session} onUpdate={setSession} />;
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-20 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Module Information</h2>
        <p className="text-slate-500 leading-relaxed">
          GOTME (Governed Orchestrated Thought Machine Engine) is a paired-AI thought breeding system. 
          It complements existing software/services, not to complicate or compromise, but to educate 
          and illuminate the truth. By automating the manual copy-paste workflow between browser tabs, 
          it enables exponential insights through parallel evolution.
        </p>
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
