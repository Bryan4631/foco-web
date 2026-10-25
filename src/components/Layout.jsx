import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconLogo, IconHome, IconFolder, IconCheck, IconCalendar, IconLogout } from './Icons';

const links = [
  { to: '/dashboard', label: 'Panel', icon: <IconHome /> },
  { to: '/areas', label: 'Áreas', icon: <IconFolder /> },
  { to: '/tareas', label: 'Tareas', icon: <IconCheck /> },
  { to: '/bloques', label: 'Horario', icon: <IconCalendar /> },
];

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <IconLogo />
          </div>
          <span className="brand-name">Foco</span>
        </div>

        <nav className="nav">
          <span className="nav-label">Menú</span>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-block"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <IconLogout />
            <span className="btn-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
