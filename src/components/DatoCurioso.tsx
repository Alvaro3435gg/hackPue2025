import './DatoCurioso.css'

// importa SIEMPRE el mismo icono
// ajusta la ruta si tu estructura cambia
import monitorIcon from '../assets/monitor.png'

type Props = {
    text?: string
    className?: string
}

const DEFAULT_TEXT =
    '70% de los ingenieros en desarrollo de software en 2025 tienen un salario arriba de 8,000 pesos al mes'

export default function DatoCurioso({ text, className = '' }: Props) {
    return (
        <section className={`fact-card ${className}`} role="note" aria-label="Dato curioso">
            <img className="fact-icon" src={monitorIcon} alt="Icono de monitor" loading="lazy" />

            <div className="fact-content">
                <h4 className="fact-title">Dato Curioso:</h4>
                <p className="fact-text">{text || DEFAULT_TEXT}</p>
            </div>
        </section>
    )
}
