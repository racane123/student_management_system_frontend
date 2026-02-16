import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './layout.css';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/students': 'Students',
  '/dashboard/teachers': 'Teachers',
  '/dashboard/classes': 'Classes',
  '/dashboard/attendance': 'Attendance',
  '/dashboard/exams': 'Exams',
  '/dashboard/results': 'Results',
  '/dashboard/fees': 'Fees',
  '/dashboard/reports': 'Reports',
  '/dashboard/users': 'Users',
};

export default function Navbar({ toggleSidebar }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = routeTitles[location.pathname] || 'Dashboard';

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="top-nav">
      <div className="top-nav__left">
        <button
          type="button"
          onClick={toggleSidebar}
          className="top-nav__menu-btn"
          aria-label="Toggle sidebar"
        >
          <Menu size={22} strokeWidth={2} />
        </button>
        <h1 className="top-nav__title">{pageTitle}</h1>
      </div>

      <div className="top-nav__center">
        <div className={`top-nav__search ${searchFocused ? 'top-nav__search--focused' : ''}`}>
          <Search size={18} className="top-nav__search-icon" />
          <input
            type="search"
            placeholder="Search students, classes..."
            className="top-nav__search-input"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="top-nav__right">
        <button type="button" className="top-nav__icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="top-nav__badge">3</span>
        </button>

        <div className="top-nav__user" ref={userMenuRef}>
          <button
            type="button"
            className="top-nav__user-trigger"
            onClick={() => setUserMenuOpen((o) => !o)}
          >
            <span className="top-nav__user-avatar">
              <User size={18} />
            </span>
            <span className="top-nav__user-info">
              <span className="top-nav__user-name">{user?.name ?? 'User'}</span>
              <span className="top-nav__user-role">{user?.role ?? '—'}</span>
            </span>
            <ChevronDown size={16} className={`top-nav__user-chevron ${userMenuOpen ? 'top-nav__user-chevron--open' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="top-nav__dropdown">
              <div className="top-nav__dropdown-header">
                <span className="top-nav__dropdown-name">{user?.name ?? 'User'}</span>
                <span className="top-nav__dropdown-role">{user?.role ?? '—'}</span>
              </div>
              <button type="button" className="top-nav__dropdown-item" onClick={handleLogout}>
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
