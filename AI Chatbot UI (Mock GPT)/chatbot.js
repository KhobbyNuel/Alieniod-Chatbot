const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const themeToggle = document.getElementById("themeToggle");

const themeSelect = document.getElementById("themeSelect");

function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem("chatTheme", theme);
}

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

// Load saved theme on startup
window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("chatTheme") || "light";
  applyTheme(savedTheme);
  themeSelect.value = savedTheme;
});



let botResponses = {
  "hello": "Hi there! How can I help you today?",
  "how are you": "I'm just a bot, but I'm doing great!",
  "what is your name": "I'm your AI assistant!",
  "bye": "Goodbye! Have a great day!"
};

function loadChatHistory() {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.forEach(({ sender, text }) => addMessage(sender, text));
}

function saveMessage(sender, text) {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ sender, text });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function mockBotReply(userText) {
  const lower = userText.toLowerCase();
  let reply = botResponses[lower] || getRandomFallback();
  showTypingIndicator(() => {
    addMessage("bot", reply);
    saveMessage("bot", reply);
    speak(reply);
  });
}

function getRandomFallback() {
  const responses = [
    "I'm not sure how to respond to that 🤔",
    "Interesting... tell me more.",
    "Can you elaborate on that?",
    "Let me think about that..."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function showTypingIndicator(callback) {
  const typingMsg = document.createElement("div");
  typingMsg.classList.add("message", "bot");
  typingMsg.textContent = "Chatbot is typing...";
  chatbox.appendChild(typingMsg);
  chatbox.scrollTop = chatbox.scrollHeight;

  setTimeout(() => {
    chatbox.removeChild(typingMsg);
    callback();
  }, 1000 + Math.random() * 1000);
}

sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (text === "") return;
  addMessage("user", text);
  saveMessage("user", text);
  userInput.value = "";
  mockBotReply(text);
});

userInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

window.addEventListener("load", loadChatHistory);

const micBtn = document.getElementById("micBtn");

let recognition;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => micBtn.classList.add("listening");
  recognition.onend = () => micBtn.classList.remove("listening");

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendBtn.click();
  };

  micBtn.addEventListener("click", () => {
    recognition.start();
  });
} else {
  micBtn.disabled = true;
  micBtn.title = "Speech recognition not supported.";
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
