import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { ProfilePicture } from '../common/ProfilePicture';
import { usePortrait } from '../../hooks/usePortrait';
import { useParams } from 'react-router-dom';
import { useModules } from '../../hooks/useModules';
import { useSidebarStore } from '../../store/sidebarStore';

export const Header = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { imageUrl } = usePortrait(user?.USE_PAYNUMBER);
  const { moduleCode } = useParams<{ moduleCode?: string }>();
  const { modules } = useModules();
  
  // Get current module name if on a module page, otherwise default to PENTADBIR SISTEM
  const currentModule = moduleCode ? modules.find(m => m.MOD_MODULCODE === moduleCode) : null;
  const headerTitle = currentModule?.MOD_MODULNAME || 'PENTADBIR SISTEM';
  const { isCollapsed } = useSidebarStore();

  return (
    <header className={`fixed top-0 ${isCollapsed ? 'left-16' : 'left-64'} right-0 bg-white shadow-sm border-b border-gray-200 z-40 h-14`}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">{headerTitle}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              {/* Profile Picture */}
              <div className="flex items-center space-x-3">
                <ProfilePicture
                  name={user.USE_PAYNUMBER}
                  imageUrl={imageUrl || undefined}
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
