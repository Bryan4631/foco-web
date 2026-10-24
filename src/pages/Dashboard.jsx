import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Panel Principal</h1>
      <p style={{ color: '#9ca3af', marginBottom: '40px' }}>¡Bienvenido a Foco! ¿Qué vamos a organizar hoy?</p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        
        <Link to="/areas" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1.1rem' }}>
          Gestionar Áreas
        </Link>

        <Link to="/tareas" style={{ padding: '12px 24px', background: '#7c3aed', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1.1rem', transition: '0.2s' }}>
          Gestionar Tareas
        </Link>

        <Link to="/bloques" style={{ padding: '12px 24px', background: '#f59e0b', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1.1rem', transition: '0.2s' }}>
          Gestionar Horario
        </Link>

        <button onClick={handleLogout} className="btn-danger" style={{ fontSize: '1.1rem' }}>
          Cerrar Sesión
        </button>
        
      </div>
    </div>
  );
}