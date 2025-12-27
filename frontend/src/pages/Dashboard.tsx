import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Dashboard = () => {
  const { user } = useAuthStore();

  const quickAccessModules = [
    { name: 'PEMBAYARAN', code: 'PEMBAYARAN', icon: '💰', color: 'bg-cyan-500' },
    { name: 'GAJI', code: 'GAJI', icon: '💵', color: 'bg-teal-500' },
    { name: 'PERAKAUNAN', code: 'PERAKAUNAN', icon: '📊', color: 'bg-blue-500' },
    { name: 'PERSONEL', code: 'PERSONEL', icon: '👥', color: 'bg-emerald-500' },
    { name: 'STOK', code: 'STOK', icon: '📦', color: 'bg-sky-500' },
    { name: 'PELESENAN', code: 'PELESENAN', icon: '📋', color: 'bg-cyan-400' },
  ];

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back{user ? `, ${user.USE_PAYNUMBER}` : ''}!
            </h1>
            <p className="text-cyan-50 text-lg">
              Sistem Perakaunan Bersepadu Berkomputer Pihak Berkuasa Tempatan
            </p>
            <p className="text-cyan-50 text-sm mt-2">
              Majlis Perbandaran Kulim, Kedah Darul Aman
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold mb-1">{formattedTime}</p>
            <p className="text-cyan-50">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Account Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.USE_STATUSFLG === 'Y' ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              user?.USE_STATUSFLG === 'Y' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {user?.USE_STATUSFLG === 'Y' ? (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">User Level</p>
              <p className="text-2xl font-bold text-gray-900">Level {user?.USE_USERLEVEL || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">PTJ/PK Code</p>
              <p className="text-2xl font-bold text-gray-900">{user?.USE_PTJPKCODE || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickAccessModules.map((module) => (
            <Link
              key={module.code}
              to={`/module/${module.code}`}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition-all group"
            >
              <div className={`w-12 h-12 ${module.color} rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <p className="text-sm font-medium text-gray-700 text-center group-hover:text-cyan-600">
                {module.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* System Information & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">System Version</span>
              <span className="text-sm font-medium text-gray-900">BHR Systems 2.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Last Login</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.USE_ENTRYDATE 
                  ? new Date(user.USE_ENTRYDATE).toLocaleString('en-MY')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Pay Number</span>
              <span className="text-sm font-medium text-gray-900">{user?.USE_PAYNUMBER || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Entry Operator</span>
              <span className="text-sm font-medium text-gray-900">{user?.USE_ENTRYOPER || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity / Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">System Update</p>
                <p className="text-xs text-gray-600 mt-1">BHR Systems 2.0 is now available</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Welcome</p>
                <p className="text-xs text-gray-600 mt-1">You have successfully logged in</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">System Ready</p>
                <p className="text-xs text-gray-600 mt-1">All modules are operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Need Help?</h3>
            <p className="text-sm text-gray-600">
              Contact your system administrator or IT support for assistance
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              User Guide
            </button>
            <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
