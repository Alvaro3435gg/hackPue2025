import "./Start.css"
import BlueButton from "../../components/BlueButton"
import ProgressBar from "../../components/ProgressBar"
import ChatBot from "../../components/ChatBot"

type CourseItem = { nombre: string; url?: string }

type StartProps = {
    courses?: CourseItem[]       // ← lista que te mandan
    userName?: string            // opcional para saludo
    progress?: number            // opcional para la barra
}

const DEFAULT_COURSES: CourseItem[] = [
    { nombre: "Curso de Biología", url: "/biologycourse" },
    { nombre: "Curso de Matemáticas", url: "/mathcourse" },
    { nombre: "Curso de Historia", url: "/historycourse" },
]

export default function Start({
                                  courses = DEFAULT_COURSES,
                                  userName = "",
                                  progress = 75,
                              }: StartProps) {
    return (
        <div className="start-container">
            {/* Saludo */}
            <h2 className="welcome-text">
                Bienvenid@{userName ? ` ${userName}` : ""}!
            </h2>

            {/* Progreso general */}
            <div className="progress-section">
                <ProgressBar value={progress} version={1} />
            </div>

            {/* Botones de cursos (scrolleable) */}
            <div className="courses-section" aria-label="Lista de cursos">
                {courses.map((c, i) => (
                    <BlueButton key={`${c.nombre}-${i}`} nombre={c.nombre} url={c.url ?? "#"} />
                ))}
            </div>

            {/* Chat abajo */}
            <ChatBot />
        </div>
    )
}
