import { IconLogo, IconFolder, IconCheck, IconCalendar, IconSparkle } from './Icons';

// Panel izquierdo compartido por las pantallas de Login y Registro
export default function AuthHero() {
  return (
    <section className="login-hero">
      <div className="brand">
        <div className="brand-mark">
          <IconLogo />
        </div>
        <span className="brand-name">Foco</span>
      </div>

      <h2>
        Tu semana, <span>con foco</span>.
      </h2>
      <p>
        Organiza tus estudios y tu emprendimiento en un solo lugar, con un horario fijo y tareas
        que sí se cumplen.
      </p>

      <ul className="feature-list">
        <li>
          <span className="stat-icon"><IconFolder /></span>
          Áreas para separar estudio, trabajo y emprendimiento
        </li>
        <li>
          <span className="stat-icon"><IconCheck /></span>
          Tareas con prioridad, fecha límite y tiempo estimado
        </li>
        <li>
          <span className="stat-icon"><IconCalendar /></span>
          Bloques de horario fijo para cada día de la semana
        </li>
        <li>
          <span className="stat-icon"><IconSparkle /></span>
          Próximamente: planificación semanal asistida por IA
        </li>
      </ul>
    </section>
  );
}
