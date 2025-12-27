import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '../../store/sidebarStore';

export const Layout = () => {
  const { isCollapsed } = useSidebarStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={isCollapsed ? 'ml-16' : 'ml-64'}>
        <Header />
        <main className="pt-14 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
