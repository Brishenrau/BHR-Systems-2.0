import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const Header = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BHR Systems 2.0</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600">
              {user.USE_PAYNUMBER}
            </span>
          )}
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

