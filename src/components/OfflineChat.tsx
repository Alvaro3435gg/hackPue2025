import { useEffect, useMemo, useRef, useState } from "react";

// Tipos de eventos del worker (deben coincidir con el worker)
type WEvent =
  | { type: "ready"; modelId: string; onnx?: string | null }
  | { type: "result"; raw: string; choice: "1" | "2" | "3"; answer: string }
  | { type: "error"; message: string }
  | { type: "log"; msg: string; extra?: any }
  | {
      type: "progress";
      status: "initiate" | "download" | "progress" | "done";
      name?: string; // model id
      file?: string; // nombre de archivo
      progress?: number; // 0..100 (si disponible)
      loaded?: number;   // bytes descargados
      total?: number | null;
    };

// @ts-ignore - Vite inyecta tipo para workers
import LlmWorker from "../llm.worker.ts?worker";

type Status = "idle" | "loading" | "ready" | "generating";

export default function OfflineChatQwen() {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [question, setQuestion] = useState("¿Quién descubrió América?");
  const [raw, setRaw] = useState("");
  const [choice, setChoice] = useState<"1" | "2" | "3" | "">("");
  const [answer, setAnswer] = useState("");

  // progreso por archivo (clave = file)
  const [progress, setProgress] = useState<
    Record<string, { status: string; loaded: number; total?: number | null }>
  >({});

  // bytes -> MiB string
  const mib = (n?: number) =>
    typeof n === "number" ? (n / (1024 * 1024)).toFixed(1) + " MiB" : "—";

  useEffect(() => {
    const w = new LlmWorker();
    workerRef.current = w;

    w.onmessage = (e: MessageEvent<WEvent>) => {
      const ev = e.data as WEvent;

      if (ev.type === "log") {
        // logs del worker
        // eslint-disable-next-line no-console
        console.log("[LLM-WORKER LOG]", ev.msg, ev.extra ?? "");
        return;
      }

      if (ev.type === "progress") {
        const key = ev.file || `${ev.status}:${ev.name || ""}`;
        setProgress((prev) => ({
          ...prev,
          [key]: {
            status: ev.status,
            loaded: ev.loaded ?? prev[key]?.loaded ?? 0,
            total: ev.total ?? null,
          },
        }));
        return;
      }

      if (ev.type === "ready") {
        setStatus("ready");
        // eslint-disable-next-line no-console
        console.log("[READY]", ev.modelId, ev.onnx ? `ONNX=${ev.onnx}` : "");
        return;
      }

      if (ev.type === "result") {
        // 👉 log visible en DevTools
        console.log("[LLM RESULT]", {
          choice: ev.choice,
          answer: ev.answer,
          rawPreview: ev.raw?.slice(0, 400),
        });

        setRaw(ev.raw);
        setChoice(ev.choice ?? "");
        setAnswer(ev.answer);
        setStatus("ready");
        return;
      }

      if (ev.type === "error") {
        setStatus("ready");
        // eslint-disable-next-line no-console
        console.error("[LLM-WORKER ERROR]", ev.message);
        alert(ev.message);
      }
    };

    setStatus("loading");
    w.postMessage({ type: "warmup" });

    return () => w.terminate();
  }, []);

  const handleGenerate = () => {
    if (!workerRef.current || status !== "ready") return;
    setStatus("generating");
    workerRef.current.postMessage({
      type: "generate",
      payload: {
        question, // el worker construye el prompt
        // puedes sobreescribir parámetros aquí si hace falta
        // p.ej. { do_sample: true, temperature: 0.35, top_p: 0.9, top_k: 50 }
      },
    });
  };

  // Lista ordenada de descargas/progreso (mejor visual)
  const progressList = useMemo(() => {
    const entries = Object.entries(progress);
    const order: Record<string, number> = {
      initiate: 0,
      download: 1,
      progress: 2,
      done: 3,
    };
    return entries
      .map(([file, v]) => ({ file, ...v }))
      .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }, [progress]);

  const offline = !navigator.onLine;

  return (
    <div style={{ maxWidth: 820, margin: "2rem auto", fontFamily: "system-ui", color: "#111" }}>
      <h2>Qwen (ONNX, offline)</h2>
      <p>
        Estado: <b>{status}</b> {offline && " • Modo offline"}
      </p>

      {/* Progreso */}
      {status !== "ready" && progressList.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Descargando / cargando:</div>
          <div style={{ display: "grid", gap: 6 }}>
            {progressList.map((p) => {
              const pct =
                typeof p.total === "number" && p.total > 0
                  ? Math.min(100, Math.round(((p.loaded || 0) / p.total) * 100))
                  : p.loaded
                  ? 100
                  : 0;
              return (
                <div key={p.file} style={{ background: "#222", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa" }}>
                    <span>{p.file}</span>
                    <span>
                      {p.status} • {mib(p.loaded)}
                      {p.total ? ` / ${mib(p.total)}` : ""}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#444", borderRadius: 999, marginTop: 6 }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg, #7dd3fc, #60a5fa)",
                        transition: "width .2s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: 12, marginTop: 8 }}
        placeholder="Escribe tu pregunta…"
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={handleGenerate} disabled={status !== "ready"}>
          Generar
        </button>
        <button
          onClick={() => {
            setRaw("");
            setChoice("");
            setAnswer("");
          }}
        >
          Limpiar
        </button>
      </div>

      {/* Resultado */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Clasificación (1/2/3):</span>
          <span
            style={{
              display: "inline-block",
              minWidth: 28,
              textAlign: "center",
              borderRadius: 6,
              padding: "2px 8px",
              background: "#eef2ff",
              border: "1px solid #c7d2fe",
              fontWeight: 700,
              color: "#111",
            }}
          >
            {choice || "—"}
          </span>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Respuesta</div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f6f6f6",
              padding: 12,
              borderRadius: 8,
              color: "#111", // 👉 asegura letras negras
            }}
          >
            {answer || "—"}
          </pre>
        </div>

        <details style={{ marginTop: 8 }}>
          <summary>Ver salida cruda del modelo</summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f6f6f6",
              padding: 12,
              borderRadius: 8,
              color: "#111",
            }}
          >
            {raw || "—"}
          </pre>
        </details>
      </div>

      <small style={{ display: "block", marginTop: 16, color: "#555" }}>
        Pon archivos en <code>/public/models/&lt;MODEL_ID&gt;/</code> y ONNX en <code>/onnx/</code>.
      </small>
    </div>
  );
}
