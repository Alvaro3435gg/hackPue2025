// src/pages/Course/MathCourse.tsx
import "./Course.css"
import BlueButton from "../../components/BlueButton.tsx"
import ProgressBar from "../../components/ProgressBar.tsx"
import ChatBot from "../../components/ChatBot.tsx"
import DatoCurioso from "../../components/DatoCurioso.tsx"
import coursesData from "../../assets/data/cursos2.json"

type Tema = { titulo: string; url: string; contenido: string }
type Curso = { nombre: string; datoCurioso?: string; temas: Tema[] }
type Props = { progress?: number }

export default function MathCourse({ progress = 75 }: Props) {
    const cursos = (coursesData as Curso[])
    const math = cursos.find((c) => c.nombre === "Matemáticas")

    if (!math) {
        return (
            <div className="start-container">
                <h2 className="course-title">Curso de Matemáticas</h2>
                <p style={{ color: "#fff" }}>(No se encontró el curso en el JSON)</p>
            </div>
        )
    }

    return (
        <div className="start-container">
            {/* Título */}
            <h2 className="course-title">Curso de Matemáticas</h2>

            {/* Progreso */}
            <div className="progress-section">
                <ProgressBar value={progress} version={2} />
            </div>

            {/* Temas (scrolleable) */}
            <div className="courses-section" aria-label="Temas de Matemáticas">
                {math.temas.map((tema) => (
                    <BlueButton
                        key={tema.titulo}
                        nombre={tema.titulo}
                        url={`/curso/matematicas/${tema.url}`}
                    />
                ))}
            </div>

            {/* Dato curioso del curso */}
            {math.datoCurioso && (
                <DatoCurioso text={math.datoCurioso} className="mb-12" />
            )}

            {/* Chat */}
            <ChatBot />
        </div>
    )
}
