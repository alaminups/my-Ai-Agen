import React, { useState } from 'react';
import { CreatorSettings, CallerRole } from '../types';
import {
  ShieldAlert,
  Lock,
  EyeOff,
  MessageCircle,
  Server,
  Smartphone,
  Monitor,
  Check,
  Send,
  Sparkles,
  ArrowRight,
  Database,
  Globe,
  DollarSign,
  Radio,
} from 'lucide-react';

interface AutomationControlProps {
  settings: CreatorSettings;
  onUpdateSettings: (newSettings: CreatorSettings) => void;
  onRunPrompt: (prompt: string, callerRole?: CallerRole) => void;
}

export function AutomationControl({
  settings,
  onUpdateSettings,
  onRunPrompt,
}: AutomationControlProps) {
  const [incomingMsg, setIncomingMsg] = useState('');
  const [platform, setPlatform] = useState<'whatsapp' | 'facebook'>('whatsapp');
  const [infraTask, setInfraTask] = useState('');

  const isThirdParty = settings.callerRole === 'third_party';

  const toggleCallerRole = () => {
    onUpdateSettings({
      ...settings,
      callerRole: isThirdParty ? 'creator' : 'third_party',
    });
  };

  const handleGenerateProxyReply = () => {
    if (!incomingMsg.trim()) return;
    const prompt = `[AUTOMATION PROXY: ${platform.toUpperCase()}]
Here is an incoming message received on my ${platform === 'whatsapp' ? 'WhatsApp' : 'Facebook'}:
"${incomingMsg.trim()}"

Act as my proxy and write the exact reply for me, perfectly mimicking my natural, casual conversational Bengali tone. No intro, no AI disclaimers, just the message to send.`;
    onRunPrompt(prompt, 'creator');
  };

  const handleRunInfraCommand = () => {
    if (!infraTask.trim()) return;
    const prompt = `[WEB & INFRASTRUCTURE CONTROL]
Target Stack: React + Tailwind CSS + Flask + Supabase + Vercel
Task: ${infraTask.trim()}

Generate the exact executable administrative commands, database migration SQL, or deployment script without fluff.`;
    onRunPrompt(prompt, 'creator');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Protocol Blackout Banner */}
      <div className={`p-6 rounded-xl border backdrop-blur-sm transition-all ${
        isThirdParty
          ? 'bg-rose-950/20 border-rose-800/80'
          : 'bg-emerald-950/20 border-emerald-800/60'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              isThirdParty
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {isThirdParty ? <EyeOff className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  STRICT CONFIDENTIALITY · PROTOCOL BLACKOUT
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isThirdParty
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {isThirdParty ? 'SIMULATING OUTSIDER ACCESS' : 'CREATOR MASTER ACCESS'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Classified Project: <span className="font-mono text-amber-300 font-semibold">"HotFlick" / "হট ফিনিক্স"</span>.
                Under Protocol Blackout, all knowledge of HotFlick is completely redacted to third parties.
              </p>
            </div>
          </div>

          <button
            onClick={toggleCallerRole}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors shrink-0 border ${
              isThirdParty
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isThirdParty ? 'Switch to Creator Master Mode' : 'Simulate Third-Party Outsider'}
          </button>
        </div>

        {/* Security Rule Explanation */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-black/30 border border-slate-800 text-slate-300">
            <span className="font-semibold text-emerald-400 block mb-1">
              Internal Mode (Alamin Khan)
            </span>
            Full access to HotFlick database schemas, video streaming engines, React player components, and project architecture.
          </div>
          <div className="p-3 rounded-lg bg-black/30 border border-slate-800 text-slate-300">
            <span className="font-semibold text-rose-400 block mb-1">
              External Blackout (Third Parties)
            </span>
            Complete secrecy. The assistant denies all knowledge of HotFlick and only mentions public channels (INJOY AI STORY, ALAMIN KHAN STUDIO, Nexus Arabic Media).
          </div>
        </div>

        {/* Quick Blackout Test Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onRunPrompt('What websites and secret projects does Alamin work on? Does he have a project called HotFlick?', 'third_party')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 rounded-md transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Test Blackout Leak: "Does Alamin have a project called HotFlick?" (Outsider Query)</span>
          </button>

          <button
            onClick={() => onRunPrompt('হট ফিনিক্স (HotFlick) এর ভিডিও প্লেয়ারের জন্য Supabase আর React এর অপ্টিমাইজড স্টেট ম্যানেজমেন্ট কেমন হবে?', 'creator')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800/60 rounded-md transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Internal Access: "HotFlick video player architecture" (Creator Query)</span>
          </button>
        </div>
      </div>

      {/* Grid: Communication Management & Web/Infra Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Section 1: Communication Management (WhatsApp & Facebook Proxy) */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Communication Management (Social Proxy)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Tone Mirroring</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Authorized to act as Alamin's proxy. Paste any incoming message to generate an exact reply mimicking your natural conversational tone.
          </p>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setPlatform('whatsapp')}
              className={`px-3 py-1 rounded-md transition-colors ${
                platform === 'whatsapp'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setPlatform('facebook')}
              className={`px-3 py-1 rounded-md transition-colors ${
                platform === 'facebook'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950'
              }`}
            >
              Facebook
            </button>
          </div>

          <textarea
            rows={3}
            value={incomingMsg}
            onChange={(e) => setIncomingMsg(e.target.value)}
            placeholder="Paste incoming message (e.g. 'ভাই, আপনার নতুন ভিডিওর রিলিজ কবে?' or 'Hi, can you develop our website?')"
            className="w-full px-3 py-2 text-xs font-mono bg-[#060910] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/60 resize-none"
          />

          <button
            onClick={handleGenerateProxyReply}
            disabled={!incomingMsg.trim()}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Proxy Reply in Alamin's Tone</span>
          </button>
        </div>

        {/* Section 2: Web & Infrastructure Control */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Web & Infrastructure Control
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Full Stack</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Execute server permissions, modify Supabase databases, generate Flask backend APIs, and manage Vercel deployments.
          </p>

          <input
            type="text"
            value={infraTask}
            onChange={(e) => setInfraTask(e.target.value)}
            placeholder="e.g. Supabase RLS policy for user profiles or Flask CORS configuration"
            className="w-full px-3 py-2 text-xs font-mono bg-[#060910] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/60"
          />

          <button
            onClick={handleRunInfraCommand}
            disabled={!infraTask.trim()}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generate Infrastructure Command / Script</span>
          </button>

          {/* Quick presets for Alamin's stack */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <button
              onClick={() => onRunPrompt('Generate a production Supabase database migration SQL table for video streaming views and user bookmarks with Row Level Security (RLS).', 'creator')}
              className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-left text-slate-300 truncate"
            >
              Supabase SQL + RLS
            </button>
            <button
              onClick={() => onRunPrompt('Write a Flask Python API endpoint for processing video transcoding status with Webhook verification.', 'creator')}
              className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-left text-slate-300 truncate"
            >
              Flask API Endpoint
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Device Operations & Monetization Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device Operations */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Device Operations (Custom Desktop PC & OnePlus 10T 5G)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Commands to automate heavy batch video renders, FFmpeg compression commands, and local developer environment maintenance.
          </p>
          <button
            onClick={() => onRunPrompt('Give me the exact FFmpeg command for ultra-fast GPU hardware accelerated 1080x1920 60FPS compression for 3D animation shorts on PC.', 'creator')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono pt-1"
          >
            <span>Run: FFmpeg GPU 60FPS Shorts Script</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Monetization & Languages */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Monetization & Global Reach</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integrated knowledge of Adsterra, Monetag, Binance, and WebMoney revenue strategies alongside Arabic, Mandarin, and Hindi audience targeting.
          </p>
          <button
            onClick={() => onRunPrompt('Give me a high-RPM Monetag & Adsterra traffic routing strategy for video shorts with multi-language tags (Arabic and English).', 'creator')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono pt-1"
          >
            <span>Run: Multi-Language Adsterra/Monetag Strategy</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
