import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { IconFolder, IconCheck, IconCalendar } from '../components/Icons';
import { fmtFecha, hoy } from '../utils/format';

export default function Dashboard() {
  const [areas, setAreas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga resumen; si algo falla, simplemente muestra 0 (no rompe el panel)
  useEffect(() => {
    const load = async () => {
      const [a, t, b] = await Promise.allSettled([
        api.get('/areas'),
        api.get('/tareas'),
        api.get('/bloques'),
      ]);
      if (a.status === 'fulfilled') setAreas(a.value.data);
      if (t.status === 'fulfilled') setTareas(t.value.data);
      if (b.status === 'fulfilled') setBloques(b.value.data);
      setLoading(false);
    };
    load();
  }, []);

  const getArea = (id) => areas.find((a) => a.id === id);

  const proximas = tareas
    .filter((t) => t.fecha_limite)
    .sort((x, y) => String(x.fecha_limite).localeCompare(String(y.fecha_limite)))
    .slice(0, 5);

  const stats = [
    { to: '/areas', label: 'Áreas', value: areas.length, hint: 'Estudio, trabajo, personal…', icon: <IconFolder /> },
    { to: '/tareas', label: 'Tareas', value: tareas.length, hint: 'Pendientes por organizar', icon: <IconCheck /> },
    { to: '/bloques', label: 'Bloques de horario', value: bloques.length, hint: 'Tu semana fija', icon: <IconCalendar /> },
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Panel principal</h1>
          <p>¿Qué vamos a organizar hoy?</p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((s) => (
          <Link key={s.to} to={s.to} className="stat-card">
            <div className="stat-top">
              <span>{s.label}</span>
              <span className="stat-icon">{s.icon}</span>
            </div>
            <div className="stat-value">{loading ? '–' : s.value}</div>
            <div className="stat-hint">{s.hint}</div>
          </Link>
        ))}
      </div>

      <section className="panel">
        <h3 className="panel-title">Próximas fechas límite</h3>

        {loading ? (
          <div className="state-box">
            <div className="spinner" />
          </div>
        ) : proximas.length === 0 ? (
          <div className="empty">
            Aún no hay tareas con fecha límite. Crea una en la sección Tareas.
          </div>
        ) : (
          <div className="upcoming">
            {proximas.map((t) => {
              const area = getArea(t.area_id);
              const vencida = String(t.fecha_limite).slice(0, 10) < hoy();
              return (
                <div key={t.id} className="upcoming-item">
                  <div className="upcoming-main">
                    <span className="dot" style={{ background: area?.color || '#6b6b84' }} />
                    <span className="upcoming-title">{t.titulo}</span>
                    <span className={`badge badge-${t.prioridad || 'media'}`}>{t.prioridad}</span>
                  </div>
                  <span className={`upcoming-date${vencida ? ' overdue' : ''}`}>
                    {fmtFecha(t.fecha_limite)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
