import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { ProfilePicture } from '../common/ProfilePicture';

export const Header = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <header className="fixed top-0 left-64 right-0 bg-white shadow-sm border-b border-gray-200 z-40 h-16">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">BHR Systems 2.0</h1>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">Majlis Perbandaran Kulim</span>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              {/* Profile Picture */}
              <div className="flex items-center space-x-3">
                <ProfilePicture
                  name={user.USE_PAYNUMBER}
                  size="md"
                  showStatus
                  status="online"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.USE_PAYNUMBER}</p>
                  <p className="text-xs text-gray-500">Level {user.USE_USERLEVEL}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
            </>
          )}
          <Button variant="secondary" onClick={logout} className="text-sm px-4 py-2">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
