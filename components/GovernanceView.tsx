
import React from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Star, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Wand2,
  Globe,
  Code,
  Database
} from 'lucide-react';
import { Session, ModelMetric } from '../types';
import { MODEL_POOL, AVAILABLE_TOOLS } from '../constants';

interface GovernanceViewProps {
  session: Session;
  onUpdate: (session: Session) => void;
}

const GovernanceView: React.FC<GovernanceViewProps> = ({ session, onUpdate }) => {
  const togglePartner = (modelName: string) => {
    let updatedPartners = [...session.activePartners];
    if (updatedPartners.includes(modelName)) {
      if (updatedPartners.length <= 1) return; // Must have at least one
      updatedPartners = updatedPartners.filter(p => p !== modelName);
    } else {
      updatedPartners.push(modelName);
    }
    onUpdate({ ...session, activePartners: updatedPartners });
  };

  const toggleTool = (toolId: string) => {
    const updatedTools = session.activeTools.includes(toolId)
      ? session.activeTools.filter(id => id !== toolId)
      : [...session.activeTools, toolId];
    onUpdate({ ...session, activeTools: updatedTools });
  };

  const activeMetrics = session.activePartners.map(p => session.modelMetrics[p] || { 
    name: p, 
    totalChars: 0, 
    avgRating: 0, 
    runs: 0, 
    type: MODEL_POOL.find(mp => mp.name === p)?.type || 'LLM' 
  });

  const getToolIcon = (id: string) => {
    switch(id) {
      case 'search': return <Globe size={20} className="text-blue-500" />;
      case 'code': return <Code size={20} className="text-emerald-500" />;
      case 'memory': return <Database size={20} className="text-purple-500" />;
      default: return <Wand2 size={20} className="text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Governance & Capabilities</h2>
          <p className="text-slate-500">Tune model intensity and enable agentic features for orchestration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Agentic Tools Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">Agentic Capabilities</h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{session.activeTools.length} ENABLED</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {AVAILABLE_TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all ${
                    session.activeTools.includes(tool.id)
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.activeTools.includes(tool.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {getToolIcon(tool.id)}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${session.activeTools.includes(tool.id) ? 'text-indigo-700' : 'text-slate-700'}`}>{tool.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-1">{tool.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Partners List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">Active Models</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {activeMetrics.map((m) => (
                <div key={m.name} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <Users size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-800">{m.name}</div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${m.type === 'SLM' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {m.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-medium text-amber-500">
                          <Star size={10} fill="currentColor" />{m.avgRating ? m.avgRating.toFixed(1) : '—'}
                        </span>
                        <span>•</span>
                        <span>{m.totalChars.toLocaleString()} chars</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => togglePartner(m.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <Plus size={20} className="text-indigo-400" />
              <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Available Pool</h3>
            </div>
            <div className="space-y-2">
              {MODEL_POOL.map(model => (
                <button
                  key={model.name}
                  onClick={() => togglePartner(model.name)}
                  disabled={session.activePartners.includes(model.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
                    session.activePartners.includes(model.name)
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-50 cursor-default'
                      : 'bg-slate-800 border-slate-700 hover:border-indigo-500 text-slate-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{model.name}</span>
                    <span className={`text-[8px] font-bold mt-0.5 ${model.type === 'SLM' ? 'text-emerald-500' : 'text-blue-400'}`}>{model.type}</span>
                  </div>
                  {session.activePartners.includes(model.name) ? <CheckCircle2 size={14} /> : <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceView;
