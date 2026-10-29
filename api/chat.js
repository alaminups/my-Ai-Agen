import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS Setup (ক্রস-অরিজিন রিকোয়েস্ট অ্যালাউ করার জন্য)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // প্রি-ফ্লাইট রিকোয়েস্ট হ্যান্ডেল
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 프ন্টএন্ডের স্ট্রিমিং সাপোর্ট করার জন্য প্রয়োজনীয় হেডার
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // বডি পার্সিং (ফাঁকা বা ভুল ফরম্যাটের মেসেজ ঠিক করার জন্য)
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) {}
    }
    if (!body) body = {};

    let finalUserMessage = "";
    
    // ফ্রন্টএন্ডের 'messages' অ্যারে থেকে সর্বশেষ ইউজারের মেসেজ বের করা
    if (Array.isArray(body.messages) && body.messages.length > 0) {
        const lastMsg = body.messages[body.messages.length - 1];
        finalUserMessage = lastMsg.text || lastMsg.content || "";
    } else if (body.message) {
        finalUserMessage = body.message;
    }

    // মেসেজ ফাঁকা থাকলে স্মার্ট ডিবাগিং রেসপন্স
    if (!finalUserMessage || finalUserMessage.trim() === "") {
        res.write(`data: ${JSON.stringify({ text: "আমি কোনো মেসেজ পাইনি, দয়া করে আবার টাইপ করুন।" })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
    }
    
    // Google Gemini API কানেকশন (লেটেস্ট ভার্সন)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // সিস্টেম প্রম্পট বা নির্দেশিকা সেট করা
    const systemInstruction = body.customDirectives || "তোমার নাম Predator। তুমি একটি অত্যাধুনিক এআই। তোমাকে আলামিন খান তৈরি করেছেন।";
    
    // লেটেস্ট এবং দ্রুততম মডেল ব্যবহার করা হচ্ছে
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
    });

    // স্ট্রিমিং রেসপন্স জেনারেট করা (মানুষের মতো রিয়েল-টাইম টাইপিং ইফেক্ট)
    const streamingResult = await model.generateContentStream(finalUserMessage);
    
    for await (const chunk of streamingResult.stream) {
        const chunkText = chunk.text();
        // ফ্রন্টএন্ডের ইভেন্ট-স্ট্রিম ফরম্যাটে ডাটা পাঠানো
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }
    
    // স্ট্রিমিং শেষ হওয়ার সিগন্যাল
    res.write(`data: [DONE]\n\n`);
    return res.end();

  } catch (error) {
    console.error("API Error:", error);
    // সার্ভার এরর হলে ফ্রন্টএন্ডে সরাসরি মেসেজ হিসেবে দেখানো
    res.write(`data: ${JSON.stringify({ text: "দুঃখিত, সার্ভারে একটি এরর হয়েছে: " + error.message })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    return res.end();
  }
}
