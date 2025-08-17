import "./Welcome.css";
import { useNavigate } from "react-router-dom";
import logoIcon from '../../assets/logo.png'

export default function Welcome() {

    const navigate = useNavigate();
    return (
        <div className="welcome-container">
            <img className="logo-icon" src={logoIcon} alt="Icono de monitor" loading="lazy" />
            <div className="welcome-content">
                <h1>
                    Tu nueva plataforma de aprendizaje con Inteligencia Artificial Offline
                </h1>
                <div className="spacer"></div>
                <button className="start-button" onClick={() => navigate("/start")}>¡Comenzar!</button>
            </div>
        </div>
    );
}