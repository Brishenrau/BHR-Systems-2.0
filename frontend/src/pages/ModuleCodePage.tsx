import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleService } from '../services/module.service';
import type { ApiError } from '../types/api.types';

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

      // Optionally navigate or refresh
      setTimeout(() => {
        navigate('/');
      }, 1500);
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
      </div>
    </div>
  );
};

