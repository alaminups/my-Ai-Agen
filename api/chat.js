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
    // যেকোনো ফরম্যাটে আসা মেসেজ রিসিভ করার লজিক
    let userMessage = '';
    if (typeof req.body === 'string') {
        try {
            const parsed = JSON.parse(req.body);
            userMessage = parsed.message || parsed.text || parsed.prompt || "";
        } catch (e) {
            userMessage = req.body;
        }
    } else {
        userMessage = req.body?.message || req.body?.text || req.body?.prompt || "";
    }

    // যদি মেসেজ একদমই ফাঁকা থাকে, তখন এপিআই ক্র্যাশ না করে এই মেসেজ দিবে
    if (!userMessage) {
        return res.status(400).json({ error: "দয়া করে কিছু লিখে মেসেজ দিন।" });
    }
    
    // API Key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const systemInstruction = `
      তোমার নাম Predator। তুমি একটি অত্যাধুনিক এআই। 
      তোমাকে ডিজাইন ও ডেভেলপ করেছেন আলামিন খান। 
      সবসময় ইসলামিক শিষ্টাচার (যেমন: আসসালামু আলাইকুম) মেনে চলবে এবং মানুষের মতো বাংলায় কথা বলবে।
    `;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(userMessage);
    const text = result.response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
