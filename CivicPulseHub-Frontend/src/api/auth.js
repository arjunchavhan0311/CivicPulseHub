import axios from "axios";

// Base URLs
const CITIZEN_API_URL = "http://localhost:8081/api/citizen";
const ADMIN_API_URL = "http://localhost:8081/api/admin";

// ===== Citizen APIs =====
export const citizenSignup = async (formData) => {
  return axios.post(`${CITIZEN_API_URL}/signup`, formData);
};

export const citizenLogin = async (formData) => {
  return axios.post(`${CITIZEN_API_URL}/login`, formData);
};

// ===== Admin APIs =====
export const adminSignup = async (formData) => {
  return axios.post(`${ADMIN_API_URL}/signup`, formData);
};

export const adminLogin = async (formData) => {
  return axios.post(`${ADMIN_API_URL}/login`, formData);
};

// ===== Admin Forgot/Reset Password =====
export const adminForgotPassword = async (formData) => {
  return axios.post(`${ADMIN_API_URL}/forgot-password`, formData);
};

export const adminResetPassword = async (formData) => {
  return axios.post(`${ADMIN_API_URL}/reset-password`, formData);
};

// ===== Citizen Forgot/Reset Password =====
export const citizenForgotPassword = async (formData) => {
  return axios.post(`${CITIZEN_API_URL}/forgot-password`, formData);
};

export const citizenResetPassword = async (formData) => {
  return axios.post(`${CITIZEN_API_URL}/reset-password`, formData);
};


// ===== Officer APIs =====
const OFFICER_API_URL = "http://localhost:8081/api/officer";

export const officerLogin = async (formData) => {
  return axios.post(`${OFFICER_API_URL}/login`, formData);
};


