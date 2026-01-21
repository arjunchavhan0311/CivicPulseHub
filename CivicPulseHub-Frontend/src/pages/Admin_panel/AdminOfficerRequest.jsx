import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Chip,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import {
  CheckCircle2,
  X,
  Loader,
  User,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";

const AdminOfficerRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/admin/officer-update-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch {
      toast.error("Failed to fetch officer update requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this request?")) return;
    await api.put(
      `/api/admin/officer-update-requests/${id}/approve`,
      null,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("Request approved");
    fetchRequests();
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;
    await api.put(
      `/api/admin/officer-update-requests/${id}/reject`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("Request rejected");
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Loader className="animate-spin" size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={800} mb={4}>
        Officer Profile Update Requests
      </Typography>

      {requests.map((req) => {
        const data = JSON.parse(req.requestedData);

        return (
          <Box
            key={req.id}
            sx={{
              background: "var(--surface)",
              borderRadius: "32px",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--card-shadow)",
              p: 4,
              mb: 5,
            }}
          >
            {/* HEADER */}
            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <Avatar
                sx={{
                  bgcolor: "var(--primary)",
                  width: 80,
                  height: 80,
                  fontSize: 32,
                }}
              >
                {req.officer.name[0]}
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {req.officer.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Calendar size={16} />
                  {new Date(req.requestedAt).toLocaleString()}
                </Typography>

                <Chip
                  label={req.status}
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                    bgcolor:
                      req.status === "PENDING"
                        ? "#FFF3CD"
                        : req.status === "APPROVED"
                        ? "#D1FAE5"
                        : "#FEE2E2",
                    color:
                      req.status === "PENDING"
                        ? "#92400E"
                        : req.status === "APPROVED"
                        ? "#065F46"
                        : "#991B1B",
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* FORM STYLE DATA */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={data.name}
                  InputProps={{ readOnly: true, startAdornment: <User /> }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={data.phoneNo}
                  InputProps={{ readOnly: true, startAdornment: <Phone /> }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={data.address}
                  InputProps={{ readOnly: true, startAdornment: <MapPin /> }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age"
                  value={data.age}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>

            {/* ACTIONS */}
            {req.status === "PENDING" && (
              <Box display="flex" gap={2} mt={5}>
                <Button
                  variant="contained"
                  startIcon={<CheckCircle2 size={18} />}
                  onClick={() => handleApprove(req.id)}
                >
                  Approve Update
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<X size={18} />}
                  onClick={() => handleReject(req.id)}
                >
                  Reject Update
                </Button>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default AdminOfficerRequest;