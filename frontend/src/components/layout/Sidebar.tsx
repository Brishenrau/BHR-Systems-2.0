import { Menu } from './Menu';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-[calc(100vh-64px)]">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu</h2>
        <Menu />
      </div>
    </aside>
  );
};

