
import './ProgressBar.css'

type Props = {
  value: number // 0–100
  version?: 1 | 2 // versión de progress bar
  label?: string
  size?: number // px del círculo (solo en v1)
  trackColor?: string
  progressColor?: string
  textColor?: string
}

export default function ProgressBar({
                                      value,
                                      version = 1,
                                      label,
                                      size = 140,
                                      trackColor = '#e6e6e6',
                                      progressColor = '#1FA15A',
                                      textColor = '#ffffff',
                                    }: Props) {
  const clamped = Math.max(0, Math.min(100, value))

  if (version === 1) {
    // === PROGRESS BAR CIRCULAR ===
    const strokeWidth = 12
    const r = (size - strokeWidth) / 2
    const c = 2 * Math.PI * r
    const dash = (clamped / 100) * c

    return (
        <div className="progress-card" role="group" aria-label="Progreso de cursos">
          <div
              className="progress-circle"
              style={{ width: size, height: size }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clamped}
              role="progressbar"
          >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <circle
                  className="track"
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={trackColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
              />
              <circle
                  className="progress"
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={progressColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="percent"
                  fill={textColor}
              >
                {clamped}%
              </text>
            </svg>
          </div>

          <p className="progress-label" style={{ color: textColor }}>
            <strong>{label ?? 'De los cursos de la plataforma realizados'}</strong>
          </p>
        </div>
    )
  }

  // === PROGRESS BAR LINEAL (versión 2) ===
  return (
      <div className="progress-card linear" role="group" aria-label="Progreso de cursos">
        <div className="progress-text" style={{ color: textColor }}>
          <strong>{clamped}%</strong>
        </div>
        <div className="progress-track">
          <div
              className="progress-fill"
              style={{
                width: `${clamped}%`,
                backgroundColor: progressColor,
              }}
          />
        </div>
        <p className="progress-label" style={{ color: textColor }}>
          <strong>{label ?? '¡Del curso realizado!'}</strong>
        </p>
      </div>
  )
}
