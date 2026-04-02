import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5001/api";

const TABS = [
  "Dashboard",
  "Users", "Courses", "Assignments", "Enrollments",
  "TimeLogs", "Notifications", "Organizations", "Memberships",
  "Events", "CourseDays", "EventDays",
  "Insert", "Update", "Delete",
];

// ── Table Config ──────────────────────────────────────────────────
const TABLE_CONFIG = {
  users: {
    label: "Users", endpoint: "users", idField: "userID",
    fields: [
      { name: "name",     label: "Name",     type: "text",     required: true },
      { name: "email",    label: "Email",    type: "text",     required: true },
      { name: "password", label: "Password", type: "password", required: true },
    ],
  },
  courses: {
    label: "Courses", endpoint: "courses", idField: "courseID",
    fields: [
      { name: "courseName", label: "Course Name", type: "text", required: true },
      { name: "section",    label: "Section",     type: "text" },
      { name: "semester",   label: "Semester",    type: "text" },
      { name: "startTime",  label: "Start Time",  type: "text" },
      { name: "endTime",    label: "End Time",    type: "text" },
      { name: "location",   label: "Location",    type: "text" },
    ],
  },
  assignments: {
    label: "Assignments", endpoint: "assignments", idField: "assignmentID",
    fields: [
      { name: "courseID",      label: "Course ID",      type: "number", required: true },
      { name: "userID",        label: "User ID",        type: "number", required: true },
      { name: "title",         label: "Title",          type: "text",   required: true },
      { name: "description",   label: "Description",    type: "text" },
      { name: "estimatedTime", label: "Estimated Time", type: "number" },
      { name: "priority",      label: "Priority",       type: "text" },
      { name: "grade", label: "Grade", type: "select", options: ["", , "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] },
      { name: "status",        label: "Status",         type: "text" },
    ],
  },
  enrollments: {
    label: "Enrollments", endpoint: "enrollments", idField: "enrollmentID",
    fields: [
      { name: "userID",         label: "User ID",         type: "number", required: true },
      { name: "courseID",       label: "Course ID",       type: "number", required: true },
      { name: "enrollmentDate", label: "Enrollment Date", type: "date" },
      { name: "status",         label: "Status",          type: "text" },
    ],
  },
  timelogs: {
    label: "Time Logs", endpoint: "timelogs", idField: "logID",
    fields: [
      { name: "userID",       label: "User ID",       type: "number", required: true },
      { name: "assignmentID", label: "Assignment ID", type: "number", required: true },
      { name: "startTime",    label: "Start Time",    type: "text", placeholder: "YYYY-MM-DD HH:MM:SS" },
      { name: "endTime",      label: "End Time",      type: "text", placeholder: "YYYY-MM-DD HH:MM:SS" },
    ],
  },
  notifications: {
    label: "Notifications", endpoint: "notifications", idField: "notificationID",
    fields: [
      { name: "userID",     label: "User ID",     type: "number", required: true },
      { name: "message",    label: "Message",     type: "text",   required: true },
      { name: "type",       label: "Type",        type: "text" },
      { name: "sendTime",   label: "Send Time",   type: "text", placeholder: "YYYY-MM-DD HH:MM:SS" },
      { name: "readStatus", label: "Read Status", type: "text" },
    ],
  },
  organizations: {
    label: "Organizations", endpoint: "organizations", idField: "organizationID",
    fields: [
      { name: "organizationName", label: "Organization Name", type: "text", required: true },
      { name: "description",      label: "Description",       type: "text" },
    ],
  },
  memberships: {
    label: "Memberships", endpoint: "memberships", idField: "membershipID",
    fields: [
      { name: "userID",         label: "User ID",         type: "number", required: true },
      { name: "organizationID", label: "Organization ID", type: "number", required: true },
      { name: "role",           label: "Role",            type: "text" },
    ],
  },
  events: {
    label: "Events", endpoint: "events", idField: "eventID",
    fields: [
      { name: "userID",         label: "User ID",         type: "number", required: true },
      { name: "organizationID", label: "Organization ID", type: "number", required: true },
      { name: "title",          label: "Title",           type: "text",   required: true },
      { name: "description",    label: "Description",     type: "text" },
      { name: "startTime",      label: "Start Time",      type: "text", placeholder: "YYYY-MM-DD HH:MM:SS" },
      { name: "endTime",        label: "End Time",        type: "text", placeholder: "YYYY-MM-DD HH:MM:SS" },
      { name: "location",       label: "Location",        type: "text" },
      { name: "isRecurring",    label: "Is Recurring",    type: "text", placeholder: "Yes / No" },
    ],
  },
};

const TABLE_KEYS = Object.keys(TABLE_CONFIG);

// ── Design Tokens ─────────────────────────────────────────────────
const T = {
  bg:           "#ffffff",
  bgSubtle:     "#f8fafc",
  bgHover:      "#f1f5f9",
  border:       "#e2e8f0",
  borderSoft:   "#f1f5f9",
  text:         "#64748b",
  textH:        "#0f172a",
  textMuted:    "#94a3b8",
  accent:       "#3b82f6",
  accentBg:     "rgba(59,130,246,0.08)",
  accentBorder: "rgba(59,130,246,0.25)",
  green:        "#16a34a",
  greenBg:      "rgba(22,163,74,0.08)",
  greenBorder:  "rgba(22,163,74,0.25)",
  amber:        "#d97706",
  amberBg:      "rgba(217,119,6,0.08)",
  amberBorder:  "rgba(217,119,6,0.25)",
  red:          "#dc2626",
  redBg:        "rgba(220,38,38,0.08)",
  redBorder:    "rgba(220,38,38,0.25)",
  blue:         "#1d4ed8",
  blueBg:       "rgba(29,78,216,0.08)",
  blueBorder:   "rgba(29,78,216,0.25)",
  shadow:       "0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:     "0 4px 16px rgba(0,0,0,0.07),0 2px 6px rgba(0,0,0,0.04)",
  shadowHover:  "0 8px 24px rgba(59,130,246,0.12),0 2px 8px rgba(0,0,0,0.05)",
  font:         "'Sora', system-ui, sans-serif",
  mono:         "'DM Mono', ui-monospace, monospace",
};

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ show, onClose }) {
  useEffect(() => {
    if (show) { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }
  }, [show, onClose]);

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      transform: show ? "translateY(0)" : "translateY(120px)",
      opacity: show ? 1 : 0,
      transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      pointerEvents: show ? "auto" : "none",
    }}>
      <div style={{
        background: T.bg, border: `1px solid ${T.greenBorder}`,
        borderRadius: 14, padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        minWidth: 300, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: T.greenBg, border: `2px solid ${T.greenBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: T.green,
        }}>✓</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, color: T.green, marginBottom: 2 }}>
            Connection Established!
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>
            MySQL · P4DB · localhost:3306
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 16, padding: 2, lineHeight: 1 }}>✕</button>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${T.green}, ${T.accent})`, animation: show ? "shrink 4s linear forwards" : "none", transformOrigin: "left" }} />
        </div>
      </div>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.bg, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: 24, boxShadow: T.shadow, ...style,
    }}>
      {children}
    </div>
  );
}

function Spinner() {
  return <div style={{ textAlign: "center", padding: 40, color: T.textMuted, fontFamily: T.mono, fontSize: 13 }}>Loading…</div>;
}

function StatusMsg({ status }) {
  return (
    <div style={{
      marginTop: 14, padding: "10px 14px", borderRadius: 8,
      background: status.ok ? T.greenBg : T.redBg,
      border: `1px solid ${status.ok ? T.greenBorder : T.redBorder}`,
      color: status.ok ? T.green : T.red,
      fontFamily: T.mono, fontSize: 13,
    }}>
      {status.msg}
    </div>
  );
}

function FormField({ field, value, onChange, disabled }) {
  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: disabled ? T.bgSubtle : T.bg,
    border: `1px solid ${T.border}`, borderRadius: 8,
    padding: "10px 14px", color: disabled ? T.textMuted : T.textH,
    fontFamily: T.mono, fontSize: 14, outline: "none",
    cursor: disabled ? "not-allowed" : "text",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", color: T.textMuted, fontSize: 11,
        fontFamily: T.mono, letterSpacing: "0.08em",
        textTransform: "uppercase", marginBottom: 6,
      }}>
        {field.label}{field.required && <span style={{ color: T.red, marginLeft: 4 }}>*</span>}
      </label>

      {field.type === "select" ? (
        <select
          name={field.name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          style={{ ...inputStyle, cursor: disabled ? "not-allowed" : "pointer", appearance: "auto" }}
          onFocus={e => { if (!disabled) { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentBg}`; }}}
          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
        >
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt === "" ? "— Select grade —" : opt}</option>
          ))}
        </select>
      ) : (
        <input
          name={field.name} type={field.type || "text"}
          value={value ?? ""} onChange={onChange} disabled={disabled}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          style={inputStyle}
          onFocus={e => { if (!disabled) { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentBg}`; }}}
          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
        />
      )}
    </div>
  );
}

function ActionButton({ onClick, loading, label, variant = "primary", style = {} }) {
  const variants = {
    primary: { background: "#0f172a", color: "#fff" },
    green:   { background: T.green,   color: "#fff" },
    red:     { background: T.red,     color: "#fff" },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: "100%", padding: "11px", borderRadius: 8, border: "none",
      background: loading ? T.bgHover : v.background,
      color: loading ? T.textMuted : v.color,
      fontFamily: T.font, fontWeight: 600, fontSize: 14,
      cursor: loading ? "not-allowed" : "pointer",
      transition: "all 0.15s", boxShadow: loading ? "none" : T.shadow, ...style,
    }}>
      {loading ? "Processing…" : label}
    </button>
  );
}

function SubTabs({ active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {TABLE_KEYS.map(key => (
        <button key={key} onClick={() => setActive(key)} style={{
          padding: "6px 14px", borderRadius: 6,
          border: `1px solid ${active === key ? T.accentBorder : T.border}`,
          background: active === key ? T.accentBg : T.bg,
          color: active === key ? T.accent : T.text,
          fontFamily: T.mono, fontSize: 11, fontWeight: 600,
          cursor: "pointer", transition: "all 0.15s",
        }}>
          {TABLE_CONFIG[key].label}
        </button>
      ))}
    </div>
  );
}

function DataTable({ data, actionCol }) {
  if (!data || data.length === 0)
    return <p style={{ color: "#94a3b8", fontFamily: T.mono, fontSize: 13, padding: "20px 0" }}>No data yet—start by inserting a record.</p>;
  const keys = Object.keys(data[0]);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono, fontSize: 13 }}>
        <thead>
          <tr style={{ background: T.bgSubtle }}>
            {keys.map(k => (
              <th key={k} style={{
                textAlign: "left", padding: "10px 16px",
                color: T.textMuted, borderBottom: `1px solid ${T.border}`,
                fontWeight: 600, letterSpacing: "0.06em", fontSize: 11, textTransform: "uppercase",
              }}>{k}</th>
            ))}
            {actionCol && <th style={{
              textAlign: "center", padding: "10px 16px",
              color: T.textMuted, borderBottom: `1px solid ${T.border}`,
              fontWeight: 600, letterSpacing: "0.06em", fontSize: 11, textTransform: "uppercase",
            }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}
              style={{ borderBottom: `1px solid ${T.borderSoft}`, transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgSubtle}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {keys.map(k => (
                <td key={k} style={{ padding: "11px 16px", color: T.textH }}>
                  {row[k] === null ? <span style={{ color: T.textMuted, fontStyle: "italic" }}>null</span> : String(row[k])}
                </td>
              ))}
              {actionCol && <td style={{ padding: "8px 16px", textAlign: "center" }}>{actionCol(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
const MAX_COUNT = 15;

function Dashboard({ summary }) {
  const cards = summary && summary.length > 0 ? summary : [
    { table: "Users", rows: 0 },
    { table: "Courses", rows: 0 },
    { table: "Assignments", rows: 0 },
    { table: "Enrollments", rows: 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={sectionTitle}>Database Overview</h2>
        <p style={subtitleText}>Live record counts across all tables</p>
      </div>

      {(!summary || summary.length === 0) && (
        <div style={{ padding: 16, borderRadius: 14, background: "rgba(148,163,184,0.1)", color: "#64748b", fontFamily: T.mono }}>
          No data yet—start by inserting a record.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 14 }}>
        {cards.map(({ table, rows }) => (
          <div key={table} style={{
            background: T.bg, border: `1px solid ${T.border}`,
            borderRadius: 24, padding: 16, boxShadow: T.shadowMd,
            cursor: "default", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = T.shadowHover; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = T.shadowMd; }}
          >
            <div style={{ fontSize: 34, fontWeight: 800, color: T.textH, fontFamily: T.font, marginBottom: 8 }}>{rows}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b", fontFamily: T.font }}>{table}</div>
          </div>
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
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [endpoint]);
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={sectionTitle}>{title}</h2>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.bgSubtle }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {endpoint} · {data?.length ?? "…"} records
          </span>
        </div>
        {loading ? <Spinner /> : <DataTable data={data} />}
      </Card>
    </div>
  );
}

// ── Insert Page ───────────────────────────────────────────────────
function InsertPage({ onSuccess }) {
  const [activeTable, setActiveTable] = useState(TABLE_KEYS[0]);
  const config = TABLE_CONFIG[activeTable];
  const emptyForm = useCallback(() => Object.fromEntries(config.fields.map(f => [f.name, ""])), [config]);
  const [form, setForm] = useState(() => Object.fromEntries(config.fields.map(f => [f.name, ""])));
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setForm(Object.fromEntries(config.fields.map(f => [f.name, ""]))); setStatus(null); }, [activeTable, config]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const missing = config.fields.filter(f => f.required && !form[f.name]).map(f => f.label);
    if (missing.length) return setStatus({ ok: false, msg: `Required: ${missing.join(", ")}` });
    setLoading(true);
    try {
      const r = await fetch(`${API}/${config.endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { setStatus({ ok: true, msg: `Inserted successfully. ID: ${d.insertedID}` }); setForm(emptyForm()); onSuccess?.(); }
      else setStatus({ ok: false, msg: d.error });
    } catch { setStatus({ ok: false, msg: "Server error." }); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={sectionTitle}>Insert Record</h2>
        <p style={{ color: T.textMuted, fontSize: 14, fontFamily: T.font, marginTop: 4 }}>Select a table and fill in the form to insert a new record.</p>
      </div>
      <SubTabs active={activeTable} setActive={setActiveTable} />
      <Card style={{ maxWidth: 520, marginTop: 16 }}>
        <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Table: {config.endpoint}
          </span>
        </div>
        {config.fields.map(field => <FormField key={field.name} field={field} value={form[field.name]} onChange={handle} />)}
        <ActionButton onClick={submit} loading={loading} label={`Insert into ${config.label}`} variant="primary" />
        {status && <StatusMsg status={status} />}
      </Card>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  // Close on backdrop click
  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose(); };
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={handleBackdrop} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeUp 0.15s ease",
    }}>
      <div style={{
        background: T.bg, border: `1px solid ${T.border}`,
        borderRadius: 14, width: "100%", maxWidth: 500,
        maxHeight: "90vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        animation: "scaleIn 0.18s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 15, color: T.textH }}>{title}</div>
            {subtitle && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            background: T.bgHover, border: `1px solid ${T.border}`,
            color: T.text, cursor: "pointer", borderRadius: 6,
            width: 28, height: 28, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14, fontFamily: T.mono, flexShrink: 0,
          }}>✕</button>
        </div>
        {/* Scrollable body */}
        <div style={{ padding: 24, overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Update Page ───────────────────────────────────────────────────
function UpdatePage({ onSuccess }) {
  const [activeTable, setActiveTable] = useState(TABLE_KEYS[0]);
  const config = TABLE_CONFIG[activeTable];
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true);
    try { const r = await fetch(`${API}/${config.endpoint}`); setRecords(await r.json()); }
    catch { setRecords([]); }
    setLoadingRecords(false);
  }, [config.endpoint]);

  useEffect(() => { setEditingRecord(null); setForm({}); setStatus(null); fetchRecords(); }, [activeTable, fetchRecords]);

  const startEdit = row => {
    setEditingRecord(row);
    const f = {};
    config.fields.forEach(field => { f[field.name] = row[field.name] ?? ""; });
    setForm(f); setStatus(null);
  };

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const id = editingRecord[config.idField];
    setLoading(true);
    try {
      const r = await fetch(`${API}/${config.endpoint}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { setStatus({ ok: true, msg: `Record ${id} updated.` }); setEditingRecord(null); setForm({}); fetchRecords(); onSuccess?.(); }
      else setStatus({ ok: false, msg: d.error });
    } catch { setStatus({ ok: false, msg: "Server error." }); }
    setLoading(false);
  };

  const closeModal = () => { setEditingRecord(null); setForm({}); setStatus(null); };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={sectionTitle}>Update Record</h2>
        <p style={{ color: T.textMuted, fontSize: 14, fontFamily: T.font, marginTop: 4 }}>Click Edit on any row to modify its values.</p>
      </div>
      <SubTabs active={activeTable} setActive={setActiveTable} />
      {status && !editingRecord && <div style={{ margin: "12px 0" }}><StatusMsg status={status} /></div>}
      <Card style={{ marginTop: 16, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.bgSubtle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {config.endpoint} · {records.length} records
          </span>
          <button onClick={fetchRecords} style={{
            padding: "5px 12px", borderRadius: 6, background: T.bg,
            border: `1px solid ${T.border}`, color: T.text,
            fontSize: 11, fontFamily: T.mono, cursor: "pointer",
          }}>Refresh</button>
        </div>
        {loadingRecords ? <Spinner /> : (
          <DataTable data={records} actionCol={row => (
            <button onClick={() => startEdit(row)} style={{
              padding: "4px 14px", borderRadius: 6,
              background: T.accentBg, border: `1px solid ${T.accentBorder}`,
              color: T.accent, fontSize: 11, fontFamily: T.mono, cursor: "pointer",
              fontWeight: 600,
            }}>
              Edit
            </button>
          )} />
        )}
      </Card>

      {/* Edit Modal */}
      {editingRecord && (
        <Modal
          title={`Edit ${config.label}`}
          subtitle={`${config.idField}: ${editingRecord[config.idField]}`}
          onClose={closeModal}
        >
          {config.fields.map(field => (
            <FormField key={field.name} field={field} value={form[field.name]} onChange={handle} />
          ))}
          <ActionButton onClick={submit} loading={loading} label="Save Changes" variant="green" />
          {status && <StatusMsg status={status} />}
        </Modal>
      )}
    </div>
  );
}

// ── Delete Page ───────────────────────────────────────────────────
function DeletePage({ onSuccess }) {
  const [activeTable, setActiveTable] = useState(TABLE_KEYS[0]);
  const config = TABLE_CONFIG[activeTable];
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true);
    try { const r = await fetch(`${API}/${config.endpoint}`); setRecords(await r.json()); }
    catch { setRecords([]); }
    setLoadingRecords(false);
  }, [config.endpoint]);

  useEffect(() => { setConfirmId(null); setStatus(null); fetchRecords(); }, [activeTable, fetchRecords]);

  const handleDelete = async id => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/${config.endpoint}/${id}`, { method: "DELETE" });
      const d = await r.json();
      if (d.success) { setStatus({ ok: true, msg: `Record ${id} deleted.` }); setConfirmId(null); fetchRecords(); onSuccess?.(); }
      else setStatus({ ok: false, msg: d.error });
    } catch { setStatus({ ok: false, msg: "Server error." }); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={sectionTitle}>Delete Record</h2>
        <p style={{ color: T.textMuted, fontSize: 14, fontFamily: T.font, marginTop: 4 }}>Click Delete on any row, then confirm.</p>
      </div>
      <SubTabs active={activeTable} setActive={setActiveTable} />
      {status && !confirmId && <div style={{ margin: "12px 0" }}><StatusMsg status={status} /></div>}
      <Card style={{ marginTop: 16, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.bgSubtle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {config.endpoint} · {records.length} records
          </span>
          <button onClick={fetchRecords} style={{
            padding: "5px 12px", borderRadius: 6, background: T.bg,
            border: `1px solid ${T.border}`, color: T.text,
            fontSize: 11, fontFamily: T.mono, cursor: "pointer",
          }}>Refresh</button>
        </div>
        {loadingRecords ? <Spinner /> : (
          <DataTable data={records} actionCol={row => (
            <button onClick={() => { setConfirmId(row[config.idField]); setStatus(null); }} style={{
              padding: "4px 14px", borderRadius: 6,
              background: T.redBg, border: `1px solid ${T.redBorder}`,
              color: T.red, fontSize: 11, fontFamily: T.mono, cursor: "pointer",
              fontWeight: 600,
            }}>Delete</button>
          )} />
        )}
      </Card>

      {/* Confirm Delete Modal */}
      {confirmId !== null && (
        <Modal
          title="Confirm Deletion"
          subtitle={`${config.idField}: ${confirmId} · ${config.endpoint}`}
          onClose={() => setConfirmId(null)}
        >
          <div style={{
            background: T.redBg, border: `1px solid ${T.redBorder}`,
            borderRadius: 10, padding: "16px 18px", marginBottom: 20,
          }}>
            <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 14, color: T.red, marginBottom: 4 }}>
              This action cannot be undone
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textMuted }}>
              Record <strong style={{ color: T.textH }}>{confirmId}</strong> will be permanently removed from <strong style={{ color: T.textH }}>{config.endpoint}</strong>.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmId(null)} style={{
              flex: 1, padding: "10px", borderRadius: 8,
              background: T.bg, border: `1px solid ${T.border}`,
              color: T.text, fontFamily: T.font, fontWeight: 600,
              fontSize: 14, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={() => handleDelete(confirmId)} disabled={loading} style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "none",
              background: loading ? T.bgHover : T.red,
              color: loading ? T.textMuted : "#fff",
              fontFamily: T.font, fontWeight: 600, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 2px 8px rgba(220,38,38,0.3)",
            }}>{loading ? "Deleting…" : "Yes, Delete"}</button>
          </div>
          {status && <StatusMsg status={status} />}
        </Modal>
      )}
    </div>
  );
}


// ── Styles ────────────────────────────────────────────────────────
const sectionTitle = {
  fontFamily: T.font, fontSize: 28, fontWeight: 800,
  color: T.textH, margin: 0, letterSpacing: "-0.02em",
};

const subtitleText = {
  color: "#8da1b6", fontSize: 14, fontFamily: T.font, marginTop: 6,
};

const TAB_ICONS = {
  Dashboard: "◈", Users: "◉", Courses: "◈", Assignments: "◎",
  Enrollments: "◐", TimeLogs: "◷", Notifications: "◬", Organizations: "◍",
  Memberships: "◑", Events: "◆", CourseDays: "◇", EventDays: "◇",
  Insert: "+", Update: "↺", Delete: "×",
};

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState([]);
  const [showToast, setShowToast] = useState(false);

  const fetchStatus = () =>
    fetch(`${API}/status`)
      .then(r => r.json())
      .then(d => { setStatus(d); if (d.connected) setShowToast(true); })
      .catch(() => setStatus({ connected: false }));

  const fetchSummary = () =>
    fetch(`${API}/summary`).then(r => r.json()).then(setSummary).catch(() => {});

  useEffect(() => { fetchStatus(); fetchSummary(); }, []);

  const getTabStyle = t => {
    const isActive = tab === t;
    const actionMap = {
      Insert: { border: T.greenBorder, bg: T.greenBg, color: T.green,       idle: T.green },
      Update: { border: T.blueBorder,  bg: T.blueBg,  color: T.blue,      idle: T.blue  },
      Delete: { border: T.redBorder,   bg: T.redBg,   color: T.red,         idle: T.red   },
    };
    if (actionMap[t]) {
      const s = actionMap[t];
      return { borderColor: isActive ? s.border : T.border, background: isActive ? s.bg : T.bg, color: isActive ? s.color : s.idle };
    }
    return { borderColor: isActive ? "#0f172a" : T.border, background: isActive ? "#0f172a" : T.bg, color: isActive ? "#ffffff" : T.text };
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f8fafc; font-family: 'Sora', system-ui, sans-serif; }
        @keyframes shrink  { from{transform:scaleX(1)} to{transform:scaleX(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
      `}</style>

      <Toast show={showToast} onClose={() => setShowToast(false)} />

      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 40px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "#0f172a",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>📅</div>
          <span style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.textH, letterSpacing: "-0.03em" }}>
            Sched<span style={{ color: T.accent }}>U</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: status?.connected ? "#22c55e" : "#f87171", display: "inline-block" }} />
          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.textMuted }}>
            {status?.connected ? "Connected" : "Disconnected"}
          </span>
          {status?.connected && (
            <button onClick={() => setShowToast(true)} style={{
              marginLeft: 4, padding: "4px 10px", borderRadius: 6,
              background: T.bg, border: `1px solid ${T.border}`,
              color: T.text, fontSize: 11, fontFamily: T.mono, cursor: "pointer",
            }}>info</button>
          )}
        </div>
      </nav>

      {/* Page */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 40px" }}>

        {/* Tab Bar */}
        <div style={{
          background: T.bg, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: 8, marginBottom: 28,
          boxShadow: T.shadow, display: "flex", flexWrap: "wrap", gap: 4,
        }}>
          {TABS.map(t => {
            const s = getTabStyle(t);
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "7px 13px", borderRadius: 7,
                border: `1px solid ${s.borderColor}`,
                background: s.background, color: s.color,
                fontFamily: T.font, fontSize: 13, fontWeight: 500,
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ fontSize: 10, opacity: 0.6 }}>{TAB_ICONS[t]}</span> {t}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ animation: "fadeUp 0.2s ease" }} key={tab}>
          {tab === "Dashboard"     && <Dashboard summary={summary} />}
          {tab === "Users"         && <DataTab title="Users"         endpoint="users" />}
          {tab === "Courses"       && <DataTab title="Courses"       endpoint="courses" />}
          {tab === "Assignments"   && <DataTab title="Assignments"   endpoint="assignments" />}
          {tab === "Enrollments"   && <DataTab title="Enrollments"   endpoint="enrollments" />}
          {tab === "TimeLogs"      && <DataTab title="Time Logs"     endpoint="timelogs" />}
          {tab === "Notifications" && <DataTab title="Notifications" endpoint="notifications" />}
          {tab === "Organizations" && <DataTab title="Organizations" endpoint="organizations" />}
          {tab === "Memberships"   && <DataTab title="Memberships"   endpoint="memberships" />}
          {tab === "Events"        && <DataTab title="Events"        endpoint="events" />}
          {tab === "CourseDays"    && <DataTab title="Course Days"   endpoint="coursedays" />}
          {tab === "EventDays"     && <DataTab title="Event Days"    endpoint="eventdays" />}
          {tab === "Insert"        && <InsertPage onSuccess={fetchSummary} />}
          {tab === "Update"        && <UpdatePage onSuccess={fetchSummary} />}
          {tab === "Delete"        && <DeletePage onSuccess={fetchSummary} />}
        </div>
      </div>
    </>
  );
}
