/// <reference lib="WebWorker" />
/* eslint-disable no-restricted-globals */
import { env, pipeline } from "@xenova/transformers";

// ====== ENV (WASM/CPU)
env.allowRemoteModels = false;
env.useBrowserCache = true;
const BASE = (import.meta as any).env?.BASE_URL || "/";
env.localModelPath = `${BASE.replace(/\/?$/, "/")}models`;

try {
  // @ts-ignore
  env.backends.onnx.wasm.simd = true;
  // Sube hilos si tu CPU lo permite (mejor que 2)
  // @ts-ignore
  env.backends.onnx.wasm.numThreads = Math.min(4, (self as any).navigator?.hardwareConcurrency ?? 4);
  // @ts-ignore
  env.backends.onnx.wasm.proxy = false;
} catch {}

const MODEL_ID = "Xenova/Qwen1.5-0.5B-Chat";

// ====== utils
function send(type: string, payload: any = {}, reqId?: number) {
  try { (self as any).postMessage({ type, reqId, ...payload }); } catch {}
}
function normalize(s: string) { return (s||"").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"").trim(); }
function parseCategory(t: string): "historia"|"matematicas"|"biologia" {
  const x = normalize((t||"").split(/\r?\n/)[0]||"");
  if (x.startsWith("hist")) return "historia";
  if (x.startsWith("mate") || x.startsWith("math")) return "matematicas";
  if (x.startsWith("bio"))  return "biologia";
  return "historia";
}

// ====== prompts
const buildPromptCategory = (q:string)=>`<|im_start|>system
Eres un CLASIFICADOR ESTRICTO.
Categorias validas (minusculas, sin acentos):
- historia
- matematicas
- biologia
Responde SOLO una palabra: historia | matematicas | biologia
<|im_end|>
<|im_start|>user
${q}
<|im_end|>
<|im_start|>assistant
`;

const buildPromptAnswer = (q:string)=>`<|im_start|>system
Eres un asistente. Responde conciso en español.
SALIDA ESTRICTA:
Escribe SOLO la respuesta final (sin explicaciones extra).
<|im_end|>
<|im_start|>user
${q}
<|im_end|>
<|im_start|>assistant
`;

// ====== state
let generator: any = null;

// ====== warmup con progreso + “ping” 1 token (reduce la 1ª latencia)
async function warmup() {
  if (generator) return;
  try {
    send("log", { msg: "WARMUP: creando pipeline", model: MODEL_ID, crossOriginIsolated: (self as any).crossOriginIsolated });
    generator = await pipeline("text-generation", MODEL_ID, {
      progress_callback: (ev: any) => {
        const { status, name, file, loaded, total, progress } = ev || {};
        const percent = typeof total === "number" && total > 0
          ? Math.min(100, Math.round(((loaded || 0) / total) * 100))
          : (typeof progress === "number" ? Math.round(progress * 100) : null);
        send("progress", { status, name, file, loaded, total, percent });
      },
    });
    // ping 1 token (JIT inicial)
    await generator("hi", { max_new_tokens: 1, do_sample: false, return_full_text: false });
    send("ready", { modelId: MODEL_ID });
  } catch (err: any) {
    send("error", { message: String(err?.message || err) });
  }
}

// ====== API: classify (solo categoría)
async function classify(question: string, reqId?: number) {
  try {
    if (!generator) await warmup();
    const out: any = await generator(buildPromptCategory(question), {
      max_new_tokens: 16,
      do_sample: false,
      temperature: 0,
      top_k: 1, top_p: 1,
      return_full_text: false,
      use_cache: false as any,
    });
    const raw = Array.isArray(out) ? (out[0]?.generated_text ?? "") : String(out);
    send("classified", { category: parseCategory(raw) }, reqId);
  } catch (err: any) {
    send("error", { message: String(err?.message || err) }, reqId);
  }
}

// ====== API: answer (solo respuesta)
async function answer(question: string, reqId?: number, genOpts: any = {}) {
  try {
    if (!generator) await warmup();

    const MAX = Math.max(1, Math.min(128, Number(genOpts?.maxNewTokens) || 16)); // <= sube/baja desde el caller
    let tokens = 0;
    const t0 = performance.now();
    send("log", { msg: "GEN: start", max_new_tokens: MAX, qlen: question.length }, reqId);

    const out: any = await generator(buildPromptAnswer(question), {
      max_new_tokens: MAX,
      do_sample: false,
      temperature: 0,
      top_k: 1, top_p: 1,
      repetition_penalty: 1.05,
      return_full_text: false,
      use_cache: true as any,
      // heartbeats por token
      callback_function: () => {
        tokens++;
        if (tokens % 2 === 0) {
          const pct = Math.min(100, Math.round((tokens / MAX) * 100));
          const secs = (performance.now() - t0) / 1000;
          send("progress", { status: "gen", tokens, max: MAX, percent: pct, secs }, reqId);
        }
      },
    });

    const raw = Array.isArray(out) ? (out[0]?.generated_text ?? "") : String(out);
    const secs = (performance.now() - t0) / 1000;
    send("log", { msg: "GEN: done", tokens, raw, secs, tok_per_sec: tokens ? +(tokens/secs).toFixed(2) : 0 }, reqId);
    send("result", { answer: raw }, reqId);
  } catch (err: any) {
    send("error", { message: String(err?.message || err) }, reqId);
  }
}

// ====== message handler
(self as any).onmessage = async (e: MessageEvent) => {
  const { type, payload, reqId } = e.data || {};
  if (type === "warmup")   return warmup();
  if (type === "classify") return classify(payload?.question, reqId);
  if (type === "answer")   return answer(payload?.question, reqId, payload?.genOpts || {});
};
