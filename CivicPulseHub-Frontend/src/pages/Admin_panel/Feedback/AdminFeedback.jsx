import React, { useEffect, useState } from "react";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    api.get("/api/admin/feedback/all")
      .then(res => {
        setFeedbacks(res.data);
        if (res.data.length > 0) {
          const avg = (res.data.reduce((sum, f) => sum + f.rating, 0) / res.data.length).toFixed(1);
          setAvgRating(avg);
        }
      })
      .catch(() => toast.error("Failed to load feedbacks. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  // Define the handleClick function to resolve the undefined error
  function handleClick() {
    console.log("Interactive element clicked");
  }

  if (loading) {
    return (
      <div style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "3rem",
        textAlign: "center",
        border: "1px solid var(--border-soft)",
      }}>
        <div style={{
          display: "inline-block",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "3px solid var(--primary)",
          borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading feedbacks...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
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
          No Feedback Yet
        </h2>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          Citizens haven't submitted any feedback yet
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
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{
          margin: "0 0 0.5rem",
          fontSize: "1.75rem",
          fontWeight: "700",
          color: "var(--text-primary)",
        }}>
          All Citizen Feedback
        </h1>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          System-wide feedback metrics and citizen reviews
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div style={{
          background: "linear-gradient(135deg, var(--accent-light) 0%, color-mix(in srgb, var(--accent) 5%, transparent) 100%)",
          borderRadius: "16px",
          padding: "1.25rem",
          border: "1px solid var(--accent-light)",
          textAlign: "center",
        }}>
          <p style={{
            margin: "0 0 0.5rem",
            fontSize: "0.8rem",
            fontWeight: "600",
            color: "var(--text-muted)",
            textTransform: "uppercase",
          }}>
            Total Feedbacks
          </p>
          <p style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: "700",
            color: "var(--accent)",
          }}>
            {feedbacks.length}
          </p>
        </div>

        <div style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
          borderRadius: "16px",
          padding: "1.25rem",
          border: "1px solid color-mix(in srgb, var(--primary) 50%, transparent)",
          textAlign: "center",
        }}>
          <p style={{
            margin: "0 0 0.5rem",
            fontSize: "0.8rem",
            fontWeight: "600",
            color: "rgba(255,255,255,0.8)",
            textTransform: "uppercase",
          }}>
            Average Rating
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <p style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: "700",
              color: "white",
            }}>
              {avgRating}
            </p>
            <Star size={24} fill="white" color="white" />
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, var(--text-muted) 0%, color-mix(in srgb, var(--text-muted) 80%, transparent) 100%)",
          borderRadius: "16px",
          padding: "1.25rem",
          border: "1px solid color-mix(in srgb, var(--text-muted) 30%, transparent)",
          textAlign: "center",
        }}>
          <p style={{
            margin: "0 0 0.5rem",
            fontSize: "0.8rem",
            fontWeight: "600",
            color: "rgba(255,255,255,0.8)",
            textTransform: "uppercase",
          }}>
            Avg Behaviour
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <p style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: "700",
              color: "white",
            }}>
              {feedbacks.length > 0
                ? (feedbacks.reduce((sum, f) => sum + f.officerBehaviourRating, 0) / feedbacks.length).toFixed(1)
                : "N/A"}
            </p>
            <TrendingUp size={24} color="white" />
          </div>
        </div>
      </div>

      <div style={{
        height: "1px",
        background: "var(--border-soft)",
        marginBottom: "2rem",
      }}></div>

      {/* Feedbacks Grid */}
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {feedbacks.map((f, i) => (
          <div
            key={`unique-key-${i}`}
            role="button"
            tabIndex={0}
            onClick={handleClick}
            style={{
              background: "color-mix(in srgb, var(--primary) 2%, transparent)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 4%, transparent)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 2%, transparent)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--border-soft)",
            }}>
              <div>
                <h3 style={{
                  margin: "0 0 0.25rem",
                  fontSize: "1.05rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}>
                  Complaint #{f.complaintId}
                </h3>
                <p style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}>
                  {f.complaintTitle}
                </p>
              </div>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}>
                <span style={{
                  display: "inline-block",
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}>
                  {f.complaintCategory}
                </span>
              </div>
            </div>

            {/* Citizen Info */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}>
              <div>
                <p style={{
                  margin: "0 0 0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Citizen
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}>
                  {f.citizenName}
                </p>
                <p style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}>
                  📍 {f.citizenLocation}
                </p>
              </div>
            </div>

            {/* Ratings */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}>
              {/* Overall Rating */}
              <div style={{
                background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid var(--accent-light)",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Overall Rating
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  marginBottom: "0.5rem",
                }}>
                  {[...new Array(5)].map((_, j) => (
                    <Star
                      key={`unique-key-${j}`}
                      size={18}
                      fill={j < f.rating ? "var(--accent)" : "transparent"}
                      color={j < f.rating ? "var(--accent)" : "var(--border)"}
                    />
                  ))}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "var(--accent)",
                }}>
                  {f.rating}/5
                </p>
              </div>

              {/* Behaviour Rating */}
              <div style={{
                background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Behaviour Rating
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                  marginBottom: "0.5rem",
                }}>
                  {[...new Array(5)].map((_, j) => (
                    <Star
                      key={`unique-key-${j}`}
                      size={18}
                      fill={j < f.officerBehaviourRating ? "var(--primary)" : "transparent"}
                      color={j < f.officerBehaviourRating ? "var(--primary)" : "var(--border)"}
                    />
                  ))}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "var(--primary)",
                }}>
                  {f.officerBehaviourRating}/5
                </p>
              </div>

              {/* Timeliness */}
              <div style={{
                background: "color-mix(in srgb, var(--text-muted) 8%, transparent)",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid color-mix(in srgb, var(--text-muted) 30%, transparent)",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Timeliness
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  padding: "0.75rem 0",
                }}>
                  {f.timeliness === "ON_TIME" && "⏱ On Time"}
                  {f.timeliness === "SLIGHT_DELAY" && "⏳ Slight Delay"}
                  {f.timeliness === "VERY_LATE" && "🐢 Very Late"}
                </p>
              </div>
            </div>

            {/* Comment */}
            {f.feedbackComment && (
              <div style={{
                background: "color-mix(in srgb, var(--text-primary) 3%, transparent)",
                borderRadius: "12px",
                padding: "1rem",
                borderLeft: "3px solid var(--primary)",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Comment
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  color: "var(--text-primary)",
                  lineHeight: 1.6,
                }}>
                  "{f.feedbackComment}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedback;
