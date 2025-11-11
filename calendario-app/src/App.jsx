import { useMemo, useState } from 'react'
import './App.css'

function App() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [activities, setActivities] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [activityText, setActivityText] = useState('')

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth],
  )

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Convert Sunday-start (0) to Monday-start (0)
    const startOffset = (firstDay.getDay() + 6) % 7
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - startOffset + 1
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return null
      }
      return new Date(year, month, dayNumber)
    })
  }, [currentMonth])

  const dayNames = useMemo(
    () => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    [],
  )

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleSelectDay = (date) => {
    setSelectedDate(date)
    if (date) {
      const key = formatDateKey(date)
      setActivityText((activities[key] || []).join('\n'))
    }
  }

  const handleCloseModal = () => {
    setSelectedDate(null)
    setActivityText('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!selectedDate) {
      return
    }

    const key = formatDateKey(selectedDate)
    const entries = activityText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    setActivities((prev) => ({
      ...prev,
      [key]: entries,
    }))

    if (entries.length === 0) {
      handleCloseModal()
    } else {
      setActivityText(entries.join('\n'))
    }
  }

  const getActivitiesForDay = (date) => {
    if (!date) {
      return []
    }
    const key = formatDateKey(date)
    return activities[key] || []
  }

  return (
    <div className="app">
      <header className="calendar-header">
        <button className="nav-button" type="button" onClick={handlePrevMonth}>
          ◀
        </button>
        <h1 className="calendar-title">{monthLabel}</h1>
        <button className="nav-button" type="button" onClick={handleNextMonth}>
          ▶
        </button>
      </header>

      <div className="calendar-grid">
        {dayNames.map((dayName) => (
          <div key={dayName} className="day-name">
            {dayName}
          </div>
        ))}

        {monthDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="day empty" />
          }

          const dayActivities = getActivitiesForDay(date)
          const hasActivity = dayActivities.length > 0

          return (
            <button
              key={formatDateKey(date)}
              type="button"
              className={`day ${hasActivity ? 'has-activity' : ''}`}
              onClick={() => handleSelectDay(date)}
            >
              <span className="day-number">{date.getDate()}</span>
              {hasActivity && (
                <ul className="activities">
                  {dayActivities.map((activity, activityIndex) => (
                    <li key={activityIndex}>{activity}</li>
                  ))}
                </ul>
              )}
            </button>
          )
        })}
      </div>

      <p className="calendar-hint">
        Haz clic en un día para agregar o editar actividades. Puedes escribir varias líneas y se
        guardarán como actividades separadas.
      </p>

      {selectedDate && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="modal-title">
              Actividades para el {selectedDate.toLocaleDateString('es-ES', { dateStyle: 'full' })}
            </h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <label htmlFor="activity-input">
                Escribe una actividad por línea. Las actividades existentes aparecerán abajo.
              </label>
              <textarea
                id="activity-input"
                value={activityText}
                onChange={(event) => setActivityText(event.target.value)}
                placeholder="Ejemplo: Clase de yoga&#10;Reunión con el equipo"
              />
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
