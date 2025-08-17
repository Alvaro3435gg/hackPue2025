import "./Topics.css";
import TopicNavigator from "../../components/TopicsNavigation";
import ChatBot from "../../components/ChatBot"
import cursos from "../../assets/data/cursos2.json";

export default function TopicSample() {
    const curso = cursos[1]; 
    const tema = curso.temas[1]; 
    
    return (
        <div className="topic-section">
            <TopicNavigator 
                text={tema.titulo} 
                prevUrl="/mexicanindependece" 
                nextUrl="/mexicanrevolution/quiz" 
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