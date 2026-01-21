import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, LogOut } from "lucide-react";
import api from "../../../api/axios";

// View Mode Component
const ViewMode = ({ userData, setIsEditing, handleLogout }) => {
  const infoItems = [
    { icon: User, label: "Full Name", value: userData.name, color: "primary" },
    { icon: Mail, label: "Email Address", value: userData.email, color: "accent" },
    { icon: Phone, label: "Phone Number", value: userData.phone, color: "green" },
    ...(userData.location ? [{ icon: MapPin, label: "Location", value: userData.location, color: "amber" }] : []),
    ...(userData.createdAt ? [
      { icon: Calendar, label: "Joined On", value: new Date(userData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), color: "purple" }
    ] : []),
  ];

  const colorMap = {
    primary: { bg: "linear-gradient(135deg, var(--primary), var(--primary-strong))", light: "color-mix(in srgb, var(--primary) 3%, transparent)", icon: "white" },
    accent: { bg: "color-mix(in srgb, var(--accent) 20%, transparent)", light: "color-mix(in srgb, var(--accent) 3%, transparent)", icon: "var(--accent)" },
    green: { bg: "rgba(16, 185, 129, 0.15)", light: "color-mix(in srgb, #10b981 3%, transparent)", icon: "#10b981" },
    amber: { bg: "rgba(245, 158, 11, 0.15)", light: "color-mix(in srgb, #f59e0b 3%, transparent)", icon: "#f59e0b" },
    purple: { bg: "rgba(139, 92, 246, 0.15)", light: "color-mix(in srgb, #8b5cf6 3%, transparent)", icon: "#8b5cf6" },
  };

  return (
    <>
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        {infoItems.map((item, idx) => {
          const Icon = item.icon;
          const colors = colorMap[item.color];
          return (
            <div key={idx} style={{
              background: colors.light,
              borderRadius: "16px",
              padding: "1.25rem",
              border: "1px solid var(--border-soft)",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "1rem",
              alignItems: "center",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: colors.bg,
              }}>
                <Icon size={20} color={colors.icon} />
              </div>
              <div>
                <p style={{
                  margin: "0 0 0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>{item.label}</p>
                <p style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}>{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <button
          onClick={() => setIsEditing(true)}
          style={{
            padding: "1rem",
            background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(43, 80, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Edit2 size={20} /> Edit Profile
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: "1rem",
            background: "transparent",
            color: "var(--accent)",
            border: "1.5px solid var(--accent)",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(249, 115, 22, 0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </>
  );
};

// Edit Mode Component
const EditMode = ({ editData, setEditData, handleSave, saving, setIsEditing, userData, errors }) => {
  const inputFields = [
    { id: "name", label: "Full Name", type: "text", value: editData.name },
    { id: "email", label: "Email Address", type: "email", value: editData.email , disabled: true, placeholder: "Email cannot be changed", readOnly: true},
    { id: "phone", label: "Phone Number", type: "tel", value: editData.phone, placeholder: "10 digits only" },
    { id: "location", label: "Location (Optional)", type: "text", value: editData.location || "", placeholder: "Your city/region" },
  ];

  return (
    <>
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        {inputFields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
            }}>{field.label}</label>
            <input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={field.value}
              disabled={field.disabled}
              readOnly={field.readOnly}
              onChange={(e) => setEditData({ ...editData, [field.id]: e.target.value })}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                borderRadius: "14px",
                border: `1px solid ${errors[field.id] ? "var(--accent)" : "var(--border)"}`,
                background: "color-mix(in srgb, var(--surface) 95%, transparent)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                fontFamily: "inherit",
                transition: "border 0.2s ease, box-shadow 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(43, 80, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors[field.id] ? "var(--accent)" : "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {errors[field.id] && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.8rem" }}>{errors[field.id]}</p>}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "1rem",
            background: saving ? "var(--text-muted)" : "linear-gradient(135deg, var(--primary), var(--primary-strong))",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <>
              <div style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                border: "2px solid white",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              }} />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} /> Save Changes
            </>
          )}
        </button>

        <button
          onClick={() => { setIsEditing(false); setEditData(userData); }}
          disabled={saving}
          style={{
            padding: "1rem",
            background: "transparent",
            color: "var(--text-primary)",
            border: "1.5px solid var(--border)",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
            opacity: saving ? 0.5 : 1,
          }}
        >
          <X size={20} /> Cancel
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

// Main Profile Component
const Profile = ({ navigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(""); // <-- Toast state

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/citizen/profile");

        const mappedData = {
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phoneNo,
          location: response.data.address,
          age: response.data.age,
          createdAt: response.data.createdAt,
        };

        setUserData(mappedData);
        setEditData(mappedData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name || editData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!editData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) newErrors.email = "Please enter a valid email";
    if (!editData.phone || !/^\d{10}$/.test(editData.phone)) newErrors.phone = "Phone must be 10 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await api.put("/api/citizen/profile", {
        name: editData.name,
        email: editData.email,
        phoneNo: editData.phone,
        address: editData.location,
        age: editData.age || 0,
      });
      setUserData(editData);
      setIsEditing(false);

      // Show toast
      setToast("Profile updated successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "24px",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
      maxWidth: "900px",
      margin: "0 auto",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#10b981",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          fontWeight: 600,
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
          zIndex: 1000,
          animation: "slideIn 0.3s ease",
        }}>
          {toast}
        </div>
      )}

      {/* Header with Avatar */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary), var(--primary-strong))",
        padding: "3rem 2rem",
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
          marginBottom: "1.5rem",
          position: "relative",
          border: "3px solid rgba(255, 255, 255, 0.3)",
        }}>
          <User size={50} color="white" />
          <button
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              background: "var(--accent)",
              borderRadius: "50%",
              padding: "0.5rem",
              border: "3px solid white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            aria-label="Change profile picture"
          >
            <Camera size={16} color="white" />
          </button>
        </div>
        <h1 style={{
          margin: "0 0 0.5rem",
          fontSize: "1.75rem",
          fontWeight: "700",
          color: "white",
        }}>{userData.name}</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>Citizen Account</p>
      </div>

      {/* Content */}
      <div style={{ padding: "2.5rem" }}>
        {isEditing ? (
          <EditMode
            editData={editData}
            setEditData={setEditData}
            handleSave={handleSave}
            saving={saving}
            setIsEditing={setIsEditing}
            userData={userData}
            errors={errors}
          />
        ) : (
          <ViewMode
            userData={userData}
            setIsEditing={setIsEditing}
            handleLogout={handleLogout}
          />
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default Profile;
