import { Link, useLocation } from 'react-router-dom';
import { useModules } from '../../hooks/useModules';

export const Menu = () => {
  const { modules, loading, error } = useModules();
  const location = useLocation();
  const isHome = location.pathname === '/';

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
        <p className="text-sm text-red-300">Failed to load modules: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* HOME Link */}
      <Link
        to="/"
        className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-2 ${
          isHome
            ? 'bg-blue-500 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <svg 
          className="w-5 h-5 mr-3" 
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
        HOME
      </Link>

      {/* Separator Line */}
      {modules.length > 0 && (
        <div className="my-2 border-t border-gray-700"></div>
      )}

      {/* Modules List - Display modules from BHR_MODULCODE */}
      {modules.length > 0 && (
        <>
          {modules.map((module) => (
            <Link
              key={module.MOD_MODULCODE}
              to={`/module/${module.MOD_MODULCODE}`}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === `/module/${module.MOD_MODULCODE}` || location.pathname.startsWith(`/module/${module.MOD_MODULCODE}/`)
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {module.MOD_MODULNAME}
            </Link>
          ))}
        </>
      )}

      {modules.length === 0 && !loading && !error && (
        <div className="text-sm text-gray-400 p-4">
          <p>No modules available</p>
        </div>
      )}
    </div>
  );
};
