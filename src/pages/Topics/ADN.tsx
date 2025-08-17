import "./Topics.css";
import TopicNavigator from "../../components/TopicsNavigation";
import ChatBot from "../../components/ChatBot"
import cursos from "../../assets/data/cursos2.json";
import returnIcon from "../../assets/return.png";
import { useNavigate } from "react-router-dom";

export default function ADN() {
    const curso = cursos[2]; 
    const tema = curso.temas[1]; 

    const navigate = useNavigate();

    const handleReturn = () => {
        navigate("/biologycourse");
    };
    
    return (
        <div className="topic-section">
            <TopicNavigator 
                text={tema.titulo} 
                prevUrl="/cellsfunctions" 
                nextUrl="/adn/quiz" 
            />
            <div className="topic-content">
                <p>{tema.contenido}</p>
            </div>

            {/* Return icon button */}
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