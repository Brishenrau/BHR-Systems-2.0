import { useAuthStore } from '../store/authStore';

export const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome</h2>
        {user && (
          <div className="space-y-2">
            <p><span className="font-medium">Pay Number:</span> {user.USE_PAYNUMBER}</p>
            <p><span className="font-medium">User Level:</span> {user.USE_USERLEVEL}</p>
            <p><span className="font-medium">Status:</span> {user.USE_STATUSFLG === 'Y' ? 'Active' : 'Inactive'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

