import React from "react";
import { Trash2, Bell } from "lucide-react";
import useAdminWebSocket from "../../hooks/useAdminWebSocket";

const AdminNotifications = () => {
  const { notifications, deleteNotification } = useAdminWebSocket();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>Admin Notifications</h1>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
          <Bell size={48} />
          <p>No notifications yet</p>
        </div>
      ) : (
        notifications.map((note, idx) => (
          <div
            key={idx}
            style={{
              padding: "1rem",
              border: "1px solid #3b82f6",
              borderRadius: "10px",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {note.message}{" "}
              {note.complaintId ? `(Complaint #${note.complaintId})` : ""}
            </div>
            <button
              onClick={() => deleteNotification(idx)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminNotifications;