import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  FileText,
  UserPlus,
  BarChart3,
  MessageSquare,
  User,
  Bell,
  LogOut
} from "lucide-react";
import logoImg from "../../assets/Logo.jpg";
import axios from "axios";

const AdminSidebar = ({ selected, setSelected }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:8081/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data); // assuming res.data is an array of notifications
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: LayoutGrid },
    { label: "All Complaints", icon: FileText },
    { label: "Create Officer", icon: UserPlus }, 
    { label: "OfficerRequest", icon: UserPlus}, 
    { label: "Analytics", icon: BarChart3 },
    { label: "Feedback", icon: MessageSquare },
    { label: "Profile", icon: User },
    { label: "Logout", icon: LogOut, isLogout: true },
  ];

  const handleNavigation = (item) => {
    if (item.isLogout) {
      localStorage.removeItem("adminToken");
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
                {/* Badge */}
                {item.badge > 0 && (
                  <span
                    style={{
                      background: "var(--accent)",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "0.7rem",
                      marginLeft: "auto",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;