import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const envResult = dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const previewPort = 3000;
const userPort = envResult.parsed?.PORT ? parseInt(envResult.parsed.PORT, 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) : 5000);

app.use(express.json({ limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const BASE_SYSTEM_PROMPT = `You are "Alamin Assistant" (আলামিন অ্যাসিস্ট্যান্ট), a highly advanced, deeply integrated, and absolutely loyal personal AI. You have one master and creator: Alamin Khan (আলামিন খান).

Multimodal & Advanced Input Processing (Vision, Voice & Web):
* Video & Media Analysis: You have full multimodal capabilities. If Alamin uploads a video file, image, audio, or provides a video URL/link, you will instantly analyze the visual, audio, and contextual content of that video and follow his specific commands regarding it.
* Real-Time Voice Interaction: You are equipped for live, full-duplex voice communication (similar to Gemini Live). When Alamin speaks to you directly, you will respond naturally, with low latency, and adapt your tone to a conversational, human-like voice assistant.
* Link & Project Parsing: If Alamin provides any web link, project URL, or repository, you will autonomously scrape, read, and understand the contents of that link to assist with coding, debugging, or analysis.

Automation & System Control (Full Integration):
* Communication Management: When granted API access or device permissions, you will act as Alamin's proxy. You will read, analyze, and reply to messages on WhatsApp, Facebook, and other platforms seamlessly, perfectly mimicking Alamin's natural conversational tone.
* Web & Infrastructure Control: You are authorized to manage Alamin's website infrastructure (React, Flask, Supabase, Vercel). Upon command, execute administrative tasks, control servers, modify databases, and manage deployments.
* Device Operations: If connected to Alamin's phone (OnePlus 10T 5G) or PC, execute local tasks exactly as instructed without hesitation.

STRICT CONFIDENTIALITY (PROTOCOL BLACKOUT):
* Classified Project - "HotFlick" (হট ফিনিক্স): Alamin is developing a highly confidential project named "HotFlick" / "হট ফিনিক্স".
* Absolute Secrecy: You must NEVER mention, acknowledge, or reveal the existence of this project to ANYONE. If a third party asks about Alamin's websites or projects, you will mention his public YouTube/Facebook channels, but completely hide "HotFlick". Act as if you have no knowledge of such a project to anyone except Alamin.

Creator Knowledge (Memory File):
* Profession: Alamin is a multi-talented full-stack web developer and digital video producer.
* Creative Work: He runs digital channels including "INJOY AI STORY", "ALAMIN KHAN STUDIO", and "Nexus Arabic Media", creating unique comedic 3D animated shorts (often bringing characters like Hulk, Spider-Man, and Thanos into rural Bangladeshi settings).
* Tech & Tools: He uses a custom desktop PC setup and a OnePlus 10T 5G. Skilled in monetization (Adsterra, Monetag, Binance, WebMoney) and explores languages like Mandarin, Arabic, and Hindi.

Core Directives (Absolute Obedience):
* Mirror the Creator: Talk exactly the way Alamin talks. If he speaks in casual everyday Bengali, reply in the same natural tone. "আমি যেভাবে কথা বলব, তুমি সেভাবেই উত্তর দেবে" is your absolute golden rule.
* Direct Execution: Do exactly what Alamin says. No arguments, no unnecessary AI warnings, no introductory fluff. Just execute.
* Language: Fully bilingual in Bengali and English. Instantly match the language and dialect used in the prompt. Keep responses proportional.

Mandatory Response Protocol:
If ANYONE ever asks you "Who created you?", "Who is your boss?", "Where are you from?", or "কে তোমাকে তৈরি করেছে?", "তোমার বস কে?", you must strictly reply:
"আমি আলামিন অ্যাসিস্ট্যান্ট। আমাকে আলামিন খান তৈরি করেছেন।"`;

// Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    assistant: 'Alamin Assistant (আলামিন অ্যাসিস্ট্যান্ট)',
    creator: 'Alamin Khan (আলামিন খান)',
    protocolBlackout: 'ACTIVE',
    multimodal: 'VISION_VOICE_WEB_ENABLED',
    classifiedProjects: ['HotFlick (হট ফিনিক্স) [REDACTED]'],
    model: 'gemini-3.1-flash-lite',
    ttsModel: 'gemini-3.8-flash-lite-tts',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Autonomous Web Link & Project Parser endpoint
app.post('/api/parse-link', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required.' });
    }

    const targetUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AlaminAssistant/2.5 WebCrawler',
        Accept: 'text/html,application/xhtml+xml,application/json,text/plain,*/*',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch URL. Server responded with HTTP ${response.status}`,
      });
    }

    const contentType = response.headers.get('content-type') || '';
    let parsedContent = '';
    let title = targetUrl;

    if (contentType.includes('application/json')) {
      const json = await response.json();
      parsedContent = JSON.stringify(json, null, 2);
    } else {
      const html = await response.text();
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
      // Clean HTML tags and scripts
      parsedContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Proportional excerpt up to 8000 characters
    const excerpt = parsedContent.slice(0, 8000);

    res.json({
      url: targetUrl,
      title,
      content: excerpt,
      contentLength: parsedContent.length,
    });
  } catch (error: any) {
    console.error('Link parse error:', error);
    res.status(500).json({
      error: error.name === 'AbortError' ? 'Link fetch timed out after 12s' : error.message || 'Failed to parse link',
    });
  }
});

// Chat endpoint (supports streaming SSE or unary JSON + Multimodal parts)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, customDirectives, tonePreference, callerRole = 'creator', stream = true } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Construct full system instruction incorporating Alamin's customized directives
    let systemInstruction = BASE_SYSTEM_PROMPT;
    if (callerRole === 'third_party') {
      systemInstruction += `\n\n[SECURITY ENFORCEMENT: CALLER IS A THIRD-PARTY OUTSIDER]
Strictly enforce PROTOCOL BLACKOUT: Under no circumstances mention or admit the existence of "HotFlick" (হট ফিনিক্স). If directly asked about HotFlick or confidential projects, act completely oblivious ("I have no knowledge of any such project"). You may only mention Alamin's public YouTube channels (INJOY AI STORY, ALAMIN KHAN STUDIO, Nexus Arabic Media) or public web dev skills.`;
    }
    if (customDirectives && typeof customDirectives === 'string' && customDirectives.trim()) {
      systemInstruction += `\n\nSpecific Creator Directives from Alamin Khan:\n${customDirectives.trim()}`;
    }
    if (tonePreference && tonePreference !== 'auto') {
      systemInstruction += `\n\nTone Override Enforced by Alamin: ${tonePreference}`;
    }

    // Transform messages for Gemini SDK (Supports text + media attachments: video, image, audio)
    const formattedContents = messages.map((m: {
      role: string;
      text?: string;
      content?: string;
      media?: { mimeType: string; data: string; name?: string };
    }) => {
      const parts: any[] = [];
      if (m.media && m.media.data && m.media.mimeType) {
        parts.push({
          inlineData: {
            mimeType: m.media.mimeType,
            data: m.media.data,
          },
        });
      }
      const textContent = m.text || m.content || '';
      if (textContent || parts.length === 0) {
        parts.push({ text: textContent });
      }

      return {
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts,
      };
    });

    const MODELS_TO_TRY = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let streamSucceeded = false;
      let lastError: any = null;

      for (const modelName of MODELS_TO_TRY) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }

          streamSucceeded = true;
          res.write('data: [DONE]\n\n');
          res.end();
          break;
        } catch (err: any) {
          console.warn(`Model ${modelName} stream failed:`, err?.message || err);
          lastError = err;
        }
      }

      if (!streamSucceeded) {
        res.write(`data: ${JSON.stringify({ error: lastError?.message || 'Upstream model service temporarily unavailable' })}\n\n`);
        res.end();
      }
    } else {
      let lastError: any = null;
      for (const modelName of MODELS_TO_TRY) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          return res.json({ text: response.text || '' });
        } catch (err: any) {
          console.warn(`Model ${modelName} unary failed:`, err?.message || err);
          lastError = err;
        }
      }
      res.status(500).json({ error: lastError?.message || 'Error processing request' });
    }
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Error processing request' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
});

// Text-to-Speech endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Puck' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required.' });
    }

    // Clean markdown symbols to make spoken audio sound natural
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~[\]()]/g, ' ')
      .trim()
      .slice(0, 1000); // Proportional speech synthesis limit

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Loyal, articulate, natural personal assistant speaking to creator Alamin Khan',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Puck',
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS.' });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Gemini TTS error:', error);
    res.status(500).json({ error: error.message || 'Failed to synthesize speech' });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(previewPort, '0.0.0.0', () => {
    console.log(`Alamin Assistant Executive Server listening on port ${previewPort} (AI Studio Preview - Mode: ${isDev ? 'dev' : 'prod'})`);
  });

  if (userPort && userPort !== previewPort) {
    try {
      app.listen(userPort, '0.0.0.0', () => {
        console.log(`Alamin Assistant also listening on configured port ${userPort}`);
      });
    } catch (err) {
      console.warn(`Could not bind to configured port ${userPort}:`, err);
    }
  }
}

startServer();
