import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Quiz.css";
import NoNext from "../../components/NoNext";
import TopicNavigator from "../../components/TopicsNavigation";
import ChatBot from "../../components/ChatBot";
import QuizButton from "../../components/QuizButton";
import SubmitButton from "../../components/SubmitButton";
import cursos from "../../assets/data/cursos2.json";

export default function QuizMexicanRevolution() {
    const curso = cursos[1]; // "Historia"
    const tema = curso.temas[0]; // "La célula y sus funciones"
    const quiz = curso.quiz;

    const [quizPassed, setQuizPassed] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();

    const handleResult = (passed: boolean) => {
        if (passed) {
            setQuizPassed(true); 
            setShowPopup(true);

            setTimeout(() => {
                setShowPopup(false);
            }, 5000);
        } else {
            navigate("/analysis", { state: { quiz, userAnswers, tema } });
        }
    };

    const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
        Array(quiz.preguntas.length).fill(null)
    );

    const handleSelectOption = (questionIndex: number, optionIndex: number) => {
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = optionIndex;
        setUserAnswers(newAnswers);
    };

    return (
        <>
            {showPopup && (
                <div className="popup-message">
                    🎉 ¡Felicitaciones!
                </div>
            )}
            
            <div className="quiz-section">
                {quizPassed ? (
                    <TopicNavigator 
                        text={`Quiz de ${tema.titulo}`} 
                        prevUrl="/mexicanrevolution" 
                        nextUrl="/contemporaryhistory"
                    />
                ) : (
                    <NoNext 
                        text={`Quiz de ${tema.titulo}`} 
                        prevUrl="/mexicanrevolution" 
                    />
                )}

                <div className="quiz-questions">
                    {quiz.preguntas.map((pregunta, qIndex) => (
                        <div key={qIndex} className="quiz-question">
                            <h3>{pregunta.pregunta}</h3>
                            <div className="quiz-options">
                                {pregunta.opciones.map((opcion, oIndex) => (
                                    <QuizButton
                                        key={oIndex}
                                        nombre={opcion}
                                        value={userAnswers[qIndex] === oIndex}
                                        onClick={() => handleSelectOption(qIndex, oIndex)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <SubmitButton 
                    quiz={quiz} 
                    userAnswers={userAnswers} 
                    onResult={handleResult} 
                />

                <div className="chat-section">
                    <ChatBot />
                </div>
            </div>
        </>
    );
}