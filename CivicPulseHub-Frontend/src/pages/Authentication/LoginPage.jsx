// src/pages/Authentication/LoginPage.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Moon, Sun, User } from "lucide-react";
import logoImg from "../../assets/Logo.jpg";
import { useThemePreference } from "../../hooks/useThemePreference.js";
import { citizenLogin, adminLogin, officerLogin } from "../../api/auth.js";
import { toast } from "react-toastify";

const portals = [
  { id: "user", label: "User Portal", idLabel: "User Email" },
  { id: "admin", label: "Admin Portal", idLabel: "Admin Email" },
  { id: "officer", label: "Officer Portal", idLabel: "Officer Email" },
];

export default function LoginPage() {
  const { theme, toggleTheme } = useThemePreference();
  const [selectedPortal, setSelectedPortal] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activePortal = useMemo(
    () => portals.find((portal) => portal.id === selectedPortal),
    [selectedPortal]
  );

  const sliderLeft = useMemo(
    () =>
      `${portals.findIndex((portal) => portal.id === selectedPortal) * 33.3333}%`,
    [selectedPortal]
  );

  const handleLogin = async (e) => {
    e.preventDefault();

    // BLOCK MULTIPLE SUBMISSIONS
    if (isLoading) return;

    if (!email || !password) {
      toast.warn("Please enter both email and password!");
      return;
    }

    let loginFunc;
    if (selectedPortal === "user") loginFunc = citizenLogin;
    else if (selectedPortal === "admin") loginFunc = adminLogin;
    else if (selectedPortal === "officer") loginFunc = officerLogin;

    try {
      setIsLoading(true);

      const res = await loginFunc({ email: email.trim(), password });

      if (res?.data?.token) {
        toast.success(`${activePortal.label} Login successful!`, {
          toastId: "success_once",
        });

        localStorage.setItem("token", res.data.token);

        setTimeout(() => {
          if (selectedPortal === "user")
            window.location.href = "/user-dashboard";
          if (selectedPortal === "admin")
            window.location.href = "/admin-dashboard";
          if (selectedPortal === "officer")
            window.location.href = "/officer-dashboard";
        }, 700);

      } else {
        toast.error(res?.data?.message || "Unexpected login response.", {
          toastId: "error_once",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid Credentials!", { toastId: "invalid_once" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="app-header">
        <div className="logo-group">
          <img src={logoImg} alt="CivicPulse Hub logo" />
          <p className="logo-title">CivicPulse</p>
        </div>

        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <Sun /> : <Moon />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </header>

      <main className="auth-shell">
        <section className="intro-content">
          <p className="eyebrow">CivicPulse Hub</p>
          <h2>CivicPulse Hub</h2>
          <h3 className="intro-subtitle">
            An Unified Smart City Feedback and Redressal System
          </h3>
          <p>
            Resolve civic issues faster by aligning citizens, officers, and admins on one workspace.
          </p>
        </section>

        <section className="form-panel">
          <div className="form-panel__header">
            <div>
              <p className="eyebrow">Login portal</p>
              <h3>{activePortal?.label}</h3>
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="portal-toggle">
            <span className="portal-toggle__slider" style={{ left: sliderLeft }}></span>

            {portals.map((portal) => (
              <button
                key={portal.id}
                type="button"
                onClick={() => {
                  setSelectedPortal(portal.id);
                  setEmail("");
                  setPassword("");
                }}
                className={`portal-toggle__button ${
                  selectedPortal === portal.id ? "is-active" : ""
                }`}
              >
                <User />
                {portal.label}
              </button>
            ))}
          </div>

          <form className="portal-form" onSubmit={handleLogin}>
            <div className="text-field">
              <label htmlFor="portal-email">{activePortal?.idLabel}</label>
              <div className="input-with-icon">
                <User />
                <input
                  id="portal-email"
                  type="email"
                  placeholder={`Enter your ${activePortal?.idLabel.toLowerCase()}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="text-field">
              <label htmlFor="portal-password">Password</label>
              <div className="input-with-icon">
                <Lock />
                <input
                  id="portal-password"
                  type="password"
                  placeholder="Enter password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`primary-btn ${isLoading ? "btn-disabled" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : `Continue to ${activePortal?.label}`}
              </button>

              {selectedPortal !== "officer" ? (
                <div className="links-row">
                  <Link
                    to={selectedPortal === "user" ? "/register" : "/adminsignup"}
                    className="secondary-link"
                  >
                    New Account? Sign up
                  </Link>
                  <Link
                    to={`/forgot-password/${selectedPortal}`}
                    className="secondary-link forgot-password-link"
                  >
                    Forgot Password?
                  </Link>
                </div>
              ) : (
                <p className="inline-note">
                  Officers are added by Admin only. Contact the system administrator.
                </p>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
