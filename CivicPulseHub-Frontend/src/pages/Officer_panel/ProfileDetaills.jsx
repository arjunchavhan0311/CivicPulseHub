import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Camera,
  MapPin,
  Save
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  InputAdornment,
  MenuItem
} from "@mui/material";
import axios from "axios";

const EditProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    gender: "male",
    phoneNo: "",
    department: "",
    role: "",
    address: "",
    age: "",
    avatar: "",
    lastRejectedReason: "" // <-- track last rejection reason
  });

  const token = localStorage.getItem("token"); // JWT token

  // ---------------- FETCH PROFILE ----------------
  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/officer/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser((prev) => ({ ...prev, ...res.data }));

      // If last request was rejected, show toast
      if (res.data.lastRejectedReason) {
        toast.error(
          `Your previous profile update request was rejected: "${res.data.lastRejectedReason}"`
        );
      }

    } catch (err) {
      toast.error("Failed to fetch profile");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ---------------- UPDATE PROFILE ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: user.name,
      phoneNo: user.phoneNo,
      address: user.address,
      age: user.age
    };

    try {
      await axios.put("http://localhost:8081/api/officer/profile", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile update requested successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      <Typography variant="h4" fontWeight="800" sx={{ mb: 4, color: "var(--text-primary)" }}>
        Officer Settings
      </Typography>

      <div style={{
        background: "var(--surface)",
        borderRadius: "32px",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "3rem" }}>
          <Box display="flex" alignItems="center" gap={3} mb={5}>
            <div style={{ position: "relative" }}>
              <Avatar
                src={user.avatar}
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid var(--border-soft)",
                  boxShadow: "var(--card-shadow)",
                  bgcolor: "var(--primary)",
                  fontSize: "2.5rem",
                  fontWeight: "800"
                }}
              >
                {user.name?.charAt(0)}
              </Avatar>
              <label htmlFor="avatar-upload" style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                background: "var(--surface)",
                padding: "8px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-soft)",
              }}>
                <Camera size={18} color="var(--primary)" />
                <input id="avatar-upload" hidden type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <Typography variant="h4" fontWeight="800" color="var(--text-primary)" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" color="var(--text-muted)" fontWeight="600" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ShieldCheck size={18} /> {user.role} • {user.department}
              </Typography>
            </div>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={user.email}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNo"
                  value={user.phoneNo}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={user.address}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={user.age}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Box display="flex" gap={2} mt={5}>
              <Button
                variant="contained"
                size="large"
                type="submit"
              >
                Update Profile
              </Button>
            </Box>
          </form>
        </div>
      </div>
    </Box>
  );
};

export default EditProfile;