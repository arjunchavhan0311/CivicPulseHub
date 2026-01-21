import React, { useEffect, useState, useMemo } from "react";
import { Typography, CircularProgress, Box, Button } from "@mui/material";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  PieChart as PieIcon,
  BarChart3,
  MapPin,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* Leaflet icon fix */
L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const COLORS = ["#2b50ff", "#10b981", "#f97316", "#ef4444", "#8b5cf6"];

const AdminAnalytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/admin/complaints", axiosConfig)
      .then(res => setComplaints(res.data || []))
      .finally(() => setLoading(false));
  }, [axiosConfig]);

  /* ---------------- DATA ---------------- */
  const categoryData = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      map[c.category || "General"] =
        (map[c.category || "General"] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const statusData = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      map[c.status || "UNKNOWN"] =
        (map[c.status || "UNKNOWN"] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const priorityData = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      map[c.priority || "NORMAL"] =
        (map[c.priority || "NORMAL"] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const officerWorkloadData = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      if (c.assignedOfficer?.name) {
        map[c.assignedOfficer.name] =
          (map[c.assignedOfficer.name] || 0) + 1;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const mapComplaints = useMemo(
    () => complaints.filter(c => c.latitude && c.longitude),
    [complaints]
  );

  /* ---------------- EXPORT ---------------- */
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(complaints);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints");
    XLSX.writeFile(wb, "complaints.xlsx");
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight="800">
          Strategic Analytics
        </Typography>
        <Button variant="contained" onClick={exportExcel}>
          Export Excel
        </Button>
      </Box>

      {/* GRID */}
      <Box display="grid" gridTemplateColumns="repeat(24, 1fr)" gap={4}>

        {/* FIRST POSITION → MAP */}
        <Card span={24} title="Complaint Hotspots" icon={<MapPin color="#2b50ff" />}>
          <MapContainer center={[20, 78]} zoom={5} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {mapComplaints.map((c, i) => (
              <Marker key={i} position={[c.latitude, c.longitude]}>
                <Popup>
                  <strong>{c.category}</strong><br />
                  Status: {c.status}<br />
                  Priority: {c.priority}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card>

        {/* STATUS */}
        <Card span={12} title="Status Distribution" icon={<BarChart3 color="#10b981" />}>
          <BarChartBlock data={statusData} color="#10b981" />
        </Card>

        {/* PRIORITY */}
        <Card span={12} title="Priority Distribution" icon={<PieIcon color="#ef4444" />}>
          <PieChartBlock data={priorityData} />
        </Card>

        {/* LAST TWO – SAME WIDTH & HEIGHT */}
        <Card span={12} title="Category Distribution" icon={<PieIcon color="#f97316" />}>
          <PieChartBlock data={categoryData} />
        </Card>

        <Card span={12} title="Officer Workload" icon={<BarChart3 color="#8b5cf6" />}>
          <BarChartBlock
            data={officerWorkloadData.slice(0, 5)}
            color="#8b5cf6"
          />
        </Card>

      </Box>
    </Box>
  );
};

/* ---------- REUSABLE COMPONENTS ---------- */
const Card = ({ span, title, icon, children }) => (
  <Box
    sx={{
      gridColumn: `span ${span}`,
      background: "var(--surface)",
      p: 3,
      borderRadius: "24px",
      boxShadow: "var(--card-shadow)",
      height: 480,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Box display="flex" gap={1.5} mb={2}>
      {icon}
      <Typography fontWeight="700">{title}</Typography>
    </Box>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);

const PieChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie data={data} dataKey="value" innerRadius={60} outerRadius={100}>
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Legend />
      <RechartsTooltip />
    </PieChart>
  </ResponsiveContainer>
);

const BarChartBlock = ({ data, color }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <RechartsTooltip />
      <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export default AdminAnalytics;
