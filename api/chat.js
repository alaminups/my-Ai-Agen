import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) {}
    }
    if (!body) body = {};

    let finalUserMessage = "";
    
    if (Array.isArray(body.messages) && body.messages.length > 0) {
        const lastMsg = body.messages[body.messages.length - 1];
        finalUserMessage = lastMsg.text || lastMsg.content || "";
    } else if (body.message) {
        finalUserMessage = body.message;
    }

    if (!finalUserMessage || finalUserMessage.trim() === "") {
        res.write(`data: ${JSON.stringify({ text: "আমি কোনো মেসেজ পাইনি, দয়া করে আবার টাইপ করুন।" })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const systemInstruction = body.customDirectives || "তোমার নাম Predator। তুমি একটি অত্যাধুনিক এআই। তোমাকে আলামিন খান তৈরি করেছেন।";
    
    // একেবারে সরাসরি এবং ইউনিভার্সাল এপিআই মডেল কল
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
    }, { apiVersion: 'v1' });

    const streamingResult = await model.generateContentStream(finalUserMessage);
    
    for await (const chunk of streamingResult.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }
    
    res.write(`data: [DONE]\n\n`);
    return res.end();

  } catch (error) {
    console.error("API Error:", error);
    res.write(`data: ${JSON.stringify({ text: "দুঃখিত, সার্ভারে একটি এরর হয়েছে: " + error.message })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    return res.end();
  }
}
