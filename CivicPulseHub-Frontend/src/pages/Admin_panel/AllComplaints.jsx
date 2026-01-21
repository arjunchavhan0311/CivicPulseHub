import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import {
  Users,
  UserCheck,
  LifeBuoy,
  Search,
  Filter,
  ExternalLink
} from "lucide-react";
import { toast } from "react-toastify";

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [openPreview, setOpenPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const token = localStorage.getItem("token");

  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  // -------------------- FETCH DATA --------------------
  const fetchData = useCallback(async () => {
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }
    setLoading(true);
    try {
      const [complaintsRes, officersRes] = await Promise.all([
        axios.get("http://localhost:8081/api/admin/complaints", axiosConfig),
        axios.get(
          "http://localhost:8081/api/admin/complaints/officers/workload",
          axiosConfig
        ),
      ]);
      setComplaints(complaintsRes.data);
      setOfficers(officersRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [axiosConfig, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------------------- DERIVED DATA --------------------
  const departments = [...new Set(officers.map((o) => o.department))];
  const availableOfficers = officers
    .filter((o) => o.department === selectedDept && o.status === "AVAILABLE")
    .sort((a, b) => a.activeComplaints - b.activeComplaints);

  // Filter complaints based on search & department (optional)
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept ? c.category === selectedDept : true;
    return matchesSearch && matchesDept;
  });

  // -------------------- ASSIGN OFFICER --------------------
  const handleAssign = async (complaintId, officerId) => {
    try {
      // Optimistically assign in UI
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? { ...c, assignedOfficer: officers.find((o) => o.id === officerId) }
            : c
        )
      );

      await axios.post(
        `http://localhost:8081/api/admin/complaints/${complaintId}/assign-officer`,
        { officerId },
        axiosConfig
      );
      toast.success("Officer assigned successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign officer. Try again.");
      fetchData(); // Revert if failed
    }
  };

  // -------------------- UPDATE STATUS --------------------
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      // Optimistic update
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId ? { ...c, status: newStatus } : c
        )
      );

      await axios.put(
        `http://localhost:8081/api/admin/complaints/${complaintId}/status`,
        { status: newStatus },
        axiosConfig
      );
      toast.success("Status updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update complaint status");
      fetchData(); // Revert if failed
    }
  };

  // -------------------- UPDATE PRIORITY --------------------
  const handlePriorityChange = async (complaintId, newPriority) => {
    try {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId ? { ...c, priority: newPriority } : c
        )
      );

      await axios.put(
        `http://localhost:8081/api/admin/complaints/${complaintId}/priority`,
        { priority: newPriority },
        axiosConfig
      );
      toast.success("Priority updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update priority level");
      fetchData(); // Revert if failed
    }
  };

  // -------------------- STATUS & PRIORITY COLOR --------------------
  const statusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      case "RESOLVED":
        return "success";
      case "REOPENED":
        return "error";
      default:
        return "default";
    }
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case "LOW":
        return "default";
      case "MEDIUM":
        return "info";
      case "HIGH":
        return "warning";
      default:
        return "default";
    }
  };

  const handleOpenPreview = (url) => {
    setPreviewUrl(url);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setPreviewUrl("");
  };

  // -------------------- UI --------------------
  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography
        variant="h4"
        fontWeight="800"
        gutterBottom
        sx={{ color: "var(--text-primary)", mb: 4 }}
      >
        Management Hub
      </Typography>

      {/* SUMMARY CARDS */}
      <Grid container spacing={3} mb={5}>
        {[
          {
            label: "Complaints",
            value: complaints.length,
            icon: LifeBuoy,
            color: "#2b50ff",
          },
          {
            label: "Total Officers",
            value: officers.length,
            icon: Users,
            color: "#f97316",
          },
          {
            label: "Active Officers",
            value: officers.filter((o) => o.status === "AVAILABLE").length,
            icon: UserCheck,
            color: "#10b981",
          },
        ].map((item) => (
          <Grid item xs={12} sm={4} key={item.label}>
            <div
              style={{
                background: "var(--surface)",
                padding: "1.5rem",
                borderRadius: "24px",
                border: "1px solid var(--border-soft)",
                boxShadow: "var(--card-shadow)",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: `color-mix(in srgb, ${item.color} 12%, transparent)`,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <item.icon size={28} />
              </div>
              <div>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="var(--text-muted)"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="800"
                  sx={{ color: "var(--text-primary)" }}
                >
                  {item.value}
                </Typography>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* FILTERS & SEARCH */}
      <div
        style={{
          background: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "24px",
          border: "1px solid var(--border-soft)",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.85rem 1rem 0.85rem 3rem",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              background: "rgba(0,0,0,0.02)",
              fontSize: "1rem",
              outline: "none",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Filter size={20} color="var(--text-muted)" />
          <TextField
            select
            size="small"
            label="Department Search"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            sx={{
              width: 220,
              "& .MuiOutlinedInput-root": { borderRadius: "14px" },
            }}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>

          {selectedDept && (
            <div
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                background: availableOfficers.length ? "#dcfce7" : "#fee2e2",
                color: availableOfficers.length ? "#166534" : "#991b1b",
                fontWeight: "700",
                fontSize: "0.85rem",
              }}
            >
              {availableOfficers.length} Officers Online
            </div>
          )}
        </div>
      </div>

      {/* COMPLAINTS TABLE */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "24px",
          border: "1px solid var(--border-soft)",
          boxShadow: "var(--card-shadow)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress
              thickness={5}
              size={60}
              sx={{ color: "var(--primary)" }}
            />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "rgba(0,0,0,0.02)" }}>
                  <TableCell sx={{ fontWeight: "800", color: "var(--text-muted)", py: 2 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "800", color: "var(--text-muted)" }}>COMPLAINT INFO</TableCell>
                  <TableCell sx={{ fontWeight: "800", color: "var(--text-muted)" }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: "800", color: "var(--text-muted)" }}>PRIORITY</TableCell>
                  <TableCell sx={{ fontWeight: "800", color: "var(--text-muted)" }}>ASSIGNED OFFICER</TableCell>
                  <TableCell sx={{ fontWeight: "800", color: "var(--text-muted)" }}>EVIDENCE</TableCell>
                  <TableCell sx={{ fontWeight: "800", color: "var(--text-muted)" }} align="right">ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 10, textAlign: "center", color: "var(--text-muted)" }}>
                      No matching complaints found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((c) => (
                    <TableRow key={c.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: "800", color: "var(--primary)" }}>#{c.id}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="700">{c.title}</Typography>
                        <Chip label={c.category} size="small" variant="outlined" sx={{ mt: 0.5, height: "20px", fontSize: "10px", fontWeight: "700" }} />
                      </TableCell>

                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          sx={{
                            width: 130,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                              fontWeight: "700",
                              color:
                                c.status === "PENDING"
                                  ? "#fff9f5"
                                  : c.status === "IN_PROGRESS"
                                    ? "#fff9f5"
                                    : c.status === "RESOLVED"
                                      ? "#fff9f5"
                                      : "#fff9f5",
                              backgroundColor:
                                c.status === "PENDING"
                                  ? "#eddf28f5"
                                  : c.status === "IN_PROGRESS"
                                    ? "#287ce9"
                                    : c.status === "RESOLVED"
                                      ? "#0fb449"
                                      : "#ef1414",
                            },
                          }}
                        >
                          {["PENDING", "IN_PROGRESS", "RESOLVED", "REOPENED"].map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </TextField>

                      </TableCell>

                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={c.priority || "MEDIUM"}
                          onChange={(e) => handlePriorityChange(c.id, e.target.value)}
                          sx={{
                            width: 120,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                              fontWeight: "700",
                              color:
                                c.priority === "LOW"
                                  ?"#fff9f5"  
                                  : c.priority === "MEDIUM"
                                    ?"#fff9f5"   
                                    : "#fff9f5",  
                              backgroundColor:
                                c.priority === "LOW"
                                  ? "#166534"   // green bg
                                  : c.priority === "MEDIUM"
                                    ? "#f57636"   // orange bg
                                    : "#991b1b",  // red bg
                            },
                          }}
                        >
                          {["LOW", "MEDIUM", "HIGH"].map((p) => (
                            <MenuItem key={p} value={p}>
                              {p}
                            </MenuItem>
                          ))}
                        </TextField>

                      </TableCell>

                      <TableCell>
                        {c.assignedOfficer ? (
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: "700" }}>{c.assignedOfficer.name}</span>
                            <span style={{ fontSize: "11px", color: c.assignedOfficer.status === "AVAILABLE" ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                              ● {c.assignedOfficer.status}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Unassigned</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {c.officerEvidenceUrl ? (
                          <div style={{ position: "relative", width: "60px", height: "45px", cursor: "pointer" }}
                            onClick={() => handleOpenPreview(`http://localhost:8081${c.officerEvidenceUrl}`)}>
                            <img
                              src={`http://localhost:8081${c.officerEvidenceUrl}`}
                              alt="Evidence"
                              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                            />
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0 }}
                              onMouseEnter={e => e.currentTarget.style.opacity = 1}
                              onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                              <ExternalLink size={12} color="white" />
                            </div>
                          </div>
                        ) : "-"}
                      </TableCell>

                      <TableCell align="right">
                        {(!c.assignedOfficer && selectedDept && c.category === selectedDept) ? (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={!availableOfficers.length}
                            onClick={() => handleAssign(c.id, availableOfficers[0].id)}
                            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: "700", background: "linear-gradient(135deg, var(--primary), var(--primary-strong))" }}
                          >
                            Assign Auto
                          </Button>
                        ) : (
                          <IconButton size="small" onClick={() => handleOpenPreview(c.imageUrl ? `http://localhost:8081${c.imageUrl}` : "https://via.placeholder.com/400")}>
                            <ExternalLink size={18} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}>
        <DialogContent sx={{ position: "relative", p: 0 }}>
          <IconButton
            sx={{ position: "absolute", top: 12, right: 12, zIndex: 10, bgcolor: "rgba(0,0,0,0.5)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
            onClick={handleClosePreview}
          >
            <CloseIcon />
          </IconButton>
          <img src={previewUrl} alt="Evidence Preview" style={{ width: "100%", height: "auto", display: "block" }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AllComplaints;
