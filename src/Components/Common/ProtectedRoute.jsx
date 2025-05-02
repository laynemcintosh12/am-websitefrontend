import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, requiredPermission }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Check if user is logged in
  if (!user) {
    return <Navigate to="/log-in" />;
  }

  // Check permissions only if route requires specific permission
  if (requiredPermission) {
    const hasPermission = user.user.permissions === requiredPermission || user.user.permissions === 'Admin';
    if (!hasPermission) {
      return <Navigate to="/dashboard" />;
    }
  }

  return element;
};

export default ProtectedRoute;