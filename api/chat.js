// api/chat.js – versão nova (100% funcional com system)
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",    // pode manter este modelo
      messages: [
        {
          role: "system",
          content:
            "Você é uma professora de inglês para a Ju. Corrija frases, traduza, explique, responda curto e de forma clara."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = completion.choices[0].message.content.trim();

    res.status(200).json({ reply });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "API error" });
  }
}



