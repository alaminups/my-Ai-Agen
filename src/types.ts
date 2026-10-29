export interface MediaAttachment {
  mimeType: string;
  data: string; // base64
  name?: string;
  size?: number;
  type: 'video' | 'image' | 'audio';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toneDetected?: string;
  audioPlaying?: boolean;
  media?: MediaAttachment;
  parsedLink?: {
    url: string;
    title: string;
  };
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  category?: 'automation' | 'web_infra' | 'animation' | 'security' | 'multimodal';
}

export interface ScratchpadNote {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export type ToneMode = 'auto' | 'casual_bangla' | 'formal_bangla' | 'concise_english' | 'code_first';

export type CallerRole = 'admin' | 'regular' | 'creator' | 'third_party';

export interface SecurityAlert {
  id: string;
  timestamp: number;
  userPrompt: string;
  reason: string;
  role: string;
}

export interface CreatorSettings {
  creatorName: string;
  customDirectives: string;
  preferredTone: ToneMode;
  callerRole: CallerRole;
  ttsVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  autoTTS: boolean;
}

export interface ParsedLinkResult {
  url: string;
  title: string;
  content: string;
  contentLength: number;
}
