
import React, { useState } from 'react';
import { Plus, Send, Sparkles, Wand2, Box, Cpu, Swords, ListChecks, Lightbulb, Microscope } from 'lucide-react';
import { refineContract } from '../services/gemini';
import { Contract, SchemaType } from '../types';
import { SCENARIOS, SCHEMAS } from '../constants';

interface ContractBuilderProps {
  onComplete: (contract: Contract) => void;
}

const ContractBuilder: React.FC<ContractBuilderProps> = ({ onComplete }) => {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [selectedSchema, setSelectedSchema] = useState<SchemaType>('parallel');
  const [isImproving, setIsImproving] = useState(false);

  const applyScenario = (id: string) => {
    const scenario = SCENARIOS.find(s => s.id === id);
    if (scenario) {
      setTopic(scenario.defaultTopic);
      setContext(scenario.defaultContext);
      setSelectedSchema(scenario.recommendedSchema);
    }
  };

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
      schema: selectedSchema,
      createdAt: new Date().toISOString(),
      createdBy: 'Research Director'
    });
  };

  const getSchemaIcon = (id: SchemaType) => {
    switch (id) {
      case 'parallel': return <Cpu size={18} />;
      case 'sequential': return <ListChecks size={18} />;
      case 'competitive': return <Swords size={18} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <Microscope size={32} />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">R&D Lab Proposal</h2>
        <p className="text-slate-500 text-lg">Pitch your idea for feasibility deconstruction and iterative hardening.</p>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => applyScenario(sc.id)}
            className="p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-indigo-500 hover:shadow-xl transition-all group"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Lightbulb size={20} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{sc.name}</h4>
            <p className="text-xs text-slate-500 line-clamp-2">{sc.defaultTopic}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">The Core Idea</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What are we researching?"
              className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-2xl placeholder:text-slate-200"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Hypothesis & Initial Logic</label>
              <button 
                onClick={handleImprove}
                disabled={isImproving || !topic || !context}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors bg-indigo-50 px-4 py-2 rounded-full"
              >
                <Sparkles size={14} className={isImproving ? 'animate-spin' : ''} />
                {isImproving ? 'Strengthening Hypothesis...' : 'Harden Proposal'}
              </button>
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={8}
              placeholder="Describe the logic, the feasibility constraints, and your current assumptions..."
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all mono text-sm leading-relaxed"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!topic || !context}
            className="w-full bg-slate-900 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
          >
            Start Deconstruction Cycle
            <Send size={18} />
          </button>
        </div>

        {/* Schema Selection */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-2">Testing Schema</label>
          <div className="space-y-3">
            {SCHEMAS.map((sch) => (
              <button
                key={sch.id}
                onClick={() => setSelectedSchema(sch.id)}
                className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all ${
                  selectedSchema === sch.id 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getSchemaIcon(sch.id)}
                  <h4 className="font-bold text-sm uppercase tracking-wider">{sch.name}</h4>
                </div>
                <p className={`text-xs leading-relaxed ${selectedSchema === sch.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {sch.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractBuilder;
