import { useEffect, useMemo, useState } from "react";
import "./admin-settings-page.css";

const TAB_ITEMS = [
  ["profile", "Profile"],
  ["institution", "Institution"],
  ["security", "Security"],
  ["notifications", "Notifications"],
  ["system", "System Preferences"],
  ["logout", "Logout"]
];

const seedDepartments = [
  { id: "D01", name: "Computer Science & Engineering" },
  { id: "D02", name: "Electronics & Communication" },
  { id: "D03", name: "Mechanical Engineering" },
  { id: "D04", name: "Arts & Humanities" }
];

const seedSessions = [
  { id: "SESS-1", device: "Windows Desktop • Chrome", location: "Bengaluru, IN", lastSeen: "Active now", current: true },
  { id: "SESS-2", device: "MacBook Pro • Safari", location: "Chennai, IN", lastSeen: "Today, 09:18 AM", current: false },
  { id: "SESS-3", device: "iPhone • Safari", location: "Bengaluru, IN", lastSeen: "Yesterday, 08:42 PM", current: false }
];

const activitySeed = [
  "Updated institution configuration for Academic Year 2026-27",
  "Approved certificate CERT-2200",
  "Enabled AI-assisted moderation indicators",
  "Exported approval queue report (PDF)"
];

function CountMini({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const run = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 650, 1);
      setN(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

function FloatingField({ label, error, filled, children }) {
  return (
    <label className={`asp-field ${filled ? "filled" : ""} ${error ? "err" : ""}`}>
      {children}
      <span>{label}</span>
      {error ? <small>{error}</small> : null}
    </label>
  );
}

export default function AdminSettingsPage({ initialTab = "profile" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [confirmSession, setConfirmSession] = useState(null);
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [savingSection, setSavingSection] = useState("");
  const [profileErrors, setProfileErrors] = useState({});

  const [profile, setProfile] = useState({
    name: "Ananya Kulkarni",
    email: "admin@bloomfielduniversity.edu",
    role: "Super Admin",
    photo: ""
  });

  const [institution, setInstitution] = useState({
    name: "Bloomfield University",
    code: "BFU-IND",
    academicYear: "2026-2027"
  });
  const [departments, setDepartments] = useState(seedDepartments);

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: true
  });
  const [sessions, setSessions] = useState(seedSessions);

  const [notifications, setNotifications] = useState({
    newAchievement: true,
    pendingApprovals: true,
    weeklyReport: true,
    realtimeAlerts: true
  });

  const [systemPrefs, setSystemPrefs] = useState({
    theme: "Light",
    defaultApproval: "Manual Review",
    autoArchiveRejected: true,
    retention: "12 Months"
  });

  const [activityLog, setActivityLog] = useState(activitySeed);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === "logout") setShowLogoutConfirm(true);
  }, [initialTab]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowLogoutConfirm(false);
        setConfirmSession(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const passwordStrength = useMemo(() => {
    const p = security.newPassword;
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    const label = ["Weak", "Weak", "Fair", "Good", "Strong"][score];
    return { score, label };
  }, [security.newPassword]);

  const permissionPreview = useMemo(() => {
    return profile.role === "Super Admin"
      ? ["Manage approvals", "Manage certificates", "Manage users", "Export audit logs", "System configuration"]
      : ["Manage approvals", "Review certificates", "Moderation comments"];
  }, [profile.role]);

  const saveWithToast = (section, title, text, cb) => {
    if (savingSection) return;
    setSavingSection(section);
    setTimeout(() => {
      cb?.();
      setSavingSection("");
      setActivityLog((prev) => [`${title}`, ...prev].slice(0, 6));
      setToast({ type: "ok", title: "Saved successfully", text });
    }, 900);
  };

  const validateProfile = () => {
    const e = {};
    if (!profile.name.trim()) e.name = "Name is required";
    if (!profile.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = "Valid email required";
    setProfileErrors(e);
    return !Object.keys(e).length;
  };

  const saveProfile = () => {
    if (!validateProfile()) return;
    saveWithToast("profile", "Updated admin profile", "Profile preferences were updated.");
  };

  const saveInstitution = () =>
    saveWithToast("institution", "Updated institution configuration", "Institution settings saved.");

  const saveSecurity = () => {
    if (!security.newPassword || security.newPassword !== security.confirmPassword) {
      setToast({ type: "danger", title: "Security update failed", text: "Confirm password must match new password." });
      return;
    }
    saveWithToast("security", "Updated security settings", "Security settings and password were updated.", () =>
      setSecurity((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }))
    );
  };

  const saveNotifications = () =>
    saveWithToast("notifications", "Updated notification preferences", "Notification settings saved.");

  const saveSystem = () =>
    saveWithToast("system", "Updated system preferences", "System preferences saved.");

  const addDepartment = () => {
    const next = departments.length + 1;
    setDepartments((prev) => [...prev, { id: `D${String(next).padStart(2, "0")}`, name: `New Department ${next}` }]);
  };

  const removeDepartment = (id) => setDepartments((prev) => prev.filter((d) => d.id !== id));
  const updateDepartment = (id, name) =>
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));

  const logoutSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setConfirmSession(null);
    setToast({ type: "ok", title: "Session logged out", text: `${id} was terminated successfully.` });
    setActivityLog((prev) => [`Terminated session ${id}`, ...prev].slice(0, 6));
  };

  const doLogout = () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    setFadeOut(true);
    try {
      localStorage.removeItem("cb.admin.session");
      localStorage.removeItem("cb.admin.authToken");
      sessionStorage.clear();
    } catch {}
    setTimeout(() => {
      try {
        localStorage.setItem("cb.admin.lastLogout", new Date().toISOString());
      } catch {}
      window.location.href = "/login";
    }, 950);
  };

  return (
    <div className={`asp-page ${fadeOut ? "is-logging-out" : ""}`}>
      <section className="asp-header asp-reveal" style={{ "--asp-delay": "20ms" }}>
        <div>
          <h1>Admin Settings</h1>
          <p>Manage account preferences, security, and institutional configuration.</p>
        </div>
        <div className="asp-header-status">
          <span className="asp-status-dot online" />
          <div>
            <strong>System Status</strong>
            <span>All services operational</span>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="asp-skeleton">
          <div className="asp-skel-nav" />
          <div className="asp-skel-main">
            <div className="asp-skel-row" />
            <div className="asp-skel-row" />
            <div className="asp-skel-row tall" />
          </div>
        </section>
      ) : (
        <section className="asp-layout asp-reveal" style={{ "--asp-delay": "80ms" }}>
          <aside className="asp-tabs" aria-label="Settings sections">
            {TAB_ITEMS.map(([key, label], idx) => (
              <button
                key={key}
                type="button"
                className={`asp-tab ${activeTab === key ? "active" : ""} ${key === "logout" ? "logout" : ""}`}
                onClick={() => {
                  setActiveTab(key);
                  if (key === "logout") setShowLogoutConfirm(true);
                }}
                style={{ "--tab-delay": `${idx * 35}ms` }}
              >
                <span>{label}</span>
              </button>
            ))}

            <div className="asp-side-panels">
              <section className="asp-side-card">
                <h4>Role Permission Preview</h4>
                <p>{profile.role}</p>
                <ul>
                  {permissionPreview.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </section>
              <section className="asp-side-card">
                <h4>Backup Export</h4>
                <p>Configuration snapshot</p>
                <button type="button" className="asp-btn asp-btn-soft" onClick={() => setToast({ type: "ok", title: "Backup queued", text: "Configuration export has been scheduled." })}>
                  Export Config
                </button>
              </section>
            </div>
          </aside>

          <div className="asp-content">
            {activeTab === "profile" ? (
              <section className="asp-panel">
                <header className="asp-panel-head">
                  <div><h2>Profile</h2><p>Admin account identity and contact preferences.</p></div>
                </header>
                <div className="asp-form-grid">
                  <FloatingField label="Admin Name" error={profileErrors.name} filled={Boolean(profile.name)}>
                    <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                  </FloatingField>
                  <FloatingField label="Email" error={profileErrors.email} filled={Boolean(profile.email)}>
                    <input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                  </FloatingField>
                  <FloatingField label="Role" error={null} filled={Boolean(profile.role)}>
                    <select value={profile.role} onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}>
                      <option>Super Admin</option>
                      <option>Moderator</option>
                    </select>
                  </FloatingField>
                  <FloatingField label="Profile Photo Upload" error={null} filled={Boolean(profile.photo)}>
                    <input value={profile.photo} placeholder=" " onChange={(e) => setProfile((p) => ({ ...p, photo: e.target.value }))} />
                  </FloatingField>
                </div>
                <div className="asp-actions-row">
                  <button type="button" className="asp-btn asp-btn-primary" onClick={saveProfile} disabled={savingSection === "profile"}>
                    {savingSection === "profile" ? <span className="asp-spin" /> : null}
                    {savingSection === "profile" ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </section>
            ) : null}

            {activeTab === "institution" ? (
              <section className="asp-panel">
                <header className="asp-panel-head">
                  <div><h2>Institution</h2><p>Institutional configuration and department mapping.</p></div>
                  <button type="button" className="asp-btn asp-btn-soft" onClick={addDepartment}>Add Department</button>
                </header>
                <div className="asp-form-grid">
                  <FloatingField label="Institution Name" error={null} filled={Boolean(institution.name)}>
                    <input value={institution.name} onChange={(e) => setInstitution((p) => ({ ...p, name: e.target.value }))} />
                  </FloatingField>
                  <FloatingField label="Institution Code" error={null} filled={Boolean(institution.code)}>
                    <input value={institution.code} onChange={(e) => setInstitution((p) => ({ ...p, code: e.target.value }))} />
                  </FloatingField>
                  <FloatingField label="Academic Year Configuration" error={null} filled={Boolean(institution.academicYear)}>
                    <input value={institution.academicYear} onChange={(e) => setInstitution((p) => ({ ...p, academicYear: e.target.value }))} />
                  </FloatingField>
                </div>
                <div className="asp-dept-card">
                  <div className="asp-dept-head"><strong>Departments</strong><span>{departments.length} departments</span></div>
                  <div className="asp-dept-table-wrap">
                    <table className="asp-dept-table">
                      <thead><tr><th>Code</th><th>Department Name</th><th>Action</th></tr></thead>
                      <tbody>
                        {departments.map((d) => (
                          <tr key={d.id}>
                            <td>{d.id}</td>
                            <td><input value={d.name} onChange={(e) => updateDepartment(d.id, e.target.value)} /></td>
                            <td><button type="button" className="asp-mini danger" onClick={() => removeDepartment(d.id)}>Remove</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="asp-actions-row">
                  <button type="button" className="asp-btn asp-btn-primary" onClick={saveInstitution} disabled={savingSection === "institution"}>
                    {savingSection === "institution" ? <span className="asp-spin" /> : null}
                    Save Configuration
                  </button>
                </div>
              </section>
            ) : null}

            {activeTab === "security" ? (
              <section className="asp-panel">
                <header className="asp-panel-head">
                  <div><h2>Security</h2><p>Password management, 2FA, and active session controls.</p></div>
                </header>

                <div className="asp-sec-grid">
                  <section className="asp-card">
                    <div className="asp-card-head"><h3>Change Password</h3></div>
                    <div className="asp-stack">
                      {[
                        ["currentPassword", "Current Password", "current"],
                        ["newPassword", "New Password", "next"],
                        ["confirmPassword", "Confirm Password", "confirm"]
                      ].map(([field, label, key]) => (
                        <div key={field} className="asp-password-field">
                          <FloatingField label={label} error={null} filled={Boolean(security[field])}>
                            <input
                              type={showPwd[key] ? "text" : "password"}
                              value={security[field]}
                              onChange={(e) => setSecurity((p) => ({ ...p, [field]: e.target.value }))}
                            />
                          </FloatingField>
                          <button type="button" className="asp-mini" onClick={() => setShowPwd((p) => ({ ...p, [key]: !p[key] }))}>
                            {showPwd[key] ? "Hide" : "Show"}
                          </button>
                        </div>
                      ))}
                      <div className="asp-strength">
                        <div className="asp-strength-bar"><span style={{ width: `${(passwordStrength.score / 4) * 100}%` }} className={`s${passwordStrength.score}`} /></div>
                        <p>Password Strength: <strong>{passwordStrength.label}</strong></p>
                      </div>
                    </div>
                  </section>

                  <section className="asp-card">
                    <div className="asp-card-head"><h3>Two-Factor Authentication</h3></div>
                    <div className="asp-stack">
                      <div className="asp-toggle-row">
                        <div><strong>Enable 2FA</strong><span>Protect admin access with an authenticator app.</span></div>
                        <button type="button" className={`asp-switch ${security.twoFactor ? "on" : ""}`} onClick={() => setSecurity((p) => ({ ...p, twoFactor: !p.twoFactor }))}>
                          <span />
                        </button>
                      </div>
                      <div className="asp-qr-card">
                        <div className="asp-qr-placeholder">QR</div>
                        <div>
                          <strong>Authenticator Enrollment</strong>
                          <p>Scan the QR code in your authenticator app.</p>
                          <span className={`asp-badge ${security.twoFactor ? "ok" : "warn"}`}>{security.twoFactor ? "2FA Enabled" : "2FA Disabled"}</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="asp-card">
                  <div className="asp-card-head"><h3>Session Management</h3></div>
                  <div className="asp-session-list">
                    {sessions.map((s) => (
                      <div key={s.id} className="asp-session-row">
                        <div>
                          <strong>{s.device}</strong>
                          <span>{s.location}</span>
                          <small>{s.lastSeen}{s.current ? " • Current session" : ""}</small>
                        </div>
                        <button type="button" className="asp-mini danger" disabled={s.current} onClick={() => setConfirmSession(s)}>
                          {s.current ? "Current" : "Logout Session"}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="asp-actions-row">
                  <button type="button" className="asp-btn asp-btn-primary" onClick={saveSecurity} disabled={savingSection === "security"}>
                    {savingSection === "security" ? <span className="asp-spin" /> : null}
                    Save Security Settings
                  </button>
                </div>
              </section>
            ) : null}

            {activeTab === "notifications" ? (
              <section className="asp-panel">
                <header className="asp-panel-head">
                  <div><h2>Notifications</h2><p>Configure admin communication and alert preferences.</p></div>
                </header>
                <div className="asp-toggle-list">
                  {[
                    ["newAchievement", "Email for new achievement submission"],
                    ["pendingApprovals", "Email for pending approvals"],
                    ["weeklyReport", "Weekly activity report"],
                    ["realtimeAlerts", "Real-time dashboard alerts"]
                  ].map(([key, label]) => (
                    <div key={key} className="asp-toggle-row">
                      <div><strong>{label}</strong><span>Institutional admin notification preference.</span></div>
                      <button type="button" className={`asp-switch ${notifications[key] ? "on" : ""}`} onClick={() => setNotifications((p) => ({ ...p, [key]: !p[key] }))}>
                        <span />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="asp-actions-row">
                  <button type="button" className="asp-btn asp-btn-primary" onClick={saveNotifications} disabled={savingSection === "notifications"}>
                    {savingSection === "notifications" ? <span className="asp-spin" /> : null}
                    Save Preferences
                  </button>
                </div>
              </section>
            ) : null}

            {activeTab === "system" ? (
              <section className="asp-panel">
                <header className="asp-panel-head">
                  <div><h2>System Preferences</h2><p>Set global moderation defaults and platform behavior.</p></div>
                </header>
                <div className="asp-system-grid">
                  <section className="asp-card">
                    <div className="asp-toggle-row">
                      <div><strong>Dark / Light Mode</strong><span>Preview admin dashboard appearance preference.</span></div>
                      <button type="button" className={`asp-switch ${systemPrefs.theme === "Dark" ? "on" : ""}`} onClick={() => setSystemPrefs((p) => ({ ...p, theme: p.theme === "Dark" ? "Light" : "Dark" }))}>
                        <span />
                      </button>
                    </div>
                    <div className="asp-theme-preview">
                      <div className={`chip ${systemPrefs.theme.toLowerCase()}`}>{systemPrefs.theme} Mode</div>
                    </div>
                  </section>

                  <section className="asp-card asp-stack">
                    <FloatingField label="Default Approval Behavior" error={null} filled={Boolean(systemPrefs.defaultApproval)}>
                      <select value={systemPrefs.defaultApproval} onChange={(e) => setSystemPrefs((p) => ({ ...p, defaultApproval: e.target.value }))}>
                        <option>Manual Review</option>
                        <option>Faculty First, Admin Final</option>
                        <option>Auto-Approve Low Risk (Policy)</option>
                      </select>
                    </FloatingField>
                    <div className="asp-toggle-row">
                      <div><strong>Auto-archive rejected submissions</strong><span>Move rejected records to archive after review closure.</span></div>
                      <button type="button" className={`asp-switch ${systemPrefs.autoArchiveRejected ? "on" : ""}`} onClick={() => setSystemPrefs((p) => ({ ...p, autoArchiveRejected: !p.autoArchiveRejected }))}>
                        <span />
                      </button>
                    </div>
                    <FloatingField label="Data Retention Policy" error={null} filled={Boolean(systemPrefs.retention)}>
                      <select value={systemPrefs.retention} onChange={(e) => setSystemPrefs((p) => ({ ...p, retention: e.target.value }))}>
                        <option>6 Months</option>
                        <option>12 Months</option>
                        <option>24 Months</option>
                        <option>Permanent (Manual Cleanup)</option>
                      </select>
                    </FloatingField>
                  </section>
                </div>
                <div className="asp-actions-row">
                  <button type="button" className="asp-btn asp-btn-primary" onClick={saveSystem} disabled={savingSection === "system"}>
                    {savingSection === "system" ? <span className="asp-spin" /> : null}
                    Save System Preferences
                  </button>
                </div>
              </section>
            ) : null}

            {activeTab === "logout" ? (
              <section className="asp-panel asp-logout-panel">
                <header className="asp-panel-head">
                  <div><h2>Logout</h2><p>End the admin session securely across this browser.</p></div>
                </header>
                <div className="asp-logout-card">
                  <div className="asp-danger-icon">!</div>
                  <div>
                    <strong>Secure Logout</strong>
                    <p>Logging out clears the current session token and redirects to the login page.</p>
                  </div>
                </div>
                <div className="asp-actions-row">
                  <button type="button" className="asp-btn asp-btn-danger" onClick={() => setShowLogoutConfirm(true)}>
                    Logout
                  </button>
                </div>
              </section>
            ) : null}

            <section className="asp-panel asp-audit-panel">
              <header className="asp-panel-head compact">
                <div><h2>Audit Log</h2><p>Recent admin actions history</p></div>
              </header>
              <div className="asp-audit-list">
                {activityLog.map((x, i) => (
                  <div key={`${x}-${i}`} className="asp-audit-row">
                    <span className="dot" />
                    <p>{x}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      )}

      {confirmSession ? (
        <div className="asp-modal-layer" role="dialog" aria-modal="true" aria-label="Logout session confirmation">
          <div className="asp-overlay" onClick={() => setConfirmSession(null)} />
          <div className="asp-modal">
            <div className="asp-modal-icon warn">!</div>
            <h3>Logout from this device?</h3>
            <p>{confirmSession.device} • {confirmSession.location}</p>
            <div className="asp-modal-actions">
              <button type="button" className="asp-btn asp-btn-ghost" onClick={() => setConfirmSession(null)}>Cancel</button>
              <button type="button" className="asp-btn asp-btn-danger" onClick={() => logoutSession(confirmSession.id)}>Logout Session</button>
            </div>
          </div>
        </div>
      ) : null}

      {showLogoutConfirm ? (
        <div className="asp-modal-layer" role="dialog" aria-modal="true" aria-label="Logout confirmation">
          <div className="asp-overlay" onClick={() => !logoutLoading && setShowLogoutConfirm(false)} />
          <div className="asp-modal">
            <div className="asp-modal-icon danger">!</div>
            <h3>Are you sure you want to logout?</h3>
            <p>You will need to log in again to access the admin dashboard.</p>
            <div className="asp-modal-actions">
              <button type="button" className="asp-btn asp-btn-ghost" disabled={logoutLoading} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button type="button" className="asp-btn asp-btn-danger" disabled={logoutLoading} onClick={doLogout}>
                {logoutLoading ? <span className="asp-spin" /> : null}
                {logoutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`asp-toast ${toast.type === "danger" ? "danger" : ""}`} role="status" aria-live="polite">
          <strong>{toast.type === "ok" ? "Success" : "Notice"}</strong>
          <span>{toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
