const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

const loading = document.createElement("div");

loading.className =
  "my-6 flex items-center gap-3 text-white font-mono animate-pulse";

loading.innerHTML = `
  <div class="flex gap-1">
    <span class="w-2 h-2 bg-white rounded-full animate-bounce"></span>
    <span class="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
    <span class="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
  </div>
  <span class="tracking-widest">Thinking...</span>
`;


function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  addUserMessage(message);
  input.value = "";
}

async function addUserMessage(text) {
  const div = document.createElement("div");
  div.className = "flex justify-end";

  div.innerHTML = `
    <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
      ${text}
    </div>
  `;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  chat.appendChild(loading);

  const assistantMessage = await callServer(text);
  chat.removeChild(loading)
  try {
    addBotMessage(assistantMessage);
  } catch (e) {
    addBotMessage("Server Error!");
  }
}

function addBotMessage(text) {
  const div = document.createElement("div");
  div.className = "flex";

  div.innerHTML = `
    <div class="bg-gray-700 text-white p-3 rounded-lg max-w-xs">
      ${text}
    </div>
  `;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

export const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/chat"
    : "https://hamrobot-api.onrender.com/chat"; // your backend url

async function callServer(input) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: input }),
  });

  if (!res.ok) {
    throw new Error("Error while generating the response");
  }

  const result = await res.json();
  return result.response;
}
