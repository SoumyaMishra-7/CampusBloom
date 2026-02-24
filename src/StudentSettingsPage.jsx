import { useEffect, useMemo, useState } from "react";

const tabs = ["Profile", "Privacy", "Notifications", "Account", "Appearance"];

const navItems = [
  { label: "Dashboard", href: "student-dashboard.html" },
  { label: "My Achievements", href: "student-achievements.html" },
  { label: "Timeline", href: "student-timeline.html" },
  { label: "Certificates", href: "student-certificates.html" },
  { label: "Public Profile", href: "student-public-profile.html" },
  { label: "Settings", href: "student-settings.html" }
];

function Icon({ type }) {
  const p = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };
  switch (type) {
    case "menu":
      return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "moon":
      return <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg>;
    case "sun":
      return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
    case "close":
      return <svg {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>;
    case "eye":
      return <svg {...p}><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" /><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>;
    case "eye-off":
      return <svg {...p}><path d="M3 4.5 20 21" /><path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c5.5 0 9 6 9 6a16.7 16.7 0 0 1-3.2 3.8" /><path d="M6.6 8.2A16.8 16.8 0 0 0 3 12s3.5 6 9 6c.5 0 1.1-.1 1.6-.1" /></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div className="ss-toggle-row">
      <div>
        <strong>{label}</strong>
        {hint ? <p>{hint}</p> : null}
      </div>
      <button type="button" className={`ss-switch ${checked ? "active" : ""}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
        <span />
      </button>
    </div>
  );
}

function StudentSettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("cb.settings.sidebar") === "true");
  const [pageThemeDark, setPageThemeDark] = useState(() => localStorage.getItem("cb.settings.pageDark") === "true");
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("cb.settings.activeTab") || "Profile");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);
  const [toast, setToast] = useState("");

  const [profile, setProfile] = useState({
    fullName: "Soumya Mishra",
    email: "soumya@example.edu",
    department: "Computer Science",
    year: "Final Year",
    bio: "Student builder focused on technology, leadership, and evidence-backed extracurricular growth.",
    photoName: ""
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showEmail: false,
    showRollNumber: false,
    achievementVisibility: true
  });

  const [notifications, setNotifications] = useState({
    achievementAdded: true,
    approvalUpdate: true,
    weeklySummary: false
  });

  const [account, setAccount] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [accountErrors, setAccountErrors] = useState({});
  const [shakeAccount, setShakeAccount] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [appearance, setAppearance] = useState({
    themeMode: "system"
  });

  useEffect(() => {
    const t = window.setTimeout(() => setLoadingProfile(false), 850);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("cb.settings.sidebar", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("cb.settings.pageDark", String(pageThemeDark));
  }, [pageThemeDark]);

  useEffect(() => {
    localStorage.setItem("cb.settings.activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );
    document.querySelectorAll("[data-ss-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [activeTab, loadingProfile]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const autoSaveLabel = useMemo(() => (saving ? "Saving..." : savedPulse ? "All changes saved" : "Autosave enabled"), [saving, savedPulse]);

  const triggerSave = (message = "Settings saved") => {
    setSaving(true);
    setSavedPulse(false);
    window.setTimeout(() => {
      setSaving(false);
      setSavedPulse(true);
      setToast(message);
      window.setTimeout(() => setSavedPulse(false), 900);
    }, 850);
  };

  const validateAccount = () => {
    const errs = {};
    if (!account.currentPassword) errs.currentPassword = "Current password is required.";
    if (!account.newPassword) errs.newPassword = "New password is required.";
    else if (account.newPassword.length < 8) errs.newPassword = "Use at least 8 characters.";
    if (!account.confirmPassword) errs.confirmPassword = "Confirm your new password.";
    else if (account.confirmPassword !== account.newPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleChangePassword = () => {
    const errs = validateAccount();
    setAccountErrors(errs);
    if (Object.keys(errs).length) {
      setShakeAccount(true);
      window.setTimeout(() => setShakeAccount(false), 420);
      return;
    }
    triggerSave("Password updated successfully");
    setAccount({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const renderField = (label, key, options = {}) => (
    <label className="ss-field">
      <span>{label}</span>
      {options.type === "textarea" ? (
        <textarea
          rows={4}
          value={profile[key]}
          onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
          placeholder=" "
        />
      ) : (
        <input
          type={options.type || "text"}
          value={profile[key]}
          onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
          readOnly={options.readOnly}
          placeholder=" "
        />
      )}
    </label>
  );

  return (
    <div className={`ss-app ${pageThemeDark ? "ss-dark" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="ss-sidebar">
        <div className="ss-sidebar-top">
          <a href="student-dashboard.html" className="ss-logo">
            <span className="ss-logo-mark">
              <img src="/brand/campusbloom-icon-inverted.svg" alt="" aria-hidden="true" />
            </span>
            <span className="ss-logo-text">CampusBloom</span>
          </a>
          <button type="button" className="ss-icon-btn ss-sidebar-toggle" onClick={() => setSidebarCollapsed((v) => !v)} aria-label="Toggle sidebar">
            <Icon type="menu" />
          </button>
        </div>

        <nav className="ss-nav" aria-label="Student navigation">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={`ss-nav-item ${item.label === "Settings" ? "active" : ""}`} title={item.label}>
              <span className="ss-nav-dot" />
              <span className="ss-nav-label">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="ss-shell">
        <header className="ss-topbar">
          <div className="ss-topbar-left">
            <div className="ss-autosave">
              <span className={`ss-save-indicator ${saving ? "saving" : savedPulse ? "saved" : ""}`} />
              <span>{autoSaveLabel}</span>
            </div>
          </div>
          <div className="ss-topbar-actions">
            <button type="button" className="ss-icon-btn" onClick={() => setPageThemeDark((v) => !v)} aria-label="Toggle theme">
              <Icon type={pageThemeDark ? "sun" : "moon"} />
            </button>
            <a href="student-dashboard.html" className="ss-avatar-chip">SM</a>
          </div>
        </header>

        <main className="ss-main">
          <div className="ss-container">
            <section className="ss-header" data-ss-reveal>
              <h1>Settings</h1>
              <p>Manage your account, privacy, and preferences.</p>
            </section>

            <section className="ss-layout" data-ss-reveal>
              <aside className="ss-tabs" role="tablist" aria-label="Settings tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={`ss-tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </aside>

              <div className="ss-panel-wrap">
                <div className="ss-panel" key={activeTab}>
                  {activeTab === "Profile" ? (
                    <div className="ss-tab-content" data-ss-reveal>
                      <div className="ss-panel-head">
                        <div>
                          <h2>Profile</h2>
                          <p>Update your academic identity and public portfolio details.</p>
                        </div>
                      </div>

                      {loadingProfile ? (
                        <div className="ss-skeleton-grid">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="ss-skeleton-card">
                              <div className="ss-skeleton short" />
                              <div className="ss-skeleton" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="ss-form-grid">
                            {renderField("Full Name", "fullName")}
                            {renderField("Email", "email", { type: "email" })}
                            {renderField("Department", "department")}
                            {renderField("Year", "year")}
                            <label className="ss-field ss-field-full">
                              <span>Bio</span>
                              <textarea
                                rows={4}
                                value={profile.bio}
                                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                                placeholder=" "
                              />
                            </label>

                            <label className="ss-field ss-field-full">
                              <span>Profile Photo</span>
                              <div className="ss-upload-inline">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setProfile((p) => ({ ...p, photoName: file.name }));
                                  }}
                                />
                                <small>{profile.photoName || "No file selected"}</small>
                              </div>
                            </label>
                          </div>

                          <div className="ss-actions">
                            <button type="button" className={`ss-btn ss-primary ${saving ? "loading" : ""}`} disabled={saving} onClick={() => triggerSave("Profile changes saved")}>
                              {saving ? "Saving..." : "Save Changes"}
                            </button>
                            {savedPulse ? <span className="ss-success-chip">Saved</span> : null}
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}

                  {activeTab === "Privacy" ? (
                    <div className="ss-tab-content" data-ss-reveal>
                      <div className="ss-panel-head">
                        <div>
                          <h2>Privacy</h2>
                          <p>Control what appears in your public profile and academic portfolio.</p>
                        </div>
                      </div>
                      <div className="ss-list-card">
                        <Toggle checked={privacy.publicProfile} onChange={(v) => setPrivacy((p) => ({ ...p, publicProfile: v }))} label="Public Profile" hint="Allow institutions and recruiters to view your public portfolio." />
                        <Toggle checked={privacy.showEmail} onChange={(v) => setPrivacy((p) => ({ ...p, showEmail: v }))} label="Show Email" hint="Display your email on the public profile page." />
                        <Toggle checked={privacy.showRollNumber} onChange={(v) => setPrivacy((p) => ({ ...p, showRollNumber: v }))} label="Show Roll Number" hint="Expose roll number to profile viewers." />
                        <Toggle checked={privacy.achievementVisibility} onChange={(v) => setPrivacy((p) => ({ ...p, achievementVisibility: v }))} label="Achievement Visibility" hint="Show all approved achievements on public profile." />
                      </div>
                      <div className="ss-actions">
                        <button type="button" className="ss-btn ss-primary" onClick={() => triggerSave("Privacy settings updated")}>Save Privacy Settings</button>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Notifications" ? (
                    <div className="ss-tab-content" data-ss-reveal>
                      <div className="ss-panel-head">
                        <div>
                          <h2>Notifications</h2>
                          <p>Choose how CampusBloom informs you about achievements and approvals.</p>
                        </div>
                      </div>
                      <div className="ss-list-card">
                        <Toggle checked={notifications.achievementAdded} onChange={(v) => setNotifications((n) => ({ ...n, achievementAdded: v }))} label="Email when new achievement is added" />
                        <Toggle checked={notifications.approvalUpdate} onChange={(v) => setNotifications((n) => ({ ...n, approvalUpdate: v }))} label="Email on approval/rejection" />
                        <Toggle checked={notifications.weeklySummary} onChange={(v) => setNotifications((n) => ({ ...n, weeklySummary: v }))} label="Weekly summary email" />
                      </div>
                      <div className="ss-actions">
                        <button type="button" className="ss-btn ss-primary" onClick={() => triggerSave("Notification preferences saved")}>Save Notification Preferences</button>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Account" ? (
                    <div className={`ss-tab-content ${shakeAccount ? "shake" : ""}`} data-ss-reveal>
                      <div className="ss-panel-head">
                        <div>
                          <h2>Account</h2>
                          <p>Manage password, session access, and account actions.</p>
                        </div>
                      </div>

                      <section className="ss-subcard">
                        <div className="ss-subcard-head">
                          <h3>Change Password</h3>
                          <button type="button" className="ss-btn ss-outline ss-small" onClick={() => setShowPasswords((v) => !v)}>
                            <Icon type={showPasswords ? "eye-off" : "eye"} />
                            {showPasswords ? "Hide" : "Show"}
                          </button>
                        </div>

                        <div className="ss-form-grid">
                          <label className="ss-field">
                            <span>Current Password</span>
                            <input
                              type={showPasswords ? "text" : "password"}
                              value={account.currentPassword}
                              onChange={(e) => setAccount((a) => ({ ...a, currentPassword: e.target.value }))}
                              placeholder=" "
                            />
                            {accountErrors.currentPassword ? <small className="ss-error">{accountErrors.currentPassword}</small> : null}
                          </label>
                          <label className="ss-field">
                            <span>New Password</span>
                            <input
                              type={showPasswords ? "text" : "password"}
                              value={account.newPassword}
                              onChange={(e) => setAccount((a) => ({ ...a, newPassword: e.target.value }))}
                              placeholder=" "
                            />
                            {accountErrors.newPassword ? <small className="ss-error">{accountErrors.newPassword}</small> : null}
                          </label>
                          <label className="ss-field ss-field-full">
                            <span>Confirm Password</span>
                            <input
                              type={showPasswords ? "text" : "password"}
                              value={account.confirmPassword}
                              onChange={(e) => setAccount((a) => ({ ...a, confirmPassword: e.target.value }))}
                              placeholder=" "
                            />
                            {accountErrors.confirmPassword ? <small className="ss-error">{accountErrors.confirmPassword}</small> : null}
                          </label>
                        </div>

                        <div className="ss-actions">
                          <button type="button" className="ss-btn ss-primary" onClick={handleChangePassword}>Update Password</button>
                        </div>
                      </section>

                      <section className="ss-subcard">
                        <div className="ss-subcard-head">
                          <h3>Session & Account Actions</h3>
                        </div>
                        <div className="ss-danger-actions">
                          <a href="login.html" className="ss-btn ss-outline">Logout</a>
                          <button type="button" className="ss-btn ss-danger" onClick={() => setDeleteConfirmOpen(true)}>Delete Account</button>
                        </div>
                      </section>
                    </div>
                  ) : null}

                  {activeTab === "Appearance" ? (
                    <div className="ss-tab-content" data-ss-reveal>
                      <div className="ss-panel-head">
                        <div>
                          <h2>Appearance</h2>
                          <p>Choose how CampusBloom looks for your student workspace.</p>
                        </div>
                      </div>

                      <div className="ss-theme-options">
                        {[
                          { key: "light", title: "Light", desc: "Bright interface for daytime use" },
                          { key: "dark", title: "Dark", desc: "Reduced glare for extended sessions" },
                          { key: "system", title: "System", desc: "Follow device preference automatically" }
                        ].map((theme) => (
                          <button
                            key={theme.key}
                            type="button"
                            className={`ss-theme-card ${appearance.themeMode === theme.key ? "active" : ""}`}
                            onClick={() => setAppearance((a) => ({ ...a, themeMode: theme.key }))}
                          >
                            <div className={`ss-theme-preview ${theme.key}`}>
                              <span />
                              <span />
                              <span />
                            </div>
                            <div className="ss-theme-text">
                              <strong>{theme.title}</strong>
                              <p>{theme.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="ss-list-card">
                        <Toggle checked={pageThemeDark} onChange={setPageThemeDark} label="Preview Dark Mode on Settings Page" hint="Instantly preview dark mode for this page." />
                      </div>

                      <div className="ss-actions">
                        <button type="button" className="ss-btn ss-primary" onClick={() => triggerSave("Appearance preferences saved")}>Save Appearance</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {deleteConfirmOpen ? (
        <div className="ss-modal-backdrop" role="dialog" aria-modal="true" aria-label="Delete account confirmation">
          <div className="ss-modal">
            <div className="ss-modal-head">
              <h3>Delete Account</h3>
              <button type="button" className="ss-icon-btn" onClick={() => setDeleteConfirmOpen(false)} aria-label="Close confirmation">
                <Icon type="close" />
              </button>
            </div>
            <p>This action is permanent and will remove your account access and profile settings. Are you sure you want to continue?</p>
            <div className="ss-modal-actions">
              <button type="button" className="ss-btn ss-outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</button>
              <button
                type="button"
                className="ss-btn ss-danger"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setToast("Delete request submitted for admin confirmation");
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="ss-toast">{toast}</div> : null}
    </div>
  );
}

export default StudentSettingsPage;
