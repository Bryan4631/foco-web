import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { IconPlus } from '../components/Icons';
import { fmtHora } from '../utils/format';

export default function Bloques() {
  const [bloques, setBloques] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resBloques, resAreas] = await Promise.all([api.get('/bloques'), api.get('/areas')]);
      setBloques(resBloques.data);
      setAreas(resAreas.data);
      if (resAreas.data.length > 0 && !area_id) setArea_id(resAreas.data[0].id);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Error al cargar el horario.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    const payload = { bloque: { titulo, dia_semana, hora_inicio, hora_fin, area_id } };

    try {
      if (editId) {
        const res = await api.put(`/bloques/${editId}`, payload);
        setBloques(bloques.map((b) => (b.id === editId ? res.data : b)));
      } else {
        const res = await api.post('/bloques', payload);
        setBloques([...bloques, res.data]);
      }
      resetForm();
    } catch (err) {
      if (err.response?.status === 422) setFormErrors(err.response.data.errors);
      else setError('Error al guardar el bloque.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este bloque?')) return;
    await api.delete(`/bloques/${id}`);
    setBloques(bloques.filter((b) => b.id !== id));
  };

  const handleEditClick = (b) => {
    setTitulo(b.titulo);
    setDia_semana(b.dia_semana);
    setHora_inicio(fmtHora(b.hora_inicio));
    setHora_fin(fmtHora(b.hora_fin));
    setArea_id(b.area_id);
    setEditId(b.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitulo('');
    setDia_semana(1);
    setHora_inicio('08:00');
    setHora_fin('10:00');
    setEditId(null);
    setFormErrors({});
  };

  const getArea = (id) => areas.find((a) => a.id === id);

  // Bloques de un día, ordenados por hora de inicio
  const bloquesDelDia = (num) =>
    bloques
      .filter((b) => Number(b.dia_semana) === Number(num))
      .sort((x, y) => fmtHora(x.hora_inicio).localeCompare(fmtHora(y.hora_inicio)));

  if (loading) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Cargando horario...</p>
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Horario semanal</h1>
          <p>Tus bloques fijos de la semana, día por día.</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="panel">
        <h3 className="panel-title">{editId ? 'Editar bloque' : 'Nuevo bloque'}</h3>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="b-titulo">Título</label>
            <input
              id="b-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Clase de Computación Web"
            />
            {formErrors.titulo && <span className="field-error">{formErrors.titulo[0]}</span>}
          </div>

          <div className="field">
            <label htmlFor="b-area">Área</label>
            <select id="b-area" value={area_id} onChange={(e) => setArea_id(e.target.value)}>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="b-dia">Día</label>
            <select id="b-dia" value={dia_semana} onChange={(e) => setDia_semana(e.target.value)}>
              {Object.entries(dias).map(([num, nombre]) => (
                <option key={num} value={num}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="b-inicio">Hora inicio</label>
            <input
              id="b-inicio"
              type="time"
              value={hora_inicio}
              onChange={(e) => setHora_inicio(e.target.value)}
            />
            {formErrors.hora_inicio && <span className="field-error">{formErrors.hora_inicio[0]}</span>}
          </div>

          <div className="field">
            <label htmlFor="b-fin">Hora fin</label>
            <input id="b-fin" type="time" value={hora_fin} onChange={(e) => setHora_fin(e.target.value)} />
            {formErrors.hora_fin && <span className="field-error">{formErrors.hora_fin[0]}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {!editId && <IconPlus />}
            {editId ? 'Guardar cambios' : 'Crear bloque'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="btn btn-ghost">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Vista semanal */}
      <div className="week-grid" style={{ marginTop: 24 }}>
        {Object.entries(dias).map(([num, nombre]) => {
          const delDia = bloquesDelDia(num);
          return (
            <section key={num} className="day-col">
              <h3 className="day-name">{nombre}</h3>

              {delDia.length === 0 && <span className="day-free">Día libre</span>}

              {delDia.map((b) => {
                const area = getArea(b.area_id);
                return (
                  <article
                    key={b.id}
                    className="block-card"
                    style={{ borderLeftColor: area?.color || '#8b5cf6' }}
                  >
                    <div className="block-time">
                      {fmtHora(b.hora_inicio)} – {fmtHora(b.hora_fin)}
                    </div>
                    <div className="block-title">{b.titulo}</div>
                    <div className="block-area">{area ? area.nombre : 'Sin área'}</div>
                    <div className="block-actions">
                      <button onClick={() => handleEditClick(b)} className="btn btn-ghost btn-sm">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="btn btn-danger-ghost btn-sm">
                        Eliminar
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>
    </>
  );
}
