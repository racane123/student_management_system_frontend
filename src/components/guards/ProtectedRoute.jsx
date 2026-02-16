/**
 * MILESTONE 2: The Auth & Role Guard (component)
 * Protects routes by auth and optional role (e.g. only Admin for Fees).
 * Place in: src/components/guards/ProtectedRoute.jsx
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - e.g. ['admin'] → only admin; undefined → any authenticated user
 * @param {string} [props.fallbackPath] - redirect if not allowed (default: /login)
 */
export default function ProtectedRoute({ children, allowedRoles, fallbackPath = '/login' }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
