import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Areas from './pages/Areas';
import Tareas from './pages/Tareas';
import Bloques from './pages/Bloques'; // <-- NUEVA IMPORTACIÓN

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px' }}>Cargando aplicación...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/areas" 
            element={
              <ProtectedRoute>
                <Areas />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tareas" 
            element={
              <ProtectedRoute>
                <Tareas />
              </ProtectedRoute>
            } 
          />

          {/* NUEVA RUTA DE BLOQUES */}
          <Route 
            path="/bloques" 
            element={
              <ProtectedRoute>
                <Bloques />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;