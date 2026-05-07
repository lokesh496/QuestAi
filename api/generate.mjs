import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, config, model: modelName } = req.body;

    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY is not set. Go to Vercel → Project → Settings → Environment Variables and add it.",
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
    let message = error?.message || "Internal Server Error";
    if (message.includes("API key not valid") || message.includes("400")) {
      message =
        "Invalid Gemini API Key. Check GEMINI_API_KEY in Vercel environment variables.";
    }
    res.status(500).json({ error: message });
  }
}
