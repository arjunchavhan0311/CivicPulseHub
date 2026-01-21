import React, { useState } from "react";
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Maximize2
} from "lucide-react";

/* STATUS → PROGRESS MAPPING */
const getProgressByStatus = (status) => {
  switch (status) {
    case "PENDING": return 0;
    case "ASSIGNED": return 10;
    case "IN_PROGRESS": return 50;
    case "ESCALATED": return 75;
    case "RESOLVED": return 100;
    default: return 0;
  }
};

const BACKEND_URL = "http://localhost:8081";

const AllComplaintsCards = ({ complaints, onViewDetails }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
      case "IN_PROGRESS": return <Clock size={16} />;
      case "RESOLVED": return <CheckCircle2 size={16} />;
      case "ESCALATED": return <AlertCircle size={16} />;
      default: return null;
    }
  };

  if (!complaints || complaints.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "5rem 2rem",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
        textAlign: "center",
      }}>
        <FileText size={56} style={{ opacity: 0.5 }} />
        <h2>No Grievances Assigned</h2>
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "2rem"
      }}>
        {complaints.map((c) => {
          const isResolved = c.status === "RESOLVED";
          const progress = getProgressByStatus(c.status);

          // Determine which image to show and its label
          let imageUrl = null;
          let imageLabel = "";
          if (c.officerEvidenceUrl) {
            imageUrl = encodeURI(`${BACKEND_URL}${c.officerEvidenceUrl}`);
            imageLabel = "Officer Evidence";
          } else if (c.imageUrl) {
            imageUrl = encodeURI(`${c.imageUrl}`);
            imageLabel = "Citizen Photo";
          }

          return (
            <div
              key={c.id}
              style={{
                background: "var(--surface)",
                borderRadius: "32px",
                border: "1px solid var(--border-soft)",
                boxShadow: "var(--card-shadow)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* IMAGE */}
              <div style={{ height: "220px", overflow: "hidden", position: "relative" }}>
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={c.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                      onClick={() => setPreviewImage(imageUrl)}
                    />
                    {/* Image Label */}
                    <span style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "500"
                    }}>
                      {imageLabel}
                    </span>
                    {/* Hover Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                      className="hover-overlay"
                    >
                      <Maximize2 size={20} color="#fff" />
                    </div>
                  </>
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f3f4f6",
                    color: "#9ca3af",
                    fontSize: "0.9rem"
                  }}>
                    No Image
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div style={{ padding: "1rem 1.75rem", flex: 1 }}>
                <h3>{c.title}</h3>

                <p style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={14} />
                  {isResolved
                    ? `Resolved: ${new Date(c.resolutionDate).toLocaleDateString()}`
                    : "Resolution Pending"}
                </p>

                {/* PROGRESS BAR */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ height: "10px", background: "#eee", borderRadius: "5px" }}>
                    <div style={{
                      width: `${progress}%`,
                      height: "100%",
                      borderRadius: "5px",
                      background: isResolved ? "#10b981" : "#3b82f6"
                    }} />
                  </div>
                </div>

                {/* ACTION */}
                <button
                  onClick={() => !isResolved && onViewDetails(c)}
                  disabled={isResolved}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "12px",
                    background: isResolved ? "#d1d5db" : "#3b82f6",
                    color: "white",
                    border: "none",
                    cursor: isResolved ? "not-allowed" : "pointer",
                  }}
                >
                  {isResolved ? "Complaint Resolved" : "Manage Grievance"}
                  {!isResolved && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out"
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "24px"
            }}
          />
        </div>
      )}
    </>
  );
};

export default AllComplaintsCards;