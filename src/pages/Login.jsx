import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card">
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#a78bfa' }}>Bienvenido a Foco</h2>
        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>Ingresa para organizar tu semana</p>
        
        {error && <div style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Correo electrónico" 
            required 
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Contraseña" 
            required 
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '10px' }}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}