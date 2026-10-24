import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { IconPlus } from '../components/Icons';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [tipo, setTipo] = useState('personal');
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

  const resetForm = () => {
    setNombre('');
    setTipo('personal');
    setColor('#2563eb');
    setEditId(null);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const payload = { area: { nombre, color, tipo } };

    try {
      if (editId) {
        const res = await api.put(`/areas/${editId}`, payload);
        setAreas(areas.map((a) => (a.id === editId ? res.data : a)));
      } else {
        const res = await api.post('/areas', payload);
        setAreas([...areas, res.data]);
      }
      resetForm();
    } catch (err) {
      // Manejo de errores 422 (Validaciones de Rails)
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        setError('Error al guardar el área.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta área?')) return;
    try {
      await api.delete(`/areas/${id}`);
      setAreas(areas.filter((a) => a.id !== id));
    } catch (err) {
      alert('No se puede eliminar un área que tiene tareas asociadas (Restricción de la base de datos).');
    }
  };

  const handleEditClick = (area) => {
    setNombre(area.nombre);
    setColor(area.color || '#2563eb');
    setTipo(area.tipo || 'personal');
    setEditId(area.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Cargando áreas...</p>
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Áreas</h1>
          <p>Agrupa tus tareas y horarios por estudio, trabajo, emprendimiento o vida personal.</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="panel">
        <h3 className="panel-title">{editId ? 'Editar área' : 'Nueva área'}</h3>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Universidad"
            />
            {formErrors.nombre && <span className="field-error">{formErrors.nombre[0]}</span>}
          </div>

          <div className="field">
            <label htmlFor="tipo">Tipo</label>
            <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="estudio">Estudio</option>
              <option value="emprendimiento">Emprendimiento</option>
              <option value="trabajo">Trabajo</option>
              <option value="personal">Personal</option>
            </select>
            {formErrors.tipo && <span className="field-error">{formErrors.tipo[0]}</span>}
          </div>

          <div className="field">
            <label htmlFor="color">Color</label>
            <input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {!editId && <IconPlus />}
            {editId ? 'Guardar cambios' : 'Crear área'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="btn btn-ghost">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de áreas */}
      <div className="list" style={{ marginTop: 24 }}>
        {areas.length === 0 && (
          <div className="empty">Todavía no tienes áreas. Crea la primera arriba.</div>
        )}

        {areas.map((area) => (
          <div
            key={area.id}
            className="list-item"
            style={{ borderLeftColor: area.color || '#6b6b84' }}
          >
            <div className="list-main">
              <span className="dot" style={{ background: area.color || '#6b6b84' }} />
              <div style={{ minWidth: 0 }}>
                <div className="list-title">{area.nombre}</div>
              </div>
              <span className="badge badge-accent">{area.tipo}</span>
            </div>

            <div className="row-actions">
              <button onClick={() => handleEditClick(area)} className="btn btn-ghost btn-sm">
                Editar
              </button>
              <button onClick={() => handleDelete(area.id)} className="btn btn-danger-ghost btn-sm">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
