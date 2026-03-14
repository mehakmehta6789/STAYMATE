/**
 * chat.js
 * Handles sending and loading chat messages
 */

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.querySelector("#chatForm");
  const messageInput = document.querySelector("#messageInput");
  const messagesBox = document.querySelector("#messages");
  const conversationId = chatForm?.dataset.conversation;

  if (!chatForm) return;
  if (!conversationId || conversationId === "undefined") {
    // No receiver selected yet, so nothing to load/send
    return;
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    await fetch("/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        message,
        receiverId: chatForm.dataset.receiver,
      }),
    });

    messageInput.value = "";
    loadMessages();
  });

  async function loadMessages() {
    const res = await fetch(`/chat/messages/${conversationId}`);
    const data = await res.json();

    messagesBox.innerHTML = "";

    data.forEach((msg) => {
      const div = document.createElement("div");
      const senderId =
        (msg.sender && (msg.sender._id || msg.sender.id)) || msg.sender;
      div.className =
        String(senderId) === String(chatForm.dataset.currentUser)
          ? "message me"
          : "message";

      div.textContent = msg.message;
      messagesBox.appendChild(div);
    });

    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  // auto-refresh
  setInterval(loadMessages, 3000);
});