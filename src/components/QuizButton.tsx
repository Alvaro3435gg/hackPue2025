import React from "react";
import "./QuizButton.css";

interface QuizButtonProps {
    nombre: string;
    value: boolean;
    onClick?: () => void;
}

const QuizButton: React.FC<QuizButtonProps> = ({ nombre, value, onClick }) => {
    const [hover, setHover] = React.useState(false);

    let className = "quiz-button";
    if (hover) className += " hover";
    if (value) className += " selected";

    return (
        <button
            className={className}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            onClick={onClick}
        >
            {nombre}
        </button>
    );
};

export default QuizButton;