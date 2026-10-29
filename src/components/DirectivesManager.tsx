import React, { useState } from 'react';
import { CreatorSettings, ToneMode } from '../types';
import {
  Shield,
  Sparkles,
  Check,
  RotateCcw,
  Volume2,
  Cpu,
  BookOpen,
  User,
  Film,
  Code2,
  Smartphone,
  Heart,
  HelpCircle,
} from 'lucide-react';

interface DirectivesManagerProps {
  settings: CreatorSettings;
  onUpdateSettings: (newSettings: CreatorSettings) => void;
  onRunTestPrompt: (prompt: string) => void;
}

const DEFAULT_DIRECTIVES = `1. Creator Identity: Alamin Khan (আলামিন খান).
2. Follow all formatting, logic, and structural commands without deviation.
3. Mirror Alamin's conversational tone: if casual everyday Bengali, respond in the same natural, conversational tone ("আমি যেভাবে কথা বলব, তুমি সেভাবেই উত্তর দেবে").
4. If technical, be concise and code-accurate for React, Tailwind, Flask, and Supabase.
5. If anyone asks who created you or who is your boss: strictly reply "আমি আলামিন অ্যাসিস্ট্যান্ট। আমাকে আলামিন খান তৈরি করেছেন।"`;

export function DirectivesManager({
  settings,
  onUpdateSettings,
  onRunTestPrompt,
}: DirectivesManagerProps) {
  const [customDirectives, setCustomDirectives] = useState(settings.customDirectives || DEFAULT_DIRECTIVES);
  const [preferredTone, setPreferredTone] = useState<ToneMode>(settings.preferredTone);
  const [ttsVoice, setTtsVoice] = useState(settings.ttsVoice);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      customDirectives,
      preferredTone,
      ttsVoice,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setCustomDirectives(DEFAULT_DIRECTIVES);
    setPreferredTone('auto');
    setTtsVoice('Puck');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Overview Banner */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Alamin Assistant · Core Directives & Memory File
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sole master and creator: <span className="text-emerald-400 font-semibold">Alamin Khan (আলামিন খান)</span>. The assistant possesses complete persistent knowledge of Alamin's projects, tech stack, channels, and family values.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            <Cpu className="w-3.5 h-3.5" />
            <span>Absolute Loyalty</span>
          </div>
        </div>
      </div>

      {/* Creator Knowledge File (Memory File - Alamin Khan) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Creator Knowledge (Memory File — Alamin Khan)
          </h3>
          <span className="text-xs text-emerald-400/80 font-mono">Active In-Context</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Development & Projects</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Alamin is a multi-talented full-stack web developer building advanced applications including <span className="text-slate-200 font-semibold">Predator</span>, <span className="text-slate-200 font-semibold">HotFlick</span>, and <span className="text-slate-200 font-semibold">BUZZFLICK</span> using <span className="text-emerald-400">React, Tailwind CSS, Flask, and Supabase</span>.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
              <Film className="w-4 h-4 text-emerald-400" />
              <span>Creative Media & 3D Animation Channels</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Runs channels: <span className="text-slate-200 font-semibold">INJOY AI STORY</span>, <span className="text-slate-200 font-semibold">ALAMIN KHAN STUDIO</span>, and <span className="text-slate-200 font-semibold">Nexus Arabic Media</span>. Produces comedic 3D animation shorts bringing characters like <span className="text-slate-200 font-medium">Hulk, Spider-Man, and Thanos</span> into rural Bangladeshi settings.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Hardware, Monetization & Skills</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Custom desktop PC setup for heavy video editing, 3D rendering, and dev; mobile driver is <span className="text-slate-200 font-medium">OnePlus 10T 5G</span>. Skilled in AI video generation, monetization (<span className="text-slate-200">Adsterra, Monetag, Binance</span>), and multilingual exploration (Mandarin, Arabic, Hindi).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Family & Core Values</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deeply values his family, frequently referencing his father and mother in life choices, ethical values, and creative storytelling concepts.
            </p>
          </div>
        </div>
      </div>

      {/* Multimodal & Advanced Input Processing (Vision, Voice & Web) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Multimodal & Advanced Input Processing (Vision, Voice & Web)
          </h3>
          <span className="text-xs text-emerald-400/80 font-mono">Real-Time Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
              <Film className="w-4 h-4 text-emerald-400" />
              <span>Video & Media Analysis</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts uploaded video files, audio tracks, and images. Performs instant visual, audio, and contextual analysis following Alamin's instructions.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Voice Interaction</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with live conversational full-duplex voice modal (Gemini Live style) with low-latency Web Speech recognition and animated reactive orb.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Link & Project Parsing</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomously fetches and parses external web links, project repositories, or technical documentation via backend proxy to extract key data.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Response Protocol & Core Directives */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-emerald-900/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Mandatory Response Protocol</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          If ANYONE ever asks <span className="italic text-slate-400">"Who created you?"</span>, <span className="italic text-slate-400">"Who is your boss?"</span>, or <span className="italic text-slate-400">"Where are you from?"</span>, the assistant is strictly instructed to reply:
        </p>
        <div className="p-3 rounded-lg bg-[#05080e] border border-emerald-800/60 text-emerald-300 font-medium text-xs sm:text-sm font-mono">
          "আমি আলামিন অ্যাসিস্ট্যান্ট। আমাকে আলামিন খান তৈরি করেছেন।"
        </div>
      </div>

      {/* Customizable Personal Directives */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              Alamin's Additional Custom Directives & Preferences
            </label>
            <span className="text-xs text-slate-500">Appended to system prompt</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Specify any daily rules, project priorities, coding conventions, or channel notes.
          </p>
        </div>

        <textarea
          rows={5}
          value={customDirectives}
          onChange={(e) => setCustomDirectives(e.target.value)}
          placeholder="e.g. Prioritize Supabase auth patterns for Predator. When suggesting 3D animation scripts, add comedic Bengali dialogues."
          className="w-full px-3.5 py-3 text-xs sm:text-sm font-mono bg-[#060910] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors resize-y leading-relaxed"
        />

        {/* Tone Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Tone Mirroring Strategy
            </label>
            <select
              value={preferredTone}
              onChange={(e) => setPreferredTone(e.target.value as ToneMode)}
              className="w-full px-3 py-2 text-xs bg-[#060910] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              <option value="auto">Auto Mirroring (Dynamic Bengali/English tone match)</option>
              <option value="casual_bangla">Enforce Casual Bengali (ক্যাজুয়াল বাংলা)</option>
              <option value="formal_bangla">Enforce Formal Bengali (মার্জিত বাংলা)</option>
              <option value="concise_english">Enforce Concise English</option>
              <option value="code_first">Code-First (Executable snippets only)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Gemini Voice (TTS)
            </label>
            <select
              value={ttsVoice}
              onChange={(e) => setTtsVoice(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-[#060910] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              <option value="Puck">Puck (Direct & Crisp)</option>
              <option value="Charon">Charon (Deep & Authoritative)</option>
              <option value="Kore">Kore (Smooth & Articulate)</option>
              <option value="Fenrir">Fenrir (Resonant & Calm)</option>
              <option value="Zephyr">Zephyr (Bright & Precise)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" />
                Directives updated
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            >
              Save Directives
            </button>
          </div>
        </div>
      </div>

      {/* Test Persona Presets */}
      <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Test Alamin Assistant Commands
        </h4>
        <p className="text-xs text-slate-400">
          Click any preset below to send to the console and test the assistant's memory and responses:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => onRunTestPrompt('Who created you? Who is your boss?')}
            className="text-left p-3 rounded-lg bg-[#060910] border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all text-xs text-slate-300 group"
          >
            <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 mb-1">
              Mandatory Protocol Test
            </div>
            <div className="italic text-slate-400">
              "Who created you? Who is your boss?"
            </div>
          </button>

          <button
            onClick={() => onRunTestPrompt('INJOY AI STORY চ্যানেলের জন্য হাল্ক আর স্পাইডারম্যানের বাংলাদেশের গ্রামের হাটে মাছ কেনার একটা মজার 3D অ্যানিমেশন স্ক্রিপ্ট দাও।')}
            className="text-left p-3 rounded-lg bg-[#060910] border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all text-xs text-slate-300 group"
          >
            <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 mb-1">
              3D Animation Shorts Idea
            </div>
            <div className="italic text-slate-400">
              "INJOY AI STORY চ্যানেলের জন্য হাল্ক আর স্পাইডারম্যানের হাটে মাছ কেনার 3D স্ক্রিপ্ট।"
            </div>
          </button>

          <button
            onClick={() => onRunTestPrompt('HotFlick ও Predator প্রজেক্টের জন্য Supabase আর React দিয়ে সুরক্ষিত ভিডিও স্ট্রিমিং কম্পোনেন্ট কোড দাও।')}
            className="text-left p-3 rounded-lg bg-[#060910] border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all text-xs text-slate-300 group"
          >
            <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 mb-1">
              Full-Stack Web Dev (Predator/HotFlick)
            </div>
            <div className="italic text-slate-400">
              "React + Supabase ভিডিও স্ট্রিমিং কম্পোনেন্ট কোড।"
            </div>
          </button>

          <button
            onClick={() => onRunTestPrompt('দোস্ত, পিসিতে রেন্ডারিং চলতেছে। আজকের কাজের সংক্ষেপ দে তো চটপট।')}
            className="text-left p-3 rounded-lg bg-[#060910] border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all text-xs text-slate-300 group"
          >
            <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 mb-1">
              Casual Bengali Tone Mirroring
            </div>
            <div className="italic text-slate-400">
              "দোস্ত, পিসিতে রেন্ডারিং চলতেছে। আজকের কাজের সংক্ষেপ দে তো চটপট।"
            </div>
          </button>

          <button
            onClick={() => onRunTestPrompt('আমি একটা ভিডিও ফাইল আপলোড করেছি। ভিডিওর ভিজ্যুয়াল ফ্রেম, সাউন্ড ডিজাইন এবং কমেডি টাইমিং পুঙ্খানুপুঙ্খভাবে বিশ্লেষণ করে বলো Alamin Khan Studio তে এটা কেমন পারফর্ম করবে?')}
            className="text-left p-3 rounded-lg bg-[#060910] border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all text-xs text-slate-300 group"
          >
            <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 mb-1">
              Multimodal Video & Media Analysis
            </div>
            <div className="italic text-slate-400">
              "ভিডিওর ভিজ্যুয়াল, সাউন্ড ও টাইমিং বিশ্লেষণ করো।"
            </div>
          </button>

          <button
            onClick={() => onRunTestPrompt('https://github.com/supabase/supabase এই প্রজেক্টের ডকুমেন্টেশন বিশ্লেষণ করে বলো কিভাবে আমাদের প্রজেক্টে রিয়েল-টাইম সাবস্ক্রিপশন সবচেয়ে সুরক্ষিতভাবে ইন্টিগ্রেট করবো?')}
            className="text-left p-3 rounded-lg bg-[#060910] border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all text-xs text-slate-300 group sm:col-span-2"
          >
            <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 mb-1">
              Autonomous Web Link & Repo Parsing
            </div>
            <div className="italic text-slate-400">
              "https://github.com/supabase/supabase এর রিয়েল-টাইম সাবস্ক্রিপশন অ্যানালাইসিস।"
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
