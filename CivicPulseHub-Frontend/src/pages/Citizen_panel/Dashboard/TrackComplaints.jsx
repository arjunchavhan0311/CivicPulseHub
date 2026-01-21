import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";

const TrackComplaints = ({ initialComplaints, loading, token }) => {
  const [complaints, setComplaints] = useState(initialComplaints || []);
  const [updatedComplaintId, setUpdatedComplaintId] = useState(null);

  const stageOrder = ["REGISTERED", "VERIFIED", "IN_PROGRESS", "ACTION_TAKEN", "RESOLVED"];
  const stageLabels = ["Registered", "Verified", "In Progress", "Action Taken", "Resolved"];

  const mapStatusToStage = (status) => {
    switch (status) {
      case "PENDING":
        return "REGISTERED";
      case "IN_PROGRESS":
        return "IN_PROGRESS";
      case "RESOLVED":
        return "RESOLVED";
      case "REJECTED":
        return "ACTION_TAKEN";
      case "REOPENED":
        return "VERIFIED";
      default:
        return "REGISTERED";
    }
  };

  useEffect(() => {
    if (!token) return;

    const socket = new SockJS("http://localhost:8081/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log("STOMP: " + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log("✅ TrackComplaints WS connected");

        stompClient.subscribe("/user/queue/notify", (message) => {
          const payload = JSON.parse(message.body);
          console.log("🟢 TrackComplaints received notification:", payload);

          setComplaints((prev) =>
            prev.map((c) =>
              c.id === payload.complaintId
                ? { ...c, status: payload.status }
                : c
            )
          );

          setUpdatedComplaintId(payload.complaintId);
          setTimeout(() => setUpdatedComplaintId(null), 5000);
        });
      },
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [token]);

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
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading complaints...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!complaints || complaints.length === 0) {
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
          <AlertCircle size={48} color="var(--text-muted)" strokeWidth={1.5} />
        </div>
        <h2 style={{
          margin: "0 0 0.5rem",
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "var(--text-primary)",
        }}>
          No Complaints Yet
        </h2>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          Submit your first complaint to start tracking progress
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
          Track Your Complaints
        </h1>
        <p style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          Monitor the progress of your submitted grievances in real-time
        </p>
      </div>

      <div style={{
        height: "1px",
        background: "var(--border-soft)",
        marginBottom: "2rem",
      }}></div>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {complaints.map((c) => {
          const mappedStage = mapStatusToStage(c.status);
          const activeStep = stageOrder.indexOf(mappedStage);
          const isUpdated = c.id === updatedComplaintId;

          return (
            <div
              key={c.id}
              style={{
                background: isUpdated
                  ? "linear-gradient(135deg, var(--accent-light) 0%, color-mix(in srgb, var(--accent) 5%, transparent) 100%)"
                  : "color-mix(in srgb, var(--primary) 2%, transparent)",
                border: `1.5px solid ${isUpdated ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "16px",
                padding: "1.75rem",
                transition: "all 0.3s ease",
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
              }}>
                <div>
                  <h3 style={{
                    margin: "0 0 0.5rem",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}>
                    {c.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}>
                    Complaint ID: <strong>#{c.id}</strong>
                  </p>
                </div>
                {isUpdated && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "var(--accent)",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    animation: "pulse 1s ease-in-out infinite",
                  }}>
                    <Zap size={14} />
                    Updated
                  </div>
                )}
              </div>

              {/* Info Row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid var(--border-soft)",
              }}>
                <div>
                  <p style={{
                    margin: "0 0 0.25rem",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Status
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "var(--primary)",
                  }}>
                    {mappedStage.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p style={{
                    margin: "0 0 0.25rem",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    Submitted
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}>
                    {c.submissionDate
                      ? new Date(c.submissionDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Progress Timeline */}
              <div>
                <p style={{
                  margin: "0 0 1rem",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Progress Timeline
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  position: "relative",
                }}>
                  {stageLabels.map((label, idx) => {
                    const isCompleted = idx <= activeStep;
                    const isCurrent = idx === activeStep;

                    return (
                      <div key={label} style={{ display: "flex", alignItems: "center", flex: 1, position: "relative" }}>
                        {/* Connector Line */}
                        {idx < stageLabels.length - 1 && (
                          <div
                            style={{
                              position: "absolute",
                              left: "calc(50% + 20px)",
                              top: "20px",
                              width: "calc(100% - 40px)",
                              height: "2px",
                              background: isCompleted
                                ? "linear-gradient(90deg, var(--primary), var(--primary-strong))"
                                : "var(--border-soft)",
                              zIndex: 0,
                            }}
                          ></div>
                        )}

                        {/* Step Circle */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: isCompleted
                              ? isCurrent
                                ? "linear-gradient(135deg, var(--primary), var(--primary-strong))"
                                : "linear-gradient(135deg, var(--primary), var(--primary-strong))"
                              : "var(--border)",
                            color: isCompleted ? "white" : "var(--text-muted)",
                            fontWeight: "700",
                            fontSize: "0.75rem",
                            zIndex: 1,
                            position: "relative",
                            transition: "all 0.3s ease",
                            boxShadow: isCurrent
                              ? "0 0 0 8px rgba(43, 80, 255, 0.15)"
                              : "none",
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={20} strokeWidth={3} />
                          ) : (
                            <Clock size={18} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Labels Below */}
                <div style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                  position: "relative",
                }}>
                  {stageLabels.map((label, idx) => (
                    <div key={label} style={{ flex: 1, textAlign: "center" }}>
                      <p style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default TrackComplaints;
