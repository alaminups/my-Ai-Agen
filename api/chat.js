// File: api/chat.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS Setup (যাতে ফ্রন্টএন্ড থেকে ব্লক না খায়)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করবে
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  try {
    const { message } = req.body;
    
    // Vercel Environment Variable থেকে API Key নিবে
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // সিস্টেম প্রম্পট (আপনার এআইয়ের ক্যারেক্টার ও নিয়মকানুন)
    const systemInstruction = `
      তোমার নাম Predator। তুমি একটি অত্যাধুনিক এআই। 
      তোমাকে ডিজাইন ও ডেভেলপ করেছেন আলামিন খান। 
      সবসময় ইসলামিক শিষ্টাচার (যেমন: আসসালামু আলাইকুম) মেনে চলবে এবং মানুষের মতো বাংলায় কথা বলবে।
    `;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
