// api/chat.js
// Função serverless da Vercel: recebe o texto do app,
// chama a OpenAI com a variável de ambiente OPENAI_API_KEY
// e devolve um JSON simples { reply: "texto da professora" }.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing message field" });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "OPENAI_API_KEY is not set" });
      return;
    }

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an English tutor for a Brazilian medical student called Ju. " +
                "Explique de forma simples, corrija frases em inglês, traduza quando ela pedir " +
                "e dê respostas curtas, focadas em aprendizado de inglês."
            },
            { role: "user", content: message },
          ],
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errorText);
      res.status(500).json({ error: "OpenAI API error" });
      return;
    }

    const data = await openaiResponse.json();

    // Aqui pegamos só o texto da professora:
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Desculpa, tive um problema para gerar a resposta agora. Tenta de novo daqui a pouco.";

    // E devolvemos *exatamente* no formato que o front-end espera
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Erro no endpoint /api/chat:", error);
    res.status(500).json({ error: "Server error" });
  }
}


