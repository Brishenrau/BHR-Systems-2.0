import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { accessService } from '../services/access.service';
import { useAuthStore } from '../store/authStore';
import type { ApiError } from '../types/api.types';
import type { BHR_PAYNUMBER, BHR_MODULCODE } from '../types/database.types';

export const UserAccessPage = () => {
  const { payNumber: paramPayNumber } = useParams<{ payNumber?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuthStore();
  const [selectedPayNumber, setSelectedPayNumber] = useState<string>(
    paramPayNumber || searchParams.get('payNumber') || currentUser?.USE_PAYNUMBER || ''
  );
  const [user, setUser] = useState<BHR_PAYNUMBER | null>(null);
  const [modules, setModules] = useState<BHR_MODULCODE[]>([]);
  const [accessString, setAccessString] = useState<string>('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load user access data
  useEffect(() => {
    const loadUserAccess = async () => {
      if (!selectedPayNumber) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await accessService.getUserAccess(selectedPayNumber);
        setUser(data.user);
        setModules(data.modules);
        
        // Initialize access string (60 characters, default 'T')
        const currentAccess = data.access?.ACC_MODACCESS || 'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT';
        setAccessString(currentAccess.padEnd(60, 'T').substring(0, 60));
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load user access');
        console.error('Failed to load user access:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserAccess();
  }, [selectedPayNumber]);

  // Check if a module has access (Y) or not (T)
  const hasModuleAccess = (moduleSequence: number): boolean => {
    const position = moduleSequence - 1; // Convert 1-based to 0-based
    if (position < 0 || position >= accessString.length) {
      return false;
    }
    return accessString.charAt(position).toUpperCase() === 'Y';
  };

  // Toggle module access
  const toggleModuleAccess = (moduleSequence: number) => {
    const position = moduleSequence - 1;
    if (position < 0 || position >= accessString.length) {
      return;
    }

    const newAccessString = accessString.split('');
    newAccessString[position] = newAccessString[position] === 'Y' ? 'T' : 'Y';
    setAccessString(newAccessString.join(''));
    setSuccess(false); // Clear success message when making changes
  };

  // Handle pay number change
  const handlePayNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPayNumber(e.target.value);
    setSearchParams({ payNumber: e.target.value });
  };

  // Load user access when pay number is submitted
  const handleLoadUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPayNumber) {
      setSearchParams({ payNumber: selectedPayNumber });
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedPayNumber) return;

    try {
      setSaving(true);
      setError(null);
      await accessService.updateUserAccess(selectedPayNumber, accessString);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update user access');
      console.error('Failed to update user access:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedPayNumber) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TAHAP PENCAPAIAN PENGGUNA</h1>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <form onSubmit={handleLoadUser} className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="payNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Number
                </label>
                <input
                  type="text"
                  id="payNumber"
                  value={selectedPayNumber}
                  onChange={handlePayNumberChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter pay number (e.g., 10703)"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors"
              >
                Load User
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <p className="mt-4 text-gray-600">Loading user access...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TAHAP PENCAPAIAN PENGGUNA</h1>
        </div>

        {/* User Selection */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <form onSubmit={handleLoadUser} className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="payNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Pay Number
              </label>
              <input
                type="text"
                id="payNumber"
                value={selectedPayNumber}
                onChange={handlePayNumberChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Enter pay number (e.g., 10703)"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors"
            >
              Load User
            </button>
          </form>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">User access updated successfully!</p>
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

        {/* User Details */}
        {user && (
          <div className="mb-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Pay Number:</span>
                <p className="text-base text-gray-900 font-mono font-semibold">{user.USE_PAYNUMBER}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Short Name:</span>
                <p className="text-base text-gray-900">{user.USE_SHORTNAME || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">User Level:</span>
                <p className="text-base text-gray-900">{user.USE_USERLEVEL || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modules List with Checkboxes */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Module Access</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-cyan-500 to-teal-500">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-16">
                    Access
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-20">
                    Sequence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Module Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Module Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modules.map((module) => (
                  <tr
                    key={module.MOD_MODULCODE}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasModuleAccess(module.MOD_MODULSIRI)}
                          onChange={() => toggleModuleAccess(module.MOD_MODULSIRI)}
                          className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2 cursor-pointer"
                        />
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {module.MOD_MODULSIRI}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-cyan-600">
                      {module.MOD_MODULCODE}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {module.MOD_MODULNAME}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

