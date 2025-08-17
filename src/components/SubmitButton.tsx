import React from "react";
import "./SubmitButton.css";

interface SubmitButtonProps {
  quiz: any;
  userAnswers: (number | null)[];
  onResult: (passed: boolean) => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ quiz, userAnswers, onResult }) => {
  const handleSubmit = () => {
    let allCorrect = true;
    quiz.preguntas.forEach((pregunta: any, index: number) => {
      if (userAnswers[index] !== pregunta.respuestaCorrecta) {
        allCorrect = false;
      }
    });

    onResult(allCorrect);
  };

  return (
    <button className="submit-button" onClick={handleSubmit}>
      Enviar
    </button>
  );
};

export default SubmitButton;