import "./Course.css"
import BlueButton from "../../components/BlueButton.tsx"
import ProgressBar from "../../components/ProgressBar.tsx"
import ChatBot from "../../components/ChatBot.tsx";
import coursesData from "../../assets/data/cursos2.json";
import returnIcon from "../../assets/return.png";
import { useNavigate } from "react-router-dom";

type CourseItem = { nombre: string; url?: string }

type StartProps = {
    courses?: CourseItem[]
    courseName?: string
    progress?: number
}

export default function BiologyCourse({
    progress = 75,
}: StartProps) {
    const navigate = useNavigate();

    const handleReturn = () => {
        navigate("/start#");
    };

    return (
        <div className="start-container">

            {/* Saludo */}
            <h2 className="welcome-text">
                Curso de Matemáticas
            </h2>

            {/* Progreso general */}
            <div className="progress-section">
                <ProgressBar value={progress} version={2} />
            </div>

            {/* Botones de cursos */}
            <div className="courses-section" aria-label="Lista de cursos">
                {coursesData
                    .flatMap(area => area.temas)
                    .slice(4, 6)
                    .map(tema => (
                        <BlueButton
                            key={tema.titulo}
                            nombre={tema.titulo}
                            url={`/${tema.url.replace(/\s+/g, "").toLowerCase()}`}
                        />
                    ))
                }
            </div>

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