import "./Home.css";
import heroImg from "../components/download.jpeg";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-wrap">

      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-icon">🏦</span>
          <span>G-BANK</span>
        </div>

        <div className="nav-links">
          <Link className="active" to="/">Home</Link>
          <Link to="/dashboard">Customer</Link>
          <Link to="/admin">Admin</Link>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <button className="theme-btn">☾</button>
          <Link className="login-btn" to="/login">Login</Link>
          <Link className="signup-btn" to="/register">
            Create account
          </Link>
        </div>
      </nav>

      <main className="landing-hero">

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

          <div className="feature-row">

            <div className="mini-feature">
              <div className="mini-icon">↗</div>
              <div>
                <strong>Instant Transfers</strong>
                <small>Send money in seconds</small>
              </div>
            </div>

            <div className="mini-feature">
              <div className="mini-icon green">◩</div>
              <div>
                <strong>Smart Insights</strong>
                <small>Track and grow savings</small>
              </div>
            </div>

            <div className="mini-feature">
              <div className="mini-icon pink">♢</div>
              <div>
                <strong>Bank-Grade Security</strong>
                <small>Your data, always safe</small>
              </div>
            </div>

          </div>

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

        <section className="hero-visual">

          <div className="blue-circle"></div>

          <div className="goal-card floating-card">
            🎯
            <div>
              <strong>₹2,15,000</strong>
              <span>Savings Goal</span>
            </div>
          </div>

          <div className="safe-card floating-card">
            🔒
            <div>
              <strong>Safe</strong>
              <span>Transactions</span>
            </div>
          </div>

          <div className="phone">
            <div className="phone-top">
              <strong>🏦 G-BANK</strong>
              <span>🔔</span>
              <b>LI</b>
            </div>

            <p className="welcome">
              Welcome back,<br />
              <strong>LIKITH 👋</strong>
            </p>

            <div className="balance-card">
              <small>Available Balance</small>
              <strong>₹3,800</strong>
              <span>A/C • 45069587</span>
              <b>VISA</b>
            </div>

            <div className="quick-buttons">
              <span>↓<small>Deposit</small></span>
              <span>↑<small>Withdraw</small></span>
              <span>⇄<small>Transfer</small></span>
              <span>•••<small>More</small></span>
            </div>

            <div className="transactions">
              <div className="transaction-title">
                <strong>Recent Transactions</strong>
                <span>View all</span>
              </div>

              <div className="transaction">
                <i>↓</i>
                <div>
                  <strong>Deposit</strong>
                  <small>14 Sep 2026</small>
                </div>
                <b>+ ₹2,000</b>
              </div>

              <div className="transaction">
                <i>⇄</i>
                <div>
                  <strong>Transfer</strong>
                  <small>14 Sep 2026</small>
                </div>
                <b>+ ₹300</b>
              </div>

              <div className="transaction">
                <i>↑</i>
                <div>
                  <strong>Withdraw</strong>
                  <small>14 Sep 2026</small>
                </div>
                <b className="negative">- ₹200</b>
              </div>
            </div>

            <div className="phone-bottom">
              <span>⌂<small>Home</small></span>
              <span>▣<small>Bills</small></span>
              <span>♡<small>Goals</small></span>
              <span>♙<small>Profile</small></span>
            </div>
          </div>

          <div className="bank-card">
            <div>🏦 G-BANK</div>
            <div className="chip"></div>
            <strong>4506 •••• •••• 9587</strong>
            <span>LIKITH</span>
            <b>VISA</b>
          </div>

          <div className="goals-card floating-card">
            📈
            <div>
              <strong>Your Goals</strong>
              <span>Our Support</span>
            </div>
          </div>

        </section>

      </main>

      <footer className="landing-footer">
        <span>🏦 G-BANK</span>
        <span>More than a bank. A better tomorrow.</span>
      </footer>

    </div>
  );
}
