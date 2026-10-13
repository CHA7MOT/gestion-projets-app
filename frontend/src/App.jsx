import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

import AdminProjets from './pages/admin/Projets';
import AdminUtilisateurs from './pages/admin/Utilisateurs';
import AdminSuivi from './pages/admin/Suivi';

import UserProjets from './pages/user/Projets';

import SupervisorSuivi from './pages/supervisor/Suivi';

import Notifications from './pages/Notifications';

function AppRoutes() {
  const { user, token, loading } = useAuth();
  const roleName = user?.role?.name?.toLowerCase();
  
  const RootRedirect = () => {
    if (loading) return <div>Loading...</div>;
    if (!token) return <Navigate to="/login" replace />;
    if (roleName === 'admin') return <Navigate to="/admin/projets" replace />;
    if (roleName === 'user') return <Navigate to="/user/projets" replace />;
    if (roleName === 'supervisor') return <Navigate to="/supervisor/suivi" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={!token ? <Login /> : <RootRedirect />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<Layout />}>
          <Route path="projets" element={<AdminProjets />} />
          <Route path="utilisateurs" element={<AdminUtilisateurs />} />
          <Route path="suivi" element={<AdminSuivi />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* User routes */}
      <Route element={<ProtectedRoute allowedRoles={['User']} />}>
        <Route path="/user" element={<Layout />}>
          <Route path="projets" element={<UserProjets />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Supervisor routes */}
      <Route element={<ProtectedRoute allowedRoles={['Supervisor']} />}>
        <Route path="/supervisor" element={<Layout />}>
          <Route path="suivi" element={<SupervisorSuivi />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
