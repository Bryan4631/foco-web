import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { IconPlus } from '../components/Icons';
import { fmtFecha, hoy } from '../utils/format';

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
      const [resTareas, resAreas] = await Promise.all([api.get('/tareas'), api.get('/areas')]);
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
        area_id,
      },
    };

    try {
      if (editId) {
        const res = await api.put(`/tareas/${editId}`, payload);
        setTareas(tareas.map((t) => (t.id === editId ? res.data : t)));
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
      setTareas(tareas.filter((t) => t.id !== id));
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitulo('');
    setFecha_limite('');
    setPrioridad('media');
    setEstimado_minutos(60);
    setEditId(null);
    setFormErrors({});
  };

  const getArea = (id) => areas.find((a) => a.id === id);

  if (loading) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Cargando tareas...</p>
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Tareas</h1>
          <p>Todo lo que tienes por hacer, con su prioridad y fecha límite.</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="panel">
        <h3 className="panel-title">{editId ? 'Editar tarea' : 'Nueva tarea'}</h3>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Estudiar para la prueba"
            />
            {formErrors.titulo && <span className="field-error">{formErrors.titulo[0]}</span>}
          </div>

          <div className="field">
            <label htmlFor="area">Área</label>
            <select id="area" value={area_id} onChange={(e) => setArea_id(e.target.value)}>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
            {formErrors.area_id && <span className="field-error">{formErrors.area_id[0]}</span>}
          </div>

          <div className="field">
            <label htmlFor="fecha">Fecha límite</label>
            <input
              id="fecha"
              type="date"
              value={fecha_limite}
              onChange={(e) => setFecha_limite(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="prioridad">Prioridad</label>
            <select id="prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="estimado">Estimado (minutos)</label>
            <input
              id="estimado"
              type="number"
              min="0"
              value={estimado_minutos}
              onChange={(e) => setEstimado_minutos(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {!editId && <IconPlus />}
            {editId ? 'Guardar cambios' : 'Crear tarea'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="btn btn-ghost">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla de tareas */}
      <div className="table-wrap" style={{ marginTop: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Área</th>
              <th>Prioridad</th>
              <th>Fecha límite</th>
              <th className="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareas.length === 0 && (
              <tr>
                <td colSpan="5">
                  <div className="empty" style={{ border: 'none' }}>
                    Aún no tienes tareas. Crea la primera arriba.
                  </div>
                </td>
              </tr>
            )}

            {tareas.map((tarea) => {
              const area = getArea(tarea.area_id);
              const vencida = tarea.fecha_limite && String(tarea.fecha_limite).slice(0, 10) < hoy();
              return (
                <tr key={tarea.id}>
                  <td>
                    <div className="cell-title">{tarea.titulo}</div>
                    {tarea.estimado_minutos ? (
                      <div className="cell-sub">{tarea.estimado_minutos} min estimados</div>
                    ) : null}
                  </td>
                  <td>
                    <span className="cell-area">
                      <span className="dot" style={{ background: area?.color || '#6b6b84' }} />
                      {area ? area.nombre : 'Sin área'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${tarea.prioridad || 'media'}`}>{tarea.prioridad}</span>
                  </td>
                  <td className={vencida ? 'overdue' : ''}>{fmtFecha(tarea.fecha_limite)}</td>
                  <td className="td-actions">
                    <div className="row-actions">
                      <button onClick={() => handleEditClick(tarea)} className="btn btn-ghost btn-sm">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(tarea.id)} className="btn btn-danger-ghost btn-sm">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
