import { NavLink } from "react-router-dom";
import { sidebarItems } from "./sidebarConfig";
import "./sidebar.css";

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}>
      
      <div className="sidebar__logo">
        {isOpen ? "School Admin" : "SA"}
      </div>

      <nav className="sidebar__nav">
        {sidebarItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__item ${isActive ? "sidebar__item--active" : ""}`
            }
          >
            <span className="sidebar__icon">{item.icon}</span>
            {isOpen && (
              <span className="sidebar__label">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;
