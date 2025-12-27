import { useParams, Link } from 'react-router-dom';
import { useModules } from '../hooks/useModules';
import { menuService } from '../services/menu.service';
import { useEffect, useState } from 'react';
import type { BHR_MODULCODE, MenuItem } from '../types/database.types';
import type { ApiError } from '../types/api.types';

export const ModulePage = () => {
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const { modules, loading: modulesLoading } = useModules();
  const [currentModule, setCurrentModule] = useState<BHR_MODULCODE | null>(null);
  const [moduleMenus, setModuleMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Find the module from modules data
  useEffect(() => {
    if (!modulesLoading && modules.length > 0 && moduleCode) {
      const found = modules.find(m => m.MOD_MODULCODE === moduleCode);
      if (found) {
        setCurrentModule(found);
      }
    }
  }, [modules, modulesLoading, moduleCode]);
  
  // Fetch menu headers and programs for this module
  useEffect(() => {
    const loadModuleMenus = async () => {
      if (!moduleCode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const menus = await menuService.getModuleMenus(moduleCode);
        setModuleMenus(menus);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load module menus');
        console.error('Failed to load module menus:', err);
        setModuleMenus([]);
      } finally {
        setLoading(false);
      }
    };

    loadModuleMenus();
  }, [moduleCode]);
  
  const moduleName = currentModule?.MOD_MODULNAME || moduleCode || 'Module';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{moduleName}</h1>
          <div className="flex gap-4 text-gray-600">
            <p>Module Code: <span className="font-mono font-semibold">{currentModule?.MOD_MODULCODE || moduleCode}</span></p>
            {currentModule?.MOD_MODULSIRI && (
              <p>Sequence: <span className="font-mono font-semibold">{currentModule.MOD_MODULSIRI}</span></p>
            )}
          </div>
        </div>

        {/* Menu Headers and Programs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading menus...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : moduleMenus.length > 0 ? (
          <div className="mb-6">
            {/* Grid layout for headers side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {moduleMenus.map((menu) => (
                <div
                  key={menu.menuNumber}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Header Section - Distinctive styling */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 border-b-2 border-blue-700">
                    <h3 className="text-base font-bold text-white">
                      {menu.menuHeader}
                    </h3>
                  </div>
                  
                  {/* Programs Section */}
                  <div className="p-4">
                    {menu.programs.length > 0 ? (
                      <ol className="space-y-1">
                        {menu.programs.map((program, index) => (
                          <li
                            key={program.programCode}
                            className="flex items-start group hover:bg-blue-50 rounded-md p-2 -ml-2 transition-colors"
                          >
                            <span className="text-blue-600 font-semibold mr-2 mt-0.5 min-w-[1.5rem] text-xs">
                              {index + 1}.
                            </span>
                            <Link
                              to={`/module/${moduleCode}/${program.programCode}`}
                              className="text-gray-700 group-hover:text-blue-700 font-medium flex-1 hover:underline cursor-pointer text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                              title={program.programName}
                            >
                              {program.programName}
                            </Link>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No programs available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No menu items available for this module</p>
          </div>
        )}
      </div>
    </div>
  );
};

