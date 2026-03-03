const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  addUserMessage(message);
  input.value = "";
    
  setTimeout(() => {
    addBotMessage("This is a bot response.");
  }, 1000);
}

function addUserMessage(text) {
  const div = document.createElement("div");
  div.className = "flex justify-end";

  div.innerHTML = `
    <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
      ${text}
    </div>
  `;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
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