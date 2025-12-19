
import React, { useState } from 'react';
import { NAV_ITEMS } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
  headerExtra?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, headerExtra }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Collapsible Sidebar */}
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-30 transition-all duration-300 ease-in-out relative`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-indigo-600 text-white rounded-full p-1 shadow-lg hover:bg-indigo-500 transition-colors z-40"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 flex items-center gap-3 border-b border-slate-800 h-20 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-lg">
            <span className="font-bold text-xl tracking-tighter italic">Δ</span>
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-lg font-bold text-white leading-tight">MAESTRO</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Delta Engine</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 mt-4 overflow-x-hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-indigo-600/10 text-indigo-400 font-bold' 
                  : 'hover:bg-slate-800 hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <span className={`${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate text-xs uppercase tracking-wider font-bold">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-black text-slate-800 uppercase tracking-[0.2em] text-sm">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            {headerExtra}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Nihilo Filter Active
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
