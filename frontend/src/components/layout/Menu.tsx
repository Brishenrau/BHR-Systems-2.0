import { Link, useLocation } from 'react-router-dom';
import { useMenu } from '../../hooks/useMenu';

export const Menu = () => {
  const { menuItems, loading, error } = useMenu();
  const location = useLocation();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-gray-700 rounded mb-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-sm text-red-300">Failed to load menu: {error}</p>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-sm text-gray-400 p-4">
        <p>No menu items available</p>
      </div>
    );
  }

  // Flatten all menus - each menu stands alone
  const allPrograms = menuItems.flatMap(item => item.programs);

  return (
    <div className="space-y-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Modules
      </div>
      {allPrograms.map((program) => (
        <Link
          key={program.programCode}
          to={`/module/${program.programCode}`}
          className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === `/module/${program.programCode}`
              ? 'bg-orange-500 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {program.programName}
        </Link>
      ))}
    </div>
  );
};
