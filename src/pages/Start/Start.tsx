import "./Start.css"
import BlueButton from "../../components/BlueButton"
import ProgressBar from "../../components/ProgressBar"
import ChatBot from "../../components/ChatBot"
import { getPlatformProgress } from "../../lib/progress";
import {useEffect, useReducer} from "react";
import { useState } from "react";

type CourseItem = { nombre: string; url?: string };

type StartProps = {
  courses?: CourseItem[]; // lista base
  userName?: string;
  progress?: number;
};

const DEFAULT_COURSES: CourseItem[] = [
  { nombre: "Curso de Biología", url: "/biologycourse" },
  { nombre: "Curso de Matemáticas", url: "/mathcourse" },
  { nombre: "Curso de Historia", url: "/historycourse" },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function matchesCategory(curso: CourseItem, cat: "biologia" | "matematicas" | "historia") {
  const n = normalize(curso.nombre);
  if (cat === "biologia") return /biolog/.test(n);
  if (cat === "matematicas") return /(matematic|algebra|calculo|probabil|estad)/.test(n);
  if (cat === "historia") return /histori/.test(n);
  return false;
}

export default function Start({
  courses = DEFAULT_COURSES,
  userName = "",
}: StartProps) {

    const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [visibleCourses, setVisibleCourses] = useState<CourseItem[]>(courses);

    useEffect(() => {
        const fn = () => forceUpdate(prev => prev + 1); // o setState para refrescar
        window.addEventListener("progress-changed", fn);
        return () => window.removeEventListener("progress-changed", fn);
    }, []);

    const { percent } = getPlatformProgress()

  // cuando el chat sugiere categorías, filtramos
  const handleSuggest = (cats: Array<"biologia" | "matematicas" | "historia">) => {
    // Si quieres que sea acumulativo, usa un set con las anteriores.
    const filtered = courses.filter((c) => cats.some((cat) => matchesCategory(c, cat)));
    // Si ninguna coincide, puedes dejar una lista neutra o vacía; aquí dejamos la base:
    setVisibleCourses(filtered.length ? filtered : courses);
  };

  return (
    <div className="start-container">
      {/* Saludo */}
      <h2 className="welcome-text">¡Bienvenid@{userName ? ` ${userName}` : ""}!</h2>

      {/* Progreso general */}
      <div className="progress-section">
        <ProgressBar value={percent} version={1} />
      </div>

      {/* Botones de cursos (scrolleable) */}
      <div className="courses-section" aria-label="Lista de cursos">
        {visibleCourses.map((c, i) => (
          <BlueButton key={`${c.nombre}-${i}`} nombre={c.nombre} url={c.url ?? "#"} />
        ))}
      </div>

      {/* Chat abajo: en modo recomendaciones */}
      <ChatBot useClassifier onSuggest={handleSuggest} />
    </div>
  );
}
