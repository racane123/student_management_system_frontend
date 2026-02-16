import { NavLink } from 'react-router-dom';
import { sidebarItems } from './SidebarConfig';
import './layout.css';

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      <div className="sidebar__logo">
        {isOpen ? 'School Admin' : 'SA'}
      </div>
      <nav className="sidebar__nav">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
              }
            >
              <span className="sidebar__icon">
                {Icon ? <Icon size={20} strokeWidth={2} /> : null}
              </span>
              {isOpen && <span className="sidebar__label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
