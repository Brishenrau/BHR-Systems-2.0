import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const hasToken = authService.isAuthenticated();

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

