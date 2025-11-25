// APP Inglês – Professora interativa com ChatGPT + voz

const chatMessagesEl = document.getElementById("chat-messages");
const chatInputEl = document.getElementById("chat-input");
const chatSendBtn = document.getElementById("chat-send");
const statusEl = document.getElementById("chat-status");

const listenLastBtn = document.getElementById("btn-listen-last");
const speakVoiceBtn = document.getElementById("btn-speak-voice");

let lastBotReply =
  "Oi, Ju! Eu sou sua professora de inglês. Você pode falar comigo em português ou inglês que eu te ajudo.";

function appendMessage(text, who) {
  const div = document.createElement("div");
  div.classList.add("chat-msg");
  if (who === "me") {
    div.classList.add("me");
    div.textContent = text;
  } else {
    div.classList.add("bot");
    div.innerHTML = "<strong>Profa:</strong> " + text;
  }
  chatMessagesEl.appendChild(div);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  appendMessage(trimmed, "me");
  chatInputEl.value = "";
  statusEl.textContent = "Pensando...";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed })
    });

    if (!res.ok) {
      throw new Error("Erro HTTP " + res.status);
    }

    const data = await res.json();
    const reply =
      (data.reply ||
        "Desculpa, não consegui responder agora. Tente de novo.") + "";

    lastBotReply = reply;
    appendMessage(reply, "bot");
    statusEl.textContent = "";
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Erro ao falar com a professora. Confere a API /api/chat.";
  }
}

chatSendBtn.addEventListener("click", () => {
  sendMessage(chatInputEl.value);
});

chatInputEl.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    ev.preventDefault();
    sendMessage(chatInputEl.value);
  }
});

// ----- Leitura em voz alta da última resposta -----
function speakText(text) {
  if (!("speechSynthesis" in window)) {
    statusEl.textContent =
      "Seu navegador não suporta leitura em voz alta.";
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

listenLastBtn.addEventListener("click", () => {
  if (!lastBotReply) {
    statusEl.textContent = "Ainda não tenho nenhuma resposta para ler.";
    return;
  }
  speakText(lastBotReply);
});

// ----- Reconhecimento de voz -----
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "pt-BR"; // você pode falar PT ou EN
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    statusEl.textContent = "🎤 Ouvindo... fale com a professora.";
  };
  recognition.onerror = (event) => {
    statusEl.textContent = "Erro no microfone: " + event.error;
  };
  recognition.onend = () => {
    if (!statusEl.textContent.startsWith("✅")) {
      statusEl.textContent =
        "Toque em “Falar com a professora” para tentar de novo.";
    }
  };
  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript.trim();
    if (spoken) {
      statusEl.textContent = "✅ Você disse: \"" + spoken + "\"";
      sendMessage(spoken);
    }
  };
} else {
  statusEl.textContent =
    "Seu navegador não suporta reconhecimento de voz (Web Speech API).";
}

speakVoiceBtn.addEventListener("click", () => {
  if (!recognition) {
    statusEl.textContent =
      "Reconhecimento de voz não disponível neste navegador.";
    return;
  }
  statusEl.textContent = "";
  recognition.start();
});
