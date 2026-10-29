import React from 'react';
import { Terminal, Shield, NotebookPen, Plus, Cpu, Volume2, Lock } from 'lucide-react';

export type ActiveTab = 'chat' | 'automation' | 'directives' | 'scratchpad';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewSession: () => void;
  autoTTS: boolean;
  setAutoTTS: (val: boolean | ((prev: boolean) => boolean)) => void;
  isBlackoutSimulated: boolean;
}

export function Header({
  activeTab,
  setActiveTab,
  onNewSession,
  autoTTS,
  setAutoTTS,
  isBlackoutSimulated,
}: HeaderProps) {
  return (
    <header className="h-16 px-4 md:px-8 border-b border-slate-800/80 bg-[#090e18]/90 backdrop-blur-md flex items-center justify-between gap-3 md:gap-6 sticky top-0 z-40">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Terminal className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            Alamin Assistant
            <span className="text-[11px] font-medium text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
              আলামিন খান
            </span>
          </span>
          <span className="text-[10px] text-slate-400 tracking-wide uppercase font-mono flex items-center gap-1.5">
            Loyal Personal AI
            {isBlackoutSimulated ? (
              <span className="text-rose-400">· [BLACKOUT SIMULATION]</span>
            ) : (
              <span className="text-emerald-500">· [MASTER MODE]</span>
            )}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation tabs */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'chat'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'automation'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Automation & Blackout</span>
          <span className="sm:hidden">Automation</span>
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'directives'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Directives & Memory</span>
          <span className="sm:hidden">Memory</span>
        </button>

        <button
          onClick={() => setActiveTab('scratchpad')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'scratchpad'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <NotebookPen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scratchpad</span>
          <span className="sm:hidden">Notes</span>
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setAutoTTS((prev) => !prev)}
          title={autoTTS ? 'Auto Voice: ON' : 'Auto Voice: OFF'}
          className={`p-2 text-xs rounded-md transition-colors border ${
            autoTTS
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Session</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>
    </header>
  );
}
