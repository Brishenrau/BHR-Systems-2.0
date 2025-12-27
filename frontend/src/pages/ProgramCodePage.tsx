import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { programService } from '../services/program.service';
import { moduleService } from '../services/module.service';
import { menuService } from '../services/menu.service';
import type { ApiError } from '../types/api.types';
import type { BHR_PGRAMCODE, BHR_MODULCODE } from '../types/database.types';

interface MenuHeader {
  menuNumber: number;
  menuHeader: string;
}

export const ProgramCodePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    PGR_PGRAMCODE: '',
    PGR_MODULCODE: '',
    PGR_MENNUMBER: '',
    PGR_PGRAMNAME: '',
    PGR_SEQUENCED: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [programs, setPrograms] = useState<BHR_PGRAMCODE[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [modules, setModules] = useState<BHR_MODULCODE[]>([]);
  const [menuHeaders, setMenuHeaders] = useState<MenuHeader[]>([]);

  // Fetch modules and menu headers on component mount and when page becomes visible
  useEffect(() => {
    const loadData = async () => {
      try {
        const [allModules, allMenus] = await Promise.all([
          moduleService.getAllModules(),
          menuService.getUserMenu(),
        ]);
        
        setModules(allModules.filter(m => m.MOD_STATUSFLG === 'Y'));
        
        // Extract menu headers from menu structure
        const headers: MenuHeader[] = allMenus.map(menu => ({
          menuNumber: menu.menuNumber,
          menuHeader: menu.menuHeader,
        }));
        setMenuHeaders(headers);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    loadData();

    // Listen for custom event when menu headers are updated
    const handleMenuHeadersUpdate = () => {
      loadData();
    };

    window.addEventListener('menuHeadersUpdated', handleMenuHeadersUpdate);

    // Also refetch when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('menuHeadersUpdated', handleMenuHeadersUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Fetch all programs on component mount and after creation
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const allPrograms = await programService.getAllPrograms();
        setPrograms(allPrograms);
      } catch (err) {
        console.error('Failed to load programs:', err);
      } finally {
        setLoadingPrograms(false);
      }
    };

    loadPrograms();
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate
      if (!formData.PGR_PGRAMCODE.trim()) {
        throw new Error('Program code is required');
      }
      if (!formData.PGR_MODULCODE.trim()) {
        throw new Error('Module code is required');
      }
      if (!formData.PGR_MENNUMBER) {
        throw new Error('Menu number is required');
      }
      if (!formData.PGR_PGRAMNAME.trim()) {
        throw new Error('Program name is required');
      }
      if (formData.PGR_PGRAMCODE.length > 13) {
        throw new Error('Program code must be 13 characters or less');
      }

      await programService.createProgram({
        PGR_PGRAMCODE: formData.PGR_PGRAMCODE.trim().toUpperCase(),
        PGR_MODULCODE: formData.PGR_MODULCODE.trim().toUpperCase(),
        PGR_MENNUMBER: Number(formData.PGR_MENNUMBER),
        PGR_PGRAMNAME: formData.PGR_PGRAMNAME.trim(),
        PGR_SEQUENCED: formData.PGR_SEQUENCED ? Number(formData.PGR_SEQUENCED) : undefined,
      });

      setSuccess(true);
      setFormData({
        PGR_PGRAMCODE: '',
        PGR_MODULCODE: '',
        PGR_MENNUMBER: '',
        PGR_PGRAMNAME: '',
        PGR_SEQUENCED: '',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create program');
      console.error('Failed to create program:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PENYELENGGARAAN ATURCARA</h1>
          <p className="text-gray-600">Create and manage system programs</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Program created successfully!</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="PGR_PGRAMCODE" className="block text-sm font-medium text-gray-700 mb-2">
                Program Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="PGR_PGRAMCODE"
                value={formData.PGR_PGRAMCODE}
                onChange={(e) => setFormData({ ...formData, PGR_PGRAMCODE: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g., ADM_PENYELENGGARAAN"
                maxLength={13}
                required
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">Maximum 13 characters. Will be converted to uppercase.</p>
            </div>

            <div>
              <label htmlFor="PGR_MODULCODE" className="block text-sm font-medium text-gray-700 mb-2">
                Module Code <span className="text-red-500">*</span>
              </label>
              <select
                id="PGR_MODULCODE"
                value={formData.PGR_MODULCODE}
                onChange={(e) => setFormData({ ...formData, PGR_MODULCODE: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                required
                disabled={loading}
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module.MOD_MODULCODE} value={module.MOD_MODULCODE}>
                    {module.MOD_MODULCODE} - {module.MOD_MODULNAME}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="PGR_MENNUMBER" className="block text-sm font-medium text-gray-700 mb-2">
                Menu Number <span className="text-red-500">*</span>
              </label>
              <select
                id="PGR_MENNUMBER"
                value={formData.PGR_MENNUMBER}
                onChange={(e) => setFormData({ ...formData, PGR_MENNUMBER: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                required
                disabled={loading}
              >
                <option value="">Select Menu</option>
                {menuHeaders.map((menu) => (
                  <option key={menu.menuNumber} value={menu.menuNumber}>
                    {menu.menuNumber} - {menu.menuHeader}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="PGR_SEQUENCED" className="block text-sm font-medium text-gray-700 mb-2">
                Sequence
              </label>
              <input
                type="number"
                id="PGR_SEQUENCED"
                value={formData.PGR_SEQUENCED}
                onChange={(e) => setFormData({ ...formData, PGR_SEQUENCED: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Auto (leave empty for auto)"
                min="1"
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">Leave empty to auto-generate sequence number</p>
            </div>
          </div>

          <div>
            <label htmlFor="PGR_PGRAMNAME" className="block text-sm font-medium text-gray-700 mb-2">
              Program Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="PGR_PGRAMNAME"
              value={formData.PGR_PGRAMNAME}
              onChange={(e) => setFormData({ ...formData, PGR_PGRAMNAME: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="e.g., PENYELENGGARAAN ATURCARA"
              maxLength={60}
              required
              disabled={loading}
            />
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
                'Create Program'
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

        {/* Programs List */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Programs</h2>
          
          {loadingPrograms ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
              <p className="mt-2 text-gray-600">Loading programs...</p>
            </div>
          ) : programs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gradient-to-r from-cyan-500 to-teal-500">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Program Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Module Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Menu Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Program Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Sequence
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
                  {programs.map((program) => (
                    <tr key={`${program.PGR_PGRAMCODE}-${program.PGR_MODULCODE}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-cyan-600">
                        {program.PGR_PGRAMCODE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {program.PGR_MODULCODE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {program.PGR_MENNUMBER}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {program.PGR_PGRAMNAME}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {program.PGR_SEQUENCED}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {program.PGR_ENTRYOPER}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {program.PGR_ENTRYDATE 
                          ? new Date(program.PGR_ENTRYDATE).toLocaleDateString('en-MY', {
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
              <p className="text-gray-600">No programs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

