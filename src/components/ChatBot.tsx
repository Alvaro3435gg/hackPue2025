import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ChatBot.css";
import sendIcon from "../assets/send.png";
import { offlineAnswer, enableOfflineLLMLogs } from "../lib/offlineLLMClient";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status: "pending" | "done" | "error";
};

const ChatBox: React.FC = () => {
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Activa logs/progreso del worker en la consola
  useEffect(() => {
    enableOfflineLLMLogs(true);
  }, []);

  // Auto-scroll al final cuando llegan mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  // ID simple
  const mkId = () => (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

  const canSend = useMemo(() => !loading && !!message.trim(), [loading, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    const q = message.trim();
    setMessage("");

    // 1) agrega turno del usuario
    const uid = mkId();
    const aid = mkId();
    setItems((prev) => [
      ...prev,
      { id: uid, role: "user",      text: q,           status: "done" },
      { id: aid, role: "assistant", text: "…",         status: "pending" }, // placeholder
    ]);

    setLoading(true);
    try {
      // 2) llama al modelo offline (ajusta tokens/timeout si quieres)
      const resp = await offlineAnswer(q, { maxNewTokens: 64, timeoutMs: 240_000 });
      const safe = (typeof resp === "string" && resp.trim()) ? resp.trim() : "(sin respuesta)";
      // 3) reemplaza el placeholder con la respuesta final
      setItems((prev) => prev.map((m) => (m.id === aid ? { ...m, text: safe, status: "done" } : m)));
    } catch (err: any) {
      console.error("Error LLM:", err);
      setItems((prev) => prev.map((m) => (m.id === aid ? { ...m, text: String(err?.message || err), status: "error" } : m)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`chat-box ${focused ? "focused" : ""}`} onSubmit={handleSubmit}>
      <span className="chat-label">¿En qué te ayudo?</span>

      {/* Historial */}
      <div className="chat-thread" style={{ margin: "12px 0", maxHeight: 320, overflowY: "auto", display: "grid", gap: 8 }}>
        {items.map((m) => (
          <div
            key={m.id}
            className={`chat-msg ${m.role} ${m.status}`}
            style={{
              alignSelf: m.role === "user" ? "end" : "start",
              background: m.role === "user" ? "#e0f2fe" : "#f6f6f6",
              border: "1px solid #e5e7eb",
              padding: "8px 10px",
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              color: m.status === "error" ? "#b91c1c" : "#111",
              maxWidth: "85%",
            }}
          >
            {m.text}
            {m.status === "pending" && (
              <span style={{ marginLeft: 6, opacity: 0.7 }}>⏳</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Entrada */}
      <div className="chat-input-wrapper">
        <textarea
          rows={4}
          className="chat-input"
          placeholder="Escribe aquí..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={loading}
        />
        <button type="submit" className="chat-send-icon" disabled={!canSend}>
          <img src={sendIcon} alt="Enviar" />
        </button>
      </div>
    </form>
  );
};

export default ChatBox;
