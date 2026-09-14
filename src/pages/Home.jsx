import "./Home.css";
import heroImg from "../components/download.jpeg";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-wrap">

      {/* ================= NAVBAR ================= */}
      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-icon">🏦</span>
          <span>G-BANK</span>
        </div>

        <div className="nav-links">
          <Link className="active" to="/">
            Home
          </Link>

          <Link to="/dashboard">
            Customer
          </Link>

          <Link to="/admin">
            Admin
          </Link>

          <a href="#about">
            About
          </a>
        </div>

        <div className="nav-actions">
          <button className="theme-btn" type="button">
            ☾
          </button>

          <Link className="login-btn" to="/login">
            Login
          </Link>

          <Link className="signup-btn" to="/register">
            Create account
          </Link>
        </div>
      </nav>


      {/* ================= HERO ================= */}
      <main className="landing-hero">

        {/* -------- LEFT SIDE -------- */}
        <section className="hero-copy">

          <div className="secure-pill">
            🛡️ Secure • Fast • Reliable
          </div>

          <h1>
            Banking for a
            <br />
            <span>Brighter Tomorrow</span>
          </h1>

          <p className="hero-description">
            Manage your money, make payments, save for your goals
            and stay in control — all in one secure and easy-to-use
            platform.
          </p>

          <div className="hero-buttons">
            <Link className="primary-cta" to="/login">
              Get started <span>→</span>
            </Link>

            <Link className="secondary-cta" to="/login">
              Sign in
            </Link>
          </div>


          {/* -------- FEATURES -------- */}
          <div className="feature-row">

            <div className="mini-feature">
              <div className="mini-icon">
                ↗
              </div>

              <div>
                <strong>Instant Transfers</strong>
                <small>Send money in seconds</small>
              </div>
            </div>


            <div className="mini-feature">
              <div className="mini-icon green">
                ◩
              </div>

              <div>
                <strong>Smart Insights</strong>
                <small>Track and grow savings</small>
              </div>
            </div>


            <div className="mini-feature">
              <div className="mini-icon pink">
                ♢
              </div>

              <div>
                <strong>Bank-Grade Security</strong>
                <small>Your data, always safe</small>
              </div>
            </div>

          </div>


          {/* -------- STATS -------- */}
          <div className="stats-row">

            <div>
              <strong>10K+</strong>
              <span>Happy Customers</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Secure Transactions</span>
            </div>

            <div>
              <strong>24×7</strong>
              <span>Customer Support</span>
            </div>

          </div>

        </section>


        {/* =================================================
             RIGHT SIDE
             ONLY THE IMAGE
             
             IMPORTANT:
             This is NOT a CSS background image.
             It is a normal <img> element.
             ================================================= */}
        <section className="hero-visual">

          <img
            src={heroImg}
            alt="G-BANK banking dashboard"
            className="hero-image"
          />

        </section>

      </main>


      {/* ================= ABOUT ================= */}
      <section id="about" className="about-section">

        <div className="about-content">

          <span className="secure-pill">
            🏦 About G-BANK
          </span>

          <h2>
            Banking made
            <span> simpler.</span>
          </h2>

          <p>
            G-BANK brings everyday banking into one simple platform.
            Manage accounts, transfer money, track transactions,
            monitor savings and access your banking tools whenever
            you need them.
          </p>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="landing-footer">

        <span>
          🏦 G-BANK
        </span>

        <span>
          More than a bank. A better tomorrow.
        </span>

      </footer>

    </div>
  );
}
