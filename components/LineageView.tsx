
import React, { useState } from 'react';
import { Session } from '../types';
import { Archive, Search, History, ChevronRight, Copy, Share2, ExternalLink, Lock, HardDriveDownload, ClipboardCheck } from 'lucide-react';
import { generateMasterAuditReport } from '../services/audit';

interface LineageViewProps {
  session: Session;
}

const LineageView: React.FC<LineageViewProps> = ({ session }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuditCopied, setIsAuditCopied] = useState(false);

  const copyMasterAudit = () => {
    const report = generateMasterAuditReport(session);
    navigator.clipboard.writeText(report);
    setIsAuditCopied(true);
    setTimeout(() => setIsAuditCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Evolutionary Lineage</h2>
          <p className="text-slate-500">Trace the Auditable Integrity of archived machine thoughts.</p>
        </div>
        <button 
          onClick={copyMasterAudit}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 border-2 ${isAuditCopied ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'}`}
        >
          {isAuditCopied ? <ClipboardCheck size={16} /> : <HardDriveDownload size={16} />}
          {isAuditCopied ? 'LEDGER COPIED' : 'SNAP MASTER AUDIT'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Archived Receipts</h3>
          
          {session.rounds.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center space-y-4">
              <History size={48} className="mx-auto text-slate-300" />
              <p className="text-slate-400 font-medium">No audited lineage recorded yet.</p>
            </div>
          ) : (
            session.rounds.map((round, idx) => (
              <div key={idx} className="group bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-lg">
                    {round.roundNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800">Sealed Generation</h4>
                      {round.iatSignature && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100 uppercase flex items-center gap-1">
                          <Lock size={10} /> {round.iatSignature}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-1">Sync ID: {round.piecesId || 'LOCAL_ONLY'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 text-white rounded-3xl p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <Archive size={24} className="text-indigo-200" />
              <h3 className="font-bold text-lg">Synchronization Hub</h3>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Every round is verified against the IAT protocol before being deposited into Pieces OS. This ensures the manual audit trail matches the machine's state exactly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineageView;
