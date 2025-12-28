import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { ProfilePicture } from '../common/ProfilePicture';
import { usePortrait } from '../../hooks/usePortrait';
import { useParams, useLocation } from 'react-router-dom';
import { useModules } from '../../hooks/useModules';
import { useSidebarStore } from '../../store/sidebarStore';
import { useMenu } from '../../hooks/useMenu';

export const Header = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { imageUrl } = usePortrait(user?.USE_PAYNUMBER);
  const { moduleCode, programCode } = useParams<{ moduleCode?: string; programCode?: string }>();
  const { modules } = useModules();
  const { menuItems } = useMenu();
  const location = useLocation();
  
  // Get current module name if on a module page, otherwise default to PENTADBIR SISTEM
  const currentModule = moduleCode ? modules.find(m => m.MOD_MODULCODE === moduleCode) : null;
  const moduleName = currentModule?.MOD_MODULNAME || 'PENTADBIR SISTEM';
  
  // Get current program name if on a program page
  let programName: string | null = null;
  if (programCode && menuItems.length > 0) {
    const allPrograms = menuItems.flatMap(item => item.programs);
    const foundProgram = allPrograms.find(p => p.programCode === programCode);
    programName = foundProgram?.programName || null;
  }
  
  const { isCollapsed } = useSidebarStore();

  return (
    <header className={`fixed top-0 ${isCollapsed ? 'left-16' : 'left-64'} right-0 bg-white shadow-sm border-b border-gray-200 z-40 h-14`}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">{moduleName}</h1>
          {programName && (
            <>
              <span className="text-gray-400">/</span>
              <h2 className="text-lg font-medium text-gray-600">{programName}</h2>
            </>
          )}
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
