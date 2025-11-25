// APP Inglês – lições + professora interativa com ChatGPT

// -------------------------
// 1) DADOS DAS LIÇÕES
// -------------------------
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

// Elementos da parte “Duolingo”
const phrasePtEl = document.getElementById("phrase-pt");
const phraseEnEl = document.getElementById("phrase-en");
const feedbackEl = document.getElementById("feedback");
const statusEl = document.getElementById("status");

const listenBtn = document.getElementById("btn-listen");
const speakBtn = document.getElementById("btn-speak");
const nextBtn = document.getElementById("btn-next");
const lessonButtonsContainer = document.getElementById("lesson-buttons");

// -------------------------
// 2) SELEÇÃO DE LIÇÃO
--------------------------
lessonButtonsContainer.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-lesson]");
  if (!btn) return;
  const key = btn.dataset.lesson;
  selectLesson(key, btn);
});

function selectLesson(key, clickedBtn) {
  currentLessonKey = key;
  currentIndex = 0;

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

// -------------------------
// 3) FALA SINTÉTICA (OUVIR FRASE EM INGLÊS)
// -------------------------
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

// -------------------------
// 4) RECONHECIMENTO DE VOZ (TREINO DA FRASE)
// -------------------------
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
    statusEl.text

