import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, User, Lock } from "lucide-react";
import {
  citizenForgotPassword,
  adminForgotPassword,
  citizenResetPassword,
  adminResetPassword,
} from "../../api/auth";

export default function ForgotPassword() {
  const { role } = useParams(); 
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 - Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();

    if (!email) return alert("Please enter your email");

    setLoading(true);
    try {
      const res =
        role === "admin"
          ? await adminForgotPassword({ email })
          : await citizenForgotPassword({ email });

      setMessage(res?.data?.message || "OTP sent to your email");
      setStep(2);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  // Step 2 - Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email || !resetToken || !newPassword)
      return alert("All fields are required!");

    setLoading(true);
    try {
      const res =
        role === "admin"
          ? await adminResetPassword({ email, resetToken, newPassword })
          : await citizenResetPassword({ email, resetToken, newPassword });

      alert(res?.data?.message || "Password reset successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Invalid OTP or password. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="page auth-page">
      <main className="auth-shell">
        <section className="form-panel">
          <h2>Forgot Password ({role})</h2>

          {step === 1 && (
            <>
              <p>Enter your email to receive OTP</p>

              <form className="portal-form" onSubmit={handleRequestOTP}>
                <div className="text-field">
                  <label>Email</label>
                  <div className="input-with-icon">
                    <User />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                    <ArrowRight />
                  </button>
                  <Link to="/" className="secondary-link">
                    Back to Login
                  </Link>
                </div>

                {message && <p className="info-message">{message}</p>}
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <p>Enter OTP and set a new password</p>

              <form className="portal-form" onSubmit={handleResetPassword}>
                <div className="text-field">
                  <label>OTP</label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                  />
                </div>

                <div className="text-field">
                  <label>New Password</label>
                  <div className="input-with-icon">
                    <Lock />
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                    <ArrowRight />
                  </button>
                  <Link to="/" className="secondary-link">
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
