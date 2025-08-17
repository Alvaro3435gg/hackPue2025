import "./Course.css"
import BlueButton from "../../components/BlueButton"
import ProgressBar from "../../components/ProgressBar"
import ChatBot from "../../components/ChatBot"
import DatoCurioso from "../../components/DatoCurioso"
import coursesData from "../../assets/data/cursos2.json"
import returnIcon from "../../assets/return.png"
import { useNavigate } from "react-router-dom"
import { getCourseProgress } from "../../lib/progress"
import { useEffect, useReducer } from "react"

type Tema = { titulo: string; url: string; contenido: string }
type Curso = { nombre: string; datoCurioso?: string; temas: Tema[] }

export default function BiologyCourse() {
    const navigate = useNavigate()
    const handleReturn = () => navigate("/start#")

    const biology = (coursesData as Curso[]).find((c) => c.nombre === "Biología")

    const [, forceUpdate] = useReducer((x) => x + 1, 0)
    useEffect(() => {
        const onChange = (e: Event) => {
            console.log("[BiologyCourse] progress-changed recibido", e)
            forceUpdate()
        }
        window.addEventListener("progress-changed", onChange)
        return () => window.removeEventListener("progress-changed", onChange)
    }, [])

    const { percent } = getCourseProgress("Biología")
    console.log("[BiologyCourse] course percent =", percent)

    return (
        <div className="start-container">
            <h2 className="welcome-text">Curso de Biología</h2>

            <div className="progress-section">
                <ProgressBar value={percent} version={2} />
            </div>

            <div className="courses-section" aria-label="Lista de cursos">
                {coursesData
                    .flatMap((area: any) => area.temas)
                    .slice(6, 8)
                    .map((tema: any) => (
                        <BlueButton
                            key={tema.titulo}
                            nombre={tema.titulo}
                            url={`/${tema.url.replace(/\s+/g, "").toLowerCase()}`}
                        />
                    ))}
            </div>

            {biology?.datoCurioso && <DatoCurioso text={biology.datoCurioso} className="mb-12" />}

            <img src={returnIcon} alt="Return" className="return-icon" onClick={handleReturn} />

            <ChatBot />
        </div>
    )
}
