import api from "./axios";

export const fetchAdminComplaints = () =>
  api.get("/api/admin/complaints");
