import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// CORS allow
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt missing" });

    // 1. OpenAI se recipe script banao
    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Make a recipe video script for: ${prompt}` }]
      })
    });
    const openAiData = await openAiRes.json();
    const script = openAiData.choices?.[0]?.message?.content || "No script";

    // 2. VEO 3 API call (video generation)
    const veoRes = await fetch("https://api.veo3.fake/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VEO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: script })
    });
    const veoData = await veoRes.json();
    const videoUrl = veoData.url || null;

    res.json({ script, videoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));