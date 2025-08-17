// src/lib/progress.ts
import cursosData from "../assets/data/cursos2.json";

// === Tipos ===
export type Tema = { titulo: string; url: string; contenido: string };
export type Curso = { nombre: string; datoCurioso?: string; temas: Tema[] };

export type TopicProgress = {
    completed: boolean;          // ¿terminó el quiz?
    score?: number;              // mejor puntaje (0-100)
    attempts: number;            // intentos totales
    lastAt?: string;             // ISO date
};

export type Save = {
    version: number;
    courses: Record<string, Record<string, TopicProgress>>; // courseName -> topicSlug(url) -> progress
};

const STORAGE_KEY = "chiukhan.save";

// === Helpers ===
const asCursos = () => (cursosData as Curso[]);

// arriba del archivo
const QUIZ_LIMITS: Record<string, number> = {
    "Biología": 2,
    "Historia": 2,
    "Matemáticas": 2
};


// Construye un save vacío a partir del cursos2.json
export function buildEmptySave(): Save {
    const base: Save = { version: 1, courses: {} };
    for (const c of asCursos()) {
        base.courses[c.nombre] = base.courses[c.nombre] || {};
        for (const t of c.temas) {
            base.courses[c.nombre][t.url] = { completed: false, attempts: 0 };
        }
    }
    return base;
}


// Mezcla un save existente con el baseline (por si agregas temas nuevos)
function deepMergeSave(baseline: Save, loaded?: Save | null): Save {
    if (!loaded) return baseline;
    const out: Save = { version: Math.max(baseline.version, loaded.version), courses: {} };
    const allCourses = new Set([...Object.keys(baseline.courses), ...Object.keys(loaded.courses)]);
    for (const cname of allCourses) {
        out.courses[cname] = {};
        const bTopics = baseline.courses[cname] || {};
        const lTopics = loaded.courses[cname] || {};
        const allTopics = new Set([...Object.keys(bTopics), ...Object.keys(lTopics)]);
        for (const slug of allTopics) {
            out.courses[cname][slug] = { ...bTopics[slug], ...lTopics[slug] };
        }
    }
    return out;
}

// Carga desde localStorage (o crea uno vacío) y normaliza con el baseline del JSON actual
export function loadSave(): Save {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed: Save | null = raw ? JSON.parse(raw) : null;
        const baseline = buildEmptySave();
        const merged = deepMergeSave(baseline, parsed);
        // asegúrate de persistir lo normalizado (por si agregaste temas nuevos)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
    } catch {
        const baseline = buildEmptySave();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(baseline));
        return baseline;
    }
}

export function saveSave(data: Save) {
    console.log("[progress] saveSave()", data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    const ev = new CustomEvent("progress-changed", { detail: { at: Date.now() } })
    console.log("[progress] dispatching progress-changed", ev.detail)
    window.dispatchEvent(ev)
}

// Registra el resultado de un quiz (umbral opcional para marcar "completed")
export function recordQuizResult(courseName: string, topicSlug: string, score: number, passThreshold = 60) {
    console.log("[progress] recordQuizResult()", { courseName, topicSlug, score, passThreshold })
    const save = loadSave()
    const course = (save.courses[courseName] ||= {})
    const prev = (course[topicSlug] ||= { completed: false, attempts: 0 })
    course[topicSlug] = {
        completed: score >= passThreshold ? true : prev.completed,
        score: Math.max(prev.score ?? 0, score),
        attempts: (prev.attempts ?? 0) + 1,
        lastAt: new Date().toISOString(),
    }
    saveSave(save)
}

export function getCourseProgress(courseName: string): { percent: number; done: number; total: number } {
    const save = loadSave();
    const curso = asCursos().find(c => c.nombre === courseName);
    if (!curso) return { percent: 0, done: 0, total: 0 };

    let topics = curso.temas.map(t => t.url);

    // aplica límite si existe
    const limit = QUIZ_LIMITS[courseName];
    if (limit) {
        topics = topics.slice(0, limit);
    }

    const states = topics.map(slug => save.courses[courseName]?.[slug]?.completed === true);
    const done = states.filter(Boolean).length;
    const total = topics.length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    return { percent, done, total };
}


// Progreso de toda la plataforma (0–100)
export function getPlatformProgress(): { percent: number; done: number; total: number } {
    const save = loadSave();
    let done = 0, total = 0;
    for (const c of asCursos()) {
        for (const t of c.temas) {
            total += 1;
            if (save.courses[c.nombre]?.[t.url]?.completed) done += 1;
        }
    }
    const percent = total ? Math.round((done / total) * 100) : 0;
    return { percent, done, total };
}

// Estado de un tema (útil para deshabilitar botones o poner check)
export function getTopicStatus(courseName: string, topicSlug: string): TopicProgress {
    const save = loadSave();
    return save.courses[courseName]?.[topicSlug] || { completed: false, attempts: 0 };
}
