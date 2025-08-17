import { useLocation, useNavigate } from "react-router-dom";
import "./Analysis.css";
import NoNext from "../../components/NoNext"

export default function Analysis() {
    const location = useLocation();
    const navigate = useNavigate();

    const { quiz, userAnswers, tema } = location.state || {};

    if (!quiz || !userAnswers) {
        return (
            <div>
                <p>No se encontraron datos para analizar.</p>
                <button onClick={() => navigate("/")}>Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className="analysis-section">
            <NoNext 
                text={`Quiz de ${tema.titulo}`} 
                prevUrl="/start#" 
            />
            <h2>Análisis del Quiz</h2>

            {quiz.preguntas.map((pregunta: any, qIndex: number) => (
                <div key={qIndex} className="analysis-question">
                    <h3>{pregunta.pregunta}</h3>
                    <div className="analysis-options">
                        {pregunta.opciones.map((opcion: string, oIndex: number) => {
                            const isCorrect = pregunta.respuestaCorrecta === oIndex;
                            const isUserChoice = userAnswers[qIndex] === oIndex;

                            let className = "analysis-option";
                            if (isCorrect) className += " correct";
                            if (isUserChoice && !isCorrect) className += " wrong";

                            return (
                                <button key={oIndex} className={className}>
                                    {opcion}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            <button className="retry-button" onClick={() => navigate(-1)}>
                Reintentar Quiz
            </button>
        </div>
    );
}