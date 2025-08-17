import "./Topics.css";
import NoNext from "../../components/NoNext";
import ChatBot from "../../components/ChatBot"
import cursos from "../../assets/data/cursos2.json";

export default function Trigonometry() {
    const curso = cursos[0]; 
    const tema = curso.temas[2]; 
    
    return (
        <div className="topic-section">
            <NoNext 
                text={tema.titulo} 
                prevUrl="/geometry/quiz" 
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