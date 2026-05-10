import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const MainLayout = () => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1 ml-[260px] transition-all duration-300">
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default MainLayout;
