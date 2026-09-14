// CustomerDashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./CustomerDashboard.css";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://bank-backend-sx1g.onrender.com"
    : process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/* ---------- Icons ---------- */
function Icon({ name, size = 18, strokeWidth = 2 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    arrowDown: <><path d="M12 4v14" /><path d="m6 12 6 6 6-6" /></>,
    arrowUp: <><path d="M12 20V6" /><path d="m6 12 6-6 6 6" /></>,
    transfer: <><path d="m17 3 4 4-4 4" /><path d="M21 7H7a4 4 0 0 0-4 4v2" /><path d="m7 21-4-4 4-4" /><path d="M3 17h14a4 4 0 0 0 4-4v-2" /></>,
    refresh: <><path d="M20 11a8.1 8.1 0 0 0-15.5-2" /><path d="M4 4v5h5" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2" /><path d="M20 20v-5h-5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h3" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 4-6" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h6" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    wallet: <><path d="M4 7h16a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" /><path d="M16 13h5" /></>,
    calculator: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2" /></>,
  };

  return <svg {...common}>{paths[name] || paths.card}</svg>;
}

/* ---------- Helpers ---------- */
function maskAccount(n) {
  if (!n) return "•••• •••• •••• ••••";
  const s = String(n);
  return `${s.slice(0, 4)} •••• •••• ${s.slice(-4)}`;
}

function fmt(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function fmtSigned(n) {
  const value = Number(n || 0);
  return `${value < 0 ? "-" : "+"} ${fmt(Math.abs(value))}`;
}

function isOutflow(t, account) {
  const k = String(t.type || "").toLowerCase();
  if (k.includes("withdraw")) return true;
  if (k.includes("deposit")) return false;

  const acc = String(account?.account_number || "");
  if (k.includes("transfer")) {
    if (t.from && String(t.from) === acc) return true;
    if (t.to && String(t.to) === acc) return false;
  }
  return Number(t.amount) < 0;
}

function signedAmount(t, account) {
  const amount = Math.abs(Number(t.amount || 0));
  return isOutflow(t, account) ? -amount : amount;
}

function timestamp(t) {
  const v = t?.timestamp;
  if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
  const d = Date.parse(v);
  return Number.isNaN(d) ? 0 : d;
}

function transactionTone(type = "") {
  const k = type.toLowerCase();
  if (k.includes("deposit")) return "deposit";
  if (k.includes("withdraw")) return "withdraw";
  if (k.includes("transfer")) return "transfer";
  return "default";
}

function calcEMI(p, annualRate, months) {
  const P = Number(p);
  const n = Number(months);
  const r = Number(annualRate) / 12 / 100;

  if (!P || !n) return { emi: 0, totalInterest: 0, totalPayment: 0 };

  if (r === 0) {
    const emi = P / n;
    return { emi, totalPayment: emi * n, totalInterest: emi * n - P };
  }

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;

  return {
    emi,
    totalPayment,
    totalInterest: totalPayment - P,
  };
}

function StatCard({ icon, label, value, helper, accent = "blue" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${accent}`}>
        <Icon name={icon} size={19} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </div>
  );
}

function ActionButton({ icon, title, subtitle, onClick, disabled, variant = "" }) {
  return (
    <button
      className={`action-button ${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="action-icon">
        <Icon name={icon} size={18} />
      </span>
      <span className="action-copy">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
    </button>
  );
}

export default function CustomerDashboard() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [transferAmt, setTransferAmt] = useState(300);
  const [modal, setModal] = useState({
    open: false,
    type: null,
    amount: "",
  });

  const [emailModal, setEmailModal] = useState({
    open: false,
    to: "",
    note: "",
  });

  const [loan, setLoan] = useState({
    amount: 50000,
    rate: 10,
    months: 12,
  });
  const [emiOut, setEmiOut] = useState(null);

  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    if (user?.user_id) {
      if (user.account) setAccount(user.account);
      fetchAccount();
      fetchHistory();
    }

    const onKey = (e) => {
      if (e.key === "Escape") {
        setModal({ open: false, type: null, amount: "" });
        setEmailModal({ open: false, to: "", note: "" });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (text, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3200
    );
  };

  const logout = () => {
    localStorage.removeItem("user");
    nav("/login");
  };

  /* ---------- API ---------- */
  const fetchAccount = async () => {
    try {
      const res = await fetch(`${API_URL}/accounts/${user.user_id}`);
      const data = await res.json();

      if (data.status === "success") {
        setAccount(data.account);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, account: data.account })
        );
      }
    } catch {
      showToast("Unable to refresh account", "error");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${API_URL}/transactions/history/${user.user_id}`
      );
      const data = await res.json();

      if (data.status === "success") {
        setTransactions(data.transactions || []);
      }
    } catch {
      showToast("Unable to load transactions", "error");
    }
  };

  const applyNewBalance = (newBalance) => {
    const nextAcc = { ...(account || {}), balance: newBalance };
    setAccount(nextAcc);
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, account: nextAcc })
    );
  };

  const openAmountModal = (type) => {
    if (!account?.account_number) {
      return showToast("No account found", "error");
    }
    setModal({ open: true, type, amount: "" });
  };

  const closeModal = () =>
    setModal({ open: false, type: null, amount: "" });

  const confirmModal = async () => {
    const amt = Number(modal.amount);

    if (!amt || amt <= 0) {
      return showToast("Enter a valid amount", "error");
    }

    const endpoint =
      modal.type === "deposit"
        ? `${API_URL}/transactions/deposit`
        : `${API_URL}/transactions/withdraw`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_number: account.account_number,
          amount: amt,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        applyNewBalance(data.new_balance);
        fetchHistory();

        showToast(
          `${modal.type === "deposit" ? "Deposited" : "Withdrawn"} ${fmt(
            amt
          )}. New balance: ${fmt(data.new_balance)}`
        );

        closeModal();
      } else {
        showToast(data.detail || "Operation failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const transferMoney = async () => {
    if (!account?.account_number) {
      return showToast("No sender account found", "error");
    }

    const toAcc = prompt("Enter receiver Account Number:");
    if (!toAcc) return;

    const amount = Number(transferAmt) || 300;

    try {
      const res = await fetch(`${API_URL}/transactions/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_account: account.account_number,
          to_account: toAcc,
          amount,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        applyNewBalance(data.from_account_new_balance);
        fetchHistory();

        showToast(
          `Transferred ${fmt(amount)}. New balance: ${fmt(
            data.from_account_new_balance
          )}`
        );
      } else {
        showToast(data.detail || "Transfer failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  /* ---------- Transactions ---------- */
  const txnsSorted = useMemo(() => {
    return (transactions || [])
      .map((t) => ({
        ...t,
        _signed: signedAmount(t, account),
        _ts: timestamp(t),
      }))
      .sort((a, b) => b._ts - a._ts);
  }, [transactions, account]);

  const moneyIn = txnsSorted
    .filter((t) => t._signed > 0)
    .reduce((s, t) => s + t._signed, 0);

  const moneyOut = txnsSorted
    .filter((t) => t._signed < 0)
    .reduce((s, t) => s + Math.abs(t._signed), 0);

  /* ---------- PDF ---------- */
  const buildPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pad = 36;

    doc.setFontSize(18).setTextColor(15, 23, 42);
    doc.text("G-BANK Transaction Statement", pad, 48);

    doc.setFontSize(10).setTextColor(100);

    const meta = [
      `User: ${user?.username || "-"}`,
      `Email: ${user?.email || "-"}`,
      `Account: ${account?.account_number || "-"}`,
      `Generated: ${new Date().toLocaleString()}`,
    ].join("   |   ");

    doc.text(meta, pad, 66);

    const rows = txnsSorted.map((t, i) => [
      i + 1,
      t.type,
      new Date(t._ts).toLocaleString(),
      (t._signed < 0 ? "-" : "+") +
        Number(Math.abs(t._signed)).toLocaleString("en-IN"),
      Number(t.balance_after).toLocaleString("en-IN"),
    ]);

    autoTable(doc, {
      startY: 90,
      head: [["#", "Type", "When", "Amount (₹)", "Balance After (₹)"]],
      body: rows,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235], halign: "left" },
      didDrawPage: () => {
        const p = `Page ${doc.getNumberOfPages()}`;
        doc.setFontSize(10).setTextColor(120);
        doc.text(
          p,
          doc.internal.pageSize.getWidth() - pad,
          doc.internal.pageSize.getHeight() - 16,
          { align: "right" }
        );
      },
    });

    const y = (doc.lastAutoTable?.finalY || 90) + 20;

    doc.setFontSize(12).setTextColor(15, 23, 42);
    doc.text(
      `Total Money In: ₹${moneyIn.toLocaleString("en-IN")}`,
      pad,
      y
    );
    doc.text(
      `Total Money Out: ₹${moneyOut.toLocaleString("en-IN")}`,
      pad,
      y + 18
    );
    doc.text(`Closing Balance: ${fmt(account?.balance)}`, pad, y + 36);

    return doc;
  };

  const downloadPdf = () => {
    const doc = buildPdf();
    const fname = `statement_${
      account?.account_number || "account"
    }_${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.save(fname);
    showToast("PDF downloaded");
  };

  /* ---------- Email ---------- */
  const openEmailModal = () => {
    setEmailModal({
      open: true,
      to: user?.email || "",
      note: "",
    });
  };

  const closeEmailModal = () => {
    setEmailModal({ open: false, to: "", note: "" });
  };

  const sendPdfToEmail = async () => {
    if (
      !emailModal.to ||
      !/^\S+@\S+\.\S+$/.test(emailModal.to)
    ) {
      return showToast("Enter a valid email", "error");
    }

    const doc = buildPdf();
    const pdfBlob = doc.output("blob");
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = (reader.result || "").toString().split(",")[1];

      try {
        const res = await fetch(
          `${API_URL}/transactions/send-report`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user?.user_id,
              to_email: emailModal.to,
              note: emailModal.note,
              filename: `statement_${
                account?.account_number || "account"
              }.pdf`,
              pdf_base64: base64,
            }),
          }
        );

        const data = await res.json();

        if (data.status === "success") {
          showToast("Report emailed successfully");
          closeEmailModal();
        } else {
          showToast(data.detail || "Email failed", "error");
        }
      } catch {
        showToast("Network error while emailing", "error");
      }
    };

    reader.readAsDataURL(pdfBlob);
  };

  const runEmi = () =>
    setEmiOut(calcEMI(loan.amount, loan.rate, loan.months));

  const disabled = !account?.account_number;
  const firstName =
    user?.username?.split(" ")[0] || "Customer";

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <header className="db-header">
        <div className="db-header-inner">
          <button className="brand" onClick={() => window.scrollTo(0, 0)}>
            <span className="brand-mark">G</span>
            <span className="brand-name">
              G-<b>BANK</b>
            </span>
          </button>

          <nav className="db-nav">
            <button className="nav-item active">
              <Icon name="home" size={16} />
              Overview
            </button>
            <button
              className="nav-item"
              onClick={() =>
                document
                  .getElementById("transactions")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Transactions
            </button>
            <button
              className="nav-item"
              onClick={() =>
                document
                  .getElementById("tools")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Financial Tools
            </button>
          </nav>

          <div className="header-right">
            <div className="header-search">
              <Icon name="search" size={16} />
              <input placeholder="Search transactions..." />
            </div>

            <button
              className="icon-button"
              title="Notifications"
              onClick={() => showToast("You're all caught up")}
            >
              <Icon name="bell" size={18} />
              <span className="notification-dot" />
            </button>

            <button
              className="profile-button"
              onClick={() => nav("/me")}
              title="Edit profile"
            >
              <span className="profile-avatar">
                {(user?.username || "GU")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="profile-name">
                {firstName}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="db-content">
        {/* Hero */}
        <section className="welcome-section">
          <div>
            <span className="eyebrow">PERSONAL BANKING</span>
            <h1>
              Good evening, <span>{firstName}.</span>
            </h1>
            <p>
              Here's your financial overview. Everything you need,
              right at your fingertips.
            </p>
          </div>

          <button className="refresh-button" onClick={fetchAccount}>
            <Icon name="refresh" size={16} />
            Refresh account
          </button>
        </section>

        {/* Stats */}
        <section className="stats-grid">
          <StatCard
            icon="wallet"
            label="Available Balance"
            value={fmt(account?.balance)}
            helper={`A/C • ${
              account?.account_number || "Not available"
            }`}
            accent="blue"
          />

          <StatCard
            icon="chart"
            label="Money Out"
            value={fmt(moneyOut)}
            helper="Based on transaction history"
            accent="orange"
          />

          <StatCard
            icon="card"
            label="Savings Vault"
            value={fmt(215000)}
            helper="43% of ₹5,00,000 goal"
            accent="green"
          />

          <StatCard
            icon="transfer"
            label="Last Transaction"
            value={
              txnsSorted[0]
                ? fmtSigned(txnsSorted[0]._signed)
                : "₹0"
            }
            helper={
              txnsSorted[0]
                ? `${txnsSorted[0].type} • ${new Date(
                    txnsSorted[0]._ts
                  ).toLocaleDateString()}`
                : "No recent activity"
            }
            accent="purple"
          />
        </section>

        {/* Main balance + actions */}
        <section className="dashboard-grid">
          <div className="balance-card">
            <div className="balance-top">
              <div>
                <span className="balance-label">
                  TOTAL AVAILABLE BALANCE
                </span>
                <h2>{fmt(account?.balance)}</h2>
              </div>
              <span className="balance-status">
                <span />
                Active
              </span>
            </div>

            <div className="balance-divider" />

            <div className="balance-details">
              <div>
                <span>Account number</span>
                <strong>
                  {maskAccount(account?.account_number)}
                </strong>
              </div>
              <div>
                <span>Account type</span>
                <strong>G-BANK Savings</strong>
              </div>
              <div>
                <span>Money in</span>
                <strong className="positive">
                  + {fmt(moneyIn)}
                </strong>
              </div>
            </div>

            <div className="balance-footer">
              <div className="mini-chip">
                <Icon name="card" size={15} />
                Secure account
              </div>
              <span>Protected by G-BANK security</span>
            </div>
          </div>

          <div className="actions-panel">
            <div className="section-title">
              <div>
                <span className="eyebrow">MANAGE MONEY</span>
                <h2>Quick actions</h2>
              </div>
            </div>

            <div className="actions-grid">
              <ActionButton
                icon="arrowDown"
                title="Deposit"
                subtitle="Add money"
                onClick={() => openAmountModal("deposit")}
                disabled={disabled}
              />
              <ActionButton
                icon="arrowUp"
                title="Withdraw"
                subtitle="Take out money"
                onClick={() => openAmountModal("withdraw")}
                disabled={disabled}
                variant="orange"
              />
              <ActionButton
                icon="transfer"
                title="Transfer"
                subtitle={`Send ${fmt(transferAmt)}`}
                onClick={transferMoney}
                disabled={disabled}
                variant="purple"
              />
              <div className="transfer-input">
                <label>Transfer amount</label>
                <div className="money-input">
                  <span>₹</span>
                  <input
                    type="number"
                    min="1"
                    value={transferAmt}
                    onChange={(e) =>
                      setTransferAmt(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transactions + side */}
        <section className="content-grid" id="transactions">
          <div className="panel transactions-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">ACTIVITY</span>
                <h2>Recent transactions</h2>
              </div>

              <div className="panel-actions">
                <button
                  className="secondary-button"
                  onClick={fetchHistory}
                >
                  <Icon name="refresh" size={14} />
                  Refresh
                </button>
                <button
                  className="secondary-button"
                  onClick={downloadPdf}
                >
                  <Icon name="file" size={14} />
                  PDF
                </button>
                <button
                  className="primary-button small"
                  onClick={openEmailModal}
                >
                  <Icon name="mail" size={14} />
                  Email
                </button>
              </div>
            </div>

            {txnsSorted.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icon name="file" size={22} />
                </div>
                <strong>No transactions yet</strong>
                <span>
                  Your recent banking activity will appear here.
                </span>
              </div>
            ) : (
              <div className="transaction-list">
                <div className="transaction-head">
                  <span>Transaction</span>
                  <span>Date</span>
                  <span>Amount</span>
                  <span>Balance</span>
                </div>

                {txnsSorted.slice(0, 8).map((t, idx) => {
                  const tone = transactionTone(t.type);

                  return (
                    <div
                      className="transaction-row"
                      key={`${t._ts}-${idx}`}
                    >
                      <div className="transaction-name">
                        <span className={`txn-icon ${tone}`}>
                          <Icon
                            name={
                              tone === "deposit"
                                ? "arrowDown"
                                : tone === "withdraw"
                                ? "arrowUp"
                                : tone === "transfer"
                                ? "transfer"
                                : "card"
                            }
                            size={16}
                          />
                        </span>
                        <div>
                          <strong>{t.type}</strong>
                          <small>
                            {t.from && t.to
                              ? `${t.from} → ${t.to}`
                              : "G-BANK account"}
                          </small>
                        </div>
                      </div>

                      <span className="transaction-date">
                        {new Date(t._ts).toLocaleString()}
                      </span>

                      <strong
                        className={
                          t._signed < 0
                            ? "amount-negative"
                            : "amount-positive"
                        }
                      >
                        {fmtSigned(t._signed)}
                      </strong>

                      <span className="transaction-balance">
                        {fmt(t.balance_after)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="side-column">
            <div className="panel savings-panel">
              <div className="side-title">
                <div className="side-icon green">
                  <Icon name="wallet" size={17} />
                </div>
                <div>
                  <span className="eyebrow">YOUR GOAL</span>
                  <h3>Savings vault</h3>
                </div>
              </div>

              <div className="savings-amount">
                <strong>₹2.15L</strong>
                <span>of ₹5L</span>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: "43%" }} />
              </div>

              <div className="progress-labels">
                <span>43% completed</span>
                <span>₹2.85L remaining</span>
              </div>
            </div>

            <div className="panel bills-panel">
              <div className="side-title">
                <div className="side-icon blue">
                  <Icon name="card" size={17} />
                </div>
                <div>
                  <span className="eyebrow">UPCOMING</span>
                  <h3>Scheduled payments</h3>
                </div>
              </div>

              <div className="bill-list">
                <div className="bill-item">
                  <span>Jio Fiber</span>
                  <strong>₹799</strong>
                  <small>28 Aug</small>
                </div>
                <div className="bill-item">
                  <span>Credit Card</span>
                  <strong>₹18,300</strong>
                  <small>05 Sep</small>
                </div>
                <div className="bill-item">
                  <span>Rent</span>
                  <strong>₹12,000</strong>
                  <small>01 Sep</small>
                </div>
              </div>

              <button
                className="secondary-button full"
                onClick={() => showToast("Bill payments coming soon")}
              >
                Manage payments
              </button>
            </div>
          </aside>
        </section>

        {/* Tools */}
        <section className="tools-section" id="tools">
          <div className="section-title tools-heading">
            <div>
              <span className="eyebrow">PLAN AHEAD</span>
              <h2>Financial tools</h2>
              <p>Make smarter borrowing decisions with a quick EMI estimate.</p>
            </div>
          </div>

          <div className="emi-card">
            <div className="emi-intro">
              <div className="emi-icon">
                <Icon name="calculator" size={23} />
              </div>
              <div>
                <h3>EMI calculator</h3>
                <p>
                  Estimate your monthly payment, total interest and
                  total repayment.
                </p>
              </div>
            </div>

            <div className="emi-fields">
              <label>
                <span>Loan amount</span>
                <div className="field-with-prefix">
                  <b>₹</b>
                  <input
                    type="number"
                    min="1"
                    value={loan.amount}
                    onChange={(e) =>
                      setLoan({
                        ...loan,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
              </label>

              <label>
                <span>Interest rate</span>
                <div className="field-with-suffix">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={loan.rate}
                    onChange={(e) =>
                      setLoan({
                        ...loan,
                        rate: e.target.value,
                      })
                    }
                  />
                  <b>%</b>
                </div>
              </label>

              <label>
                <span>Tenure</span>
                <div className="field-with-suffix">
                  <input
                    type="number"
                    min="1"
                    value={loan.months}
                    onChange={(e) =>
                      setLoan({
                        ...loan,
                        months: e.target.value,
                      })
                    }
                  />
                  <b>mo</b>
                </div>
              </label>

              <button className="primary-button calculate" onClick={runEmi}>
                Calculate EMI
              </button>
            </div>

            {emiOut && (
              <div className="emi-results">
                <div>
                  <span>Monthly EMI</span>
                  <strong>{fmt(emiOut.emi)}</strong>
                </div>
                <div>
                  <span>Total interest</span>
                  <strong>{fmt(emiOut.totalInterest)}</strong>
                </div>
                <div>
                  <span>Total payment</span>
                  <strong>{fmt(emiOut.totalPayment)}</strong>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer actions */}
        <footer className="db-footer">
          <div>
            <span className="footer-brand">G-BANK</span>
            <span>Secure digital banking for everyday life.</span>
          </div>

          <button className="logout-button" onClick={logout}>
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </footer>
      </main>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.type === "error" ? "error" : "success"}`}
          >
            <span className="toast-icon">
              <Icon
                name={t.type === "error" ? "close" : "check"}
                size={15}
              />
            </span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* Deposit / Withdraw Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
              <Icon name="close" size={18} />
            </button>

            <div className={`modal-icon ${modal.type}`}>
              <Icon
                name={
                  modal.type === "deposit"
                    ? "arrowDown"
                    : "arrowUp"
                }
                size={22}
              />
            </div>

            <span className="eyebrow">
              {modal.type === "deposit"
                ? "ADD MONEY"
                : "MOVE MONEY"}
            </span>

            <h3>
              {modal.type === "deposit"
                ? "Deposit money"
                : "Withdraw money"}
            </h3>

            <p>
              Enter the amount you want to{" "}
              {modal.type === "deposit"
                ? "add to"
                : "withdraw from"}{" "}
              your account.
            </p>

            <label className="modal-label">Amount</label>
            <div className="modal-money-input">
              <span>₹</span>
              <input
                type="number"
                min="1"
                autoFocus
                placeholder="0.00"
                value={modal.amount}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    amount: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={confirmModal}
              >
                Confirm {modal.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal.open && (
        <div
          className="modal-overlay"
          onClick={closeEmailModal}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeEmailModal}
            >
              <Icon name="close" size={18} />
            </button>

            <div className="modal-icon email">
              <Icon name="mail" size={22} />
            </div>

            <span className="eyebrow">STATEMENT</span>
            <h3>Email transaction statement</h3>
            <p>
              Send your current G-BANK transaction statement as a PDF.
            </p>

            <label className="modal-label">Recipient email</label>
            <input
              className="modal-text-input"
              type="email"
              value={emailModal.to}
              onChange={(e) =>
                setEmailModal({
                  ...emailModal,
                  to: e.target.value,
                })
              }
            />

            <label className="modal-label">Note (optional)</label>
            <textarea
              className="modal-textarea"
              rows="3"
              placeholder="Add a short note..."
              value={emailModal.note}
              onChange={(e) =>
                setEmailModal({
                  ...emailModal,
                  note: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={closeEmailModal}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={sendPdfToEmail}
              >
                <Icon name="mail" size={15} />
                Send statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
