
import React, { useState } from 'react';
import { Session } from '../types';
import { Archive, Search, History, ChevronRight, Copy, Share2, ExternalLink } from 'lucide-react';

interface LineageViewProps {
  session: Session;
}

const LineageView: React.FC<LineageViewProps> = ({ session }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Evolutionary Lineage</h2>
          <p className="text-slate-500">Trace the ancestry of machine thoughts preserved in Pieces OS.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Pieces Archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Session Ancestry</h3>
          
          {session.rounds.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center space-y-4">
              <History size={48} className="mx-auto text-slate-300" />
              <p className="text-slate-400 font-medium">No evolutionary lineage recorded yet.</p>
            </div>
          ) : (
            session.rounds.map((round, idx) => (
              <div key={idx} className="group bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:bg-indigo-600 transition-colors">
                    {round.roundNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800">Archived Synthesis</h4>
                      {round.piecesId && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100 uppercase">Pieces Snippet</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic max-w-md">"{round.synthesis.substring(0, 100)}..."</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{round.synthesisCharCount} Characters</span>
                      <span className="text-slate-200">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(round.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Copy to Clipboard">
                    <Copy size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Open in Pieces Desktop">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 text-white rounded-3xl p-8 space-y-6 shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-3">
              <Archive size={24} className="text-indigo-200" />
              <h3 className="font-bold text-lg">Pieces OS Link</h3>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Every evolutionary cycle is automatically captured as a semantic snippet. This allows you to "re-breed" successful thoughts later.
            </p>
            <div className="pt-4 space-y-3">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-indigo-200">
                 <span>Sync Status</span>
                 <span className="text-emerald-300">Active</span>
               </div>
               <div className="h-1.5 bg-indigo-500/50 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-400 w-full animate-pulse" />
               </div>
            </div>
            <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-2xl text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
              <ExternalLink size={16} />
              Open Pieces Desktop
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Lineage Insights</h3>
            <div className="space-y-3">
              {[
                { label: 'Longest Chain', val: `${session.rounds.length} cycles` },
                { label: 'Total Chars Preserved', val: `${session.rounds.reduce((acc, r) => acc + r.synthesisCharCount, 0).toLocaleString()}` },
                { label: 'Best Efficiency', val: 'Cycle 4' }
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineageView;
