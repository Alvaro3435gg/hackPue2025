// src/pages/Course/MathCourse.tsx
import "./Course.css"
import BlueButton from "../../components/BlueButton.tsx"
import ProgressBar from "../../components/ProgressBar.tsx"
import ChatBot from "../../components/ChatBot.tsx"
import DatoCurioso from "../../components/DatoCurioso.tsx"
import coursesData from "../../assets/data/cursos2.json"
import returnIcon from "../../assets/return.png"
import { useNavigate } from "react-router-dom"
// ⬇️ importa progreso
import { getCourseProgress } from "../../lib/progress"
import { useEffect, useState } from "react"

type Tema = { titulo: string; url: string; contenido: string }
type Curso = { nombre: string; datoCurioso?: string; temas: Tema[] }

export default function MathCourse() {
    const navigate = useNavigate()
    const handleReturn = () => navigate("/start#")

    // leer datoCurioso de Matemáticas
    const math = (coursesData as Curso[]).find(c => c.nombre === "Matemáticas")

    // estado de progreso
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // función para refrescar progreso
        const refresh = () => {
            const { percent } = getCourseProgress("Matemáticas")
            setProgress(percent)
        }
        refresh() // primera carga
        window.addEventListener("progress-changed", refresh)
        return () => window.removeEventListener("progress-changed", refresh)
    }, [])

    return (
        <div className="start-container">
            {/* Saludo */}
            <h2 className="welcome-text">Curso de Matemáticas</h2>

            {/* Progreso real */}
            <div className="progress-section">
                <ProgressBar value={progress} version={2} />
            </div>

            {/* Botones de cursos */}
            <div className="courses-section" aria-label="Lista de cursos">
                {coursesData
                    .flatMap(area => area.temas)
                    .slice(0, 2) // <-- aquí asumes que los temas de Matemáticas están en la posición 0 y 1
                    .map(tema => (
                        <BlueButton
                            key={tema.titulo}
                            nombre={tema.titulo}
                            url={`/${tema.url.replace(/\s+/g, "").toLowerCase()}`}
                        />
                    ))
                }
            </div>

            {/* Dato curioso */}
            {math?.datoCurioso && (
                <DatoCurioso text={math.datoCurioso} className="mb-12" />
            )}

            {/* Return icon button */}
            <img
                src={returnIcon}
                alt="Return"
                className="return-icon"
                onClick={handleReturn}
            />

            {/* Chat abajo */}
            <ChatBot />
        </div>
    )
}
