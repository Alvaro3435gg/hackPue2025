// src/pages/Course/MathCourse.tsx
import "./Course.css"
import BlueButton from "../../components/BlueButton.tsx"
import ChatBot from "../../components/ChatBot.tsx"
import DatoCurioso from "../../components/DatoCurioso.tsx"
import coursesData from "../../assets/data/cursos2.json"
import returnIcon from "../../assets/return.png"
import { useNavigate } from "react-router-dom"

type Tema = { titulo: string; url: string; contenido: string }
type Curso = { nombre: string; datoCurioso?: string; temas: Tema[] }

export default function MathCourse() {
    const navigate = useNavigate()
    const handleReturn = () => navigate("/start#")

    // Solo para leer el datoCurioso de "Matemáticas"
    const math = (coursesData as Curso[]).find(c => c.nombre === "Matemáticas")

    return (
        <div className="start-container">
            {/* Saludo */}
            <h2 className="welcome-text">Curso de Matemáticas</h2>

            {/* Botones de cursos (mantengo tu slice) */}
            <div className="courses-section" aria-label="Lista de cursos">
                {coursesData
                    .flatMap(area => area.temas)
                    .slice(0, 2)
                    .map(tema => (
                        <BlueButton
                            key={tema.titulo}
                            nombre={tema.titulo}
                            url={`/${tema.url.replace(/\s+/g, "").toLowerCase()}`}
                        />
                    ))
                }
            </div>

            {/* Dato curioso (ANTES de la flecha, sin tocar la flecha) */}
            {math?.datoCurioso && (
                <DatoCurioso text={math.datoCurioso} className="mb-12" />
            )}

            {/* Return icon button (sin cambios) */}
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
