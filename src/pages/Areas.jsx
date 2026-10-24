import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [tipo, setTipo] = useState('personal'); // NUEVO ESTADO
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { logout } = useAuth();
  const navigate = useNavigate();

  // Cargar áreas al iniciar
  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await api.get('/areas');
      setAreas(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Error al cargar las áreas.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    // Enviamos el tipo también
    const payload = { area: { nombre, color, tipo } };

    try {
      if (editId) {
        // Editar
        const res = await api.put(`/areas/${editId}`, payload);
        setAreas(areas.map(a => a.id === editId ? res.data : a));
      } else {
        // Crear
        const res = await api.post('/areas', payload);
        setAreas([...areas, res.data]);
      }
      // Limpiar formulario
      setNombre('');
      setTipo('personal');
      setColor('#2563eb');
      setEditId(null);
    } catch (err) {
      // Manejo de errores 422 (Validaciones de Rails)
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors); // Ej: { nombre: ["ya existe"], tipo: ["no puede estar en blanco"] }
      } else {
        setError('Error al guardar el área.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta área?')) return;
    try {
      await api.delete(`/areas/${id}`);
      setAreas(areas.filter(a => a.id !== id));
    } catch (err) {
      alert('No se puede eliminar un área que tiene tareas asociadas (Restricción de la base de datos).');
    }
  };

  const handleEditClick = (area) => {
    setNombre(area.nombre);
    setColor(area.color || '#2563eb');
    setTipo(area.tipo || 'personal');
    setEditId(area.id);
  };

  if (loading) return <div style={{ padding: '20px' }}>Cargando áreas...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestión de Áreas</h2>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>
          Cerrar Sesión
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ background: '#f3f4f6', color: '#333', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editId ? 'Editar Área' : 'Nueva Área'}</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre: </label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '5px', marginLeft: '10px' }} />
          {formErrors.nombre && <span style={{ color: 'red', fontSize: '12px', marginLeft: '10px' }}>{formErrors.nombre[0]}</span>}
        </div>

        {/* NUEVO SELECT PARA EL TIPO */}
        <div style={{ marginBottom: '10px' }}>
          <label>Tipo: </label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '5px', marginLeft: '10px' }}>
            <option value="estudio">Estudio</option>
            <option value="emprendimiento">Emprendimiento</option>
            <option value="trabajo">Trabajo</option>
            <option value="personal">Personal</option>
          </select>
          {formErrors.tipo && <span style={{ color: 'red', fontSize: '12px', marginLeft: '10px' }}>{formErrors.tipo[0]}</span>}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Color: </label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ marginLeft: '10px' }} />
        </div>

        <button type="submit" style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}>
          {editId ? 'Guardar Cambios' : 'Crear Área'}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setNombre(''); setTipo('personal'); }} style={{ padding: '8px', background: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de Áreas */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {areas.map(area => (
          <li key={area.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
            <div>
              <span style={{ display: 'inline-block', width: '15px', height: '15px', background: area.color || '#ccc', borderRadius: '50%', marginRight: '10px' }}></span>
              <strong>{area.nombre}</strong> <span style={{ fontSize: '12px', color: 'gray' }}>({area.tipo})</span>
            </div>
            <div>
              <button onClick={() => handleEditClick(area)} style={{ marginRight: '10px', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => handleDelete(area.id)} style={{ color: 'red', cursor: 'pointer' }}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>Volver al Panel</button>
    </div>
  );
}