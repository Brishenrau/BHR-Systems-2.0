import { Menu } from './Menu';
import { useAuthStore } from '../../store/authStore';
import { ProfilePicture } from '../common/ProfilePicture';
import { usePortrait } from '../../hooks/usePortrait';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { imageUrl } = usePortrait(user?.USE_PAYNUMBER);

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl h-screen fixed left-0 top-0 flex flex-col z-50">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src="/logo.png" 
            alt="MPKK Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-white">BHR Systems</h1>
            <p className="text-xs text-gray-400">Majlis Perbandaran Kulim</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              {/* Profile Picture in Sidebar */}
              <ProfilePicture
                name={user.USE_PAYNUMBER}
                imageUrl={imageUrl || undefined}
                size="lg"
                showStatus
                status="online"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Logged in as</p>
                <p className="text-sm font-semibold text-white truncate">{user.USE_PAYNUMBER}</p>
                <p className="text-xs text-gray-400 mt-0.5">Level: {user.USE_USERLEVEL}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-4">
        <Menu />
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50 flex-shrink-0">
        <p className="text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} BHR Systems
        </p>
      </div>
    </aside>
  );
};
