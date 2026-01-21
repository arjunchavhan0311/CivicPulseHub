import React from "react";
import { MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";

const FeedbackList = ({ complaints, onSelectComplaint }) => {
  const propTypes = {
    complaints: "array",
    onSelectComplaint: "function",
  };
  const resolvedComplaints = complaints.filter(
    (c) => c.status === "RESOLVED"
  );

  if (resolvedComplaints.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "4rem 2rem",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
        textAlign: "center",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}>
          <MessageSquare size={48} color="var(--text-muted)" strokeWidth={1.5} />
        </div>
        <h2 style={{
          margin: "0 0 0.5rem",
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "var(--text-primary)",
        }}>
          No Resolved Complaints Yet
        </h2>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          Once your complaints are resolved, you can share feedback here
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "24px",
      padding: "2.5rem",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{
          margin: "0 0 0.5rem",
          fontSize: "1.75rem",
          fontWeight: "700",
          color: "var(--text-primary)",
        }}>
          Share Your Feedback
        </h1>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          Help us improve by rating your experience with resolved complaints
        </p>
      </div>

      <div style={{
        height: "1px",
        background: "var(--border-soft)",
        marginBottom: "2rem",
      }}></div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {resolvedComplaints.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectComplaint(c)}
            style={{
              background: "color-mix(in srgb, var(--primary) 3%, transparent)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 6%, transparent)";
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 3%, transparent)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", textAlign: "left", flex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
              }}>
                <CheckCircle2 size={22} color="white" />
              </div>
              <div>
                <h3 style={{
                  margin: "0 0 0.25rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}>
                  {c.title}
                </h3>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <span style={{
                    display: "inline-block",
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                  }}>
                    {c.category}
                  </span>
                  <span style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                  }}>
                    ID: {c.id}
                  </span>
                </div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--primary)",
              fontWeight: "600",
            }}>
              Give Feedback
              <ArrowRight size={18} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;
