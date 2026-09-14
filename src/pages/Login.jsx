import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import heroImg from "../components/download.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpAcc, setFpAcc] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg, setFpMsg] = useState(null);

  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setMsg({ type: "success", text: "Login successful. Redirecting…" });
        setTimeout(() => nav("/dashboard"), 500);
      } else {
        setMsg({ type: "error", text: data.detail || data.message || "Login failed" });
      }
    } catch {
      setMsg({ type: "error", text: "Network error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const openForgot = () => {
    setFpEmail(email || "");
    setFpAcc("");
    setFpNewPass("");
    setFpMsg(null);
    setShowForgot(true);
  };

  const handleForgotPassword = async () => {
    setFpMsg(null);
    if (!fpEmail || !fpAcc || !fpNewPass) {
      setFpMsg({ type: "error", text: "Please fill all fields." });
      return;
    }

    try {
      setFpLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: fpEmail,
            account_number: fpAcc,
            new_password: fpNewPass,
          }),
        }
      );
      const data = await res.json();

      if (res.ok && data.status === "success") {
        setFpMsg({
          type: "success",
          text: "Password reset successful! Please login again.",
        });
        setTimeout(() => {
          setShowForgot(false);
          setPassword(fpNewPass);
          setMsg({ type: "success", text: "Password updated. Please sign in." });
        }, 600);
      } else {
        setFpMsg({ type: "error", text: data.detail || data.message || "Reset failed" });
      }
    } catch {
      setFpMsg({ type: "error", text: "Network error. Try again." });
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-showcase">
          <div className="showcase-top">
            <div className="login-brand">
              <span className="brand-mark">🏦</span>
              <span>G-BANK</span>
            </div>
            <span className="showcase-badge">Secure • Smart • Reliable</span>
          </div>

          <div className="showcase-content">
            <div className="showcase-copy">
              <p className="eyebrow">WELCOME TO G-BANK</p>
              <h1>
                Banking for a
                <span> Brighter Tomorrow.</span>
              </h1>
              <p className="showcase-description">
                Manage your money, make payments, track your savings and stay
                in control — all from one simple banking platform.
              </p>

              <div className="showcase-features">
                <div className="showcase-feature">
                  <span>↗</span>
                  <div><strong>Instant transfers</strong><small>Send money in seconds</small></div>
                </div>
                <div className="showcase-feature">
                  <span>▥</span>
                  <div><strong>Smart insights</strong><small>Track and grow your savings</small></div>
                </div>
                <div className="showcase-feature">
                  <span>◇</span>
                  <div><strong>Bank-grade security</strong><small>Your data stays protected</small></div>
                </div>
              </div>
            </div>

            <div className="showcase-art">
              <img src={heroImg} alt="G-BANK banking experience" />
            </div>
          </div>

          <div className="showcase-stats">
            <div><strong>10K+</strong><span>Happy Customers</span></div>
            <div><strong>100%</strong><span>Secure Transactions</span></div>
            <div><strong>24×7</strong><span>Customer Support</span></div>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-panel-inner">
            <div className="mobile-brand">
              <span className="brand-mark">🏦</span>
              <span>G-BANK</span>
            </div>

            <div className="login-heading">
              <span className="login-kicker">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>Enter your details to continue securely.</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <label>
                Email address
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <div className="login-options">
                <label className="remember-option">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-button" onClick={openForgot}>
                  Forgot password?
                </button>
              </div>

              <button className="login-submit" type="submit" disabled={loading}>
                <span>{loading ? "Signing in…" : "Sign in"}</span>
                {!loading && <span className="submit-arrow">→</span>}
              </button>
            </form>

            {msg && (
              <div className={`login-alert ${msg.type === "error" ? "login-alert-error" : "login-alert-success"}`}>
                {msg.text}
              </div>
            )}

            <div className="login-divider"><span>Secure G-BANK access</span></div>

            <p className="create-account-text">
              Don't have an account? <Link to="/register">Create account</Link>
            </p>

            <p className="login-footer">
              © {new Date().getFullYear()} Golden Ore Bank · Secure banking for a brighter tomorrow.
            </p>
          </div>
        </section>
      </div>

      {showForgot && (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🔐</div>
            <h3>Reset your password</h3>
            <p className="modal-description">Verify your account details and choose a new password.</p>

            <div className="modal-form">
              <label>
                Email
                <input type="email" placeholder="you@example.com" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} />
              </label>
              <label>
                Account Number
                <input type="text" placeholder="8-digit account number" value={fpAcc} onChange={(e) => setFpAcc(e.target.value)} />
              </label>
              <label>
                New Password
                <input type="password" placeholder="Enter new password" value={fpNewPass} onChange={(e) => setFpNewPass(e.target.value)} />
              </label>
            </div>

            {fpMsg && (
              <div className={`login-alert ${fpMsg.type === "error" ? "login-alert-error" : "login-alert-success"}`}>
                {fpMsg.text}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={() => setShowForgot(false)} className="modal-cancel">Cancel</button>
              <button type="button" onClick={handleForgotPassword} className="modal-submit" disabled={fpLoading}>
                {fpLoading ? "Submitting…" : "Reset password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
