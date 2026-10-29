import { Message, ToneMode, CallerRole, MediaAttachment, ParsedLinkResult, SecurityAlert } from '../types';

export interface ChatStreamOptions {
  messages: Array<{ role: 'user' | 'assistant'; content: string; media?: MediaAttachment }>;
  customDirectives?: string;
  tonePreference?: ToneMode;
  callerRole?: CallerRole;
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (err: Error) => void;
}

export async function streamChat({
  messages,
  customDirectives,
  tonePreference = 'auto',
  callerRole = 'creator',
  onChunk,
  onComplete,
  onError,
}: ChatStreamOptions): Promise<() => void> {
  const controller = new AbortController();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          text: m.content,
          media: m.media,
        })),
        customDirectives,
        tonePreference,
        callerRole,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by browser or empty response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') {
          onComplete();
          return () => controller.abort();
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            onError(new Error(parsed.error));
            return () => controller.abort();
          }
          if (parsed.text) {
            onChunk(parsed.text);
          }
        } catch {
          // Plain text fallback
          onChunk(dataStr);
        }
      }
    }

    onComplete();
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      onError(error);
    }
  }

  return () => controller.abort();
}

export async function parseWebLink(url: string): Promise<ParsedLinkResult> {
  const response = await fetch('/api/parse-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to parse link: ${response.status}`);
  }

  return await response.json();
}

export async function generateTTS(text: string, voiceName: string = 'Puck'): Promise<string> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voiceName }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'TTS generation failed');
  }

  const data = await response.json();
  return `data:audio/wav;base64,${data.audioBase64}`;
}

export async function fetchServerStatus() {
  try {
    const res = await fetch('/api/status');
    return await res.json();
  } catch {
    return { status: 'offline', creator: 'Alamin Khan (আলামিন খান)' };
  }
}

export async function fetchSecurityAlerts(): Promise<SecurityAlert[]> {
  try {
    const res = await fetch('/api/admin/alerts');
    if (!res.ok) return [];
    const data = await res.json();
    return data.alerts || [];
  } catch {
    return [];
  }
}

export async function clearSecurityAlerts(): Promise<void> {
  try {
    await fetch('/api/admin/alerts/clear', { method: 'POST' });
  } catch (err) {
    console.error('Failed to clear alerts:', err);
  }
}
