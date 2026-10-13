import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const roleName = user?.role?.name?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map((role) => role.toLowerCase());

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !normalizedAllowedRoles.includes(roleName)) {
    // Redirect based on their role if they try to access unauthorized pages
    if (roleName === 'admin') return <Navigate to="/admin" replace />;
    if (roleName === 'user') return <Navigate to="/user" replace />;
    if (roleName === 'supervisor') return <Navigate to="/supervisor" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
