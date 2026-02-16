import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="layout">
      <Sidebar isOpen={isOpen} />
      <div className="layout__main">
        <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="layout__content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
