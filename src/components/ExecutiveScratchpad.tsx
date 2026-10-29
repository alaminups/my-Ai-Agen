import React, { useState } from 'react';
import { TaskItem, ScratchpadNote } from '../types';
import { Plus, Trash2, CheckCircle2, Circle, Copy, Check, Download, NotebookPen, ListTodo, FileCode } from 'lucide-react';

interface ExecutiveScratchpadProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  notes: ScratchpadNote[];
  setNotes: React.Dispatch<React.SetStateAction<ScratchpadNote[]>>;
}

export function ExecutiveScratchpad({
  tasks,
  setTasks,
  notes,
  setNotes,
}: ExecutiveScratchpadProps) {
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [newTaskText, setNewTaskText] = useState('');
  const [copiedNote, setCopiedNote] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: TaskItem = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleCreateNote = () => {
    const newNote: ScratchpadNote = {
      id: Date.now().toString(),
      title: `Draft Note #${notes.length + 1}`,
      content: '',
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateActiveNote = (updates: Partial<ScratchpadNote>) => {
    if (!activeNote) return;
    setNotes(
      notes.map((n) =>
        n.id === activeNote.id
          ? { ...n, ...updates, updatedAt: Date.now() }
          : n
      )
    );
  };

  const handleDeleteNote = (id: string) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id && remaining.length > 0) {
      setActiveNoteId(remaining[0].id);
    }
  };

  const handleCopyNote = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleDownloadNote = () => {
    if (!activeNote) return;
    const blob = new Blob([`${activeNote.title}\n\n${activeNote.content}`], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tasks / Direct Action Items */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-400" />
                Alamin's Action Items
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {tasks.filter((t) => t.completed).length}/{tasks.length} Done
              </span>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add directive or task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-[#060910] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/60"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Task List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No action items logged. Send ideas from the Command Console or add above.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`group flex items-start justify-between gap-2.5 p-2.5 rounded-lg border transition-all ${
                      task.completed
                        ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                        : 'bg-[#060910] border-slate-800/80 text-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-xs leading-relaxed ${
                        task.completed ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Executive Scratchpad & Code Vault */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col h-[580px]">
            {/* Header with Note Selector & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <NotebookPen className="w-4 h-4 text-emerald-400 shrink-0" />
                {activeNote ? (
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                    className="font-semibold text-sm text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/40 rounded px-1 w-full"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white">Scratchpad</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCreateNote}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Note</span>
                </button>
                <button
                  onClick={handleCopyNote}
                  title="Copy note content"
                  className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-md transition-colors"
                >
                  {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownloadNote}
                  title="Download as Markdown"
                  className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {notes.length > 1 && activeNote && (
                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    title="Delete note"
                    className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/80 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Note Selector Tabs if multiple notes */}
            {notes.length > 1 && (
              <div className="flex items-center gap-1 py-2 overflow-x-auto border-b border-slate-800/60 mb-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                      note.id === activeNote?.id
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {note.title || 'Untitled'}
                  </button>
                ))}
              </div>
            )}

            {/* Note Editor Area */}
            {activeNote ? (
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                placeholder="Scratchpad for Alamin: Paste plans, code architecture, 3D video prompts, or notes here..."
                className="flex-1 w-full bg-[#060910] border border-slate-800/80 rounded-lg p-3 text-xs sm:text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed mt-2"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <NotebookPen className="w-8 h-8 text-slate-600" />
                <span>No active note selected.</span>
                <button
                  onClick={handleCreateNote}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium"
                >
                  Create First Note
                </button>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Markdown and code syntax supported</span>
              <span>Updated: {activeNote ? new Date(activeNote.updatedAt).toLocaleTimeString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
