import React, { useState } from 'react';
import { Session } from '../types';
import { Plus, Trash2, MessageSquare, Download, X, Search, Terminal } from 'lucide-react';

interface SessionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export function SessionSidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportSession = (session: Session) => {
    let markdown = `# Alamin Assistant Command Session: ${session.title}\n`;
    markdown += `Created: ${new Date(session.createdAt).toLocaleString()}\n\n---\n\n`;

    for (const msg of session.messages) {
      const sender = msg.role === 'user' ? 'Alamin Khan (আলামিন খান)' : 'Alamin Assistant (আলামিন অ্যাসিস্ট্যান্ট)';
      markdown += `### ${sender} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n${msg.content}\n\n`;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-[#080d16] border-r border-slate-800 p-4 flex flex-col h-full shadow-2xl z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Alamin's Archives</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Session Button */}
        <button
          onClick={() => {
            onNewSession();
            onClose();
          }}
          className="my-3 w-full py-2 px-3 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#05080e] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No archives found.
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  session.id === activeSessionId
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-1">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{session.title || 'Untitled Session'}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportSession(session);
                    }}
                    title="Export session"
                    className="p-1 hover:text-slate-200 text-slate-400 rounded"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      title="Delete session"
                      className="p-1 hover:text-rose-400 text-slate-500 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom meta */}
        <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between items-center">
          <span>Sole Admin: Alamin Khan (আলামিন খান)</span>
          <span>{sessions.length} Threads</span>
        </div>
      </div>
    </div>
  );
}
