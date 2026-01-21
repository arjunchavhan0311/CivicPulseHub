import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemePreference } from "../../hooks/useThemePreference.js";

import AdminSidebar from "../Admin_panel/AdminSidebar";
import AdminSummaryCards from "../Admin_panel/AdminSummary";
import RecentComplaintsTable from "./RecentComplaintsTable";
import CreateOfficerForm from "./AdminCreateOfficer";
import AllComplaints from "../Admin_panel/AllComplaints";
import AdminAnalytics from "../Admin_panel/AdminAnalytics";
import AdminFeedback from "../Admin_panel/Feedback/AdminFeedback";
import AdminProfile from "../Admin_panel/AdminProfile";
import AdminNotifications from "../Admin_panel/AdminNotificationList";
import AdminOfficerRequest from "./AdminOfficerRequest";

import {
  connectWebSocket,
  disconnectWebSocket,
} from "../../hooks/useWebSocket";
import { fetchAdminComplaints } from "../../api/admin";

export default function AdminDashboard() {
  const { theme, toggleTheme } = useThemePreference();
  const [selected, setSelected] = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    category: "All",
  });

  /* ===================== FETCH + WEBSOCKET ===================== */
  useEffect(() => {
    let isMounted = true;

    const loadComplaints = async () => {
      try {
        const res = await fetchAdminComplaints();
        if (isMounted) setComplaints(res.data || []);
      } catch (err) {
        console.error("Failed to load complaints:", err);
      }
    };

    loadComplaints();

    const ws = connectWebSocket({
      onAdminNotify: (newComplaint) => {
        if (isMounted) setComplaints((prev) => [newComplaint, ...prev]);
      },
    });

    return () => {
      isMounted = false;
      disconnectWebSocket(ws);
    };
  }, []);

  /* ===================== HELPERS ===================== */
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const countByStatus = (status) =>
    complaints.filter((c) => c.status === status).length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filters.status === "All" || c.status === filters.status;
    const matchesPriority =
      filters.priority === "All" || c.priority === filters.priority;
    const matchesCategory =
      filters.category === "All" || c.category === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const summaryCounts = [
    { label: "Pending", value: countByStatus("PENDING"), color: "#ff9800" },
    { label: "In Progress", value: countByStatus("IN_PROGRESS"), color: "#2196f3" },
    { label: "Resolved", value: countByStatus("RESOLVED"), color: "#4caf50" },
    { label: "Escalated", value: countByStatus("ESCALATED"), color: "#f44336" },
  ];

  /* ===================== UI ===================== */
  return (
    <div className="dashboard-shell">
      <AdminSidebar selected={selected} setSelected={setSelected} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-header-title">{selected}</h1>

          <div className="dashboard-header-actions">
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <div className="dashboard-body">
          {selected === "Dashboard" && (
            <div className="dashboard-body-inner" style={{ padding: "1.5rem 2rem" }}>
              <AdminSummaryCards counts={summaryCounts} />

              <div style={{
                display: "flex",
                gap: "1.5rem",
                flexWrap: "wrap",
                margin: "2rem 0",
                alignItems: "center"
              }}>
                <div style={{
                  position: "relative",
                  flex: 1,
                  minWidth: "300px"
                }}>
                  <input
                    type="text"
                    placeholder="Quick search complaints..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "1rem 1.5rem",
                      borderRadius: "18px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                      fontSize: "1rem",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                  />
                </div>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  style={{
                    padding: "1rem 1.5rem",
                    borderRadius: "18px",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                    outline: "none"
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
              </div>

              <RecentComplaintsTable complaints={filteredComplaints.slice(0, 8)} />
            </div>
          )}

          {selected === "All Complaints" && (
            <AllComplaints
              complaints={filteredComplaints}
              refresh={async () => {
                const res = await fetchAdminComplaints();
                setComplaints(res.data || []);
              }}
            />
          )}

          {selected === "Create Officer" && <CreateOfficerForm />}
          {selected==="OfficerRequest" && <AdminOfficerRequest/>}
          {selected === "Analytics" && <AdminAnalytics />}
          {selected === "Notifications" && <AdminNotifications/>}
          {selected === "Feedback" && <AdminFeedback />}
          {selected === "Profile" && <AdminProfile />}
        </div>
      </div>
    </div>
  );
}