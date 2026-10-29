import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // আপনার ফ্রন্টএন্ড স্ট্রিমিং সাপোর্ট করে, তাই এটি বাধ্যতামূলক
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // বডি পার্সিং (ফাঁকা মেসেজ এড়ানোর জন্য)
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) {}
    }
    if (!body) body = {};

    let finalUserMessage = "";
    
    // ফ্রন্টএন্ডের অ্যারে থেকে মেসেজ বের করা
    if (Array.isArray(body.messages) && body.messages.length > 0) {
        const lastMsg = body.messages[body.messages.length - 1];
        finalUserMessage = lastMsg.text || lastMsg.content || "";
    } else if (body.message) {
        finalUserMessage = body.message;
    }

    // স্মার্ট ডিবাগ মোড
    if (!finalUserMessage || finalUserMessage.trim() === "") {
        const debugMsg = "আমি মেসেজটি ধরতে পারিনি। সার্ভারে যে ডাটা এসেছে: " + JSON.stringify(body).substring(0, 150);
        res.write(`data: ${JSON.stringify({ text: debugMsg })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
    }
    
    // Gemini API কানেকশন
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const systemInstruction = body.customDirectives || "তোমার নাম Predator। তুমি একটি অত্যাধুনিক এআই।";
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
    });

    // স্ট্রিমিং রেসপন্স (রিয়েল-টাইম টাইপিং ইফেক্ট)
    const streamingResult = await model.generateContentStream(finalUserMessage);
    
    for await (const chunk of streamingResult.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }
    
    res.write(`data: [DONE]\n\n`);
    return res.end();

  } catch (error) {
    console.error("API Error:", error);
    res.write(`data: ${JSON.stringify({ error: "সার্ভার এরর: " + error.message })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    return res.end();
  }
}
