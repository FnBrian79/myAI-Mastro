
import React, { useState } from 'react';
import { Plus, Send, Sparkles, Wand2 } from 'lucide-react';
import { refineContract } from '../services/gemini';
import { Contract } from '../types';

interface ContractBuilderProps {
  onComplete: (contract: Contract) => void;
}

const ContractBuilder: React.FC<ContractBuilderProps> = ({ onComplete }) => {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  const handleImprove = async () => {
    if (!topic || !context) return;
    setIsImproving(true);
    try {
      const refined = await refineContract(topic, context);
      setContext(refined || context);
    } catch (error) {
      console.error(error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = () => {
    if (!topic || !context) return;
    onComplete({
      topic,
      context,
      createdAt: new Date().toISOString(),
      createdBy: 'User + Conducter'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Phase 1: Co-Create Contract</h2>
        <p className="text-slate-500">Collaborate with Gemini to build the foundation of your evolutionary cycle.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">The Topic / Problem</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Design a fault-tolerant GKE architecture"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-lg"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">The Context & Wording</label>
            <button 
              onClick={handleImprove}
              disabled={isImproving || !topic || !context}
              className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors bg-indigo-50 px-3 py-1.5 rounded-full"
            >
              <Sparkles size={14} className={isImproving ? 'animate-spin' : ''} />
              {isImproving ? 'Illuminating...' : 'Refine with AI Mom'}
            </button>
          </div>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={10}
            placeholder="Describe the constraints, references, and stop conditions..."
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all mono text-sm leading-relaxed"
          />
        </div>

        <div className="pt-4 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={!topic || !context}
            className="flex-1 bg-indigo-600 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
          >
            Deploy Contract to Orchestrator
            <Send size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Machine Consumable', desc: 'Ensures output is strictly formatted for sub-agents.' },
          { title: 'Sovereign Control', desc: 'You retain the ability to inject catfish hooks at any time.' },
          { title: 'Evolutionary', desc: 'Each round optimizes based on stress test failure signals.' }
        ].map((feat, i) => (
          <div key={i} className="p-5 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            <h4 className="font-bold text-slate-800 text-sm mb-1">{feat.title}</h4>
            <p className="text-xs text-slate-500">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractBuilder;
