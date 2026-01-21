import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Grid,
  MenuItem
} from "@mui/material";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  UserPlus,
  MapPin
} from "lucide-react";
import { toast } from "react-toastify";

const DEPARTMENTS = [
  "Electricity",
  "Water",
  "Roads",
  "Sanitation",
  "Traffic",
  "Other"
];

const AdminCreateOfficer = () => {
  const [officerData, setOfficerData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    address: "",
    age: "",
    department: ""
  });

  const handleChange = (e) => {
    setOfficerData({
      ...officerData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You are not logged in as Admin");
        return;
      }

      if (
        !officerData.name ||
        !officerData.email ||
        !officerData.password ||
        !officerData.phoneNo ||
        !officerData.address ||
        !officerData.age ||
        !officerData.department
      ) {
        toast.error("All fields are required");
        return;
      }

      if (Number(officerData.age) <= 0) {
        toast.error("Age must be a valid number");
        return;
      }

      const res = await fetch("http://localhost:8081/api/admin/create-officer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...officerData,
          age: Number(officerData.age)
        })
      });

      if (!res.ok) {
        let errorMsg;
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          errorMsg = data.message || JSON.stringify(data);
        } else {
          errorMsg = await res.text();
        }

        throw new Error(errorMsg || "Failed to create officer");
      }

      const contentType = res.headers.get("content-type");
      const successMsg =
        contentType && contentType.includes("application/json")
          ? (await res.json()).message
          : await res.text();

      toast.success(successMsg || "Officer account created successfully!");

      setOfficerData({
        name: "",
        email: "",
        password: "",
        phoneNo: "",
        address: "",
        age: "",
        department: ""
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Server error");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        background: "var(--surface)",
        padding: "3rem",
        borderRadius: "32px",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)"
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            padding: "12px",
            borderRadius: "16px",
            background:
              "color-mix(in srgb, var(--primary) 10%, transparent)",
            color: "var(--primary)"
          }}
        >
          <UserPlus size={32} />
        </Box>

        <Box>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{ color: "var(--text-primary)" }}
          >
            Add Officer
          </Typography>
          <Typography
            variant="body2"
            color="var(--text-muted)"
            fontWeight="600"
          >
            Create a new department official account
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Grid container spacing={3}>
        {[
          { label: "Full Name", name: "name", icon: User, type: "text", md: 6 },
          { label: "Email Address", name: "email", icon: Mail, type: "email", md: 6 },
          { label: "Password", name: "password", icon: Lock, type: "password", md: 6 },
          { label: "Phone Number", name: "phoneNo", icon: Phone, type: "tel", md: 6 },
          { label: "Address", name: "address", icon: MapPin, type: "text", md: 12 },
          { label: "Age", name: "age", icon: User, type: "number", md: 6 }
        ].map((field) => (
          <Grid item xs={12} md={field.md} key={field.name}>
            <TextField
              fullWidth
              label={field.label}
              name={field.name}
              type={field.type}
              value={officerData[field.name]}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <field.icon size={20} />
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px"
                }
              }}
            />
          </Grid>
        ))}

        {/* Department Dropdown (ONLY CHANGE) */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Department"
            name="department"
            value={officerData.department}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Building2 size={20} />
                </InputAdornment>
              )
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px"
              }
            }}
          >
            <MenuItem value="">Select a department...</MenuItem>
            {DEPARTMENTS.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{
          mt: 4,
          py: 1.8,
          borderRadius: "16px",
          fontWeight: "700",
          textTransform: "none",
          background:
            "linear-gradient(135deg, var(--primary), var(--primary-strong))"
        }}
        onClick={handleSubmit}
      >
        Generate Officer Account
      </Button>
    </Box>
  );
};

export default AdminCreateOfficer;
