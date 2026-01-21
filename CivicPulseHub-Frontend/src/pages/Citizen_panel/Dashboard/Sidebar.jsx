import React from "react";
import { 
  LayoutGrid, 
  BookOpen, 
  TrendingUp, 
  Bell, 
  MessageSquare, 
  User, 
  LogOut 
} from "lucide-react";
import logoImg from "../../../assets/Logo.jpg";

const Sidebar = ({ selected, setSelected, notifications, navigate }) => {
  const propTypes = {
    selected: "string",
    setSelected: "function",
    notifications: "array",
    navigate: "function",
  };
  const sidebarItems = [
    { label: "Dashboard", icon: LayoutGrid },
    { label: "Submit Grievance", icon: BookOpen },
    { label: "Track Complaints", icon: TrendingUp },
    { label: "Notifications", icon: Bell, badge: notifications?.length || 0 },
    { label: "Feedback", icon: MessageSquare },
    { label: "My Profile", icon: User },
    { label: "Logout", icon: LogOut, isLogout: true },
  ];

  const handleNavigation = (item) => {
    if (item.isLogout) {
      localStorage.removeItem("token");
      navigate("/");
    } else {
      setSelected(item.label);
    }
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <img src={logoImg} alt="CivicPulse" />
        <div className="dashboard-sidebar-title">CivicPulse</div>
      </div>

      <nav className="dashboard-nav">
        {sidebarItems.map((item) => {
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
                {item.badge > 0 && (
                  <span className="dashboard-nav-badge">{item.badge}</span>
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

