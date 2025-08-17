# README — Xenova/Qwen1.5-0.5B-Chat (ONNX)

## Modelo

Este proyecto utiliza el modelo **[Xenova/Qwen1.5-0.5B-Chat](https://huggingface.co/Xenova/Qwen1.5-0.5B-Chat)**, convertido a **ONNX** para su uso en navegador o Node.js mediante **Transformers.js**.

> 🔹 También existe el repo base (no-chat): [Xenova/Qwen1.5-0.5B](https://huggingface.co/Xenova/Qwen1.5-0.5B).

Ambos están optimizados para ejecución local y soportan cuantización.

---

## Estructura de archivos

Los archivos del modelo deben organizarse de la siguiente forma dentro del proyecto:

```
public/
└── models/
    └── Xenova/
        └── Qwen1.5-0.5B-Chat/
            └── onnx/
                ├── decoder_model_merged_quantized.onnx
                ├── config.json
                ├── generation_config.json
                ├── tokenizer_config.json
                └── tokenizer.json
```

---

## Instalación

Instala la librería oficial:

```bash
npm install @xenova/transformers
```

---

##  Uso rápido

### 1. Ejecutar localmente en modo desarrollo

Si tu proyecto ya usa **Vite**, **Next.js** o similar, puedes correrlo con:

```bash
npm run dev
```

Esto levantará tu entorno local y podrás acceder a la app que cargue el modelo desde `public/models`.

---

### 2. Hacer build para producción

Cuando quieras generar la versión optimizada:

```bash
npm run build
npx serve dist
```



