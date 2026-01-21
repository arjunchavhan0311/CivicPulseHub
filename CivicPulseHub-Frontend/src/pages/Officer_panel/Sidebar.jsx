import React from "react";
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  User,
  LogOut,
  Zap,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/Logo.jpg";
import axios from "axios";

const Sidebar = ({ selected, setSelected, notifications = [] }) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", icon: LayoutGrid },
    { label: "All Complaints", icon: FileText },
    { label: "Feedback", icon: MessageSquare },
    { label: "Profile", icon: User },
    { label: "Logout", icon: LogOut, isLogout: true },
  ];

  const handleNavigation = (item) => {
    if (item.isLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    } else {
      setSelected(item.label);
    }
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <img src={logoImg} alt="CivicPulse Logo" className="dashboard-sidebar-logo" />
        <div className="dashboard-sidebar-title">CivicPulse</div>
      </div>

      <nav className="dashboard-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = selected === item.label;

          return (
            <li key={item.label} className="dashboard-nav-item">
              <button
                className={`dashboard-nav-button ${isActive ? "active" : ""}`}
                onClick={() => handleNavigation(item)}
                style={item.isLogout ? { color: "var(--accent)" } : {}}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {/* Show badge if notifications */}
                {item.badge > 0 && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </button>
            </li>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
