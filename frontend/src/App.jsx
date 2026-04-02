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
    label: "Users",
    endpoint: "users",
    idField: "userID",
    fields: [
      { name: "name",     label: "Name",     type: "text",     required: true  },
      { name: "email",    label: "Email",    type: "text",     required: true  },
      { name: "password", label: "Password", type: "password", required: true  },
    ],
  },
  courses: {
    label: "Courses",
    endpoint: "courses",
    idField: "courseID",
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
    label: "Assignments",
    endpoint: "assignments",
    idField: "assignmentID",
    fields: [
      { name: "courseID",      label: "Course ID",       type: "number", required: true },
      { name: "userID",        label: "User ID",         type: "number", required: true },
      { name: "title",         label: "Title",           type: "text",   required: true },
      { name: "description",   label: "Description",     type: "text" },
      { name: "estimatedTime", label: "Estimated Time",  type: "number" },
      { name: "priority",      label: "Priority",        type: "text" },
      { name: "grade",         label: "Grade",           type: "number" },
      { name: "status",        label: "Status",          type: "text" },
    ],
  },
  enrollments: {
    label: "Enrollments",
    endpoint: "enrollments",
    idField: "enrollmentID",
    fields: [
      { name: "userID",         label: "User ID",         type: "number", required: true },
      { name: "courseID",       label: "Course ID",       type: "number", required: true },
      { name: "enrollmentDate", label: "Enrollment Date", type: "date" },
      { name: "status",         label: "Status",          type: "text" },
    ],
  },
  timelogs: {
    label: "Time Logs",
    endpoint: "timelogs",
    idField: "logID",
    fields: [
      { name: "userID",       label: "User ID",       type: "number", required: true },
      { name: "assignmentID", label: "Assignment ID", type: "number", required: true },
      { name: "startTime",    label: "Start Time",    type: "text", placeholder: "YYYY-MM-DD HH:MM:SS" },
      { name: "endTime",      label: "End Time",      type: "text", placeholder: "YYYY-MM-DD HH:MM:SS" },
    ],
  },
  notifications: {
    label: "Notifications",
    endpoint: "notifications",
    idField: "notificationID",
    fields: [
      { name: "userID",     label: "User ID",     type: "number", required: true },
      { name: "message",    label: "Message",     type: "text",   required: true },
      { name: "type",       label: "Type",        type: "text" },
      { name: "sendTime",   label: "Send Time",   type: "text", placeholder: "YYYY-MM-DD HH:MM:SS" },
      { name: "readStatus", label: "Read Status", type: "text" },
    ],
  },
  organizations: {
    label: "Organizations",
    endpoint: "organizations",
    idField: "organizationID",
    fields: [
      { name: "organizationName", label: "Organization Name", type: "text", required: true },
      { name: "description",      label: "Description",       type: "text" },
    ],
  },
  memberships: {
    label: "Memberships",
    endpoint: "memberships",
    idField: "membershipID",
    fields: [
      { name: "userID",         label: "User ID",         type: "number", required: true },
      { name: "organizationID", label: "Organization ID", type: "number", required: true },
      { name: "role",           label: "Role",            type: "text" },
    ],
  },
  events: {
    label: "Events",
    endpoint: "events",
    idField: "eventID",
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

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ show, onClose }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);

  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      transform: show ? "translateY(0)" : "translateY(120px)",
      opacity: show ? 1 : 0,
      transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      pointerEvents: show ? "auto" : "none",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0f2a1a, #0d1f2d)",
        border: "1px solid rgba(52,211,153,0.4)",
        borderRadius: 14, padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.1), 0 0 24px rgba(52,211,153,0.1)",
        minWidth: 300, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: "rgba(52,211,153,0.15)", border: "2px solid rgba(52,211,153,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: "#34d399",
          animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
        }}>✓</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: "#34d399", marginBottom: 3 }}>
            Connection Established!
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
            MySQL · P4DB · localhost:3306
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16, padding: 2, lineHeight: 1, flexShrink: 0 }}>✕</button>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #34d399, #06b6d4)", animation: show ? "shrink 4s linear forwards" : "none", transformOrigin: "left" }} />
        </div>
      </div>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────────
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
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: 24, backdropFilter: "blur(4px)", ...style,
    }}>
      {children}
    </div>
  );
}

function Spinner() {
  return <div style={{ textAlign: "center", padding: 40, color: "#63b3ed", fontFamily: "monospace" }}>Loading...</div>;
}

function StatusMsg({ status }) {
  return (
    <div style={{
      marginTop: 14, padding: "10px 14px", borderRadius: 8,
      background: status.ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
      color: status.ok ? "#34d399" : "#f87171",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
    }}>
      {status.msg}
    </div>
  );
}

function FormField({ field, value, onChange, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", color: "#63b3ed", fontSize: 11,
        fontFamily: "monospace", letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: 6,
      }}>
        {field.label}{field.required && <span style={{ color: "#f87171", marginLeft: 4 }}>*</span>}
      </label>
      <input
        name={field.name}
        type={field.type || "text"}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        style={{
          width: "100%", boxSizing: "border-box",
          background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
          padding: "10px 14px", color: disabled ? "#475569" : "#e2e8f0",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 14, outline: "none",
          cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = "#63b3ed"; }}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
    </div>
  );
}

function ActionButton({ onClick, loading, label, color = "blue", style = {} }) {
  const gradients = {
    blue: loading ? "#334155" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
    red:  loading ? "#334155" : "linear-gradient(135deg, #ef4444, #f97316)",
    green: loading ? "#334155" : "linear-gradient(135deg, #22c55e, #06b6d4)",
  };
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: "100%", padding: "12px", borderRadius: 8, border: "none",
      background: gradients[color],
      color: "#fff", fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
      letterSpacing: "0.05em", transition: "opacity 0.2s", ...style,
    }}>
      {loading ? "PROCESSING..." : label}
    </button>
  );
}

function SubTabs({ active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 0 }}>
      {TABLE_KEYS.map(key => (
        <button key={key} onClick={() => setActive(key)} style={{
          padding: "6px 14px", borderRadius: 6, border: "1px solid",
          borderColor: active === key ? "#a78bfa" : "rgba(255,255,255,0.08)",
          background: active === key ? "rgba(167,139,250,0.15)" : "transparent",
          color: active === key ? "#a78bfa" : "#64748b",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
          letterSpacing: "0.03em",
        }}>
          {TABLE_CONFIG[key].label}
        </button>
      ))}
    </div>
  );
}

function DataTable({ data, actionCol }) {
  if (!data || data.length === 0)
    return <p style={{ color: "#64748b", fontFamily: "monospace", padding: "20px 0" }}>No records found.</p>;
  const keys = Object.keys(data[0]);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
        <thead>
          <tr>
            {keys.map(k => (
              <th key={k} style={{
                textAlign: "center", padding: "10px 14px",
                background: "rgba(99,179,237,0.1)", color: "#63b3ed",
                borderBottom: "1px solid rgba(99,179,237,0.2)",
                fontWeight: 600, letterSpacing: "0.05em", fontSize: 11, textTransform: "uppercase",
              }}>{k}</th>
            ))}
            {actionCol && <th style={{
              textAlign: "center", padding: "10px 14px",
              background: "rgba(99,179,237,0.1)", color: "#63b3ed",
              borderBottom: "1px solid rgba(99,179,237,0.2)",
              fontWeight: 600, letterSpacing: "0.05em", fontSize: 11, textTransform: "uppercase",
            }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {keys.map(k => (
                <td key={k} style={{ padding: "10px 14px", color: "#cbd5e1", textAlign: "center" }}>
                  {row[k] === null ? <span style={{ color: "#475569" }}>NULL</span> : String(row[k])}
                </td>
              ))}
              {actionCol && <td style={{ padding: "8px 14px", textAlign: "center" }}>{actionCol(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
function Dashboard({ summary }) {
  return (
    <div>
      <h2 style={sectionTitle}>Database Summary</h2>
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
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [endpoint]);
  return (
    <div>
      <h2 style={sectionTitle}>{title}</h2>
      <Card>{loading ? <Spinner /> : <DataTable data={data} />}</Card>
    </div>
  );
}

// ── Insert Page ───────────────────────────────────────────────────
function InsertPage({ onSuccess }) {
  const [activeTable, setActiveTable] = useState(TABLE_KEYS[0]);
  const config = TABLE_CONFIG[activeTable];

  const emptyForm = useCallback(() =>
    Object.fromEntries(config.fields.map(f => [f.name, ""])),
    [config]
  );

  const [form, setForm] = useState(() => Object.fromEntries(config.fields.map(f => [f.name, ""])));
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(Object.fromEntries(config.fields.map(f => [f.name, ""])));
    setStatus(null);
  }, [activeTable, config]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const missing = config.fields.filter(f => f.required && !form[f.name]).map(f => f.label);
    if (missing.length) return setStatus({ ok: false, msg: `Required fields: ${missing.join(", ")}` });
    setLoading(true);
    try {
      const r = await fetch(`${API}/${config.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) {
        setStatus({ ok: true, msg: `Record inserted successfully. ID: ${d.insertedID}` });
        setForm(emptyForm());
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
      <h2 style={sectionTitle}>Insert Record</h2>
      <p style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginBottom: 20 }}>
        Select a table and fill in the form to insert a new record.
      </p>
      <SubTabs active={activeTable} setActive={setActiveTable} />
      <Card style={{ maxWidth: 520, marginTop: 16 }}>
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a78bfa", letterSpacing: "0.08em" }}>
            TABLE: {config.endpoint.toUpperCase()}
          </span>
        </div>
        {config.fields.map(field => (
          <FormField key={field.name} field={field} value={form[field.name]} onChange={handle} />
        ))}
        <ActionButton onClick={submit} loading={loading} label={`INSERT INTO ${config.label.toUpperCase()}`} color="blue" />
        {status && <StatusMsg status={status} />}
      </Card>
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
    try {
      const r = await fetch(`${API}/${config.endpoint}`);
      const d = await r.json();
      setRecords(d);
    } catch {
      setRecords([]);
    }
    setLoadingRecords(false);
  }, [config.endpoint]);

  useEffect(() => {
    setEditingRecord(null);
    setForm({});
    setStatus(null);
    fetchRecords();
  }, [activeTable, fetchRecords]);

  const startEdit = (row) => {
    setEditingRecord(row);
    const f = {};
    config.fields.forEach(field => { f[field.name] = row[field.name] ?? ""; });
    setForm(f);
    setStatus(null);
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setForm({});
    setStatus(null);
  };

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const id = editingRecord[config.idField];
    setLoading(true);
    try {
      const r = await fetch(`${API}/${config.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) {
        setStatus({ ok: true, msg: `Record ${id} updated successfully.` });
        setEditingRecord(null);
        setForm({});
        fetchRecords();
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
      <h2 style={sectionTitle}>Update Record</h2>
      <p style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginBottom: 20 }}>
        Select a table, click Edit on a row to modify its values.
      </p>
      <SubTabs active={activeTable} setActive={setActiveTable} />

      <Card style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a78bfa", letterSpacing: "0.08em" }}>
            TABLE: {config.endpoint.toUpperCase()} — {records.length} RECORDS
          </span>
          <button onClick={fetchRecords} style={{
            padding: "4px 10px", borderRadius: 5,
            background: "rgba(99,179,237,0.1)", border: "1px solid rgba(99,179,237,0.2)",
            color: "#63b3ed", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer", letterSpacing: "0.05em",
          }}>REFRESH</button>
        </div>
        {loadingRecords ? <Spinner /> : (
          <DataTable
            data={records}
            actionCol={row => (
              <button onClick={() => startEdit(row)} style={{
                padding: "4px 12px", borderRadius: 5,
                background: editingRecord?.[config.idField] === row[config.idField]
                  ? "rgba(167,139,250,0.3)" : "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.3)",
                color: "#a78bfa", fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer", letterSpacing: "0.03em",
              }}>
                {editingRecord?.[config.idField] === row[config.idField] ? "EDITING" : "EDIT"}
              </button>
            )}
          />
        )}
      </Card>

      {editingRecord && (
        <Card style={{ maxWidth: 520, marginTop: 20, borderColor: "rgba(167,139,250,0.25)" }}>
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a78bfa", letterSpacing: "0.08em" }}>
              EDITING {config.idField.toUpperCase()}: {editingRecord[config.idField]}
            </span>
            <button onClick={cancelEdit} style={{
              background: "none", border: "1px solid rgba(255,255,255,0.1)",
              color: "#64748b", cursor: "pointer", borderRadius: 5,
              padding: "3px 10px", fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}>CANCEL</button>
          </div>
          {config.fields.map(field => (
            <FormField key={field.name} field={field} value={form[field.name]} onChange={handle} />
          ))}
          <ActionButton onClick={submit} loading={loading} label={`UPDATE RECORD`} color="green" />
          {status && <StatusMsg status={status} />}
        </Card>
      )}
      {!editingRecord && status && <div style={{ marginTop: 16 }}><StatusMsg status={status} /></div>}
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
    try {
      const r = await fetch(`${API}/${config.endpoint}`);
      const d = await r.json();
      setRecords(d);
    } catch {
      setRecords([]);
    }
    setLoadingRecords(false);
  }, [config.endpoint]);

  useEffect(() => {
    setConfirmId(null);
    setStatus(null);
    fetchRecords();
  }, [activeTable, fetchRecords]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/${config.endpoint}/${id}`, { method: "DELETE" });
      const d = await r.json();
      if (d.success) {
        setStatus({ ok: true, msg: `Record ${id} deleted successfully.` });
        setConfirmId(null);
        fetchRecords();
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
      <h2 style={sectionTitle}>Delete Record</h2>
      <p style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginBottom: 20 }}>
        Select a table, then confirm deletion of the record.
      </p>
      <SubTabs active={activeTable} setActive={setActiveTable} />

      {status && <div style={{ marginTop: 16, marginBottom: 4 }}><StatusMsg status={status} /></div>}

      <Card style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a78bfa", letterSpacing: "0.08em" }}>
            TABLE: {config.endpoint.toUpperCase()} — {records.length} RECORDS
          </span>
          <button onClick={fetchRecords} style={{
            padding: "4px 10px", borderRadius: 5,
            background: "rgba(99,179,237,0.1)", border: "1px solid rgba(99,179,237,0.2)",
            color: "#63b3ed", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer", letterSpacing: "0.05em",
          }}>REFRESH</button>
        </div>
        {loadingRecords ? <Spinner /> : (
          <DataTable
            data={records}
            actionCol={row => {
              const id = row[config.idField];
              const isConfirming = confirmId === id;
              return (
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  {isConfirming ? (
                    <>
                      <button onClick={() => handleDelete(id)} disabled={loading} style={{
                        padding: "4px 12px", borderRadius: 5,
                        background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.5)",
                        color: "#f87171", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                        cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.03em",
                      }}>
                        {loading ? "..." : "CONFIRM"}
                      </button>
                      <button onClick={() => setConfirmId(null)} style={{
                        padding: "4px 10px", borderRadius: 5,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#64748b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                        cursor: "pointer",
                      }}>CANCEL</button>
                    </>
                  ) : (
                    <button onClick={() => { setConfirmId(id); setStatus(null); }} style={{
                      padding: "4px 12px", borderRadius: 5,
                      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                      cursor: "pointer", letterSpacing: "0.03em",
                    }}>DELETE</button>
                  )}
                </div>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const sectionTitle = {
  color: "#e2e8f0", fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 0,
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
    fetch(`${API}/summary`)
      .then(r => r.json())
      .then(setSummary)
      .catch(() => {});

  useEffect(() => { fetchStatus(); fetchSummary(); }, []);

  const TAB_ICONS = {
    Dashboard: "◈", Users: "◉", Courses: "◈", Assignments: "◎",
    Enrollments: "◐", TimeLogs: "◷", Notifications: "◬", Organizations: "◍",
    Memberships: "◑", Events: "◆", CourseDays: "◇", EventDays: "◇",
    Insert: "＋", Update: "↺", Delete: "✕",
  };

  const TAB_COLORS = {
    Insert: { active: "#a78bfa", bg: "rgba(167,139,250,0.15)", border: "#a78bfa" },
    Update: { active: "#34d399", bg: "rgba(52,211,153,0.15)", border: "#34d399" },
    Delete: { active: "#f87171", bg: "rgba(248,113,113,0.15)", border: "#f87171" },
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #060d1a; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes shrink { from{transform:scaleX(1)} to{transform:scaleX(0)} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 999px; }
      `}</style>

      <Toast show={showToast} onClose={() => setShowToast(false)} />

      <div style={{
        minHeight: "100vh", position: "relative",
        background: "radial-gradient(ellipse at 20% 0%, #0c2340 0%, #060d1a 60%)",
      }}>
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>🗄️</div>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.02em" }}>P4 Database</h1>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}>MySQL · P4DB · localhost:3306</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusBadge ok={status?.connected} />
              {status?.connected && (
                <button onClick={() => setShowToast(true)} style={{
                  padding: "5px 12px", borderRadius: 6,
                  background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                  color: "#34d399", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                  cursor: "pointer", letterSpacing: "0.05em",
                }}>show popup</button>
              )}
            </div>
          </div>

          {/* Connection Info Bar */}
          {status?.connected && (
            <Card style={{ marginBottom: 28, display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[["HOST", status.host || "localhost"], ["DATABASE", status.database || "P4DB"], ["PORT", "3306"], ["STATUS", "Active"]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#475569", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#63b3ed", fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </Card>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, flexWrap: "wrap" }}>
            {TABS.map(t => {
              const custom = TAB_COLORS[t];
              const isActive = tab === t;
              return (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: "8px 16px", borderRadius: 8, border: "1px solid",
                  borderColor: isActive ? (custom?.border || "#3b82f6") : "rgba(255,255,255,0.08)",
                  background: isActive ? (custom?.bg || "rgba(59,130,246,0.15)") : "transparent",
                  color: isActive ? (custom?.active || "#63b3ed") : "#64748b",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                  fontWeight: 600, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.03em",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ fontSize: 10 }}>{TAB_ICONS[t]}</span> {t}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={{ animation: "fadeIn 0.25s ease" }} key={tab}>
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
      </div>
    </>
  );
}
