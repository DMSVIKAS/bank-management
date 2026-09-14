import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

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

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));

        setMsg({
          type: "success",
          text: "Login successful. Redirecting…",
        });

        setTimeout(() => {
          nav("/dashboard");
        }, 500);
      } else {
        setMsg({
          type: "error",
          text:
            data.detail ||
            data.message ||
            "Login failed",
        });
      }
    } catch (error) {
      setMsg({
        type: "error",
        text: "Network error. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================
  const openForgot = () => {
    setFpEmail(email || "");
    setFpAcc("");
    setFpNewPass("");
    setFpMsg(null);
    setShowForgot(true);
  };

  const closeForgot = () => {
    if (!fpLoading) {
      setShowForgot(false);
    }
  };

  const handleForgotPassword = async () => {
    setFpMsg(null);

    if (!fpEmail || !fpAcc || !fpNewPass) {
      setFpMsg({
        type: "error",
        text: "Please fill all fields.",
      });
      return;
    }

    try {
      setFpLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

          setMsg({
            type: "success",
            text: "Password updated. Please sign in.",
          });
        }, 600);
      } else {
        setFpMsg({
          type: "error",
          text:
            data.detail ||
            data.message ||
            "Reset failed",
        });
      }
    } catch (error) {
      setFpMsg({
        type: "error",
        text: "Network error. Try again.",
      });
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =========================
          MAIN LOGIN CONTAINER
      ========================== */}
      <div className="login-wrap">

        {/* =========================
            LEFT SIDE
        ========================== */}
        <section className="login-showcase">

          <div className="showcase-top">

            <div className="brand">
              <div className="brand-icon">🏦</div>

              <div>
                <div className="brand-name">
                  G-BANK
                </div>

                <div className="brand-subtitle">
                  WELCOME TO G-BANK
                </div>
              </div>
            </div>

            <div className="secure-badge">
              Secure • Smart • Reliable
            </div>

          </div>

          <div className="showcase-content">

            <div className="showcase-heading">
              Banking
              <br />
              for a
              <br />

              <span>
                Brighter
                <br />
                Tomorrow.
              </span>
            </div>

            <p className="showcase-description">
              Manage your money, make payments,
              track your savings and stay in control
              — all from one simple banking platform.
            </p>

            {/* FEATURES */}
            <div className="showcase-features">

              <div className="feature-item">
                <div className="feature-icon">
                  ↗
                </div>

                <div>
                  <strong>
                    Instant transfers
                  </strong>

                  <span>
                    Send money in seconds
                  </span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Secure banking
                  </strong>

                  <span>
                    Your money stays protected
                  </span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  $
                </div>

                <div>
                  <strong>
                    Smart money management
                  </strong>

                  <span>
                    Track your finances easily
                  </span>
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* =========================
            RIGHT SIDE LOGIN
        ========================== */}
        <section className="login-panel">

          <div className="login-content">

            <div className="login-heading">

              <div className="login-eyebrow">
                WELCOME BACK
              </div>

              <h1>
                Sign in to your
                <br />
                account
              </h1>

              <p>
                Enter your details to continue securely.
              </p>

            </div>


            {/* LOGIN FORM */}
            <form onSubmit={handleLogin}>

              {/* EMAIL */}
              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>


              {/* PASSWORD */}
              <div className="form-group">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>


              {/* REMEMBER / FORGOT */}
              <div className="form-options">

                <label className="remember-me">

                  <input
                    type="checkbox"
                  />

                  <span>
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  className="forgot-link"
                  onClick={openForgot}
                >
                  Forgot password?
                </button>

              </div>


              {/* MESSAGE */}
              {msg && (
                <div
                  className={`login-message ${msg.type}`}
                >
                  {msg.text}
                </div>
              )}


              {/* SIGN IN */}
              <button
                type="submit"
                className="signin-button"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : (
                    <>
                      Sign in
                      <span>→</span>
                    </>
                  )}
              </button>

            </form>


            {/* REGISTER */}
            <div className="register-section">

              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create account
              </Link>

            </div>

          </div>

        </section>

      </div>


      {/* =========================
          FORGOT PASSWORD MODAL
      ========================== */}
      {showForgot && (
        <div
          className="forgot-overlay"
          onClick={closeForgot}
        >

          <div
            className="forgot-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              onClick={closeForgot}
              disabled={fpLoading}
            >
              ×
            </button>

            <div className="modal-icon">
              🔐
            </div>

            <h2>
              Reset your password
            </h2>

            <p className="modal-description">
              Enter your account details to create
              a new password.
            </p>


            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="fp-email">
                Email address
              </label>

              <input
                id="fp-email"
                type="email"
                placeholder="you@example.com"
                value={fpEmail}
                onChange={(e) =>
                  setFpEmail(e.target.value)
                }
              />

            </div>


            {/* ACCOUNT NUMBER */}
            <div className="form-group">

              <label htmlFor="fp-account">
                Account number
              </label>

              <input
                id="fp-account"
                type="text"
                placeholder="Enter account number"
                value={fpAcc}
                onChange={(e) =>
                  setFpAcc(e.target.value)
                }
              />

            </div>


            {/* NEW PASSWORD */}
            <div className="form-group">

              <label htmlFor="fp-password">
                New password
              </label>

              <input
                id="fp-password"
                type="password"
                placeholder="Enter new password"
                value={fpNewPass}
                onChange={(e) =>
                  setFpNewPass(e.target.value)
                }
              />

            </div>


            {/* FORGOT MESSAGE */}
            {fpMsg && (
              <div
                className={`login-message ${fpMsg.type}`}
              >
                {fpMsg.text}
              </div>
            )}


            {/* RESET BUTTON */}
            <button
              type="button"
              className="signin-button modal-submit"
              onClick={handleForgotPassword}
              disabled={fpLoading}
            >
              {fpLoading
                ? "Resetting..."
                : "Reset password"}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
