import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useThemePreference } from "../../../hooks/useThemePreference.js";

import Sidebar from "./Sidebar";
import ComplaintsTable from "./ComplaintsTable";
import NotificationsList from "./NotificationsList";
import SubmitGrievance from "./SubmitGrievance";
import TrackComplaints from "./TrackComplaints";
import FeedbackContainer from "../Feedback/FeedbackContainer";
import Profile from "./Profile";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemePreference();

  const [selected, setSelected] = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);

  const token = localStorage.getItem("token");

  // ================= AUTH CHECK =================
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  // ================= FETCH COMPLAINTS =================
  const fetchComplaints = useCallback(async () => {
    try {
      setComplaintLoading(true);

      const res = await fetch("http://localhost:8081/api/citizen/complaints", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();
      console.log("📦 Complaints from API:", data);

      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching complaints:", error);
      setComplaints([]);
    } finally {
      setComplaintLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ================= WEBSOCKET NOTIFICATIONS =================
  const initializeWebSocket = useCallback(async () => {
    try {
      const { Client } = await import("@stomp/stompjs");
      const { default: SockJS } = await import("sockjs-client");

      const socket = new SockJS("http://localhost:8081/ws");
      const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (str) => console.log("STOMP: " + str),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log("✅ WebSocket connected");
          subscribeToNotifications(stompClient);
        },
      });

      stompClient.activate();
      return stompClient;
    } catch (error) {
      console.error("WebSocket initialization error:", error);
      return null;
    }
  }, [token]);

  const subscribeToNotifications = useCallback((stompClient) => {
    stompClient.subscribe("/user/queue/notify", (message) => {
      const payload = JSON.parse(message.body);
      console.log("🟢 Received notification:", payload);

      // Update complaint list live
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === payload.complaintId
            ? { ...c, status: payload.status || payload.message }
            : c
        )
      );

      // Add notification to notifications list
      const messageText = `Complaint #${payload.complaintId} status updated to ${payload.status}`;
      setNotifications((prev) => [messageText, ...prev]);
    });
  }, []);

  useEffect(() => {
    if (!token) return;

    let stompClient;
    initializeWebSocket().then((client) => {
      stompClient = client;
    });

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [token, initializeWebSocket]);

  return (
    <div className="dashboard-shell">
      <Sidebar selected={selected} setSelected={setSelected} notifications={notifications} navigate={navigate} />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-header-title">Citizen Dashboard</h1>
          
          <div className="dashboard-header-actions">
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <div className="dashboard-body">
          {selected === "Dashboard" && (
            <ComplaintsTable
              complaints={complaints}
              loading={complaintLoading}
              fetchComplaints={fetchComplaints}
              onFeedback={(complaint) => {
                setFeedbackComplaint(complaint);
                setSelected("Feedback");
              }}
            />
          )}

          {selected === "Submit Grievance" && (
            <SubmitGrievance complaints={complaints} setComplaints={setComplaints} />
          )}

          {selected === "Track Complaints" && (
            <TrackComplaints
              initialComplaints={complaints}
              loading={complaintLoading}
              token={token}
            />
          )}

          {selected === "Notifications" && (
            <NotificationsList
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}

          {selected === "Feedback" && (
            <FeedbackContainer
              complaints={complaints}
              selectedComplaint={feedbackComplaint}
              clearSelection={() => setFeedbackComplaint(null)}
            />
          )}

          {selected === "My Profile" && (
            <Profile navigate={navigate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

