// src/pages/UserDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDetails.css";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://bank-backend-sx1g.onrender.com"
    : process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    phone: (
      <>
        <path d="M6.5 3.5h3l1.5 4-2 1.5a15 15 0 0 0 6 6l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10.5 19.5 4.5 13.5 4.5 5.5c0-1.1.9-2 2-2Z" />
      </>
    ),
    map: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.2 2.5 3.2 5.5 3.2 9s-1 6.5-3.2 9c-2.2-2.5-3.2-5.5-3.2-9S9.8 5.5 12 3Z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.2 8.3-8 10-4.8-1.7-8-5-8-10V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 11v6M14 11v6" />
        <path d="m9 7 .7-2h4.6l.7 2M6 7l1 14h10l1-14" />
      </>
    ),
    arrow: <path d="m5 12 10-0M13 7l5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    back: <path d="m15 18-6-6 6-6" />,
  };

  return <svg {...common}>{paths[name] || paths.user}</svg>;
}

export default function UserDetails() {
  const nav = useNavigate();

  const userLocal = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const accountNumber = userLocal?.account?.account_number;

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    username: userLocal?.username || "",
    email: userLocal?.email || "",
    dob: "",
    phone: "",
    address: "",
    country: "India",
    language: "English",
    time_zone: "Asia/Kolkata",
    welcome: "Welcome to my page.",
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!accountNumber) {
        setLoading(false);
        return;
      }

      try {
        const r = await fetch(
          `${API_URL}/users/by-account/${accountNumber}`
        );
        const data = await r.json();

        if (!alive) return;

        if (data.status === "success") {
          const u = data.user || {};
          setForm((f) => ({
            ...f,
            username: u.username ?? f.username,
            email: u.email ?? f.email,
            dob: u.dob ?? "",
            phone: u.phone ?? "",
            address: u.address ?? "",
            country: u.country ?? f.country,
            language: u.language ?? f.language,
            time_zone: u.time_zone ?? f.time_zone,
            welcome: u.welcome ?? f.welcome,
          }));
        } else {
          setMsg(data.detail || "Failed to load profile");
        }
      } catch {
        setMsg("Network error while loading profile");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [accountNumber]);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const save = async () => {
    setMsg("");
    if (!accountNumber) return setMsg("Account information is unavailable.");

    setSaving(true);
    try {
      const r = await fetch(
        `${API_URL}/users/by-account/${accountNumber}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            dob: form.dob,
            phone: form.phone,
            address: form.address,
            country: form.country,
            language: form.language,
            time_zone: form.time_zone,
            welcome: form.welcome,
          }),
        }
      );

      const data = await r.json();

      if (data.status === "success") {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...userLocal, username: form.username })
        );
        setMsg("Profile changes saved successfully.");
      } else {
        setMsg(data.detail || "Save failed");
      }
    } catch {
      setMsg("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const old_password = fd.get("old_password");
    const new_password = fd.get("new_password");
    const confirm = fd.get("confirm");

    if (!old_password || !new_password) {
      return setMsg("Enter both current and new password.");
    }

    if (new_password !== confirm) {
      return setMsg("New passwords do not match.");
    }

    setMsg("");
    setPasswordSaving(true);

    try {
      const r = await fetch(
        `${API_URL}/users/by-account/${accountNumber}/password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ old_password, new_password }),
        }
      );

      const data = await r.json();

      if (data.status === "success") {
        setMsg("Password updated successfully.");
        e.currentTarget.reset();
      } else {
        setMsg(data.detail || "Password change failed");
      }
    } catch {
      setMsg("Network error while changing password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const current_password = fd.get("current_password");
    const confirmCheck = fd.get("confirm_delete") === "on";

    if (!confirmCheck) {
      return setMsg("Please confirm that you want to delete your account.");
    }

    if (!current_password) {
      return setMsg("Enter your current password to delete your account.");
    }

    if (!window.confirm("Delete account permanently? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setMsg("");

    try {
      const r = await fetch(
        `${API_URL}/users/by-account/${accountNumber}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_password }),
        }
      );

      const data = await r.json();

      if (data.status === "success") {
        localStorage.removeItem("user");
        localStorage.removeItem("admin_ok");
        nav("/register", { replace: true });
      } else {
        setMsg(data.detail || "Delete failed");
      }
    } catch {
      setMsg("Network error while deleting");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  const initials = (form.username || "GU")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const hasError =
    /fail|error|network|delete|unavailable|match/i.test(msg);

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <button className="profile-brand" onClick={() => nav("/dashboard")}>
          <span className="brand-symbol">G</span>
          <span>
            <strong>G-BANK</strong>
            <small>Personal Banking</small>
          </span>
        </button>

        <div className="profile-topbar-right">
          <span className="secure-label">
            <Icon name="shield" size={16} />
            Secure account
          </span>
          <button
            className="top-avatar"
            onClick={() => nav("/dashboard")}
            title="Back to dashboard"
          >
            {initials}
          </button>
        </div>
      </header>

      <main className="profile-content">
        <button className="back-link" onClick={() => nav(-1)}>
          <Icon name="back" size={18} />
          Back to dashboard
        </button>

        <section className="profile-heading">
          <div>
            <span className="profile-eyebrow">PROFILE & SECURITY</span>
            <h1>Account settings</h1>
            <p>
              Manage your personal information, preferences and account
              security.
            </p>
          </div>

          <div className="account-badge">
            <span className="account-badge-dot" />
            Account active
          </div>
        </section>

        {msg && (
          <div className={`profile-message ${hasError ? "error" : "success"}`}>
            <span className="message-icon">
              <Icon name={hasError ? "shield" : "check"} size={17} />
            </span>
            <span>{msg}</span>
          </div>
        )}

        <section className="profile-layout">
          <div className="profile-main-card">
            <div className="card-heading">
              <div className="heading-icon blue">
                <Icon name="user" size={20} />
              </div>
              <div>
                <h2>Personal information</h2>
                <p>Keep your account details up to date.</p>
              </div>
            </div>

            <div className="profile-form">
              <label className="profile-field">
                <span>Full name</span>
                <div className="input-shell">
                  <Icon name="user" size={17} />
                  <input
                    name="username"
                    value={form.username}
                    onChange={onChange}
                    placeholder="Your full name"
                  />
                </div>
              </label>

              <label className="profile-field">
                <span>Email address</span>
                <div className="input-shell disabled">
                  <Icon name="mail" size={17} />
                  <input value={form.email} disabled />
                  <em>Verified</em>
                </div>
              </label>

              <label className="profile-field">
                <span>Date of birth</span>
                <div className="input-shell">
                  <Icon name="calendar" size={17} />
                  <input
                    type="date"
                    name="dob"
                    value={form.dob || ""}
                    onChange={onChange}
                  />
                </div>
              </label>

              <label className="profile-field">
                <span>Phone number</span>
                <div className="input-shell">
                  <Icon name="phone" size={17} />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </label>

              <label className="profile-field full">
                <span>Address</span>
                <div className="input-shell">
                  <Icon name="map" size={17} />
                  <input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Street, City, PIN"
                  />
                </div>
              </label>

              <label className="profile-field">
                <span>Country</span>
                <div className="select-shell">
                  <Icon name="globe" size={17} />
                  <select
                    name="country"
                    value={form.country}
                    onChange={onChange}
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Indonesia</option>
                  </select>
                </div>
              </label>

              <label className="profile-field">
                <span>Language</span>
                <div className="select-shell">
                  <Icon name="globe" size={17} />
                  <select
                    name="language"
                    value={form.language}
                    onChange={onChange}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </label>

              <label className="profile-field">
                <span>Time zone</span>
                <div className="select-shell">
                  <Icon name="calendar" size={17} />
                  <select
                    name="time_zone"
                    value={form.time_zone}
                    onChange={onChange}
                  >
                    <option>Asia/Kolkata</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Jakarta</option>
                  </select>
                </div>
              </label>

              <label className="profile-field full">
                <span>Welcome message</span>
                <textarea
                  name="welcome"
                  rows={3}
                  value={form.welcome}
                  onChange={onChange}
                  placeholder="Write a short welcome message..."
                />
              </label>
            </div>

            <div className="profile-card-footer">
              <span>
                <Icon name="shield" size={15} />
                Your information is protected by G-BANK security.
              </span>
              <button
                className="save-button"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
                {!saving && <Icon name="check" size={17} />}
              </button>
            </div>
          </div>

          <aside className="profile-side">
            <div className="security-card">
              <div className="side-card-heading">
                <div className="heading-icon blue">
                  <Icon name="lock" size={19} />
                </div>
                <div>
                  <h2>Security</h2>
                  <p>Update your password regularly.</p>
                </div>
              </div>

              <form onSubmit={changePassword} className="security-form">
                <label>
                  <span>Current password</span>
                  <input
                    name="old_password"
                    type="password"
                    placeholder="Enter current password"
                  />
                </label>

                <label>
                  <span>New password</span>
                  <input
                    name="new_password"
                    type="password"
                    placeholder="Create a new password"
                  />
                </label>

                <label>
                  <span>Confirm new password</span>
                  <input
                    name="confirm"
                    type="password"
                    placeholder="Repeat new password"
                  />
                </label>

                <button
                  className="security-button"
                  disabled={passwordSaving}
                >
                  <Icon name="lock" size={16} />
                  {passwordSaving ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>

            <div className="account-info-card">
              <span className="info-label">ACCOUNT NUMBER</span>
              <strong>{accountNumber || "Not available"}</strong>
              <span className="info-status">
                <span /> Active savings account
              </span>
            </div>

            <div className="danger-card">
              <div className="danger-heading">
                <div className="danger-icon">
                  <Icon name="trash" size={18} />
                </div>
                <div>
                  <h2>Danger zone</h2>
                  <p>Permanently close your G-BANK account.</p>
                </div>
              </div>

              <form onSubmit={deleteAccount} className="danger-form">
                <label>
                  <span>Current password</span>
                  <input
                    name="current_password"
                    type="password"
                    placeholder="Enter your password"
                  />
                </label>

                <label className="delete-check">
                  <input type="checkbox" name="confirm_delete" />
                  <span>
                    I understand that deleting my account is permanent and
                    cannot be undone.
                  </span>
                </label>

                <button className="delete-button" disabled={deleting}>
                  <Icon name="trash" size={16} />
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </form>
            </div>
          </aside>
        </section>

        <footer className="profile-footer">
          <Icon name="shield" size={18} />
          <div>
            <strong>Your security. Our priority.</strong>
            <span>Never share your G-BANK password with anyone.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
