import { Menu } from './Menu';
import { useAuthStore } from '../../store/authStore';
import { ProfilePicture } from '../common/ProfilePicture';
import { usePortrait } from '../../hooks/usePortrait';
import { useSidebarStore } from '../../store/sidebarStore';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { imageUrl } = usePortrait(user?.USE_PAYNUMBER);
  const { isCollapsed } = useSidebarStore();
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isCollapsed) {
    return (
      <aside className="w-16 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl h-screen fixed left-0 top-0 flex flex-col z-50">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <Link
            to="/"
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              isHome
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            title="HOME"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
          </Link>
        </div>
      </aside>
    );
  }

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
