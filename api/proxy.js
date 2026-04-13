export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const userMessage = req.body.messages?.[0]?.content || "";

    const geminiBody = {
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", JSON.stringify(data));
      return res.status(response.status).json({ error: data?.error?.message || "Gemini fout" });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Return in Anthropic-compatible format so the frontend doesn't need to change
    res.status(200).json({
      content: [{ type: "text", text }]
    });

  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
