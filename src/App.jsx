import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Areas from './pages/Areas';
import Tareas from './pages/Tareas';
import Bloques from './pages/Bloques';

// Protege las rutas y las envuelve con el menú lateral (Layout)
const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="state-box" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p>Cargando aplicación...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/tareas" element={<Tareas />} />
            <Route path="/bloques" element={<Bloques />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
