import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Bloques() {
  const [bloques, setBloques] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [dia_semana, setDia_semana] = useState(1);
  const [hora_inicio, setHora_inicio] = useState('08:00');
  const [hora_fin, setHora_fin] = useState('10:00');
  const [area_id, setArea_id] = useState('');
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { logout } = useAuth();
  const navigate = useNavigate();

  const dias = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [resBloques, resAreas] = await Promise.all([api.get('/bloques'), api.get('/areas')]);
      setBloques(resBloques.data);
      setAreas(resAreas.data);
      if (resAreas.data.length > 0 && !area_id) setArea_id(resAreas.data[0].id);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    const payload = { bloque: { titulo, dia_semana, hora_inicio, hora_fin, area_id } };

    try {
      if (editId) {
        const res = await api.put(`/bloques/${editId}`, payload);
        setBloques(bloques.map(b => b.id === editId ? res.data : b));
      } else {
        const res = await api.post('/bloques', payload);
        setBloques([...bloques, res.data]);
      }
      resetForm();
    } catch (err) {
      if (err.response?.status === 422) setFormErrors(err.response.data.errors);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este bloque?')) return;
    await api.delete(`/bloques/${id}`);
    setBloques(bloques.filter(b => b.id !== id));
  };

  const handleEditClick = (b) => {
    setTitulo(b.titulo); 
    setDia_semana(b.dia_semana); 
    setHora_inicio(b.hora_inicio); 
    setHora_fin(b.hora_fin); 
    setArea_id(b.area_id); 
    setEditId(b.id);
  };

  const resetForm = () => { 
    setTitulo(''); 
    setDia_semana(1); 
    setHora_inicio('08:00');
    setHora_fin('10:00');
    setEditId(null); 
  };

  const getAreaName = (id) => areas.find(a => a.id === id)?.nombre || 'Sin área';

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestión de Bloques de Horario</h2>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ background: '#ef4444', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#f3f4f6', color: '#333', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editId ? 'Editar Bloque' : 'Nuevo Bloque'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          
          <div>
            <label>Título:</label><br/>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ width: '100%', padding: '5px' }} />
            {formErrors.titulo && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.titulo[0]}</span>}
          </div>

          <div>
            <label>Área:</label><br/>
            <select value={area_id} onChange={(e) => setArea_id(e.target.value)} style={{ width: '100%', padding: '5px' }}>
              {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          <div>
            <label>Día:</label><br/>
            <select value={dia_semana} onChange={(e) => setDia_semana(e.target.value)} style={{ width: '100%', padding: '5px' }}>
              {Object.entries(dias).map(([num, nombre]) => <option key={num} value={num}>{nombre}</option>)}
            </select>
          </div>

          <div>
            <label>Hora Inicio:</label><br/>
            <input type="time" value={hora_inicio} onChange={(e) => setHora_inicio(e.target.value)} style={{ width: '100%', padding: '5px' }} />
            {formErrors.hora_inicio && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.hora_inicio[0]}</span>}
          </div>

          <div>
            <label>Hora Fin:</label><br/>
            <input type="time" value={hora_fin} onChange={(e) => setHora_fin(e.target.value)} style={{ width: '100%', padding: '5px' }} />
            {/* AQUÍ ESTÁ LA MAGIA DE LA VALIDACIÓN NUEVA */}
            {formErrors.hora_fin && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.hora_fin[0]}</span>}
          </div>

        </div>

        <button type="submit" style={{ marginTop: '15px', background: '#16a34a', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {editId ? 'Guardar Cambios' : 'Crear Bloque'}
        </button>
        
        {editId && (
          <button type="button" onClick={resetForm} style={{ marginTop: '15px', marginLeft: '10px', padding: '8px', background: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancelar
          </button>
        )}
      </form>

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th>Título</th><th>Día</th><th>Horario</th><th>Área</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {bloques.map(b => (
            <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 0' }}>{b.titulo}</td>
              <td>{dias[b.dia_semana]}</td>
              <td>{b.hora_inicio} - {b.hora_fin}</td>
              <td>{getAreaName(b.area_id)}</td>
              <td>
                <button onClick={() => handleEditClick(b)} style={{ marginRight: '10px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(b.id)} style={{ color: 'red', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>
        Volver al Panel
      </button>
    </div>
  );
}