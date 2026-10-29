import React, { useState, useEffect, useRef } from 'react';
import { CreatorSettings } from '../types';
import { generateTTS } from '../services/api';
import { Mic, MicOff, X, Volume2, Sparkles, Terminal, Radio } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CreatorSettings;
  onSendMessage: (text: string) => Promise<string | void>;
}

export function LiveVoiceModal({
  isOpen,
  onClose,
  settings,
  onSendMessage,
}: LiveVoiceModalProps) {
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [conversationLogs, setConversationLogs] = useState<Array<{ role: 'alamin' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'আলামিন ভাই, লাইভ ভয়েস মোড সক্রিয়। আমি আপনার কথা শুনতে পাচ্ছি।' },
  ]);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      stopVoice();
      return;
    }
    startListening();
    return () => {
      stopVoice();
    };
  }, [isOpen]);

  const stopVoice = () => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setVoiceState('idle');
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setConversationLogs((prev) => [
        ...prev,
        { role: 'assistant', text: 'ব্রাউজারে স্পিচ রিকগনিশন সমর্থন করে না। অনুগ্রহ করে ক্রোম ব্যবহার করুন।' },
      ]);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'bn-BD'; // Bilingual support

      recognition.onstart = () => {
        isListeningRef.current = true;
        setVoiceState('listening');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += t;
          } else {
            interimTranscript += t;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);

        if (finalTranscript.trim()) {
          handleAlaminSpoken(finalTranscript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech error in Live Voice:', e);
        if (e.error !== 'no-speech') {
          setVoiceState('idle');
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && voiceState !== 'speaking' && voiceState !== 'thinking') {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start Live Voice recognition:', err);
    }
  };

  const handleAlaminSpoken = async (query: string) => {
    if (!query.trim()) return;

    // Pause listening while thinking & answering
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setVoiceState('thinking');
    setConversationLogs((prev) => [...prev, { role: 'alamin', text: query }]);
    setTranscript('');

    try {
      // Call chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: query }],
          customDirectives: settings.customDirectives,
          tonePreference: settings.preferredTone,
          callerRole: settings.callerRole,
          stream: false,
        }),
      });

      const data = await response.json();
      const replyText = data.text || 'আলামিন ভাই, আপনার নির্দেশ পেয়েছি।';

      setConversationLogs((prev) => [...prev, { role: 'assistant', text: replyText }]);
      setVoiceState('speaking');

      // Synthesize with Gemini TTS
      const audioUrl = await generateTTS(replyText, settings.ttsVoice);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setVoiceState('listening');
        startListening();
      };

      audio.onerror = () => {
        setVoiceState('listening');
        startListening();
      };

      await audio.play();
    } catch (err: any) {
      console.error('Live voice processing error:', err);
      setVoiceState('listening');
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Main Glass Panel */}
      <div className="relative w-full max-w-2xl bg-[#080d16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col h-[600px]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Gemini Live Voice Interaction
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                  Full-Duplex
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Conversational Voice · Voice Persona: {settings.ttsVoice}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Central Orb / Waveform Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden">
          {/* Glowing Ambient Background */}
          <div
            className={`absolute w-72 h-72 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
              voiceState === 'listening'
                ? 'bg-emerald-500/20 scale-110'
                : voiceState === 'speaking'
                ? 'bg-cyan-500/25 scale-125 animate-pulse'
                : voiceState === 'thinking'
                ? 'bg-amber-500/20 scale-95 animate-spin'
                : 'bg-slate-700/10 scale-90'
            }`}
          />

          {/* Central Animated Sphere */}
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative border ${
              voiceState === 'listening'
                ? 'bg-emerald-950/80 border-emerald-500/60 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10'
                : voiceState === 'speaking'
                ? 'bg-cyan-950/80 border-cyan-400/80 shadow-xl shadow-cyan-500/30 ring-8 ring-cyan-500/20 animate-pulse'
                : voiceState === 'thinking'
                ? 'bg-amber-950/80 border-amber-500/60 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            {voiceState === 'listening' && (
              <Mic className="w-12 h-12 text-emerald-400 animate-pulse" />
            )}
            {voiceState === 'speaking' && (
              <Volume2 className="w-12 h-12 text-cyan-300 animate-bounce" />
            )}
            {voiceState === 'thinking' && (
              <Sparkles className="w-12 h-12 text-amber-400 animate-spin" />
            )}
            {voiceState === 'idle' && (
              <MicOff className="w-12 h-12 text-slate-500" />
            )}
          </div>

          {/* Voice State Badge */}
          <div className="mt-5 text-center">
            <span
              className={`text-xs font-mono font-medium px-3 py-1 rounded-full border transition-all ${
                voiceState === 'listening'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : voiceState === 'speaking'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                  : voiceState === 'thinking'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {voiceState === 'listening' && 'Listening (Alamin Khan)... Speak in Bengali or English'}
              {voiceState === 'speaking' && 'Speaking back to Alamin...'}
              {voiceState === 'thinking' && 'Processing query...'}
              {voiceState === 'idle' && 'Voice Session Idle'}
            </span>

            {transcript && (
              <p className="mt-3 text-xs text-slate-300 italic max-w-md mx-auto line-clamp-2 px-2">
                "{transcript}"
              </p>
            )}
          </div>
        </div>

        {/* Live Conversation Transcript Reel */}
        <div className="h-44 border-t border-slate-800 bg-[#060910] p-3 overflow-y-auto space-y-2 text-xs">
          <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
            Live Transcript
          </div>
          {conversationLogs.slice(-4).map((log, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg ${
                log.role === 'alamin'
                  ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-200 ml-4'
                  : 'bg-slate-900/70 border border-slate-800 text-slate-200 mr-4'
              }`}
            >
              <span className="font-semibold text-[10px] block opacity-70 mb-0.5">
                {log.role === 'alamin' ? 'Alamin Khan (You)' : 'Alamin Assistant'}
              </span>
              <p className="leading-relaxed">{log.text}</p>
            </div>
          ))}
        </div>

        {/* Bottom Control Actions */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-[#070b12] flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-slate-500">
            Powered by gemini-3.8-flash-lite-tts & Web Speech
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (voiceState === 'listening') {
                  stopVoice();
                } else {
                  startListening();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {voiceState === 'listening' ? 'Pause Mic' : 'Resume Mic'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
