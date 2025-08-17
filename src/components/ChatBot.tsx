import React, { useState } from "react";
import "./ChatBot.css";
import sendIcon from "../assets/send.png";

const ChatBox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
        const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        });

        const data = await response.json();
        console.log("Server response:", data);

        setMessage("");
    } catch (err) {
        console.error("Error sending message:", err);
    } finally {
        console.log("Sent");
    }
    };

  return (
    <form className={`chat-box ${focused ? "focused" : ""}`} onSubmit={handleSubmit}>
        <span className="chat-label">¿En qué te ayudo?</span>
            <div className="chat-input-wrapper">
                <textarea
                rows={5}
                className="chat-input"
                placeholder="Escribe aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                />
                <button type="submit" className="chat-send-icon">
                <img src={sendIcon} alt="Enviar solicitud." />
                </button>
            </div>
        </form>
  );
};

export default ChatBox;