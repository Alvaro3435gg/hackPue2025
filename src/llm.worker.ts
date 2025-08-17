/// <reference lib="WebWorker" />
/* eslint-disable no-restricted-globals */

// Worker para LLM offline con transformers.js (Xenova) en CPU/WASM
// 🚫 SIN WebGPU: no importes "onnxruntime-web/webgpu"

import { env, pipeline } from "@xenova/transformers";

// ====== ENV (CPU/WASM) ======
env.allowRemoteModels = false;   // sin red
env.useBrowserCache = true;     // desactiva cache para depurar
env.localModelPath = "/models";  // sirve /public/models

// Ajustes WASM estables
try {
  // @ts-ignore
  env.backends.onnx.wasm.simd = true;
  // @ts-ignore
  env.backends.onnx.wasm.numThreads = Math.min(
    2,
    (self as any).navigator?.hardwareConcurrency ?? 2
  );
  // @ts-ignore
  env.backends.onnx.wasm.proxy = false;
} catch {}

// ====== MODELO ======
const MODEL_ID = "Xenova/Qwen1.5-0.5B-Chat";
// const MODEL_ID = "Xenova/Phi-3-mini-4k-instruct";

// Archivos JSON obligatorios
const COMMON_JSON = [
  "tokenizer.json",
  "tokenizer_config.json",
  "generation_config.json",
  "config.json",
];

// Nombres ONNX comunes (añadí model_q4.onnx para Phi-3)
const ONNX_CANDIDATES = [
  "onnx/decoder_model_merged_quantized.onnx",
  "onnx/decoder_model_merged.onnx",
  "onnx/model.onnx",
  "onnx/model_quantized.onnx",
  "onnx/model_q4.onnx",
];

// ====== LOG/COMMS ======
function wlog(...args: any[]) {
  try { console.log("[WORKER]", ...args); } catch {}
  try { (self as any).postMessage({ type: "log", msg: args[0], extra: args[1] }); } catch {}
}
function send(type: string, payload: any = {}) {
  try { (self as any).postMessage({ type, ...payload }); } catch {}
}

// ====== PROMPTS ======
// 1) Clasificación — SOLO categoría en minúsculas
function buildPromptCategory(question: string) {
  return (
`<|im_start|>system
You are a STRICT classifier.

Choose the best word to match the user question.
- History
- Math
- Entertainment
<|im_end|>
<|im_start|>user
${question}
<|im_end|>
<|im_start|>assistant
`);
}


// 2) Respuesta — SOLO la respuesta final
function buildPromptAnswer(question: string, category: string) {
  return (
`<|im_start|>system
You are an assistant. The question has been classified as: ${category}.
Answer the user's question concisely in English.

STRICT OUTPUT:
Write ONLY the final answer. No category, no preamble, no explanations.
<|im_end|>
<|im_start|>user
${question}
<|im_end|>
<|im_start|>assistant
`);
}

// ====== PARSERS ======
function parseCategory(text: string): "math" | "history" | "entertainment" | "other" {
  const firstLine = (text || "").split(/\r?\n/).find(l => l.trim().length)?.trim().toLowerCase() ?? "";
  if (firstLine === "math" || firstLine === "history" || firstLine === "entertainment") return firstLine;
  return "other";
}

const categoryToDigit: Record<string, "1" | "2" | "3"> = {
  math: "1",
  history: "2",
  entertainment: "3",
};

// ====== Helpers de red ======
async function getMeta(url: string) {
  const res = await fetch(url, { method: "GET", cache: "no-cache" });
  const len = Number(res.headers.get("content-length") || "0");
  const type = res.headers.get("content-type") || "";
  return { ok: res.ok, status: res.status, type, len, url };
}
function looksLikeBinaryOk(info: { ok: boolean; status: number; type: string; len: number }) {
  return !!info && info.ok && info.status === 200 && !String(info.type).includes("text/html");
}

// ====== STATE ======
let generator: any = null;

// ====== WARMUP (CPU/WASM) ======
async function warmup() {
  try {
    const base = `${env.localModelPath}/${MODEL_ID}`;

    // Checar JSONs
    for (const jf of COMMON_JSON) {
      const j = await getMeta(`${base}/${jf}`);
      wlog(`CHECK ${jf}`, { status: j.status, len: j.len, type: j.type });
      if (j.status !== 200) {
        send("error", { message: `Missing ${jf} at ${base}` });
        return;
      }
    }

    // Checar ONNX existente
    let found = null as null | string;
    for (const rel of ONNX_CANDIDATES) {
      const m = await getMeta(`${base}/${rel}`);
      wlog(`CHECK ${rel}`, { status: m.status, len: m.len, type: m.type });
      if (looksLikeBinaryOk(m)) { found = rel; break; }
    }
    if (!found) {
      send("error", { message: `No ONNX found under ${base}/onnx` });
      return;
    }
    wlog("ONNX selected", { rel: found });

    // Crear pipeline (CPU/WASM)
    generator = await pipeline("text-generation", MODEL_ID, {
      progress_callback: (p: any) => { send("progress", p); wlog("[loader]", p); },
    });

    // Ping mínimo — sin KV cache
    const warm = await generator("Hello", {
      max_new_tokens: 1,
      do_sample: false,
      return_full_text: false,
      use_cache: false as any,
    });
    wlog("warmup ok", warm);

    send("ready", { modelId: MODEL_ID, backend: "cpu" });
  } catch (err: any) {
    wlog("warmup ERROR", { err: String(err?.message || err) });
    send("error", { message: String(err?.message || err) });
  }
}

// ====== GENERATE (dos consultas) ======
async function generate(question: string, opts: any = {}) {
  try {
    if (!generator) {
      await warmup();
      if (!generator) return;
    }

    // ---------- STAGE 1: categoría ----------
    const p1 = buildPromptCategory(question);
    const s1 = {
      max_new_tokens: 128,
      do_sample: false,
      temperature: 0,
      top_k: 1,
      top_p: 1,
      repetition_penalty: 1.0,
      return_full_text: false,
      use_cache: false as any,
    };

    wlog("STAGE1 classify()", { promptPreview: p1.slice(0, 200) + "…", s1 });
    const o1: any = await generator(p1, s1);
    const rawCategory = Array.isArray(o1) ? (o1[0]?.generated_text ?? "") : String(o1);
    const category = parseCategory(rawCategory);
    wlog("STAGE1 RAW", rawCategory);
    wlog("STAGE1 PARSED category", category);

    // ---------- STAGE 2: respuesta ----------
    const p2 = buildPromptAnswer(question, category);
    const s2 = {
      max_new_tokens: 128,
      do_sample: false,  // precisión/consistencia; si quieres variación: true + temperature
      temperature: 0,
      top_k: 1,
      top_p: 1,
      repetition_penalty: 1.05,
      return_full_text: false,
      use_cache: false as any,
      ...opts,
    };

    wlog("STAGE2 answer()", { promptPreview: p2.slice(0, 200) + "…", s2 });
    const o2: any = await generator(p2, s2);
    const rawAnswer = Array.isArray(o2) ? (o2[0]?.generated_text ?? "") : String(o2);
    const answer = rawAnswer.trim();
    wlog("STAGE2 RAW", rawAnswer);

    // mantener compatibilidad con UI que espera "choice"
    const choice = categoryToDigit[category] ?? "3";

    // Enviar resultado final (y logs ya muestran ambas etapas)
    send("result", { raw: rawAnswer, rawCategory, rawAnswer, category, choice, answer });
  } catch (err: any) {
    wlog("generate ERROR", { err: String(err?.message || err) });
    send("error", { message: String(err?.message || err) });
  }
}

// ====== HANDLERS ======
(self as any).onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data || {};
  try {
    if (type === "warmup") {
      await warmup();
    } else if (type === "generate") {
      const { question, ...opts } = payload || {};
      await generate(question, opts);
    }
  } catch (err: any) {
    wlog("onmessage ERROR", { err: String(err?.message || err) });
    send("error", { message: String(err?.message || err) });
  }
};
