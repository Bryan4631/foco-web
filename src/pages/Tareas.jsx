import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [areas, setAreas] = useState([]); // Para el select de la relación
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [fecha_limite, setFecha_limite] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [estimado_minutos, setEstimado_minutos] = useState(60);
  const [area_id, setArea_id] = useState('');
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Cargamos tareas y áreas al mismo tiempo
      const [resTareas, resAreas] = await Promise.all([
        api.get('/tareas'),
        api.get('/areas')
      ]);
      setTareas(resTareas.data);
      setAreas(resAreas.data);
      
      // Si hay áreas, seleccionamos la primera por defecto
      if (resAreas.data.length > 0 && !area_id) {
        setArea_id(resAreas.data[0].id); 
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Error al cargar los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    const payload = { 
      tarea: { 
        titulo, 
        fecha_limite: fecha_limite || null, // Si está vacío, enviamos null
        prioridad, 
        estimado_minutos, 
        area_id 
      } 
    };

    try {
      if (editId) {
        const res = await api.put(`/tareas/${editId}`, payload);
        setTareas(tareas.map(t => t.id === editId ? res.data : t));
      } else {
        const res = await api.post('/tareas', payload);
        setTareas([...tareas, res.data]);
      }
      resetForm();
    } catch (err) {
      // Manejo de error 422
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        setError('Error al guardar la tarea.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta tarea?')) return;
    try {
      await api.delete(`/tareas/${id}`);
      setTareas(tareas.filter(t => t.id !== id));
    } catch (err) {
      alert('Error al eliminar la tarea.');
    }
  };

  const handleEditClick = (tarea) => {
    setTitulo(tarea.titulo);
    setFecha_limite(tarea.fecha_limite || '');
    setPrioridad(tarea.prioridad || 'media');
    setEstimado_minutos(tarea.estimado_minutos || 60);
    setArea_id(tarea.area_id);
    setEditId(tarea.id);
  };

  const resetForm = () => {
    setTitulo('');
    setFecha_limite('');
    setPrioridad('media');
    setEstimado_minutos(60);
    setEditId(null);
  };

  // Función para mostrar el nombre del área en la tabla en vez del ID
  const getAreaName = (id) => {
    const area = areas.find(a => a.id === id);
    return area ? area.nombre : 'Sin área';
  };

  if (loading) return <div style={{ padding: '20px' }}>Cargando tareas...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestión de Tareas</h2>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>
          Cerrar Sesión
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ background: '#f3f4f6', color: '#333', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editId ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label>Título:</label><br/>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ width: '100%', padding: '5px' }} />
            {formErrors.titulo && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.titulo[0]}</span>}
          </div>

          <div>
            <label>Área (Relación):</label><br/>
            <select value={area_id} onChange={(e) => setArea_id(e.target.value)} style={{ width: '100%', padding: '5px' }}>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
            {formErrors.area_id && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.area_id[0]}</span>}
          </div>

          <div>
            <label>Fecha Límite:</label><br/>
            <input type="date" value={fecha_limite} onChange={(e) => setFecha_limite(e.target.value)} style={{ width: '100%', padding: '5px' }} />
          </div>

          <div>
            <label>Prioridad:</label><br/>
            <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} style={{ width: '100%', padding: '5px' }}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div>
            <label>Estimado (minutos):</label><br/>
            <input type="number" value={estimado_minutos} onChange={(e) => setEstimado_minutos(e.target.value)} style={{ width: '100%', padding: '5px' }} />
          </div>
        </div>

        <button type="submit" style={{ marginTop: '15px', padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {editId ? 'Guardar Cambios' : 'Crear Tarea'}
        </button>
        {editId && (
          <button type="button" onClick={resetForm} style={{ marginTop: '15px', marginLeft: '10px', padding: '8px', background: 'gray', color: 'white', border: 'none', borderRadius: '4px' }}>
            Cancelar
          </button>
        )}
      </form>

      {/* Tabla de Tareas */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th>Título</th>
            <th>Área</th>
            <th>Prioridad</th>
            <th>Fecha Límite</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tareas.map(tarea => (
            <tr key={tarea.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 0' }}>{tarea.titulo}</td>
              <td>{getAreaName(tarea.area_id)}</td>
              <td>{tarea.prioridad}</td>
              <td>{tarea.fecha_limite}</td>
              <td>
                <button onClick={() => handleEditClick(tarea)} style={{ marginRight: '10px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(tarea.id)} style={{ color: 'red', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>Volver al Panel</button>
    </div>
  );
}