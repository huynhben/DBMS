import { useState, useEffect } from "react";

const API = "http://localhost:5001/api";

const TABS = ["Dashboard", "Users", "Courses", "Assignments", "Enrollments", "Add User"];

// ── Helpers ──────────────────────────────────────────────────────
function StatusBadge({ ok }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 999,
      background: ok ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
      color: ok ? "#34d399" : "#f87171",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: ok ? "#34d399" : "#f87171",
        boxShadow: ok ? "0 0 8px #34d399" : "0 0 8px #f87171",
        animation: ok ? "pulse 2s infinite" : "none",
      }} />
      {ok ? "CONNECTED" : "DISCONNECTED"}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: 24,
      backdropFilter: "blur(4px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Table({ data }) {
  if (!data || data.length === 0)
    return <p style={{ color: "#64748b", fontFamily: "monospace" }}>No data.</p>;
  const keys = Object.keys(data[0]);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={k} style={{
                textAlign: "left", padding: "10px 14px",
                background: "rgba(99,179,237,0.1)", color: "#63b3ed",
                borderBottom: "1px solid rgba(99,179,237,0.2)",
                fontWeight: 600, letterSpacing: "0.05em", fontSize: 11,
                textTransform: "uppercase",
              }}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {keys.map((k) => (
                <td key={k} style={{ padding: "10px 14px", color: "#cbd5e1" }}>
                  {row[k] === null ? <span style={{ color: "#475569" }}>NULL</span>
                    : String(row[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────
function Dashboard({ summary }) {
  return (
    <div>
      <h2 style={sectionTitle}>📊 Database Summary</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {summary.map(({ table, rows }) => (
          <Card key={table} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#63b3ed", fontFamily: "monospace" }}>{rows}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, letterSpacing: "0.05em" }}>{table}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DataTab({ title, endpoint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/${endpoint}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [endpoint]);

  return (
    <div>
      <h2 style={sectionTitle}>{title}</h2>
      <Card>
        {loading ? <Spinner /> : <Table data={data} />}
      </Card>
    </div>
  );
}

function AddUser({ onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email || !form.password)
      return setStatus({ ok: false, msg: "All fields are required." });
    setLoading(true);
    try {
      const r = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) {
        setStatus({ ok: true, msg: `✅ User inserted! ID: ${d.insertedID}` });
        setForm({ name: "", email: "", password: "" });
        onSuccess?.();
      } else {
        setStatus({ ok: false, msg: d.error });
      }
    } catch {
      setStatus({ ok: false, msg: "Server error." });
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={sectionTitle}>➕ Add New User</h2>
      <Card style={{ maxWidth: 460 }}>
        {["name", "email", "password"].map((field) => (
          <div key={field} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#63b3ed", fontSize: 11, fontFamily: "monospace",
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              {field}
            </label>
            <input
              name={field}
              type={field === "password" ? "password" : "text"}
              value={form[field]}
              onChange={handle}
              placeholder={`Enter ${field}`}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "10px 14px",
                color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
                outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#63b3ed"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
        ))}
        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: "12px", borderRadius: 8, border: "none",
          background: loading ? "#334155" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
          color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.05em", transition: "opacity 0.2s",
        }}>
          {loading ? "INSERTING..." : "INSERT USER"}
        </button>
        {status && (
          <div style={{
            marginTop: 14, padding: "10px 14px", borderRadius: 8,
            background: status.ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
            color: status.ok ? "#34d399" : "#f87171",
            fontFamily: "monospace", fontSize: 13,
          }}>
            {status.msg}
          </div>
        )}
      </Card>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 40, color: "#63b3ed", fontFamily: "monospace" }}>
      Loading...
    </div>
  );
}

const sectionTitle = {
  color: "#e2e8f0", fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 0,
};

// ── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState([]);

  const fetchStatus = () =>
    fetch(`${API}/status`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));

  const fetchSummary = () =>
    fetch(`${API}/summary`)
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});

  useEffect(() => {
    fetchStatus();
    fetchSummary();
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #060d1a; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 999px; }
      `}</style>

      {/* Background */}
      <div style={{
        minHeight: "100vh", position: "relative",
        background: "radial-gradient(ellipse at 20% 0%, #0c2340 0%, #060d1a 60%)",
      }}>
        {/* Grid overlay */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>🗄️</div>
                <h1 style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 24,
                  fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.02em",
                }}>P4 Database</h1>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}>
                MySQL · P4DB · localhost:3306
              </p>
            </div>
            <StatusBadge ok={status?.connected} />
          </div>

          {/* Connection Info */}
          {status?.connected && (
            <Card style={{ marginBottom: 28, display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                ["HOST", status.host || "localhost"],
                ["DATABASE", status.database || "P4DB"],
                ["PORT", "3306"],
                ["STATUS", "Active"],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#63b3ed", fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </Card>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid",
                borderColor: tab === t ? "#3b82f6" : "rgba(255,255,255,0.08)",
                background: tab === t ? "rgba(59,130,246,0.15)" : "transparent",
                color: tab === t ? "#63b3ed" : "#64748b",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                letterSpacing: "0.03em",
              }}>
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ animation: "fadeIn 0.25s ease" }} key={tab}>
            {tab === "Dashboard"   && <Dashboard summary={summary} />}
            {tab === "Users"       && <DataTab title="👤 Users" endpoint="users" />}
            {tab === "Courses"     && <DataTab title="📚 Courses" endpoint="courses" />}
            {tab === "Assignments" && <DataTab title="📝 Assignments" endpoint="assignments" />}
            {tab === "Enrollments" && <DataTab title="📋 Enrollments" endpoint="enrollments" />}
            {tab === "Add User"    && <AddUser onSuccess={fetchSummary} />}
          </div>
        </div>
      </div>
    </>
  );
}