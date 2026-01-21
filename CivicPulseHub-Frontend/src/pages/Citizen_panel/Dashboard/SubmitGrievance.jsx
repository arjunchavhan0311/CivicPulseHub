import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Upload, MapPin, Check } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import MapSelector from "./MapSelector";

/**
 * 🔑 IMPORTANT:
 * Receive setComplaints from UserDashboard
 */
const SubmitGrievance = ({ setComplaints }) => {
  const propTypes = {
    setComplaints: "function",
  };
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    citizenName: "",
    citizenPhone: "",
  });

  const [coordinates, setCoordinates] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!coordinates) newErrors.location = "Please select location on map";
    if (!formData.category) newErrors.category = "Category required";
    if (!formData.description.trim()) newErrors.description = "Description required";
    if (!formData.citizenName.trim()) newErrors.citizenName = "Name required";
    if (!/^\d{10}$/.test(formData.citizenPhone))
      newErrors.citizenPhone = "Invalid 10-digit phone";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // 🔥 OPTIMISTIC TEMP COMPLAINT
    const tempComplaint = {
      id: "temp-" + Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: "PENDING",
      submissionDate: new Date().toISOString(),
      location: formData.location,
    };

    // ✅ 1. SHOW IMMEDIATELY IN UI
    setComplaints((prev) => [tempComplaint, ...prev]);

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();

      Object.keys(formData).forEach((k) => fd.append(k, formData[k]));
      fd.append("latitude", coordinates.lat);
      fd.append("longitude", coordinates.lng);
      if (imageFile) fd.append("image", imageFile);

      const { data } = await axios.post(
        "http://localhost:8081/api/citizen/complaints/submit",
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ 2. REPLACE TEMP WITH REAL COMPLAINT
      setComplaints((prev) =>
        prev.map((c) => (c.id === tempComplaint.id ? data : c))
      );

      toast.success(`Grievance submitted! ID: ${data.id}`, {
        autoClose: 1500,
      });

      handleCancel();
    } catch (err) {
      console.error(err);

      // ❌ 3. ROLLBACK TEMP DATA
      setComplaints((prev) =>
        prev.filter((c) => c.id !== tempComplaint.id)
      );

      toast.error("Failed to submit grievance");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      location: "",
      citizenName: "",
      citizenPhone: "",
    });
    setCoordinates(null);
    setImageFile(null);
    setErrors({});
  };

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "24px",
      padding: "2.5rem",
      border: "1px solid var(--border-soft)",
      boxShadow: "var(--card-shadow)",
      maxWidth: 900,
      margin: "0 auto",
    }}>
      <ToastContainer />

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
          Submit New Grievance
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Help us improve your community by reporting issues
        </p>
      </div>

      <div style={{ height: "1px", background: "var(--border-soft)", marginBottom: "2rem" }}></div>

      {/* Form Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        {/* Title */}
        <div>
          <label htmlFor="title" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Grievance Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter a brief title for your grievance"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              borderRadius: "14px",
              border: `1px solid ${errors.title ? "var(--accent)" : "var(--border)"}`,
              background: "color-mix(in srgb, var(--surface) 95%, transparent)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              fontFamily: "inherit",
              transition: "border 0.2s ease, box-shadow 0.2s ease",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = errors.title ? "var(--accent)" : "var(--primary)";
              e.currentTarget.style.boxShadow = errors.title ? "0 0 0 4px rgba(249, 115, 22, 0.1)" : "0 0 0 4px rgba(43, 80, 255, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.title ? "var(--accent)" : "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {errors.title && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.title}</p>}
        </div>

        {/* Category & Location in 2 cols */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div>
            <label htmlFor="category" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                borderRadius: "14px",
                border: `1px solid ${errors.category ? "var(--accent)" : "var(--border)"}`,
                background: "color-mix(in srgb, var(--surface) 95%, transparent)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "border 0.2s ease, box-shadow 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = errors.category ? "var(--accent)" : "var(--primary)";
                e.currentTarget.style.boxShadow = errors.category ? "0 0 0 4px rgba(249, 115, 22, 0.1)" : "0 0 0 4px rgba(43, 80, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.category ? "var(--accent)" : "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="">Select a category...</option>
              <option value="ELECTRICITY">Electricity</option>
              <option value="WATER">Water</option>
              <option value="ROADS">Roads</option>
              <option value="SANITATION">Sanitation</option>
              <option value="TRAFFIC">Traffic</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.category && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="location" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              📍 Location (Optional)
            </label>
            <input
              id="location"
              type="text"
              placeholder="Enter location name..."
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--surface) 95%, transparent)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                fontFamily: "inherit",
                transition: "border 0.2s ease, box-shadow 0.2s ease",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Map Section */}
        <div>
          <label htmlFor="mapSelect" style={{ display: "flex", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.75rem", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={18} />
            Select Location on Map *
          </label>
          <div style={{
            borderRadius: "16px",
            overflow: "hidden",
            border: `2px solid ${errors.location ? "var(--accent)" : "var(--border-soft)"}`,
            transition: "border 0.2s ease",
          }}>
            <MapSelector onLocationSelect={(latlng) => setCoordinates(latlng)} />
          </div>
          {coordinates && (
            <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: "12px", color: "var(--primary)", fontSize: "0.9rem" }}>
              ✓ Selected: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
          )}
          {errors.location && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Description *
          </label>
          <textarea
            id="description"
            placeholder="Please provide detailed information about the issue..."
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="5"
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              borderRadius: "14px",
              border: `1px solid ${errors.description ? "var(--accent)" : "var(--border)"}`,
              background: "color-mix(in srgb, var(--surface) 95%, transparent)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              fontFamily: "inherit",
              resize: "vertical",
              transition: "border 0.2s ease, box-shadow 0.2s ease",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = errors.description ? "var(--accent)" : "var(--primary)";
              e.currentTarget.style.boxShadow = errors.description ? "0 0 0 4px rgba(249, 115, 22, 0.1)" : "0 0 0 4px rgba(43, 80, 255, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.description ? "var(--accent)" : "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {errors.description && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.description}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="fileInput" style={{ display: "flex", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.75rem", alignItems: "center", gap: "0.5rem" }}>
            <Upload size={18} />
            Upload Image (Optional)
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "14px",
              border: "2px dashed var(--border)",
              background: "color-mix(in srgb, var(--surface) 95%, transparent)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "border 0.2s ease, background 0.2s ease",
              boxSizing: "border-box",
            }}
            onDragEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 5%, transparent)";
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "color-mix(in srgb, var(--surface) 95%, transparent)";
            }}
          />
          {imageFile && <p style={{ margin: "0.5rem 0 0", color: "var(--primary)", fontSize: "0.85rem" }}>✓ {imageFile.name}</p>}
        </div>

        <div style={{ height: "1px", background: "var(--border-soft)" }}></div>

        {/* Citizen Info Section */}
        <div>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)" }}>
            Your Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div>
              <label htmlFor="citizenName" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Name *
              </label>
              <input id="citizenName"
                type="text"
                placeholder="Your full name"
                name="citizenName"
                value={formData.citizenName}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  borderRadius: "14px",
                  border: `1px solid ${errors.citizenName ? "var(--accent)" : "var(--border)"}`,
                  background: "color-mix(in srgb, var(--surface) 95%, transparent)",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  transition: "border 0.2s ease, box-shadow 0.2s ease",
                  boxSizing: "border-box",
                }}
              />
              {errors.citizenName && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.citizenName}</p>}
            </div>

            <div>
              <label htmlFor="citizenPhone" style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Phone Number *
              </label>
              <input
                id="citizenPhone"
                type="tel"
                placeholder="10-digit phone number"
                name="citizenPhone"
                value={formData.citizenPhone}
                onChange={handleInputChange}
                maxLength="10"
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  borderRadius: "14px",
                  border: `1px solid ${errors.citizenPhone ? "var(--accent)" : "var(--border)"}`,
                  background: "color-mix(in srgb, var(--surface) 95%, transparent)",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  transition: "border 0.2s ease, box-shadow 0.2s ease",
                  boxSizing: "border-box",
                }}
              />
              {errors.citizenPhone && <p style={{ margin: "0.5rem 0 0", color: "var(--accent)", fontSize: "0.85rem" }}>{errors.citizenPhone}</p>}
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "2rem" }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "1rem",
            background: loading ? "var(--text-muted)" : "linear-gradient(135deg, var(--primary), var(--primary-strong))",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(43, 80, 255, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {loading ? (
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
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Submitting...
            </>
          ) : (
            <>
              <Check size={20} />
              Submit Grievance
            </>
          )}
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          style={{
            padding: "1rem",
            background: "transparent",
            color: "var(--text-primary)",
            border: "1.5px solid var(--border)",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 5%, transparent)";
              e.currentTarget.style.borderColor = "var(--primary)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          Clear Form
        </button>
      </div>
    </div>
  );
};

export default SubmitGrievance;
