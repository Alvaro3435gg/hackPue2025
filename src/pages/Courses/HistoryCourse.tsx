import "./Course.css"
import BlueButton from "../../components/BlueButton"
import ProgressBar from "../../components/ProgressBar"
import ChatBot from "../../components/ChatBot"
import DatoCurioso from "../../components/DatoCurioso"
import coursesData from "../../assets/data/cursos2.json"

type Tema = { titulo: string; url: string; contenido: string }
type Curso = { nombre: string; datoCurioso?: string; temas: Tema[] }
type Props = { progress?: number }

export default function HistoryCourse({ progress = 75 }: Props) {
    const cursos = (coursesData as Curso[])
    const history = cursos.find((c) => c.nombre === "Historia")

    if (!history) {
        return (
            <div className="start-container">
                <h2 className="course-title">Curso de Historia</h2>
                <p style={{ color: "#fff" }}>
                    (No se encontró el curso de Historia en el JSON)
                </p>
            </div>
        )
    }

    return (
        <div className="start-container">
            {/* Título */}
            <h2 className="course-title">Curso de Historia</h2>

            {/* Progreso */}
            <div className="progress-section">
                <ProgressBar value={progress} version={2} />
            </div>

            {/* Temas (scrolleable) */}
            <div className="courses-section" aria-label="Temas de Historia">
                {history.temas.map((tema) => (
                    <BlueButton
                        key={tema.titulo}
                        nombre={tema.titulo}
                        url={`/curso/historia/${tema.url}`}
                    />
                ))}
            </div>

            {/* Dato curioso del curso */}
            {history.datoCurioso && (
                <DatoCurioso text={history.datoCurioso} className="mb-12" />
            )}


            {/* Chat */}
            <ChatBot />
        </div>
    )
}
