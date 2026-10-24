import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthHero from '../components/AuthHero';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormErrors({});

    // Validación en el cliente antes de llamar a la API
    if (password.length < 8) {
      setFormErrors({ password: ['debe tener al menos 8 caracteres'] });
      return;
    }
    if (password !== confirmacion) {
      setFormErrors({ confirmacion: ['las contraseñas no coinciden'] });
      return;
    }

    setLoading(true);
    try {
      await register(nombre, email, password);
      navigate('/dashboard');
    } catch (err) {
      // 422: errores de validación de Rails, campo por campo
      if (err.response?.status === 422 && err.response.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else if (err.response?.status === 409) {
        setFormErrors({ email: ['ya está registrado'] });
      } else {
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <AuthHero />

      <section className="login-side">
        <div className="login-card">
          <h1>Crea tu cuenta</h1>
          <p className="sub">Empieza a organizar tu semana con foco.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
                required
              />
              {formErrors.nombre && <span className="field-error">{formErrors.nombre[0]}</span>}
            </div>

            <div className="field">
              <label htmlFor="reg-email">Correo electrónico</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
                autoComplete="email"
                required
              />
              {formErrors.email && <span className="field-error">{formErrors.email[0]}</span>}
            </div>

            <div className="field">
              <label htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
              />
              {formErrors.password && <span className="field-error">{formErrors.password[0]}</span>}
            </div>

            <div className="field">
              <label htmlFor="reg-confirm">Repite la contraseña</label>
              <input
                id="reg-confirm"
                type="password"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                required
              />
              {formErrors.confirmacion && (
                <span className="field-error">{formErrors.confirmacion[0]}</span>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
