import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const Header = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-50 h-16">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">BHR Systems 2.0</h1>
          <span className="text-sm text-gray-500">|</span>
          <span className="text-sm text-gray-600">Majlis Perbandaran Kulim</span>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.USE_PAYNUMBER}</p>
                <p className="text-xs text-gray-500">Level {user.USE_USERLEVEL}</p>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
            </>
          )}
          <Button variant="secondary" onClick={logout} className="text-sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
