import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    let finalUserMessage = "";

    // ফ্রন্টএন্ড থেকে পাঠানো 'messages' অ্যারে চেক করা হচ্ছে
    if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
        // অ্যারে থেকে সর্বশেষ ইউজার মেসেজটি বের করা
        const lastMessage = body.messages[body.messages.length - 1];
        finalUserMessage = lastMessage.text || lastMessage.content || "";
    } 
    // যদি কেউ সরাসরি 'message' পাঠায় তার ফলব্যাক
    else if (body.message) {
        finalUserMessage = body.message;
    }

    if (!finalUserMessage || finalUserMessage.trim() === "") {
        return res.status(400).json({ error: "দয়া করে কিছু লিখে মেসেজ দিন।" });
    }
    
    // API Setup
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const systemInstruction = body.customDirectives || `তোমার নাম Predator। তোমাকে ডিজাইন করেছেন আলামিন খান। সবসময় ইসলামিক শিষ্টাচার মেনে বাংলায় কথা বলবে।`;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(finalUserMessage);
    const text = result.response.text();

    // ফ্রন্টএন্ডের স্ট্রিমিং ফরম্যাট অনুযায়ী রেসপন্স পাঠানো
    if (body.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
    } else {
        return res.status(200).json({ text });
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
