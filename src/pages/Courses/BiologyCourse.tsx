import "./Course.css"
import BlueButton from "../../components/BlueButton.tsx"
import ProgressBar from "../../components/ProgressBar.tsx"
import ChatBot from "../../components/ChatBot.tsx"
import DatoCurioso from "../../components/DatoCurioso.tsx"
import coursesData from "../../assets/data/cursos2.json"
import returnIcon from "../../assets/return.png"
import { useNavigate } from "react-router-dom"

type Tema = { titulo: string; url: string; contenido: string }
type Curso = { nombre: string; datoCurioso?: string; temas: Tema[] }

type StartProps = {
    progress?: number
}

export default function BiologyCourse({ progress = 75 }: StartProps) {
    const navigate = useNavigate()
    const handleReturn = () => {
        navigate("/start#")
    }

    // Obtenemos el curso Biología SOLO para leer su datoCurioso
    const biology = (coursesData as Curso[]).find(c => c.nombre === "Biología")

    return (
        <div className="start-container">
            {/* Saludo */}
            <h2 className="welcome-text">Curso de Biología</h2>

            {/* Progreso general */}
            <div className="progress-section">
                <ProgressBar value={progress} version={2} />
            </div>

            {/* Botones de cursos (mantengo tu lógica actual) */}
            <div className="courses-section" aria-label="Lista de cursos">
                {coursesData
                    .flatMap(area => area.temas)
                    .slice(6, 8)
                    .map(tema => (
                        <BlueButton
                            key={tema.titulo}
                            nombre={tema.titulo}
                            url={`/${tema.url.replace(/\s+/g, "").toLowerCase()}`}
                        />
                    ))}
            </div>

            {/* DATO CURIOSO: insertado ANTES de la flecha, sin tocar la flecha */}
            {biology?.datoCurioso && (
                <DatoCurioso text={biology.datoCurioso} className="mb-12" />
            )}

            {/* Return icon button (SIN CAMBIOS) */}
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
