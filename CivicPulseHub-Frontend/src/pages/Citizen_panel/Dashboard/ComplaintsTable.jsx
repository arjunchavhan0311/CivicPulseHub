import React, { useState } from "react";
import PropTypes from "prop-types";
import { Trash2, Eye, MessageSquare, Search } from "lucide-react";

const BACKEND_URL = "http://localhost:8081";

const ComplaintsTable = ({
  complaints,
  loading,
  fetchComplaints,
  onFeedback,
}) => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!globalThis.confirm("Delete this complaint?")) return;

    try {
      await fetch(`${BACKEND_URL}/api/citizen/complaints/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      fetchComplaints?.();
    } catch {
      alert("Delete failed");
    }
  };

  const filteredComplaints = complaints.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return { bg: "rgba(255, 152, 0, 0.1)", color: "#ff9800", text: "Pending" };
      case "IN_PROGRESS":
        return { bg: "rgba(33, 150, 243, 0.1)", color: "#2196f3", text: "In Progress" };
      case "RESOLVED":
        return { bg: "rgba(76, 175, 80, 0.1)", color: "#4caf50", text: "Resolved" };
      default:
        return { bg: "rgba(158, 158, 158, 0.1)", color: "#9e9e9e", text: status };
    }
  };

  const renderComplaintsList = () => {
    if (loading) {
      return (
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>Loading complaints...</div>
        </div>
      );
    }

    if (filteredComplaints.length === 0) {
      return (
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
            No complaints found. Start by submitting a new grievance!
          </div>
        </div>
      );
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-soft)" }}>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Title</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Category</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Image</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c) => {
              const statusStyle = getStatusStyle(c.status);
              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: "1px solid var(--border-soft)",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 5%, transparent)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "1rem", color: "var(--text-primary)", fontSize: "0.95rem" }}>{c.id}</td>
                  <td style={{ padding: "1rem", color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: "500" }}>{c.title}</td>
                  <td style={{ padding: "1rem", color: "var(--text-primary)", fontSize: "0.95rem" }}>{c.category}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.5rem 1rem",
                      borderRadius: "999px",
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}>
                      {statusStyle.text}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {c.imageUrl ? (
                      <img
                        src={`${BACKEND_URL}${c.imageUrl}`}
                        alt="complaint"
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                        }}
                      />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleView(c)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "transparent",
                          border: "1px solid var(--primary)",
                          borderRadius: "10px",
                          color: "var(--primary)",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--primary)";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--primary)";
                        }}
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                          type="button"
                          disabled={c.status === "RESOLVED"}
                          onClick={() => handleDelete(c.id)}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "transparent",
                            border: "1px solid var(--accent)",
                            borderRadius: "10px",
                            color: "var(--accent)",
                            cursor: c.status === "RESOLVED" ? "not-allowed" : "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            opacity: c.status === "RESOLVED" ? 0.4 : 1,
                            pointerEvents: c.status === "RESOLVED" ? "none" : "auto",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>

                     {c.status === "RESOLVED" && (
                      <button
                        type="button"
                        disabled={!!c.feedback}
                        onClick={() => onFeedback(c)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: c.feedback
                            ? "#e5e7eb"
                            : "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                          border: "none",
                          borderRadius: "10px",
                          color: c.feedback ? "#6b7280" : "white",
                          cursor: c.feedback ? "not-allowed" : "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          opacity: c.feedback ? 0.6 : 1,
                          pointerEvents: c.feedback ? "none" : "auto",
                        }}
                      >
                        <MessageSquare size={16} />
                        {c.feedback ? "Feedback Submitted" : "Feedback"}
                      </button>
                    )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* ===== Stats Cards ===== */}
      <section aria-label="Complaints Statistics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <article
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-soft)",
            borderRadius: "20px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "var(--card-shadow)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 40px 80px rgba(43, 80, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--card-shadow)";
          }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Total Complaints
          </h3>
          <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", color: "var(--primary)" }}>
            {complaints.length}
          </p>
        </article>
      </section>

      {/* ===== Search Bar ===== */}
      <div style={{ marginBottom: "2rem" }}>
        <label htmlFor="complaint-search" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>
          Search Complaints
        </label>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "0.75rem 1rem",
          transition: "border 0.2s ease, box-shadow 0.2s ease",
        }}>
          <Search size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} aria-hidden="true" />
          <input
            id="complaint-search"
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: "1rem",
              outline: "none",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.currentTarget.parentElement.style.borderColor = "var(--primary)";
              e.currentTarget.parentElement.style.boxShadow = "0 0 0 4px rgba(43, 80, 255, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement.style.borderColor = "var(--border)";
              e.currentTarget.parentElement.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* ===== Complaints List ===== */}
      <div style={{
        background: "var(--surface)",
        borderRadius: "20px",
        border: "1px solid var(--border-soft)",
        overflow: "hidden",
        boxShadow: "var(--card-shadow)",
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-soft)" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)" }}>
            Your Complaints
          </h3>
        </div>

        {renderComplaintsList()}
      </div>

      {/* ===== Modal ===== */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "2rem",
        }}>
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "24px",
              padding: "2rem",
              maxWidth: 600,
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              border: "1px solid var(--border-soft)",
              boxShadow: "0 50px 100px rgba(0, 0, 0, 0.3)",
              animation: "slideIn 0.3s ease",
            }}
          >
            <style>{`
              @keyframes slideIn {
                from {
                  transform: translate(-50%, -40%) scale(0.9);
                  opacity: 0;
                }
                to {
                  transform: translate(0, 0) scale(1);
                  opacity: 1;
                }
              }
            `}</style>
            {selectedComplaint && (
              <>
                <h2 style={{ margin: "0 0 1rem", fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {selectedComplaint.title}
                </h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Status</div>
                    <div style={{
                      ...getStatusStyle(selectedComplaint.status),
                      display: "inline-block",
                      padding: "0.5rem 1rem",
                      borderRadius: "999px",
                      backgroundColor: getStatusStyle(selectedComplaint.status).bg,
                      color: getStatusStyle(selectedComplaint.status).color,
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}>
                      {getStatusStyle(selectedComplaint.status).text}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Category</div>
                    <div style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: "500" }}>{selectedComplaint.category}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Description</div>
                  <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: "1.6" }}>
                    {selectedComplaint.description}
                  </p>
                </div>

                {selectedComplaint.imageUrl && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <img
                      src={`${BACKEND_URL}${selectedComplaint.imageUrl}`}
                      alt="complaint"
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "cover",
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                    color: "white",
                    border: "none",
                    borderRadius: "14px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 15px 35px rgba(43, 80, 255, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ComplaintsTable;

ComplaintsTable.propTypes = {
  complaints: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  fetchComplaints: PropTypes.func.isRequired,
  onFeedback: PropTypes.func.isRequired,
};

