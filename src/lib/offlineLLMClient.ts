// @ts-ignore
import LlmWorker from "../llm.worker.ts?worker";

type AnyEv = { type: string; reqId?: number; [k: string]: any };

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let seq = 0;

// logger opcional
let logger: null | {
  log?: (m:any)=>void, ready?: (i:any)=>void, error?: (e:any)=>void, progress?: (p:any)=>void
} = null;

export function enableOfflineLLMLogs(enable: boolean | typeof logger) {
  if (enable === true) {
    logger = {
      log:   (m)=>console.log("[LLM LOG]", m),
      ready: (i)=>console.log("[LLM READY]", i),
      error: (e)=>console.error("[LLM ERR]", e),
      progress: (p)=>{
        if (p?.status === "gen") {
          const pct = typeof p?.percent === "number" ? `${p.percent}%` : "—";
          console.log(`[LLM GEN] ${pct} tokens=${p.tokens}/${p.max} t=${(p.secs||0).toFixed(1)}s`);
        } else {
          const pct = typeof p?.percent === "number" ? `${p.percent}%` : "—";
          const mb = (n?:number)=> typeof n==="number" ? (n/(1024*1024)).toFixed(1)+" MiB" : "—";
          console.log(`[LLM PROG] ${p.status||""} ${p.file||p.name||""} — ${pct} (${mb(p.loaded)}/${mb(p.total)})`);
        }
      },
    };
  } else if (enable && typeof enable === "object") {
    logger = enable as any;
  } else {
    logger = null;
  }
}

function ensureWorker(): Promise<void> {
  if (ready) return ready;
  worker = new LlmWorker();

  ready = new Promise<void>((resolve) => {
    worker!.addEventListener("message", (e: MessageEvent<AnyEv>) => {
      const ev = e.data;
      if (!ev?.type) return;
      if (ev.type === "ready")    { logger?.ready?.(ev); resolve(); }
      else if (ev.type === "log") { logger?.log?.(ev); }
      else if (ev.type === "progress") { logger?.progress?.(ev); }
      else if (ev.type === "error") { logger?.error?.(ev); }
    });
  });

  worker!.postMessage({ type: "warmup" });
  return ready;
}

type AnswerOpts = { timeoutMs?: number; maxNewTokens?: number };
type ClassifyOpts = { timeoutMs?: number };

function askWorker<T = any>(
  type: "classify" | "answer",
  payload: any,
  opts?: AnswerOpts | ClassifyOpts
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    await ensureWorker();
    const reqId = ++seq;

    let timeoutMs = Math.max(10_000, Number(opts?.timeoutMs) || 180_000); // 3 min por default
    let timer: any;

    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        worker!.removeEventListener("message", onMsg);
        reject(new Error("Timeout esperando respuesta"));
      }, timeoutMs);
    };

    const onMsg = (e: MessageEvent<AnyEv>) => {
      const ev = e.data;
      if (!ev) return;

      // 🔁 si llega progreso/log con reqId, refrescamos timeout
      if ((ev.type === "progress" || ev.type === "log") && ev.reqId === reqId) {
        arm();
        return;
      }

      if (ev.reqId !== reqId) return;

      if (ev.type === "classified") {
        clearTimeout(timer); worker!.removeEventListener("message", onMsg);
        return resolve(ev.category as T);
      }
      if (ev.type === "result") {
        clearTimeout(timer); worker!.removeEventListener("message", onMsg);
        return resolve(ev.answer as T);
      }
      if (ev.type === "error") {
        clearTimeout(timer); worker!.removeEventListener("message", onMsg);
        return reject(new Error(ev.message || "Worker error"));
      }
    };

    worker!.addEventListener("message", onMsg);
    arm(); // arranca el timeout
    worker!.postMessage({ type, reqId, payload });
  });
}

export function offlineClassify(question: string, opts?: ClassifyOpts)
: Promise<"historia"|"matematicas"|"biologia"> {
  return askWorker("classify", { question }, opts);
}

export function offlineAnswer(question: string, opts?: AnswerOpts): Promise<string> {
  const genOpts = { maxNewTokens: opts?.maxNewTokens };
  return askWorker("answer", { question, genOpts }, opts);
}
