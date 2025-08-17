import "./Course.css"
import BlueButton from "../../components/BlueButton"
import ProgressBar from "../../components/ProgressBar"
import ChatBot from "../../components/ChatBot"
import DatoCurioso from "../../components/DatoCurioso"
import coursesData from "../../assets/data/cursos2.json"

type Tema = { titulo: string; url: string; contenido: string }
type Curso = { nombre: string; datoCurioso?: string; temas: Tema[] }

type Props = { progress?: number }

export default function BiologyCourse({ progress = 75 }: Props) {
    const cursos = (coursesData as Curso[])
    const biology = cursos.find((c) => c.nombre === "Biología")

    if (!biology) {
        return (
            <div className="start-container">
                <h2 className="course-title">Curso de Biología</h2>
                <p style={{ color: "#fff" }}>
                    (No se encontró el curso de Biología en el JSON)
                </p>
            </div>
        )
    }

    return (
        <div className="start-container">
            {/* Título */}
            <h2 className="course-title">Curso de Biología</h2>

            {/* Progreso */}
            <div className="progress-section">
                <ProgressBar value={progress} version={2} />
            </div>

            {/* Temas de Biología (scrolleable) */}
            <div className="courses-section" aria-label="Temas de Biología">
                {biology.temas.map((tema) => (
                    <BlueButton
                        key={tema.titulo}
                        nombre={tema.titulo}
                        url={`/curso/biologia/${tema.url}`}
                    />
                ))}
            </div>

            {/* Dato curioso */}
            {biology.datoCurioso && (
                <DatoCurioso text={biology.datoCurioso} className="mb-12" />
            )}

            {/* Chat */}
            <ChatBot />
        </div>
    )
}
