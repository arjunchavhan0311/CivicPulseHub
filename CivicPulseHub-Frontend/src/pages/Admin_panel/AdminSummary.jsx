import React from "react";
import {
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

/**
 * Returns an icon based on the summary label.
 */
const getIcon = (label) => {
  switch (label.toUpperCase()) {
    case "PENDING": return <Clock size={24} />;
    case "IN PROGRESS": return <Activity size={24} />;
    case "RESOLVED": return <CheckCircle2 size={24} />;
    case "ESCALATED": return <AlertTriangle size={24} />;
    default: return <Activity size={24} />;
  }
};

const AdminSummaryCards = ({ counts }) => {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "1.5rem",
      width: "100%"
    }}>
      {counts.map((card) => (
        <div
          key={card.label}
          style={{
            background: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "24px",
            border: "1px solid var(--border-soft)",
            boxShadow: "var(--card-shadow)",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 25px 50px rgba(0,0,0,0.1)";
            e.currentTarget.style.borderColor = card.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--card-shadow)";
            e.currentTarget.style.borderColor = "var(--border-soft)";
          }}
        >
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: `color-mix(in srgb, ${card.color} 12%, transparent)`,
            color: card.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            {getIcon(card.label)}
          </div>
          <div>
            <div style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.25rem"
            }}>
              {card.label}
            </div>
            <div style={{
              fontSize: "1.85rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              lineHeight: 1
            }}>
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminSummaryCards;
