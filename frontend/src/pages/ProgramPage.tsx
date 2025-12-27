import { useParams } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { useModules } from '../hooks/useModules';
import { useEffect, useState } from 'react';
import type { ProgramItem, BHR_MODULCODE } from '../types/database.types';

export const ProgramPage = () => {
  const { moduleCode, programCode } = useParams<{ moduleCode: string; programCode: string }>();
  const { menuItems, loading: menuLoading } = useMenu();
  const { modules, loading: modulesLoading } = useModules();
  const [currentProgram, setCurrentProgram] = useState<ProgramItem | null>(null);
  const [currentModule, setCurrentModule] = useState<BHR_MODULCODE | null>(null);

  // Find the current program
  useEffect(() => {
    if (!menuLoading && menuItems.length > 0 && programCode) {
      const allPrograms = menuItems.flatMap(item => item.programs);
      const foundProgram = allPrograms.find(p => p.programCode === programCode);
      setCurrentProgram(foundProgram || null);
    }
  }, [menuItems, menuLoading, programCode]);

  // Find the current module
  useEffect(() => {
    if (!modulesLoading && modules.length > 0 && moduleCode) {
      const foundModule = modules.find(m => m.MOD_MODULCODE === moduleCode);
      setCurrentModule(foundModule || null);
    }
  }, [modules, modulesLoading, moduleCode]);

  const displayName = currentProgram?.programName || programCode || 'Program';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
          <div className="flex gap-4 text-gray-600">
            {currentModule && (
              <p>Module: <span className="font-semibold">{currentModule.MOD_MODULNAME}</span></p>
            )}
            {currentProgram && (
              <>
                <p>Program Code: <span className="font-mono font-semibold">{currentProgram.programCode}</span></p>
                <p>Module Code: <span className="font-mono font-semibold">{currentProgram.moduleCode}</span></p>
              </>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Program Preview</h3>
              <p className="text-blue-800">
                This is a preview page for <strong>{displayName}</strong>.
                The actual functionality will be implemented when the backend is connected.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Information</h3>
            <div className="space-y-2">
              {currentProgram ? (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Program Name:</span>
                    <p className="text-base text-gray-900">{currentProgram.programName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Program Code:</span>
                    <p className="text-base text-gray-900 font-mono">{currentProgram.programCode}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Module Code:</span>
                    <p className="text-base text-gray-900 font-mono">{currentProgram.moduleCode}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Sequence:</span>
                    <p className="text-base text-gray-900">{currentProgram.sequence}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-700">No information available for this program.</p>
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

