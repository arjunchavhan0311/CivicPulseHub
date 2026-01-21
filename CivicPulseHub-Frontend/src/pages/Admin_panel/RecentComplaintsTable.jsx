import React, { useState } from "react";
import {
  Chip,
  Box,
  Modal,
} from "@mui/material";
import { statusColor, priorityColor } from "./helpers";
import { Maximize2 } from "lucide-react";

const RecentComplaintsTable = ({ complaints }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageClick = (url) => setPreviewImage(url);
  const handleClose = () => setPreviewImage(null);

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "24px",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
      overflow: "hidden",
      marginTop: "1.5rem"
    }}>
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border-soft)" }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>Recent Complaints</h3>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.02)" }}>
              <th style={{ padding: "1rem 2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>ID</th>
              <th style={{ padding: "1rem 2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Title</th>
              <th style={{ padding: "1rem 2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Category</th>
              <th style={{ padding: "1rem 2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Status</th>
              <th style={{ padding: "1rem 2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Priority</th>
              <th style={{ padding: "1rem 2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Evidence</th>
              <th style={{ padding: "1rem 2rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Resolution</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No recent complaints found.
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border-soft)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.01)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1.25rem 2rem", fontWeight: "600", color: "var(--primary)" }}>#{c.id}</td>
                  <td style={{ padding: "1.25rem 2rem", fontWeight: "500" }}>{c.title}</td>
                  <td style={{ padding: "1.25rem 2rem" }}>
                    <span style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "8px",
                      background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                      color: "var(--primary)",
                      fontSize: "0.85rem",
                      fontWeight: "600"
                    }}>
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: "1.25rem 2rem" }}>
                    <Chip
                      label={c.status}
                      color={statusColor(c.status)}
                      size="small"
                      sx={{ fontWeight: "700", borderRadius: "8px" }}
                    />
                  </td>
                  <td style={{ padding: "1.25rem 2rem" }}>
                    <Chip
                      label={c.priority}
                      color={priorityColor(c.priority)}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: "700", borderRadius: "8px" }}
                    />
                  </td>
                  <td style={{ padding: "1.25rem 2rem" }}>
                    <div style={{ position: "relative", width: "48px", height: "48px", cursor: "pointer" }}
                      onClick={() => c.imageUrl && handleImageClick(`http://localhost:8081${c.imageUrl}`)}>
                      <img
                        src={c.imageUrl ? `http://localhost:8081${c.imageUrl}` : "https://via.placeholder.com/48"}
                        alt={c.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                      />
                      {c.imageUrl && (
                        <div style={{
                          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                          background: "rgba(0,0,0,0.3)", borderRadius: "10px", display: "flex",
                          alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s"
                        }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                          <Maximize2 size={16} color="white" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {c.resolutionDate
                      ? new Date(c.resolutionDate).toLocaleString("en-IN", {
                        dateStyle: "medium",
                      })
                      : "Pending"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!previewImage}
        onClose={handleClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2, backdropFilter: "blur(4px)" }}
      >
        <Box
          component="img"
          src={previewImage}
          alt="Preview"
          sx={{ maxHeight: "85vh", maxWidth: "85vw", borderRadius: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "4px solid white" }}
        />
      </Modal>
    </div>
  );
};

export default RecentComplaintsTable;
