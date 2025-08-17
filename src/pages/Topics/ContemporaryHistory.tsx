import "./Topics.css";
import NoNext from "../../components/NoNext";
import ChatBot from "../../components/ChatBot"
import cursos from "../../assets/data/cursos2.json";
import returnIcon from "../../assets/return.png";
import { useNavigate } from "react-router-dom";

export default function ContemporaryHistory() {
    const curso = cursos[1]; 
    const tema = curso.temas[2]; 

    const navigate = useNavigate();

    const handleReturn = () => {
        navigate("/historycourse");
    };
    
    return (
        <div className="topic-section">
            <NoNext 
                text={tema.titulo} 
                prevUrl="/mexicanrevolution/quiz" 
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