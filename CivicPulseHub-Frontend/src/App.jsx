import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./pages/Citizen_panel/ProtectedRoute.jsx"; 
import 'leaflet/dist/leaflet.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// AUTH PAGES
import LoginPage from "./pages/Authentication/LoginPage.jsx";
import RegisterPage from "./pages/Authentication/RegisterPage.jsx";
import AdminSignup from "./pages/Authentication/AdminSignup.jsx";
import ForgotPassword from "./pages/Authentication/ForgotPassword.jsx";

// USER DASHBOARD (Your folder structure)
import UserDashboard from "./pages/Citizen_panel/Dashboard/UserDashboard.jsx";

//officer DASHBOARD
//import { OfficerDashboard as OfficerDashboard } from "./pages/Officer_panel/Dashboard.jsx";
import OfficerDashboard from "./pages/Officer_panel/Dashboard.jsx";


//admin DASHBOARD
import AdminDashboard from "./pages/Admin_panel/AdminDashboard.jsx"; 

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Routes>
        {/* LOGIN ROUTES */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/adminsignup" element={<AdminSignup />} />
        <Route path="/forgot-password/:role" element={<ForgotPassword />} />

        {/* USER DASHBOARD ROUTE */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

           {/* OFFICER DASHBOARD ✅ */}
  <Route
    path="/officer-dashboard"
    element={
      <ProtectedRoute>
        <OfficerDashboard />
      </ProtectedRoute>
    }
  />

{/* ✅ ADMIN DASHBOARD */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
