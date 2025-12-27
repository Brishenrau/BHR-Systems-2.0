import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuHeaderService } from '../services/menuHeader.service';
import type { ApiError } from '../types/api.types';
import type { BHR_MENHEADER } from '../types/database.types';

export const MenuHeaderPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    MEN_MENNUMBER: '',
    MEN_MENHEADER: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [menuHeaders, setMenuHeaders] = useState<BHR_MENHEADER[]>([]);
  const [loadingMenuHeaders, setLoadingMenuHeaders] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch all menu headers on component mount and after creation/deletion
  const loadMenuHeaders = async () => {
    try {
      setLoadingMenuHeaders(true);
      const allMenuHeaders = await menuHeaderService.getAllMenuHeaders();
      setMenuHeaders(allMenuHeaders);
    } catch (err) {
      console.error('Failed to load menu headers:', err);
    } finally {
      setLoadingMenuHeaders(false);
    }
  };

  useEffect(() => {
    loadMenuHeaders();
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate
      if (!formData.MEN_MENHEADER.trim()) {
        throw new Error('Menu header is required');
      }
      if (formData.MEN_MENHEADER.length > 20) {
        throw new Error('Menu header must be 20 characters or less');
      }

      await menuHeaderService.createMenuHeader({
        MEN_MENNUMBER: formData.MEN_MENNUMBER ? Number(formData.MEN_MENNUMBER) : undefined,
        MEN_MENHEADER: formData.MEN_MENHEADER.trim(),
      });

      setSuccess(true);
      setSuccessMessage('Menu header created successfully!');
      setFormData({
        MEN_MENNUMBER: '',
        MEN_MENHEADER: '',
      });

      // Dispatch custom event to notify other pages
      window.dispatchEvent(new Event('menuHeadersUpdated'));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create menu header');
      console.error('Failed to create menu header:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (menuNumber: number) => {
    if (!window.confirm(`Are you sure you want to delete menu header "${menuHeaders.find(m => m.MEN_MENNUMBER === menuNumber)?.MEN_MENHEADER}"?`)) {
      return;
    }

    try {
      setDeletingId(menuNumber);
      await menuHeaderService.deleteMenuHeader(menuNumber);
      setSuccess(true);
      setSuccessMessage('Menu header deleted successfully!');
      setError(null);
      
      // Reload menu headers
      await loadMenuHeaders();
      
      // Dispatch custom event to notify other pages
      window.dispatchEvent(new Event('menuHeadersUpdated'));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete menu header');
      console.error('Failed to delete menu header:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KOD TAJUK MENU</h1>
          <p className="text-gray-600">Create and manage menu headers</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">{successMessage || 'Operation completed successfully!'}</p>
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
            <label htmlFor="MEN_MENNUMBER" className="block text-sm font-medium text-gray-700 mb-2">
              Menu Number
            </label>
            <input
              type="number"
              id="MEN_MENNUMBER"
              value={formData.MEN_MENNUMBER}
              onChange={(e) => setFormData({ ...formData, MEN_MENNUMBER: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Auto (leave empty for auto)"
              min="1"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">Leave empty to auto-generate menu number</p>
          </div>

          <div>
            <label htmlFor="MEN_MENHEADER" className="block text-sm font-medium text-gray-700 mb-2">
              Menu Header <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="MEN_MENHEADER"
              value={formData.MEN_MENHEADER}
              onChange={(e) => setFormData({ ...formData, MEN_MENHEADER: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="e.g., FAIL-FAIL KOD"
              maxLength={20}
              required
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">Maximum 20 characters</p>
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
                'Create Menu Header'
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

        {/* Menu Headers List */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Menu Headers</h2>
          
          {loadingMenuHeaders ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
              <p className="mt-2 text-gray-600">Loading menu headers...</p>
            </div>
          ) : menuHeaders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gradient-to-r from-cyan-500 to-teal-500">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Menu Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Menu Header
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuHeaders.map((menuHeader) => (
                    <tr key={menuHeader.MEN_MENNUMBER} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {menuHeader.MEN_MENNUMBER}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {menuHeader.MEN_MENHEADER}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {menuHeader.MEN_ENTRYOPER}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {menuHeader.MEN_ENTRYDATE 
                          ? new Date(menuHeader.MEN_ENTRYDATE).toLocaleDateString('en-MY', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(menuHeader.MEN_MENNUMBER)}
                          disabled={deletingId === menuHeader.MEN_MENNUMBER}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {deletingId === menuHeader.MEN_MENNUMBER ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Deleting...
                            </span>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">No menu headers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

