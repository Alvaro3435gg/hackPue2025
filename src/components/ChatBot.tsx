import React, { useEffect, useRef, useState } from "react";
import "./ChatBot.css";
import sendIcon from "../assets/send.png";
import { offlineAnswer, enableOfflineLLMLogs } from "../lib/offlineLLMClient";

type Category = "biologia" | "matematicas" | "historia";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status: "pending" | "done" | "error";
};

type ChatBoxProps = {
  /** true => modo “recomendar cursos” por regex; false/undefined => responde normal */
  useClassifier?: boolean | null;
  /** solo aplica cuando useClassifier = false o para generar la respuesta base que analizamos */
  maxNewTokens?: number;
  timeoutMs?: number;
  /** callback cuando detectamos categorías (pueden ser varias) */
  onSuggest?: (cats: Category[]) => void;
};

const RX = {
  biologia: [
    /\bbiolog[íi]a\b/i, /\bc[eé]lula(s)?\b/i, /\badn\b/i, /\bgen[ée]tica\b/i, /\bprote[íi]na(s)?\b/i,
    /\bmitosis\b/i, /\bmeiosis\b/i, /\bevoluci[óo]n\b/i, /\becosistema(s)?\b/i, /\bfotos[íi]ntesis\b/i,
    /\bbacteria(s)?\b/i, /\bvirus\b/i, /\banatom[íi]a\b/i, /\bfisiolog[íi]a\b/i
  ],
  matematicas: [
    /\bmat(em[aá]ticas?)?\b/i, /\bál?gebra\b/i, /\bgeometr[íi]a\b/i, /\btrigonometr[íi]a\b/i,
    /\bc[aá]lculo\b/i, /\bderivad(as|a)\b/i, /\bintegral(es)?\b/i, /\becuaci[oó]n(es)?\b/i,
    /\bprobabilidad\b/i, /\bestad[íi]stica\b/i, /\bmatriz|matrices\b/i, /\bl[íi]mite(s)?\b/i,
    /\blogaritmo(s)?\b/i, /\bpolinomio(s)?\b/i, /\bfunci[oó]n(es)?\b/i
  ],
  historia: [
    /\bhistoria\b/i, /\brevoluci[oó]n\b/i, /\bguerra(s)?\b/i, /\bimperio(s)?\b/i, /\bcivilizaci[oó]n(es)?\b/i,
    /\bsiglo(s)?\b/i, /\bconquista\b/i, /\bcolonia(l)?\b/i, /\bindependencia\b/i, /\bconstituci[oó]n\b/i,
    /\bprehistoria\b/i, /\b(antigua|medieval|moderna|contempor[aá]nea)\b/i, /\bazteca(s)?\b/i, /\bmaya(s)?\b/i, /\bcol[oó]n\b/i
  ],
} as const;

function detectCategories(text: string): Category[] {
  const hits: Category[] = [];
  (Object.keys(RX) as Category[]).forEach((k) => {
    const any = RX[k].some((rx) => rx.test(text));
    if (any) hits.push(k);
  });
  return hits;
}

function joinCatsSpanish(cats: string[]) {
  if (cats.length === 0) return "";
  if (cats.length === 1) return cats[0];
  if (cats.length === 2) return `${cats[0]} y ${cats[1]}`;
  return `${cats.slice(0, -1).join(", ")} y ${cats[cats.length - 1]}`;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  useClassifier = null,
  maxNewTokens = 64,
  timeoutMs = 240_000,
  onSuggest,
}) => {
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { enableOfflineLLMLogs(true); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [items.length]);

  const mkId = () => (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
  const canSend = !loading && !!message.trim();

  // Función de envío
  const sendMessage = async () => {
    if (!canSend) return;
    const q = message.trim();
    setMessage("");

    const uid = mkId();
    const aid = mkId();
    setItems((prev) => [
      ...prev,
      { id: uid, role: "user", text: q, status: "done" },
      { id: aid, role: "assistant", text: "…", status: "pending" },
    ]);

    setLoading(true);
    try {
      if (useClassifier) {
        // 1) generamos respuesta base (más contexto para el regex)
        const base = await offlineAnswer(q, { maxNewTokens, timeoutMs });
        const scanText = `${q}\n${base}`;
        // 2) detectamos 1+ categorías
        const cats = detectCategories(scanText);
        if (cats.length === 0) {
          // sin señales claras -> respuesta neutra y no sugerimos nada
          const msg = "Te podrían gustar estos cursos de introducción.";
          setItems((prev) => prev.map((m) => (m.id === aid ? { ...m, text: msg, status: "done" } : m)));
        } else {
          // 3) armamos SOLO la frase pedida
          const human = joinCatsSpanish(cats.map((c) => c));
          const msg = `Te podrían gustar estos cursos de ${human}.`;
          // 4) actualizamos chat y avisamos arriba
          setItems((prev) => prev.map((m) => (m.id === aid ? { ...m, text: msg, status: "done" } : m)));
          onSuggest?.(cats);
        }
      } else {
        // modo normal: usar respuesta del modelo
        const resp = await offlineAnswer(q, { maxNewTokens, timeoutMs });
        const safe = resp?.trim() || "(sin respuesta)";
        setItems((prev) => prev.map((m) => (m.id === aid ? { ...m, text: safe, status: "done" } : m)));
      }
    } catch (err: any) {
      setItems((prev) => prev.map((m) => (m.id === aid ? { ...m, text: String(err?.message || err), status: "error" } : m)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await sendMessage(); };

  return (
    <form
      className={`chat-box ${focused ? "focused" : ""}`}
      onSubmit={handleSubmit}
      onClick={() => { setFocused(true); inputRef.current?.focus(); }}
      aria-label="Chat de ayuda"
    >
      <label htmlFor="chat-input" className="chat-label">
        {useClassifier ? "¿Qué cursos te recomiendo?" : "¿En qué te ayudo?"}
      </label>

      <div className="chat-thread" role="log" aria-live="polite" aria-relevant="additions">
        {items.map((m) => (
          <div key={m.id} className={`chat-msg ${m.role} ${m.status}`}>
            {m.text}{m.status === "pending" && <span className="pending">⏳</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-wrapper">
        <textarea
          ref={inputRef}
          id="chat-input"
          rows={4}
          className="chat-input"
          placeholder={useClassifier ? "Escribe tu tema o duda…" : "Escribe aquí…"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              if (!loading && message.trim()) void sendMessage();
            }
          }}
          disabled={loading}
        />
        <button type="submit" className="chat-send-icon" disabled={!message.trim() || loading} aria-disabled={!message.trim() || loading} aria-label="Enviar mensaje">
          <img src={sendIcon} alt="" />
        </button>
      </div>
    </form>
  );
};

export default ChatBox;
