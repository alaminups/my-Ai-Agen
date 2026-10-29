import React from 'react';
import { Terminal, Shield, NotebookPen, Plus, ShieldAlert, Volume2, UserCheck, UserX } from 'lucide-react';
import { CallerRole } from '../types';

export type ActiveTab = 'chat' | 'security' | 'directives' | 'scratchpad';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewSession: () => void;
  autoTTS: boolean;
  setAutoTTS: (val: boolean | ((prev: boolean) => boolean)) => void;
  callerRole: CallerRole;
  onToggleRole: () => void;
  alertsCount: number;
}

export function Header({
  activeTab,
  setActiveTab,
  onNewSession,
  autoTTS,
  setAutoTTS,
  callerRole,
  onToggleRole,
  alertsCount,
}: HeaderProps) {
  const isAdmin = callerRole === 'admin' || callerRole === 'creator';

  return (
    <header className="h-16 px-3 sm:px-6 border-b border-emerald-900/30 bg-[#070b12]/95 backdrop-blur-md flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Terminal className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 font-mono">
              PREDATOR
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-700/50 px-1.5 py-0.5 rounded">
                এআই
              </span>
            </span>
            <span className="hidden md:inline-flex text-[10px] text-emerald-300/80 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded font-mono">
              আসসালামু আলাইকুম
            </span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wide font-mono flex items-center gap-1">
            Dev: <span className="text-slate-300 font-medium">Alamin Khan</span>
            <span className="text-emerald-500/70">·</span>
            <span className="text-slate-400 hidden sm:inline">Islamic Etiquette</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Tabs */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'chat'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'security'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Admin Monitor</span>
          <span className="sm:hidden">Monitor</span>
          {alertsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full animate-pulse">
              {alertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'directives'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Directives & Protocol</span>
          <span className="sm:hidden">Protocol</span>
        </button>

        <button
          onClick={() => setActiveTab('scratchpad')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'scratchpad'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <NotebookPen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scratchpad</span>
          <span className="sm:hidden">Notes</span>
        </button>
      </nav>

      {/* Zone 3: Role Switcher & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Role Toggle Button */}
        <button
          onClick={onToggleRole}
          title={isAdmin ? 'Switch to Regular User Mode' : 'Switch to Admin Mode (Alamin Khan)'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono font-semibold rounded-lg border transition-all ${
            isAdmin
              ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'bg-rose-950/60 border-rose-700/50 text-rose-300 hover:bg-rose-900/50'
          }`}
        >
          {isAdmin ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Admin (Alamin)</span>
              <span className="lg:hidden">Admin</span>
            </>
          ) : (
            <>
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden lg:inline">Regular User</span>
              <span className="lg:hidden">User</span>
            </>
          )}
        </button>

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
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Session</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>
    </header>
  );
}
