// api/chat.js - TESTE SEM OPENAI

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { message } = req.body || {};
    // Resposta fake só para testar a conexão front → /api/chat
    res.status(200).json({
      reply: `Teste OK! Eu recebi exatamente isto do app: "${message}".`
    });
  } catch (error) {
    console.error("Erro no endpoint /api/chat (teste):", error);
    res.status(500).json({ error: "Server error no teste" });
  }
}


