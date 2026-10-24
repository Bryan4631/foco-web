import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IconLogo, IconFolder, IconCheck, IconCalendar, IconSparkle } from '../components/Icons';

export default function Login() {
  const [email, setEmail] = useState('demo@foco.cl');
  const [password, setPassword] = useState('demo12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
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
          Organiza tus estudios y tu emprendimiento en un solo lugar, con un horario fijo y
          tareas que sí se cumplen.
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
            Planificación semanal asistida por IA
          </li>
        </ul>
      </section>

      <section className="login-side">
        <div className="login-card">
          <h1>Bienvenido de vuelta</h1>
          <p className="sub">Ingresa para organizar tu semana.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <p className="login-hint">Cuenta de demostración precargada</p>
        </div>
      </section>
    </div>
  );
}
