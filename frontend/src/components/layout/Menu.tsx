import { Link } from 'react-router-dom';
import { useMenu } from '../../hooks/useMenu';

export const Menu = () => {
  const { menuItems, loading, error } = useMenu();

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        <div className="animate-pulse">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        <p>Failed to load menu: {error}</p>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        <p>No menu items available</p>
      </div>
    );
  }

  return (
    <nav className="space-y-4">
      {menuItems.map((item) => (
        <div key={item.menuNumber} className="menu-section">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            {item.menuHeader}
          </h3>
          <ul className="space-y-1 ml-2">
            {item.programs.map((program) => (
              <li key={program.programCode}>
                <Link
                  to={`/program/${program.programCode}`}
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                >
                  {program.programName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

