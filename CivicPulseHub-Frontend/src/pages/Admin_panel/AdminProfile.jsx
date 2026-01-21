import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
} from "@mui/material";
import { User, Mail } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const BACKEND_URL = "http://localhost:8081"; // your Spring Boot backend

const AdminProfile = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  // Get JWT token from localStorage
  const token = localStorage.getItem("token");

  // Fetch admin profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser({
          name: res.data.name || "",
          email: res.data.email || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Handle editable fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${BACKEND_URL}/api/admin/profile`,
        { name: user.name, email: user.email }, // payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography
        variant="h4"
        fontWeight="800"
        sx={{ mb: 4, color: "var(--text-primary)" }}
      >
        Account Settings
      </Typography>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: "32px",
          border: "1px solid var(--border-soft)",
          boxShadow: "var(--card-shadow)",
          padding: "3rem",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                type="text"
                value={user.name}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color="var(--text-muted)" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "16px" },
                  "& .MuiInputLabel-root": { color: "var(--text-muted)" },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--primary)",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                variant="outlined"
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="var(--text-muted)" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "16px" },
                  "& .MuiInputLabel-root": { color: "var(--text-muted)" },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--primary)",
                  },
                }}
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={5}>
            <Button
              variant="contained"
              size="large"
              type="submit"
              sx={{
                borderRadius: "16px",
                px: 5,
                py: 1.8,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "700",
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-strong))",
                color: "#fff",
                "&:hover": {
                  transform: "translateY(-1px)",
                },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </div>
    </Box>
  );
};

export default AdminProfile;
