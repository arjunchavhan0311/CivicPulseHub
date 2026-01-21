import { useState } from 'react';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/Logo.jpg';
import { useThemePreference } from '../../hooks/useThemePreference.js';
import { citizenSignup } from '../../api/auth.js';

export default function RegisterPage() {
  const { theme, toggleTheme } = useThemePreference();

  const [form, setForm] = useState({
    name: "",
    address: "",
    age: "",
    phoneNo: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.id.replace("signup-", "")]: e.target.value });
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, address, age, phoneNo, email, password, confirmPassword } = form;

    // ------------------ VALIDATION ------------------
    if (!name.trim()) {
      alert("Name is required!");
      return;
    }

    if (!address.trim()) {
      alert("Address is required!");
      return;
    }

    if (!age || age < 18) {
      alert("You must be 18 or older to register!");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit numbers
    if (!phoneRegex.test(phoneNo)) {
      alert("Enter a valid 10-digit phone number!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Enter a valid email address!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // ------------------ SUBMIT ------------------
    const signupData = { name, address, age, phoneNo, email, password };

    try {
      const res = await citizenSignup(signupData);
      alert("Signup Successful!");
      console.log("SIGNUP RESPONSE:", res.data);
      // Optionally, redirect to login page after signup
      window.location.href = "/";
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
            <p className="eyebrow">SIGN UP</p>
            <h3>Enroll your Details</h3>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>

            {/* Personal Details */}
            <fieldset className="field-section">
              <legend>Personal details</legend>
              <div className="field-row">

                <div className="text-field">
                  <label htmlFor="signup-name">Full name</label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="e.g., Maya Rao"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="text-field">
                  <label htmlFor="signup-address">Address</label>
                  <input
                    id="signup-address"
                    type="text"
                    placeholder="Ward / Street"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="text-field">
                  <label htmlFor="signup-age">Age</label>
                  <input
                    id="signup-age"
                    type="number"
                    placeholder="e.g., 24"
                    value={form.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                  />
                </div>

              </div>
            </fieldset>

            {/* Contact Details */}
            <fieldset className="field-section">
              <legend>Contact details</legend>
              <div className="field-row">

                <div className="text-field">
                  <label htmlFor="signup-phoneNo">Phone number</label>
                  <div className="phone-input-group">
                    <span className="country-code-static">🇮🇳 +91</span>
                    <input
                      id="signup-phoneNo"
                      type="tel"
                      placeholder="00000 00000"
                      value={form.phoneNo}
                      onChange={handleChange}
                      className="phone-number-input"
                    />
                  </div>
                </div>

                <div className="text-field">
                  <label htmlFor="signup-email">Email ID</label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@city.gov.in"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </fieldset>

            {/* Login Details */}
            <fieldset className="field-section">
              <legend>Login details</legend>
              <div className="field-row">

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

                <div className="text-field">
                  <label htmlFor="signup-confirmPassword">Confirm password</label>
                  <input
                    id="signup-confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </fieldset>

            <button type="submit" className="primary-btn">
              SignUp
            </button>

          </form>
        </section>
      </main>
    </div>
  );
}
