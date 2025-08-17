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
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Activa logs/progreso del worker en consola
  useEffect(() => {
    enableOfflineLLMLogs(true);
  }, []);

  // Auto-scroll al final cuando llegan mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  // ID simple
  const mkId = () =>
      (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

  const canSend = useMemo(() => !loading && !!message.trim(), [loading, message]);

  // Enviar la pregunta actual
  const sendMessage = async () => {
    if (!canSend) return;

    const q = message.trim();
    setMessage("");

    // 1) agrega turno del usuario + placeholder del assistant
    const uid = mkId();
    const aid = mkId();
    setItems((prev) => [
      ...prev,
      { id: uid, role: "user", text: q, status: "done" },
      { id: aid, role: "assistant", text: "…", status: "pending" },
    ]);

    setLoading(true);
    try {
      // 2) llama al modelo offline (ajusta tokens/timeout si quieres)
      const resp = await offlineAnswer(q, { maxNewTokens: 64, timeoutMs: 240_000 });
      const safe =
          typeof resp === "string" && resp.trim() ? resp.trim() : "(sin respuesta)";
      // 3) reemplaza el placeholder con la respuesta final
      setItems((prev) =>
          prev.map((m) => (m.id === aid ? { ...m, text: safe, status: "done" } : m)),
      );
    } catch (err: any) {
      console.error("Error LLM:", err);
      setItems((prev) =>
          prev.map((m) =>
              m.id === aid
                  ? { ...m, text: String(err?.message || err), status: "error" }
                  : m,
          ),
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit de formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  return (
      <form
          className={`chat-box ${focused ? "focused" : ""}`}
          onSubmit={handleSubmit}
          onClick={() => {
            setFocused(true);
            inputRef.current?.focus();
          }}
          aria-label="Chat de ayuda"
      >
        <label htmlFor="chat-input" className="chat-label">
          ¿En qué te ayudo?
        </label>

        {/* Historial */}
        <div
            className="chat-thread"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
        >
          {items.map((m) => (
              <div key={m.id} className={`chat-msg ${m.role} ${m.status}`}>
                {m.text}
                {m.status === "pending" && <span className="pending">⏳</span>}
              </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Entrada */}
        <div className="chat-input-wrapper">
        <textarea
            ref={inputRef}
            id="chat-input"
            rows={4}
            className="chat-input"
            placeholder="Escribe aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (canSend) void sendMessage();
              }
            }}
            disabled={loading}
        />
          <button
              type="submit"
              className="chat-send-icon"
              disabled={!canSend}
              aria-disabled={!canSend}
              aria-label="Enviar mensaje"
          >
            <img src={sendIcon} alt="" />
          </button>
        </div>
      </form>
  );
};

export default ChatBox;
