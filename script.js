// APP Inglês – lógica básica estilo Duolingo, focado em voz e frases curtas.

const lessons = {
  greetings: [
    { pt: "Olá", en: "hello" },
    { pt: "Bom dia", en: "good morning" },
    { pt: "Boa tarde", en: "good afternoon" },
    { pt: "Boa noite", en: "good evening" },
    { pt: "Como você está?", en: "how are you?" },
    { pt: "Estou bem, obrigada", en: "I am fine, thank you" }
  ],
  travel: [
    { pt: "Onde fica o portão de embarque?", en: "where is the boarding gate?" },
    { pt: "Eu tenho uma reserva", en: "I have a reservation" },
    { pt: "Quanto custa a diária?", en: "how much is the room per night?" },
    { pt: "Eu preciso de um táxi", en: "I need a taxi" }
  ],
  clinic: [
    { pt: "Onde dói?", en: "where does it hurt?" },
    { pt: "Você tem alergias?", en: "do you have any allergies?" },
    { pt: "Tome este medicamento", en: "take this medicine" },
    { pt: "Volte em uma semana", en: "come back in one week" }
  ],
  everyday: [
    { pt: "Eu acordo às sete horas", en: "I wake up at seven o'clock" },
    { pt: "Eu trabalho em um hospital", en: "I work in a hospital" },
    { pt: "Eu gosto de estudar inglês", en: "I like to study English" },
    { pt: "Estou indo para casa", en: "I am going home" }
  ]
};

let currentLessonKey = null;
let currentIndex = 0;

const phrasePtEl = document.getElementById("phrase-pt");
const phraseEnEl = document.getElementById("phrase-en");
const feedbackEl = document.getElementById("feedback");
const statusEl = document.getElementById("status");

const listenBtn = document.getElementById("btn-listen");
const speakBtn = document.getElementById("btn-speak");
const nextBtn = document.getElementById("btn-next");

const lessonButtonsContainer = document.getElementById("lesson-buttons");

// ---- Seleção de lição ----
lessonButtonsContainer.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-lesson]");
  if (!btn) return;
  const key = btn.dataset.lesson;
  selectLesson(key, btn);
});

function selectLesson(key, clickedBtn) {
  currentLessonKey = key;
  currentIndex = 0;

  // atualizar estado visual dos botões
  document
    .querySelectorAll(".lesson-btn")
    .forEach((b) => b.classList.toggle("active", b === clickedBtn));

  showCurrentPhrase();
}

function showCurrentPhrase() {
  if (!currentLessonKey) {
    phrasePtEl.textContent = "Escolhe uma lição para começar.";
    phraseEnEl.textContent = "—";
    feedbackEl.textContent = "";
    feedbackEl.className = "";
    return;
  }

  const list = lessons[currentLessonKey];
  if (!list || list.length === 0) return;

  const item = list[currentIndex];
  phrasePtEl.textContent = item.pt;
  phraseEnEl.textContent = item.en;
  feedbackEl.textContent = "Tenta repetir em voz alta em inglês.";
  feedbackEl.className = "";
}

// ---- Fala sintética (ouvir frase em inglês) ----
listenBtn.addEventListener("click", () => {
  if (!currentLessonKey) {
    simpleFlash("Escolhe primeiro uma lição.");
    return;
  }
  const text = lessons[currentLessonKey][currentIndex].en;
  speakEnglish(text);
});

function speakEnglish(text) {
  if (!("speechSynthesis" in window)) {
    simpleFlash("Seu navegador não suporta leitura em voz alta.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// ---- Reconhecimento de voz (repetir a frase) ----
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    statusEl.textContent = "🎤 Ouvindo... Fala a frase em inglês.";
  };
  recognition.onerror = (event) => {
    statusEl.textContent = "Erro no microfone: " + event.error;
  };
  recognition.onend = () => {
    if (!statusEl.textContent.startsWith("✅")) {
      statusEl.textContent = "Toque em “Falar a frase” para tentar de novo.";
    }
  };
  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript.trim().toLowerCase();
    checkPronunciation(spoken);
  };
} else {
  statusEl.textContent =
    "Seu navegador não suporta reconhecimento de voz (Web Speech API).";
}

speakBtn.addEventListener("click", () => {
  if (!currentLessonKey) {
    simpleFlash("Escolhe primeiro uma lição.");
    return;
  }
  if (!recognition) {
    simpleFlash("Reconhecimento de voz não disponível neste navegador.");
    return;
  }
  feedbackEl.textContent = "";
  feedbackEl.className = "";
  recognition.start();
});

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function checkPronunciation(spokenRaw) {
  const target = lessons[currentLessonKey][currentIndex].en;
  const spoken = normalize(spokenRaw);
  const expected = normalize(target);

  if (spoken === expected) {
    feedbackEl.textContent = "Perfeito! Ficou muito parecido com a frase alvo.";
    feedbackEl.className = "ok";
    statusEl.textContent = "✅ Você disse: “" + spokenRaw + "”";
  } else {
    feedbackEl.textContent =
      "Quase! Você disse: “" +
      spokenRaw +
      "”. A frase alvo é: “" +
      target +
      "”.";
    feedbackEl.className = "error";
    statusEl.textContent =
      "Toque em “Ouvir em inglês” e tenta de novo, sem pressa.";
  }
}

// ---- Próxima frase ----
nextBtn.addEventListener("click", () => {
  if (!currentLessonKey) {
    simpleFlash("Escolhe primeiro uma lição.");
    return;
  }
  const list = lessons[currentLessonKey];
  currentIndex = (currentIndex + 1) % list.length;
  showCurrentPhrase();
});

function simpleFlash(msg) {
  feedbackEl.textContent = msg;
  feedbackEl.className = "error";
}

// Inicial
showCurrentPhrase();
