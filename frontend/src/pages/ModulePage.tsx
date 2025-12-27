import { useParams } from 'react-router-dom';
import { useModules } from '../hooks/useModules';
import { useMenu } from '../hooks/useMenu';
import { useEffect, useState } from 'react';
import type { BHR_MODULCODE } from '../types/database.types';

export const ModulePage = () => {
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const { modules, loading: modulesLoading } = useModules();
  const { menuItems, loading: menuLoading } = useMenu();
  const [currentModule, setCurrentModule] = useState<BHR_MODULCODE | null>(null);
  const [modulePrograms, setModulePrograms] = useState<Array<{ programCode: string; programName: string }>>([]);
  
  // Find the module from modules data
  useEffect(() => {
    if (!modulesLoading && modules.length > 0 && moduleCode) {
      const found = modules.find(m => m.MOD_MODULCODE === moduleCode);
      if (found) {
        setCurrentModule(found);
      }
    }
  }, [modules, modulesLoading, moduleCode]);
  
  // Find all programs under this module
  useEffect(() => {
    if (!menuLoading && menuItems.length > 0 && moduleCode) {
      const allPrograms = menuItems.flatMap(item => item.programs);
      const programs = allPrograms
        .filter(p => p.moduleCode === moduleCode)
        .map(p => ({ programCode: p.programCode, programName: p.programName }));
      setModulePrograms(programs);
    }
  }, [menuItems, menuLoading, moduleCode]);
  
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Preview Mode</h3>
              <p className="text-blue-800">
                This is a preview page for the <strong>{moduleName}</strong> module. 
                The actual functionality will be implemented when the backend is connected.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Module Name:</span>
                <p className="text-base text-gray-900">{moduleName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Module Code:</span>
                <p className="text-base text-gray-900 font-mono">{currentModule?.MOD_MODULCODE || moduleCode}</p>
              </div>
              {currentModule?.MOD_MODULSIRI && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Sequence:</span>
                  <p className="text-base text-gray-900 font-mono">{currentModule.MOD_MODULSIRI}</p>
                </div>
              )}
              {modulePrograms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <span className="text-sm font-medium text-gray-600">Programs in this module:</span>
                  <ul className="mt-2 space-y-1">
                    {modulePrograms.map((program) => (
                      <li key={program.programCode} className="text-sm text-gray-700">
                        • {program.programName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Data entry and management
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Reports and analytics
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Search and filter capabilities
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

