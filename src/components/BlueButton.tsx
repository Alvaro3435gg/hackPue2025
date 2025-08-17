import React from 'react'
import { useNavigate } from 'react-router-dom'
import './BlueButton.css'

interface BlueButtonProps {
  nombre: string
  url: string
}

const BlueButton: React.FC<BlueButtonProps> = ({ nombre, url }) => {
  const navigate = useNavigate()

  const irAlCurso = () => {
    navigate(url)  // navigate in the current tab
  }

  return (
    <div>
      <button className="blue-button" onClick={irAlCurso}>
        {nombre}
      </button>
    </div>
  )
}

export default BlueButton