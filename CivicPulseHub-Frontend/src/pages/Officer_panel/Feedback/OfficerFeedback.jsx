import React, { useEffect, useState } from "react";
import { Star, MessageSquare, Quote } from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const OfficerFeedback = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);
  const [feedbackMap, setFeedbackMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch complaints and feedbacks together
        const [complaintsRes, feedbacksRes] = await Promise.all([
          api.get("/api/officer/complaints"),
          api.get("/api/officer/feedbacks"),
        ]);

        setComplaints(complaintsRes.data);

        // Map feedbacks by complaintId for quick lookup
        const map = {};
        feedbacksRes.data.forEach((f) => {
          map[f.complaintId] = f;
        });
        setFeedbackMap(map);
      } catch (err) {
        toast.error("Failed to load complaints or feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleFeedback = (complaintId) => {
    setExpandedComplaintId(
      expandedComplaintId === complaintId ? null : complaintId
    );
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  if (!complaints.length)
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <MessageSquare size={48} />
        <p>No complaints found</p>
      </div>
    );

  return (
    <div style={{ padding: "2.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
        Hear from the Citizens...
      </h1>
      <p style={{ color: "var(--text-muted)", display: "flex", gap: 8 }}>
        <Quote size={18} /> Feedback per resolved complaint
      </p>

      <div style={{ display: "grid", gap: "1.75rem", marginTop: "2rem" }}>
        {complaints.map((c) => {
          const feedback = feedbackMap[c.id];
          const isOpen = expandedComplaintId === c.id;

          return (
            <div
              key={c.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-soft)",
                borderRadius: "18px",
                padding: "1.75rem",
                boxShadow: "var(--card-shadow)",
              }}
            >
              {/* Complaint Header */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                    Complaint #{c.id}
                  </h3>
                  <p style={{ marginTop: 4, color: "var(--text-muted)" }}>
                    🛠 {c.title}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleFeedback(c.id)}
                  style={{
                    background: isOpen ? "#eee" : "var(--primary)",
                    color: isOpen ? "#333" : "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.55rem 1.2rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {isOpen ? "Hide Feedback" : feedback ? "View Feedback" : "No Feedback"}
                </button>
              </div>

              {/* Feedback Section */}
              {isOpen && feedback && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1.5rem",
                    borderRadius: "14px",
                    background: "color-mix(in srgb, var(--primary) 4%, transparent)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  {/* Ratings */}
                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                    {[
                      { label: "Overall", value: feedback.rating },
                      { label: "Behaviour", value: feedback.officerBehaviourRating },
                    ].map((r) => (
                      <div key={r.label}>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {r.label.toUpperCase()}
                        </p>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              fill={i < r.value ? "var(--primary)" : "transparent"}
                              color={i < r.value ? "var(--primary)" : "#ccc"}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
                    <Badge text={feedback.timeliness.replace("_", " ")} />
                    <Badge text={feedback.resolutionStatus} success />
                    <Badge text={feedback.reopened ? "Reopened" : "Not Reopened"} />
                  </div>

                  {/* Comment */}
                  {feedback.feedbackComment && (
                    <div
                      style={{
                        marginTop: "1.25rem",
                        padding: "1rem",
                        borderLeft: "4px solid var(--primary)",
                        background: "#fff",
                        borderRadius: "8px",
                      }}
                    >
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        CITIZEN COMMENT
                      </p>
                      <p style={{ fontSize: "0.95rem" }}>“{feedback.feedbackComment}”</p>
                    </div>
                  )}

                  {/* Optional Image */}
                  {feedback.feedbackImageUrl && (
                    <img
                      src={feedback.feedbackImageUrl}
                      alt="Feedback"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                        marginTop: "1rem",
                        borderRadius: "12px",
                      }}
                    />
                  )}

                  <p
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Submitted on {new Date(feedback.feedbackSubmittedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* Small Badge Component */
const Badge = ({ text, success }) => (
  <span
    style={{
      padding: "0.35rem 0.75rem",
      borderRadius: "999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      background: success
        ? "color-mix(in srgb, green 15%, transparent)"
        : "color-mix(in srgb, var(--text-muted) 12%, transparent)",
    }}
  >
    {text}
  </span>
);

export default OfficerFeedback;