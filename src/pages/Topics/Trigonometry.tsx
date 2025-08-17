import "./Topics.css";
import NoNext from "../../components/NoNext";
import ChatBot from "../../components/ChatBot"
import cursos from "../../assets/data/cursos2.json";
import returnIcon from "../../assets/return.png";
import { useNavigate } from "react-router-dom";

export default function Trigonometry() {
    const curso = cursos[0]; 
    const tema = curso.temas[2]; 

    const navigate = useNavigate();

    const handleReturn = () => {
        navigate("/mathcourse");
    };
    
    return (
        <div className="topic-section">
            <NoNext 
                text={tema.titulo} 
                prevUrl="/geometry/quiz" 
            />
            <div className="topic-content">
                <p>{tema.contenido}</p>
            </div>
            <img 
                src={returnIcon} 
                alt="Return" 
                className="return-icon" 
                onClick={handleReturn} 
            />
            <div className="chat-section">
                <ChatBot />
            </div>
        </div>
    );
}