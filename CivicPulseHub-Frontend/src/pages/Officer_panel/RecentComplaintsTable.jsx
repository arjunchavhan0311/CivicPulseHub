import React, { useState, useEffect } from "react";
import {
  Maximize2,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { statusColor, priorityColor } from "./helpers";

const BACKEND_URL = "http://localhost:8081";

/* ✅ Normalize image URLs */
const resolveImageUrl = (url) => {
  if (!url || url.trim() === "") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return encodeURI(url);
  }
  return encodeURI(`${BACKEND_URL}${url}`);
};

const RecentComplaintsTable = ({ complaints }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);

  /* ESC key close */
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setPreviewImage(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
      case "IN_PROGRESS":
        return <Clock size={14} />;
      case "RESOLVED":
        return <CheckCircle2 size={14} />;
      case "ESCALATED":
        return <AlertCircle size={14} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        padding: "2rem",
        borderRadius: "24px",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <div
          style={{
            padding: 8,
            borderRadius: 10,
            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
            color: "var(--primary)",
          }}
        >
          <FileText size={20} />
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
          Recent Grievances
        </h2>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
          <thead>
            <tr>
              {[
                "ID",
                "Complaint Title",
                "Category",
                "Status",
                "Priority",
                "Citizen Evidence",
                "Officer Evidence",
                "Target Date",
              ].map((head) => (
                <th
                  key={head}
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "3rem" }}>
                  No complaints assigned to you yet.
                </td>
              </tr>
            ) : (
              complaints.map((c) => {
                const citizenImage = resolveImageUrl(c.imageUrl);
                const officerImage = resolveImageUrl(c.officerEvidenceUrl);

                return (
                  <tr key={c.id}>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>#{c.id}</td>
                    <td style={{ padding: "1rem", fontWeight: 700 }}>{c.title}</td>
                    <td style={{ padding: "1rem" }}>{c.category}</td>

                    <td style={{ padding: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 10,
                          fontWeight: 700,
                          background: `color-mix(in srgb, ${statusColor(c.status)} 10%, transparent)`,
                          color: statusColor(c.status),
                        }}
                      >
                        {getStatusIcon(c.status)}
                        {c.status}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          background: priorityColor(c.priority).bg,
                          color: priorityColor(c.priority).color,
                          border: priorityColor(c.priority).border,
                        }}
                      >
                        {c.priority}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      {citizenImage ? (
                        <ImageThumb
                          src={citizenImage}
                          onClick={() => setPreviewImage(citizenImage)}
                          hovered={hoveredImage === `citizen-${c.id}`}
                          onEnter={() => setHoveredImage(`citizen-${c.id}`)}
                          onLeave={() => setHoveredImage(null)}
                        />
                      ) : (
                        "No image"
                      )}
                    </td>

                    <td style={{ padding: "1rem" }}>
                      {officerImage ? (
                        <ImageThumb
                          src={officerImage}
                          onClick={() => setPreviewImage(officerImage)}
                          hovered={hoveredImage === `officer-${c.id}`}
                          onEnter={() => setHoveredImage(`officer-${c.id}`)}
                          onLeave={() => setHoveredImage(null)}
                        />
                      ) : (
                        "No image"
                      )}
                    </td>

                    <td style={{ padding: "1rem" }}>
                      {c.expectedCompletionDate
                        ? new Date(c.expectedCompletionDate).toLocaleDateString()
                        : "TBD"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 NICE PREVIEW MODAL */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111",
              borderRadius: 20,
              width: "80%",
              maxWidth: 900,
              animation: "zoomIn 0.25s ease",
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              <strong>Evidence Preview</strong>
              <X
                size={20}
                style={{ cursor: "pointer", opacity: 0.8 }}
                onClick={() => setPreviewImage(null)}
              />
            </div>

            {/* Image */}
            <div style={{ padding: 16, textAlign: "center" }}>
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  borderRadius: 14,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 🔹 Thumbnail */
const ImageThumb = ({ src, onClick, hovered, onEnter, onLeave }) => (
  <div
    style={{ position: "relative", width: 45, height: 45, cursor: "pointer" }}
    onClick={onClick}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  >
    <img
      src={src}
      alt="Evidence"
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
    />
    {hovered && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
        }}
      >
        <Maximize2 size={16} color="#fff" />
      </div>
    )}
  </div>
);

export default RecentComplaintsTable;