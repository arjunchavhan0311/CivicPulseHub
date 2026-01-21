import React, { useEffect, useState } from "react";
import { Moon, Sun, Search } from "lucide-react";
import axios from "axios";
import { useThemePreference } from "../../hooks/useThemePreference.js";

import Sidebar from "./Sidebar";
import SummaryCards from "./SummaryCards";
import RecentComplaintsTable from "./RecentComplaintsTable";
import AllComplaintsCards from "./AllComplaintsCards";
import UpdateGrievanceModal from "./UpdateGrievanceModal";
import EditProfile from "./ProfileDetaills";
import OfficerFeedback from "./Feedback/OfficerFeedback";
import { Box } from "@mui/material";

const BASE_URL = "http://localhost:8081";

const Dashboard = () => {
  const { theme, toggleTheme } = useThemePreference();
  const [selected, setSelected] = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    category: "All",
  });

  // ✅ IMAGE NORMALIZER (SINGLE SOURCE OF TRUTH)
  const normalizeImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith("http")) {
      return encodeURI(imageUrl);
    }

    if (imageUrl.startsWith("/uploads")) {
      return encodeURI(`${BASE_URL}${imageUrl}`);
    }

    // filename only
    return encodeURI(`${BASE_URL}/uploads/officer/${imageUrl}`);
  };

  // ✅ FETCH COMPLAINTS
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8081/api/officer/complaints",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fixedData = res.data.map((c) => ({
          ...c,
          imageUrl: normalizeImageUrl(c.imageUrl),
        }));

        setComplaints(fixedData);
      } catch (err) {
        console.error("Failed to fetch complaints", err);
      }
    };

    fetchComplaints();
  }, []);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedComplaint(null);
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
    { label: "Escalated", value: countByStatus("ESCALATED"), color: "#f44336" },
    { label: "In Progress", value: countByStatus("IN_PROGRESS"), color: "#2196f3" },
    { label: "Resolved", value: countByStatus("RESOLVED"), color: "#4caf50" },
  ];

  return (
    <div className="dashboard-shell">
      <Sidebar selected={selected} setSelected={setSelected} />

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
            <>
              <Box sx={{ mb: 4 }}>
                <SummaryCards counts={summaryCounts} />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  mb: 4,
                  p: 3,
                  background: "var(--surface)",
                  borderRadius: "24px",
                  border: "1px solid var(--border-soft)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <div style={{ position: "relative", flex: 1, minWidth: "300px" }}>
                  <Search
                    size={20}
                    color="var(--text-muted)"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search for complaints..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: "0.8rem 1rem 0.8rem 2.8rem",
                      borderRadius: "14px",
                      border: "1px solid var(--border)",
                      background: "rgba(0,0,0,0.02)",
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                </div>
              </Box>

              <RecentComplaintsTable
                complaints={filteredComplaints.slice(0, 5)}
              />
            </>
          )}

          {selected === "All Complaints" && (
            <AllComplaintsCards
              complaints={filteredComplaints}
              onViewDetails={handleViewDetails}
            />
          )}

          {selected === "Profile" && <EditProfile />}
          {selected === "Feedback" && <OfficerFeedback />}
        </div>
      </div>

      {/* ✅ MODAL */}
      <UpdateGrievanceModal
        open={modalOpen}
        grievance={selectedComplaint}
        onClose={handleModalClose}
        onSubmit={async () => {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            "http://localhost:8081/api/officer/complaints",
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const fixedData = res.data.map((c) => ({
            ...c,
            imageUrl: normalizeImageUrl(c.imageUrl),
          }));

          setComplaints(fixedData);
        }}
      />
    </div>
  );
};

export default Dashboard;
