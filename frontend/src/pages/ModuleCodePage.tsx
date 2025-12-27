import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleService } from '../services/module.service';
import type { ApiError } from '../types/api.types';
import type { BHR_MODULCODE } from '../types/database.types';

export const ModuleCodePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    MOD_MODULCODE: '',
    MOD_MODULNAME: '',
    MOD_STATUSFLG: 'Y',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [modules, setModules] = useState<BHR_MODULCODE[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // Fetch all modules on component mount
  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoadingModules(true);
        const allModules = await moduleService.getAllModules();
        // Filter to show only active modules
        setModules(allModules.filter(m => m.MOD_STATUSFLG === 'Y'));
      } catch (err) {
        console.error('Failed to load modules:', err);
      } finally {
        setLoadingModules(false);
      }
    };

    loadModules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate
      if (!formData.MOD_MODULCODE.trim()) {
        throw new Error('Module code is required');
      }
      if (!formData.MOD_MODULNAME.trim()) {
        throw new Error('Module name is required');
      }
      if (formData.MOD_MODULCODE.length > 10) {
        throw new Error('Module code must be 10 characters or less');
      }

      await moduleService.createModule({
        MOD_MODULCODE: formData.MOD_MODULCODE.trim().toUpperCase(),
        MOD_MODULNAME: formData.MOD_MODULNAME.trim(),
        MOD_STATUSFLG: formData.MOD_STATUSFLG,
      });

      setSuccess(true);
      setFormData({
        MOD_MODULCODE: '',
        MOD_MODULNAME: '',
        MOD_STATUSFLG: 'Y',
      });

      // Reload modules list
      const allModules = await moduleService.getAllModules();
      setModules(allModules.filter(m => m.MOD_STATUSFLG === 'Y'));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create module');
      console.error('Failed to create module:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KOD MODUL</h1>
          <p className="text-gray-600">Create a new system module</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Module created successfully!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="MOD_MODULCODE" className="block text-sm font-medium text-gray-700 mb-2">
              Module Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="MOD_MODULCODE"
              value={formData.MOD_MODULCODE}
              onChange={(e) => setFormData({ ...formData, MOD_MODULCODE: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="e.g., SADM, SPER"
              maxLength={10}
              required
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">Maximum 10 characters. Will be converted to uppercase.</p>
          </div>

          <div>
            <label htmlFor="MOD_MODULNAME" className="block text-sm font-medium text-gray-700 mb-2">
              Module Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="MOD_MODULNAME"
              value={formData.MOD_MODULNAME}
              onChange={(e) => setFormData({ ...formData, MOD_MODULNAME: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="e.g., PENTADBIR SISTEM"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="MOD_STATUSFLG" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="MOD_STATUSFLG"
              value={formData.MOD_STATUSFLG}
              onChange={(e) => setFormData({ ...formData, MOD_STATUSFLG: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              disabled={loading}
            >
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Module'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Active Modules List */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Modules</h2>
          
          {loadingModules ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
              <p className="mt-2 text-gray-600">Loading modules...</p>
            </div>
          ) : modules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gradient-to-r from-cyan-500 to-teal-500">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Sequence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Module Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Module Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Created Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modules.map((module, index) => (
                    <tr key={module.MOD_MODULCODE} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {module.MOD_MODULSIRI}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-cyan-600">
                        {module.MOD_MODULCODE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {module.MOD_MODULNAME}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          module.MOD_STATUSFLG === 'Y' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {module.MOD_STATUSFLG === 'Y' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.MOD_ENTRYOPER}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.MOD_ENTRYDATE 
                          ? new Date(module.MOD_ENTRYDATE).toLocaleDateString('en-MY', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">No active modules found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

