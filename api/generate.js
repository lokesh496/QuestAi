// CommonJS format - required for Vercel Node.js serverless functions
// when project package.json has "type": "module", we use .js but with CJS syntax

const { GoogleGenAI } = require("@google/genai");

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, config, model: modelName } = req.body;

    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not set. Add it to your deployment environment (Render: Service → Environment → Environment Variables).",
      });
    }

    apiKey = apiKey.trim().replace(/^["']|["']$/g, "");

    const genAI = new GoogleGenAI({ apiKey });

    const response = await genAI.models.generateContent({
      model: modelName || "gemini-1.5-pro",
      contents: prompt,
      config: config,
    });

    const text = response.text;

    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    res.status(200).json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    let message = error.message || "Internal Server Error";
    if (message.includes("API key not valid") || message.includes("400")) {
      message = "Invalid Gemini API Key. Check GEMINI_API_KEY in Vercel environment variables.";
    }
    res.status(500).json({ error: message });
  }
};
