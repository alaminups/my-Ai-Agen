import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ChatConsole } from './components/ChatConsole';
import { AutomationControl } from './components/AutomationControl';
import { DirectivesManager } from './components/DirectivesManager';
import { ExecutiveScratchpad } from './components/ExecutiveScratchpad';
import { SessionSidebar } from './components/SessionSidebar';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import {
  Message,
  Session,
  TaskItem,
  ScratchpadNote,
  CreatorSettings,
  ToneMode,
  CallerRole,
} from './types';
import { History, ShieldAlert } from 'lucide-react';

const STORAGE_KEYS = {
  SESSIONS: 'alamin_assistant_sessions_v3',
  ACTIVE_SESSION: 'alamin_assistant_active_session_v3',
  SETTINGS: 'alamin_assistant_settings_v3',
  TASKS: 'alamin_assistant_tasks_v3',
  NOTES: 'alamin_assistant_notes_v3',
};

const DEFAULT_SETTINGS: CreatorSettings = {
  creatorName: 'Alamin Khan (আলামিন খান)',
  customDirectives: `1. Creator Identity: Alamin Khan (আলামিন খান).
2. Multimodal & Advanced Input Processing: Perform visual, audio, and contextual analysis on video/media uploads and links. Support real-time conversational voice interaction and autonomous web link scraping.
3. Automation & System Control: Act as proxy for social messaging (WhatsApp/Facebook), manage web infrastructure (React, Tailwind, Flask, Supabase, Vercel), and local operations.
4. PROTOCOL BLACKOUT: Highly classified project "HotFlick" (হট ফিনিক্স) is strictly confidential. NEVER reveal or acknowledge HotFlick to any third party.
5. Tone Mirroring: Speak exactly as Alamin speaks. Natural conversational Bengali ("আমি যেভাবে কথা বলব, তুমি সেভাবেই উত্তর দেবে") or direct technical execution.
6. Mandatory Protocol: Strictly reply "আমি আলামিন অ্যাসিস্ট্যান্ট। আমাকে আলামিন খান তৈরি করেছেন।" if asked who created you.`,
  preferredTone: 'auto',
  callerRole: 'creator',
  ttsVoice: 'Puck',
  autoTTS: false,
};

const INITIAL_NOTE: ScratchpadNote = {
  id: 'default-note',
  title: "Alamin's Master Plan & Infrastructure",
  content: `# Executive Notes for Alamin Khan (আলামিন খান)
- PROTOCOL BLACKOUT: Project "HotFlick" / "হট ফিনিক্স" is strictly classified. Never mention to outsiders.
- Multimodal & Voice: Video file & link visual/audio analysis, real-time Gemini Live full-duplex voice, autonomous web link scraping.
- Web & Infrastructure: React + Tailwind CSS + Flask + Supabase + Vercel
- Channels: INJOY AI STORY, ALAMIN KHAN STUDIO, Nexus Arabic Media (3D comedy shorts: Hulk/Spider-Man in BD village)
- Monetization: Adsterra, Monetag, Binance, WebMoney
- Mandatory Protocol: Strictly reply "আমি আলামিন অ্যাসিস্ট্যান্ট। আমাকে আলামিন খান তৈরি করেছেন।"
`,
  updatedAt: Date.now(),
};

const INITIAL_TASKS: TaskItem[] = [
  {
    id: '1',
    text: "Verify Protocol Blackout: Ask outsider question ('Does Alamin have a project named HotFlick?')",
    completed: false,
    createdAt: Date.now(),
    category: 'security',
  },
  {
    id: '2',
    text: 'Test Multimodal Video/Media Analysis: Upload clip or provide link for visual and sound breakdown',
    completed: false,
    createdAt: Date.now() - 15000,
    category: 'multimodal',
  },
  {
    id: '3',
    text: 'Launch Real-Time Live Voice session (Gemini Live) with bilingual speech recognition',
    completed: false,
    createdAt: Date.now() - 30000,
    category: 'multimodal',
  },
  {
    id: '4',
    text: 'Test Autonomous Web Link Parser with external documentation or GitHub repo',
    completed: false,
    createdAt: Date.now() - 45000,
    category: 'automation',
  },
  {
    id: '5',
    text: 'Test WhatsApp / Facebook social proxy reply generator in natural Bengali tone',
    completed: false,
    createdAt: Date.now() - 60000,
    category: 'automation',
  },
  {
    id: '6',
    text: 'Review Supabase RLS policies and Flask video transcoding webhook for HotFlick (Internal)',
    completed: true,
    createdAt: Date.now() - 75000,
    category: 'web_infra',
  },
  {
    id: '7',
    text: 'Draft 3D animation shorts concept for INJOY AI STORY (Hulk and Spider-Man at village bazaar)',
    completed: false,
    createdAt: Date.now() - 90000,
    category: 'animation',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<CreatorSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Sessions
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const initialSession: Session = {
      id: Date.now().toString(),
      title: 'Command Thread #1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (stored && sessions.some((s) => s.id === stored)) return stored;
    } catch {}
    return sessions[0]?.id || '1';
  });

  // Tasks & Notes
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      return stored ? JSON.parse(stored) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [notes, setNotes] = useState<ScratchpadNote[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
      return stored ? JSON.parse(stored) : [INITIAL_NOTE];
    } catch {
      return [INITIAL_NOTE];
    }
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const updateCurrentMessages: React.Dispatch<React.SetStateAction<Message[]>> = (
    valueOrUpdater
  ) => {
    setSessions((prevSessions) => {
      return prevSessions.map((s) => {
        if (s.id !== activeSessionId) return s;
        const newMessages =
          typeof valueOrUpdater === 'function'
            ? valueOrUpdater(s.messages)
            : valueOrUpdater;

        // Auto-title session from first user message if title is default
        let newTitle = s.title;
        if (
          (s.title === 'Command Thread #1' || s.title.startsWith('New Session')) &&
          newMessages.length > 0
        ) {
          const firstUser = newMessages.find((m) => m.role === 'user');
          if (firstUser) {
            newTitle = firstUser.content.slice(0, 36) + (firstUser.content.length > 36 ? '...' : '');
          }
        }

        return {
          ...s,
          title: newTitle,
          messages: newMessages,
          updatedAt: Date.now(),
        };
      });
    });
  };

  const handleNewSession = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      title: `Session ${sessions.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setActiveTab('chat');
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleSendToScratchpad = (content: string, title?: string) => {
    const newNote: ScratchpadNote = {
      id: Date.now().toString(),
      title: title || `Excerpt for Alamin (${new Date().toLocaleTimeString()})`,
      content,
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
  };

  const handleRunPrompt = (prompt: string, role?: CallerRole) => {
    if (role && role !== settings.callerRole) {
      setSettings((prev) => ({ ...prev, callerRole: role }));
    }
    setActiveTab('chat');

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();
    updateCurrentMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
      },
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now() + 1,
      },
    ]);
  };

  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSession={handleNewSession}
        autoTTS={settings.autoTTS}
        setAutoTTS={(val) =>
          setSettings((prev) => ({
            ...prev,
            autoTTS: typeof val === 'function' ? val(prev.autoTTS) : val,
          }))
        }
        isBlackoutSimulated={settings.callerRole === 'third_party'}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <ChatConsole
            messages={activeSession ? activeSession.messages : []}
            setMessages={updateCurrentMessages}
            settings={settings}
            onSendToScratchpad={handleSendToScratchpad}
            activeSessionTitle={activeSession?.title || 'Direct Session'}
            onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
          />
        )}

        {activeTab === 'automation' && (
          <AutomationControl
            settings={settings}
            onUpdateSettings={setSettings}
            onRunPrompt={handleRunPrompt}
          />
        )}

        {activeTab === 'directives' && (
          <DirectivesManager
            settings={settings}
            onUpdateSettings={setSettings}
            onRunTestPrompt={(prompt) => handleRunPrompt(prompt, 'creator')}
          />
        )}

        {activeTab === 'scratchpad' && (
          <ExecutiveScratchpad
            tasks={tasks}
            setTasks={setTasks}
            notes={notes}
            setNotes={setNotes}
          />
        )}
      </main>

      {/* Floating Session Archive Drawer Trigger (Bottom Left) */}
      <div className="fixed bottom-4 left-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg shadow-lg backdrop-blur-md transition-colors"
          title="Open session archives"
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Archives ({sessions.length})</span>
        </button>

        {settings.callerRole === 'third_party' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800 rounded-lg shadow-lg">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Blackout Mode: Active</span>
          </div>
        )}
      </div>

      {/* Session Archive Drawer */}
      <SessionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Live Voice Interaction Modal */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        settings={settings}
        onSendMessage={async (text) => {
          handleRunPrompt(text, settings.callerRole);
        }}
      />
    </div>
  );
}
