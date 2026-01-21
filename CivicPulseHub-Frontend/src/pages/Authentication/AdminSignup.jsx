import { useState } from 'react';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/Logo.jpg';
import { useThemePreference } from '../../hooks/useThemePreference.js';
import { adminSignup } from '../../api/auth.js'; // Create this API call similar to citizenSignup

export default function AdminSignup() {
  const { theme, toggleTheme } = useThemePreference();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.id.replace("signup-", "")]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("All fields are required!");
      return;
    }

    try {
      const res = await adminSignup({
        name: form.name,
        email: form.email,
        password: form.password
      });

      alert("Admin Signup Successful!");
      console.log("SIGNUP RESPONSE:", res.data);

    } catch (err) {
      console.error(err);
      alert("Signup Failed! Please try again.");
    }
  };

  return (
    <div className="page">
      <header className="app-header">
        <div className="logo-group">
          <img src={logoImg} alt="CivicPulse Hub logo" />
          <div>
            <p className="logo-title">CivicPulse Hub</p>
          </div>
        </div>

        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun /> : <Moon />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </header>

      <main className="register-shell">
        <section className="form-panel">
          <Link to="/" className="secondary-link">
            <ArrowLeft /> Back to login
          </Link>

          <div>
            <p className="eyebrow">ADMIN SIGN UP</p>
            <h3>Enter Your Details</h3>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>

            <div className="text-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="e.g., John Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="text-field">
              <label htmlFor="signup-email">Email ID</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@admin.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="text-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="primary-btn">
              Sign Up
            </button>

          </form>
        </section>
      </main>
    </div>
  );
}
