import "./Topics.css";
import TopicNavigator from "../../components/TopicsNavigation";
import ChatBot from "../../components/ChatBot"
import cursos from "../../assets/data/cursos2.json";

export default function CellsFunctions() {
    const curso = cursos[2]; 
    const tema = curso.temas[0]; 
    
    return (
        <div className="topic-section">
            <TopicNavigator 
                text={tema.titulo} 
                prevUrl="/adn" 
                nextUrl="/cellsfunctions/quiz" 
            />
            <div className="topic-content">
                <p>{tema.contenido}</p>
            </div>
            <div className="chat-section">
                <ChatBot />
            </div>
        </div>
    );
}