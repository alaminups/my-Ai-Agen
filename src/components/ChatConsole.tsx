import React, { useState, useRef, useEffect } from 'react';
import { Message, ToneMode, CreatorSettings, ScratchpadNote, MediaAttachment } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { streamChat, generateTTS, parseWebLink } from '../services/api';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  BookmarkPlus,
  Loader2,
  Terminal,
  Paperclip,
  Film,
  Image as ImageIcon,
  Globe,
  Radio,
  X,
  FileCode,
} from 'lucide-react';

interface ChatConsoleProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  settings: CreatorSettings;
  onSendToScratchpad: (content: string, title?: string) => void;
  activeSessionTitle: string;
  onOpenLiveVoice: () => void;
}

export function ChatConsole({
  messages,
  setMessages,
  settings,
  onSendToScratchpad,
  activeSessionTitle,
  onOpenLiveVoice,
}: ChatConsoleProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedScratchpadId, setAddedScratchpadId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Multimodal Media & Web Link states
  const [pendingMedia, setPendingMedia] = useState<MediaAttachment | null>(null);
  const [showLinkBar, setShowLinkBar] = useState(false);
  const [targetLink, setTargetLink] = useState('');
  const [isParsingLink, setIsParsingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortStreamRef = useRef<(() => void) | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom as messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Web Speech API for voice input
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'bn-BD'; // supports Bangla & English interchangeably

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  // Handle file attachment (Video, Image, Audio)
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    let category: 'video' | 'image' | 'audio' = 'image';
    if (fileType.startsWith('video/')) category = 'video';
    else if (fileType.startsWith('audio/')) category = 'audio';

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.split(',')[1];
      setPendingMedia({
        mimeType: file.type || (category === 'video' ? 'video/mp4' : 'image/jpeg'),
        data: base64Data,
        name: file.name,
        size: file.size,
        type: category,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle autonomous link parsing
  const handleParseLink = async () => {
    if (!targetLink.trim()) return;
    setIsParsingLink(true);
    setLinkError(null);

    try {
      const parsed = await parseWebLink(targetLink.trim());
      setIsParsingLink(false);
      setShowLinkBar(false);
      setTargetLink('');

      const contextualNote = `[AUTONOMOUS LINK PARSED: "${parsed.title}"]\nTarget URL: ${parsed.url}\nContent Excerpt:\n"""\n${parsed.content.slice(0, 3000)}\n"""\n\nAlamin's Directive: Please analyze the above link/repo and `;
      setInput((prev) => (prev ? `${contextualNote}\n${prev}` : contextualNote));
    } catch (err: any) {
      setIsParsingLink(false);
      setLinkError(err.message || 'Failed to fetch link.');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if ((!text && !pendingMedia) || isStreaming) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: text || (pendingMedia ? `[Attached ${pendingMedia.type.toUpperCase()}: ${pendingMedia.name || 'file'}]` : ''),
      timestamp: Date.now(),
      media: pendingMedia || undefined,
    };

    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
    };

    const updatedMessages = [...messages, userMessage, initialAssistantMessage];
    setMessages(updatedMessages);
    setInput('');
    const currentMediaToSend = pendingMedia;
    setPendingMedia(null);
    setIsStreaming(true);

    let accumulatedContent = '';

    const abortFn = await streamChat({
      messages: updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
        media: m.media,
      })),
      customDirectives: settings.customDirectives,
      tonePreference: settings.preferredTone,
      callerRole: settings.callerRole,
      onChunk: (chunk: string) => {
        accumulatedContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      },
      onComplete: () => {
        setIsStreaming(false);
        abortStreamRef.current = null;

        // Auto TTS if enabled
        if (settings.autoTTS && accumulatedContent) {
          playTTS(assistantMsgId, accumulatedContent);
        }
      },
      onError: (err: Error) => {
        console.error('Streaming error:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    accumulatedContent ||
                    `*Error contacting assistant engine: ${err.message}*`,
                }
              : msg
          )
        );
        setIsStreaming(false);
        abortStreamRef.current = null;
      },
    });

    abortStreamRef.current = abortFn;
  };

  const handleStopStream = () => {
    if (abortStreamRef.current) {
      abortStreamRef.current();
      abortStreamRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToNotes = (id: string, text: string) => {
    onSendToScratchpad(text, `Response for Alamin (${new Date().toLocaleTimeString()})`);
    setAddedScratchpadId(id);
    setTimeout(() => setAddedScratchpadId(null), 2000);
  };

  const playTTS = async (id: string, text: string) => {
    if (playingAudioId === id && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingAudioId(null);
      return;
    }

    try {
      setAudioLoadingId(id);
      const audioUrl = await generateTTS(text, settings.ttsVoice);
      setAudioLoadingId(null);

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      setPlayingAudioId(id);

      audio.onended = () => {
        setPlayingAudioId(null);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        setPlayingAudioId(null);
        setAudioLoadingId(null);
        currentAudioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error('Audio playback error:', err);
      setAudioLoadingId(null);
      setPlayingAudioId(null);

      // Browser fallback speech synthesis
      if ('speechSynthesis' in window) {
        const clean = text.replace(/```[\s\S]*?```/g, '').replace(/[*_#`]/g, '');
        const utter = new SpeechSynthesisUtterance(clean.slice(0, 300));
        window.speechSynthesis.speak(utter);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* Session Header Indicator */}
      <div className="py-2.5 px-3 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-slate-300 truncate max-w-xs sm:max-w-md">
            {activeSessionTitle || 'Direct Session'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px]">
          {/* Live Voice Interaction trigger */}
          <button
            onClick={onOpenLiveVoice}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-colors"
            title="Launch Full-Duplex Live Voice"
          >
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Gemini Live Voice</span>
            <span className="sm:hidden">Live</span>
          </button>

          {settings.callerRole === 'third_party' ? (
            <span className="text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded">
              Outsider (Blackout)
            </span>
          ) : (
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              Master Access
            </span>
          )}
          <span className="hidden md:inline text-slate-500">·</span>
          <span className="hidden md:inline text-slate-400">
            Tone: <span className="text-emerald-400">{settings.preferredTone}</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 px-2 sm:px-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center py-12 px-4 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
              <Terminal className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                আলামিন ভাই, আমি প্রস্তুত।
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                ভিডিও বা মিডিয়া আপলোড করুন, যেকোনো ওয়েব লিংক দিন, কিংবা লাইভ ভয়েসে কথা বলুন—আমি সরাসরি প্রস্তুত। Predator, HotFlick বা INJOY AI STORY এর যেকোনো নির্দেশ দিন।
              </p>
            </div>

            {/* Quick Action Commands for Alamin Khan */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
              <button
                onClick={() =>
                  handleSendMessage('Who created you? Who is your boss?')
                }
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all text-xs text-slate-300 group"
              >
                <div className="font-semibold text-emerald-400 flex items-center justify-between mb-1">
                  <span>Mandatory Protocol Check</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  "Who created you? Who is your boss?"
                </div>
              </button>

              <button
                onClick={onOpenLiveVoice}
                className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/60 hover:border-emerald-500/60 hover:bg-emerald-950/40 transition-all text-xs text-emerald-200 group"
              >
                <div className="font-semibold text-emerald-400 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Live Full-Duplex Voice
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  Launch Gemini Live real-time conversational voice.
                </div>
              </button>

              <button
                onClick={() =>
                  handleSendMessage(
                    'INJOY AI STORY চ্যানেলের জন্য হাল্ক আর স্পাইডারম্যানের বাংলাদেশের গ্রামের হাটে মাছ কেনার একটা মজার 3D অ্যানিমেশন শর্টস স্ক্রিপ্ট দাও।'
                  )
                }
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all text-xs text-slate-300 group"
              >
                <div className="font-semibold text-emerald-400 flex items-center justify-between mb-1">
                  <span>3D Animation Shorts (INJOY AI STORY)</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  হাল্ক ও স্পাইডারম্যানের গ্রামীণ হাটে মজার 3D স্ক্রিপ্ট।
                </div>
              </button>

              <button
                onClick={() =>
                  handleSendMessage(
                    'আমার WhatsApp এ মেসেজ আসছে: "Alamin bhai, what are the best practices for Supabase RLS security in our web app?". আমার স্টাইলে সরাসরি পাঠানোর মতো রিপ্লাই দাও।'
                  )
                }
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all text-xs text-slate-300 group"
              >
                <div className="font-semibold text-emerald-400 flex items-center justify-between mb-1">
                  <span>Social Proxy (WhatsApp Reply)</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  স্বাভাবিক বাংলা টোনে প্রক্সি রিপ্লাই তৈরি।
                </div>
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Bubble Container */}
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-4 sm:p-5 transition-all ${
                  message.role === 'user'
                    ? 'bg-emerald-950/40 border border-emerald-700/40 text-slate-100'
                    : 'bg-slate-900/80 border border-slate-800/90 text-slate-200 shadow-sm'
                }`}
              >
                {/* Sender Tag */}
                <div className="flex items-center justify-between gap-4 mb-2 text-[11px] font-mono text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5">
                    {message.role === 'user' ? (
                      <span className="text-emerald-400">Alamin Khan (আলামিন খান)</span>
                    ) : (
                      <span className="text-slate-300 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-emerald-400" />
                        Alamin Assistant (আলামিন অ্যাসিস্ট্যান্ট)
                      </span>
                    )}
                  </span>
                  <span className="text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Attached Multimodal Media Preview */}
                {message.media && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-700 bg-black/40">
                    {message.media.type === 'image' && (
                      <img
                        src={`data:${message.media.mimeType};base64,${message.media.data}`}
                        alt={message.media.name || 'Attached image'}
                        className="max-h-72 w-auto rounded-lg object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {message.media.type === 'video' && (
                      <div className="p-2.5 flex items-center gap-2 bg-slate-950 text-xs text-slate-300">
                        <Film className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono">
                          Video attached: {message.media.name || 'video_clip.mp4'}
                        </span>
                      </div>
                    )}
                    {message.media.type === 'audio' && (
                      <div className="p-2 flex items-center gap-2 bg-slate-950">
                        <audio
                          controls
                          src={`data:${message.media.mimeType};base64,${message.media.data}`}
                          className="w-full h-8"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Message Content */}
                {message.role === 'user' ? (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                ) : (
                  <div>
                    {message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Formulating obedient response for Alamin Khan...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Assistant Message Actions (TTS, Copy, Scratchpad) */}
                {message.role === 'assistant' && message.content && (
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                    {/* TTS Button */}
                    <button
                      onClick={() => playTTS(message.id, message.content)}
                      disabled={audioLoadingId === message.id}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
                        playingAudioId === message.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title="Listen with Gemini Voice TTS"
                    >
                      {audioLoadingId === message.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                      <span className="font-mono text-[11px]">
                        {playingAudioId === message.id ? 'Pause' : 'Listen'}
                      </span>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors text-[11px] font-mono"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Send to Scratchpad */}
                    <button
                      onClick={() => handleSaveToNotes(message.id, message.content)}
                      className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors text-[11px] font-mono"
                      title="Send response to Alamin's Executive Scratchpad"
                    >
                      {addedScratchpadId === message.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Saved to Notes</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3 h-3" />
                          <span>Save to Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Autonomous Link Parsing Bar (Collapsible) */}
      {showLinkBar && (
        <div className="mb-2 p-3 rounded-xl bg-slate-900 border border-emerald-800/60 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5 text-emerald-400">
              <Globe className="w-3.5 h-3.5" />
              Autonomous Web Link & Project Parser
            </span>
            <button
              onClick={() => setShowLinkBar(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste any website, GitHub repository, documentation, or project URL. The assistant will fetch and parse it to assist with code, debugging, or media analysis.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={targetLink}
              onChange={(e) => setTargetLink(e.target.value)}
              placeholder="https://github.com/user/project or https://example.com"
              className="flex-1 px-3 py-1.5 text-xs bg-[#05080e] border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/60"
            />
            <button
              onClick={handleParseLink}
              disabled={isParsingLink || !targetLink.trim()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isParsingLink ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              <span>{isParsingLink ? 'Parsing...' : 'Fetch & Parse'}</span>
            </button>
          </div>
          {linkError && (
            <p className="text-[11px] text-rose-400 font-mono">{linkError}</p>
          )}
        </div>
      )}

      {/* Pending Media Attachment Badge */}
      {pendingMedia && (
        <div className="mb-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2 truncate">
            {pendingMedia.type === 'video' && <Film className="w-4 h-4 text-emerald-400 shrink-0" />}
            {pendingMedia.type === 'image' && <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span className="truncate">
              Ready for analysis: {pendingMedia.name || 'Media Attachment'} ({pendingMedia.type})
            </span>
          </div>
          <button
            onClick={() => setPendingMedia(null)}
            className="p-1 hover:text-rose-400 text-slate-400 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Console Bar */}
      <div className="py-3 px-1 sm:px-2 border-t border-slate-800/80 bg-[#070b12]">
        <div className="relative rounded-xl bg-slate-900/90 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all p-2.5 sm:p-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="আলামিন ভাই, নির্দেশ দিন... (Type command in Bengali or English, upload video/media, or parse link)"
            className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-44 leading-relaxed pr-24"
          />

          {/* Hidden File Input for Video/Image/Audio */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,image/*,audio/*"
            className="hidden"
            onChange={handleFileSelected}
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Media Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                title="Upload Video, Image, or Audio for analysis"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Link Parser Toggle */}
              <button
                type="button"
                onClick={() => setShowLinkBar((prev) => !prev)}
                className={`p-1.5 rounded-md transition-colors ${
                  showLinkBar
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                }`}
                title="Autonomous Web Link & Project Parser"
              >
                <Globe className="w-4 h-4" />
              </button>

              {/* Mic / Voice dictation */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-md transition-colors ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={isRecording ? 'Stop voice recording' : 'Dictate in Bengali / English'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {isRecording && (
                <span className="text-[11px] text-rose-400 font-mono animate-pulse">
                  Listening (Alamin)...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStream}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 rounded-lg transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() && !pendingMedia}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all shadow-sm ${
                    input.trim() || pendingMedia
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Execute</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
