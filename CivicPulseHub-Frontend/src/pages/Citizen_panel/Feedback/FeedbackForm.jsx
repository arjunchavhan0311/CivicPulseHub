import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import api from "../../../api/axios";

const FeedbackForm = ({ complaint, onBack }) => {
  const [form, setForm] = useState({
    rating: 0,
    officerBehaviourRating: 0,
    resolutionStatus: "",
    timeliness: "",
    feedbackComment: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (
      form.rating === 0 ||
      form.officerBehaviourRating === 0 ||
      !form.resolutionStatus ||
      !form.timeliness
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        `/api/citizen/feedback/submit/${complaint.id}`,
        form
      );
      alert("Feedback submitted successfully!");
      onBack();
    } catch (err) {
      alert("Feedback already submitted or failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, onChange) => (
    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Star
            size={32}
            fill={star <= value ? "var(--accent)" : "transparent"}
            color={star <= value ? "var(--accent)" : "var(--border)"}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "2.5rem",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.75rem",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          Share Your Feedback
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: "0.95rem",
          }}
        >
          Help us improve by sharing your experience about complaint #
          {complaint.id}
        </p>
      </div>

      <div
        style={{
          height: "1px",
          background: "var(--border-soft)",
          marginBottom: "2rem",
        }}
      />

      <div style={{ display: "grid", gap: "2rem" }}>
        <div>
          <label style={{ fontWeight: 600 }}>
            Overall Experience Rating *
          </label>
          {renderStars(form.rating, (v) =>
            setForm({ ...form, rating: v })
          )}
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>
            Officer Behaviour Rating *
          </label>
          {renderStars(form.officerBehaviourRating, (v) =>
            setForm({ ...form, officerBehaviourRating: v })
          )}
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>
            Resolution Status *
          </label>
          <select
            value={form.resolutionStatus}
            onChange={(e) =>
              setForm({ ...form, resolutionStatus: e.target.value })
            }
            style={{ width: "100%", padding: "0.8rem" }}
          >
            <option value="">Select status...</option>
            <option value="RESOLVED">Fully Resolved</option>
            <option value="PARTIALLY_RESOLVED">Partially Resolved</option>
            <option value="NOT_RESOLVED">Not Resolved</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>
            Resolution Timeliness *
          </label>
          <select
            value={form.timeliness}
            onChange={(e) =>
              setForm({ ...form, timeliness: e.target.value })
            }
            style={{ width: "100%", padding: "0.8rem" }}
          >
            <option value="">Select timeliness...</option>
            <option value="ON_TIME">On Time</option>
            <option value="SLIGHT_DELAY">Slight Delay</option>
            <option value="VERY_LATE">Very Late</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>
            Additional Comments (Optional)
          </label>
          <textarea
            rows="4"
            value={form.feedbackComment}
            onChange={(e) =>
              setForm({ ...form, feedbackComment: e.target.value })
            }
            style={{ width: "100%", padding: "0.8rem" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: "1rem",
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <Send size={18} /> Submit Feedback
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          style={{
            padding: "1rem",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;
