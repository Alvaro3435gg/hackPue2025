import "./Topics.css";
import TopicNavigator from "../../components/TopicsNavigation";
import ChatBot from "../../components/ChatBot"
import cursos from "../../assets/data/cursos2.json";
import returnIcon from "../../assets/return.png";
import { useNavigate } from "react-router-dom";

export default function TopicSample() {
    const curso = cursos[0]; 
    const tema = curso.temas[1]; 

    const navigate = useNavigate();

    const handleReturn = () => {
        navigate("/mathcourse");
    };
    
    return (
        <div className="topic-section">
            <TopicNavigator 
                text={tema.titulo} 
                prevUrl="/basicalgebra" 
                nextUrl="/geometry/quiz" 
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