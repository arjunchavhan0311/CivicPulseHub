import React from "react";
import {
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";

const SummaryCards = ({ counts }) => {
  const getIcon = (label) => {
    switch (label) {
      case "Pending": return Clock;
      case "Escalated": return AlertCircle;
      case "In Progress": return Loader2;
      case "Resolved": return CheckCircle2;
      default: return Clock;
    }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "1.5rem"
    }}>
      {counts.map((card) => {
        const Icon = getIcon(card.label);
        return (
          <div
            key={card.label}
            style={{
              background: "var(--surface)",
              padding: "1.75rem",
              borderRadius: "24px",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--card-shadow)",
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              transition: "transform 0.2s ease, border-color 0.2s ease",
              cursor: "default"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = card.color;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--border-soft)";
            }}
          >
            <div style={{
              padding: "12px",
              borderRadius: "14px",
              background: `color-mix(in srgb, ${card.color} 12%, transparent)`,
              color: card.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Icon size={24} strokeWidth={2.5} />
            </div>

            <div>
              <div style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px"
              }}>
                {card.label}
              </div>
              <div style={{
                fontSize: "1.75rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                lineHeight: 1
              }}>
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
