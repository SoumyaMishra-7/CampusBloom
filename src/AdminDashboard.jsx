import { useEffect, useMemo, useRef, useState } from "react";
import AdminManageAchievementsView from "./AdminManageAchievements.jsx";
import AdminCertificatesManagementView from "./AdminCertificatesManagement.jsx";
import AdminApprovalsManagementView from "./AdminApprovalsManagement.jsx";
import AdminSettingsPage from "./AdminSettingsPage.jsx";

const navItems = [
  ["dashboard", "Dashboard", "DB"],
  ["achievements", "Manage Achievements", "MA"],
  ["students", "Students", "ST"],
  ["certificates", "Certificates", "CF"],
  ["reports", "Reports & Analytics", "RA"],
  ["approvals", "Approvals", "AP"],
  ["settings", "Settings", "SE"],
  ["logout", "Logout", "LO"]
];

const stats = [
  ["Total Students", 4218, "TS", "indigo", "+8.2%"],
  ["Total Achievements", 18642, "TA", "indigo", "+12.4%"],
  ["Pending Approvals", 87, "PA", "amber", "Needs review"],
  ["Certificates Uploaded", 9114, "CU", "emerald", "+5.9%"],
  ["Departments", 14, "DP", "indigo", "2 onboarded"],
  ["Events Conducted", 236, "EV", "emerald", "+19 this quarter"]
];

const bars = [
  ["CSE", 420],
  ["ECE", 340],
  ["ME", 265],
  ["Civil", 188],
  ["MBA", 214],
  ["Arts", 302]
];

const pie = [
  ["Technical", 38, "#4F46E5"],
  ["Sports", 22, "#10B981"],
  ["Cultural", 17, "#F59E0B"],
  ["Leadership", 13, "#0EA5E9"],
  ["Research", 10, "#EF4444"]
];

const lineData = [
  ["Sep", 220],
  ["Oct", 265],
  ["Nov", 248],
  ["Dec", 306],
  ["Jan", 354],
  ["Feb", 398]
];

const areaData = [
  ["Q1", 5200],
  ["Q2", 7900],
  ["Q3", 11800],
  ["Q4", 15400],
  ["Q1*", 18600]
];

const initialRows = [
  ["Aarav Sharma", "National Robotics Challenge Winner", "Technical", "Feb 23, 2026", "Pending"],
  ["Diya Nair", "Inter-University Debate Finalist", "Cultural", "Feb 22, 2026", "Approved"],
  ["Rohan Mehta", "State Athletics Silver Medal", "Sports", "Feb 22, 2026", "Pending"],
  ["Sara Khan", "Community Impact Fellowship", "Leadership", "Feb 21, 2026", "Approved"],
  ["Nitin Rao", "Research Poster Presentation", "Research", "Feb 20, 2026", "Pending"],
  ["Ishita Verma", "Campus Music Ensemble Performance", "Cultural", "Feb 19, 2026", "Approved"]
];

const notesSeed = [
  "7 new achievement submissions require faculty approval",
  "CSE department imported 142 certificates successfully",
  "Monthly participation report is ready for export"
];

const quickActions = ["Add Achievement", "Add Student", "Generate Report", "Export Data (Excel / PDF)"];

const storage = {
  collapsed: "cb.admin.sidebarCollapsed",
  dark: "cb.admin.darkMode",
  active: "cb.admin.activeNav",
  filters: "cb.admin.filters"
};

function Counter({ value, compact = false }) {
  const ref = useRef(null);
  const [live, setLive] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setLive(true);
        io.disconnect();
      }
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    let start = 0;
    const run = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 1100, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [live, value]);

  const out = compact && count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count.toLocaleString();
  return <span ref={ref}>{out}</span>;
}

function IconBadge({ text, tone = "indigo", small = false }) {
  return <span className={`ad-ib ad-ib-${tone} ${small ? "sm" : ""}`}>{text}</span>;
}

function ProgressRing({ value }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="ad-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ad-ring-track" cx="60" cy="60" r={r} />
        <circle className="ad-ring-fill" cx="60" cy="60" r={r} strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} />
      </svg>
      <div className="ad-ring-center">
        <strong>{v}</strong>
        <span>Performance</span>
      </div>
    </div>
  );
}

function ChartFrame({ title, sub, children, delay }) {
  return (
    <section className="ad-panel reveal" style={{ "--delay": `${delay}ms` }}>
      <header className="ad-panel-head">
        <div>
          <h3>{title}</h3>
          <p>{sub}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function BarChart({ data, tip }) {
  const max = Math.max(...data.map(([, v]) => v));
  return (
    <div className="ad-bar-chart">
      {data.map(([label, value], i) => (
        <button
          key={label}
          type="button"
          className="ad-bar"
          onMouseEnter={(e) => tip(e, `${label}: ${value} achievements`)}
          onMouseMove={(e) => tip(e, `${label}: ${value} achievements`)}
          onMouseLeave={() => tip(null, "")}
        >
          <span className="ad-bar-track"><span className={`ad-bar-fill ${i % 2 ? "alt" : ""}`} style={{ height: `${(value / max) * 100}%` }} /></span>
          <span className="ad-bar-label">{label}</span>
        </button>
      ))}
    </div>
  );
}

function PieChart({ data, tip }) {
  const total = data.reduce((s, [, v]) => s + v, 0);
  let cursor = 0;
  const c = 80;
  const r = 58;
  const polar = (a) => ({ x: c + r * Math.cos(a), y: c + r * Math.sin(a) });

  return (
    <div className="ad-pie-wrap">
      <svg className="ad-pie" viewBox="0 0 160 160" role="img" aria-label="Category distribution">
        <circle cx={c} cy={c} r={r + 8} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="16" />
        {data.map(([label, value, color]) => {
          const start = cursor;
          const end = cursor + (value / total) * Math.PI * 2;
          cursor = end;
          const s = polar(start - Math.PI / 2);
          const e = polar(end - Math.PI / 2);
          const large = end - start > Math.PI ? 1 : 0;
          const d = `M ${c} ${c} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
          return (
            <path
              key={label}
              d={d}
              fill={color}
              className="ad-pie-slice"
              onMouseEnter={(ev) => tip(ev, `${label}: ${value}%`)}
              onMouseMove={(ev) => tip(ev, `${label}: ${value}%`)}
              onMouseLeave={() => tip(null, "")}
            />
          );
        })}
        <circle cx={c} cy={c} r="28" className="ad-pie-hole" />
        <text x="80" y="76" textAnchor="middle" className="ad-pie-t1">Total</text>
        <text x="80" y="94" textAnchor="middle" className="ad-pie-t2">100%</text>
      </svg>
      <div className="ad-legend">
        {data.map(([label, value, color]) => (
          <div className="ad-legend-row" key={label}>
            <span className="dot" style={{ background: color }} />
            <span>{label}</span>
            <strong>{value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ data, variant, tip }) {
  const w = 520;
  const h = 220;
  const p = 18;
  const values = data.map(([, v]) => v);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const step = (w - p * 2) / Math.max(1, data.length - 1);
  const pts = data.map(([label, value], i) => {
    const x = p + i * step;
    const y = h - p - ((value - min) / range) * (h - p * 2);
    return { label, value, x, y };
  });
  const line = pts.map((x) => `${x.x},${x.y}`).join(" ");
  const area = `${p},${h - p} ${line} ${w - p},${h - p}`;
  const id = `grad-${variant}`;

  return (
    <div className="ad-trend">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={variant === "area" ? "Growth in achievements over time" : "Monthly participation trends"}>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={variant === "area" ? "#4F46E5" : "#10B981"} stopOpacity="0.28" />
            <stop offset="100%" stopColor={variant === "area" ? "#4F46E5" : "#10B981"} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((g) => {
          const y = p + (g * (h - p * 2)) / 3;
          return <line key={g} x1={p} y1={y} x2={w - p} y2={y} className="grid" />;
        })}
        <polygon points={area} fill={`url(#${id})`} className={`fill ${variant}`} />
        <polyline points={line} className={`line ${variant}`} />
        {pts.map((x) => (
          <g key={x.label}>
            <circle
              cx={x.x}
              cy={x.y}
              r="4.5"
              className={`dot ${variant}`}
              onMouseEnter={(e) => tip(e, `${x.label}: ${x.value}`)}
              onMouseMove={(e) => tip(e, `${x.label}: ${x.value}`)}
              onMouseLeave={() => tip(null, "")}
            />
            <text x={x.x} y={h - 2} textAnchor="middle" className="axis">{x.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="ad-skel">
      <div className="blk h1 shimmer" />
      <div className="grid6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="blk h2 shimmer" />)}
      </div>
      <div className="grid2">
        <div className="blk h3 shimmer" />
        <div className="blk h3 shimmer" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(storage.collapsed) === "1");
  const [dark, setDark] = useState(() => localStorage.getItem(storage.dark) === "1");
  const [active, setActive] = useState(() => localStorage.getItem(storage.active) || "dashboard");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notes, setNotes] = useState(notesSeed);
  const [unread, setUnread] = useState(3);
  const [exporting, setExporting] = useState(false);
  const [tip, setTip] = useState({ show: false, x: 0, y: 0, text: "" });
  const [filters, setFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storage.filters) || '{"department":"All Departments","status":"All Status","range":"Last 30 days"}');
    } catch {
      return { department: "All Departments", status: "All Status", range: "Last 30 days" };
    }
  });
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => localStorage.setItem(storage.collapsed, collapsed ? "1" : "0"), [collapsed]);
  useEffect(() => localStorage.setItem(storage.dark, dark ? "1" : "0"), [dark]);
  useEffect(() => localStorage.setItem(storage.active, active), [active]);
  useEffect(() => localStorage.setItem(storage.filters, JSON.stringify(filters)), [filters]);
  useEffect(() => {
    if (active === "achievements" || active === "certificates" || active === "approvals" || active === "settings" || active === "logout") setDrawer(false);
  }, [active]);
  useEffect(() => {
    const t = setInterval(() => {
      const msg = `Realtime sync update • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      setNotes((p) => [msg, ...p].slice(0, 5));
      setUnread((u) => Math.min(9, u + 1));
    }, 18000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && (setDrawer(false), setNotifOpen(false));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .map((row, idx) => ({ row, idx }))
      .filter(({ row: [student, title, category, , status] }) => {
      const s = !q || student.toLowerCase().includes(q) || title.toLowerCase().includes(q) || category.toLowerCase().includes(q);
      const f1 = filters.status === "All Status" || status === filters.status;
      const f2 = filters.department === "All Departments" || category === filters.department;
      return s && f1 && f2;
    });
  }, [rows, search, filters]);

  const pendingCount = rows.filter((r) => r[4] === "Pending").length;

  const showTip = (e, text) => {
    if (!e || !text) return setTip((p) => ({ ...p, show: false }));
    const rect = e.currentTarget.closest(".ad-shell")?.getBoundingClientRect();
    setTip({
      show: true,
      x: (rect ? e.clientX - rect.left : e.clientX) + 12,
      y: (rect ? e.clientY - rect.top : e.clientY) - 8,
      text
    });
  };

  const act = (idx, next) => setRows((prev) => prev.map((r, i) => (i === idx ? [r[0], r[1], r[2], r[3], next] : r)));

  const exportNow = () => {
    if (exporting) return;
    setExporting(true);
    setTimeout(() => setExporting(false), 1800);
  };

  const shellClass = ["ad-shell", collapsed ? "collapsed" : "", dark ? "dark" : ""].filter(Boolean).join(" ");

  return (
    <div className={shellClass}>
      <aside className="ad-sidebar" aria-label="Admin navigation">
        <div className="ad-side-top">
          <a href="/admin-dashboard" className="brand">
            <div className="mark">
              <img src="/brand/campusbloom-icon-inverted.svg" alt="" aria-hidden="true" />
            </div>
            <div className="brand-copy">
              <strong>CampusBloom</strong>
              <span>Admin</span>
            </div>
          </a>
          <button className="icon-btn side-toggle" type="button" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">|||</button>
        </div>
        <nav className="ad-nav">
          {navItems.map(([key, label, glyph]) => (
            <button key={key} type="button" className={`nav-item ${active === key ? "active" : ""}`} onClick={() => setActive(key)} title={collapsed ? label : undefined}>
              <IconBadge text={glyph} small tone={active === key ? "solid" : "muted"} />
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <div className="secure-card">
            <p>Institution security posture</p>
            <strong>SSO + Role Controls Active</strong>
            <span>Last audit: Feb 20, 2026</span>
          </div>
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-top">
          <div className="top-left">
            <button className="icon-btn mobile-only" type="button" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">|||</button>
            <label className="search">
              <span className="search-mark">SR</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or achievement" />
            </label>
          </div>
          <div className="top-right">
            {active !== "achievements" && active !== "certificates" && active !== "approvals" && active !== "settings" && active !== "logout" ? (
              <button className="icon-btn" type="button" onClick={() => setDrawer(true)} aria-label="Open filters">FL</button>
            ) : null}
            <button
              className={`icon-btn notify ${unread ? "has-alert" : ""}`}
              type="button"
              onClick={() => {
                setNotifOpen((v) => !v);
                setUnread(0);
              }}
              aria-label="Notifications"
            >
              NT
              {unread > 0 ? <span className="count">{unread}</span> : null}
            </button>
            <button className="icon-btn" type="button" onClick={() => setDark((v) => !v)} aria-label="Toggle dark mode">{dark ? "LM" : "DM"}</button>
            <div className="inst-pill">
              <div>
                <strong>Bloomfield University</strong>
                <span>Institution Admin</span>
              </div>
              <div className="avatar">AK</div>
            </div>
          </div>
          {notifOpen ? (
            <div className="popover" role="dialog" aria-label="Approval alerts">
              <div className="popover-head">
                <strong>Approval Alerts</strong>
                <button type="button" className="text-btn" onClick={() => setNotes([])}>Clear</button>
              </div>
              <div className="notes">
                {notes.length ? notes.map((n, i) => (
                  <div key={`${n}-${i}`} className="note-row">
                    <span className="pulse" />
                    <p>{n}</p>
                  </div>
                )) : <p className="empty">No new notifications</p>}
              </div>
            </div>
          ) : null}
        </header>

        <main className="ad-content">
          {active === "achievements" ? (
            <AdminManageAchievementsView />
          ) : active === "certificates" ? (
            <AdminCertificatesManagementView />
          ) : active === "approvals" ? (
            <AdminApprovalsManagementView />
          ) : active === "settings" || active === "logout" ? (
            <AdminSettingsPage initialTab={active === "logout" ? "logout" : "profile"} />
          ) : (
            <>
          <section className="hero reveal" style={{ "--delay": "30ms" }}>
            <div>
              <p className="overline">CampusBloom Admin Control Center</p>
              <h1>Institutional Achievement Intelligence</h1>
              <p className="hero-copy">
                Monitor approvals, departmental activity, and student participation trends across your institution in one secure dashboard.
              </p>
            </div>
            <div className="hero-side">
              <ProgressRing value={84} />
              <div className="hero-cards">
                <div><span>Verification SLA</span><strong>18h 24m avg</strong></div>
                <div><span>Approval throughput</span><strong>92% this week</strong></div>
              </div>
            </div>
          </section>

          {loading ? (
            <Skeleton />
          ) : (
            <>
              <section className="stats-grid">
                {stats.map(([label, value, glyph, tone, delta], i) => (
                  <article key={label} className={`stat-card ${tone} reveal`} style={{ "--delay": `${70 + i * 55}ms` }}>
                    <IconBadge text={glyph} tone={tone} />
                    <div>
                      <p>{label}</p>
                      <h2><Counter value={value} compact={value >= 1000} /></h2>
                      <span className="delta">{delta}</span>
                    </div>
                  </article>
                ))}
              </section>

              <section className="charts-grid">
                <ChartFrame title="Achievements by Department" sub="Submission volume in current reporting cycle" delay={120}>
                  <BarChart data={bars} tip={showTip} />
                </ChartFrame>
                <ChartFrame title="Category Distribution" sub="Institution-wide contribution split" delay={170}>
                  <PieChart data={pie} tip={showTip} />
                </ChartFrame>
                <ChartFrame title="Monthly Participation Trends" sub="Student participation across events" delay={220}>
                  <TrendChart data={lineData} variant="line" tip={showTip} />
                </ChartFrame>
                <ChartFrame title="Growth in Achievements" sub="Cumulative institutional growth trajectory" delay={270}>
                  <TrendChart data={areaData} variant="area" tip={showTip} />
                </ChartFrame>
              </section>

              <section className="main-grid">
                <div className="left-col">
                  <section className="ad-panel reveal" style={{ "--delay": "240ms" }}>
                    <header className="ad-panel-head">
                      <div>
                        <h3>Recent Activity</h3>
                        <p>Latest student achievement submissions and verification actions</p>
                      </div>
                      <div className="chips"><span className="chip">{filters.range}</span><span className="chip">{filters.status}</span></div>
                    </header>
                    <div className="table-wrap">
                      <table className="activity">
                        <thead>
                          <tr>
                            <th>Student Name</th><th>Achievement Title</th><th>Category</th><th>Date</th><th>Status</th><th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRows.map(({ row: r, idx }) => (
                            <tr key={`${r[0]}-${r[1]}`}>
                              <td>{r[0]}</td>
                              <td className="title">{r[1]}</td>
                              <td><span className={`tag ${r[2].toLowerCase()}`}>{r[2]}</span></td>
                              <td>{r[3]}</td>
                              <td><span className={`status ${r[4].toLowerCase()}`}>{r[4]}</span></td>
                              <td>
                                <div className="acts">
                                  <button type="button" className="ghost" onClick={() => act(idx, "Approved")}>Approve</button>
                                  <button type="button" className="ghost danger" onClick={() => act(idx, "Rejected")}>Reject</button>
                                  <button type="button" className="soft">View</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!filteredRows.length ? <div className="empty-table">No matching activity records for the current filters.</div> : null}
                    </div>
                  </section>
                </div>

                <div className="right-col">
                  <section className={`ad-panel approvals reveal ${pendingCount > 0 ? "pulse-bg" : ""}`} style={{ "--delay": "290ms" }}>
                    <header className="ad-panel-head compact">
                      <div><h3>Pending Approvals</h3><p>Priority review queue</p></div>
                    </header>
                    <div className="approval-body">
                      <div className="approval-count"><Counter value={pendingCount} /><span>awaiting action</span></div>
                      <button type="button" className="btn primary" onClick={() => setActive("approvals")}>Quick Review</button>
                    </div>
                  </section>

                  <section className="ad-panel reveal" style={{ "--delay": "330ms" }}>
                    <header className="ad-panel-head compact">
                      <div><h3>Quick Actions</h3><p>High-frequency admin workflows</p></div>
                    </header>
                    <div className="qa-list">
                      {quickActions.map((x) => (
                        <button key={x} type="button" className={`qa ${x.includes("Export") ? "primaryish" : ""}`} onClick={x.includes("Export") ? exportNow : undefined}>
                          <IconBadge text={x.split(" ").map((w) => w[0]).slice(0, 2).join("")} tone="indigo" small />
                          <span>{x}</span>
                          {x.includes("Export") && exporting ? <span className="spinner" /> : null}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="ad-panel reveal" style={{ "--delay": "370ms" }}>
                    <header className="ad-panel-head compact">
                      <div><h3>Operational Highlights</h3><p>Live institutional metrics</p></div>
                    </header>
                    <ul className="highlights">
                      <li><span>Departments with 100% verification this month</span><strong>7 / 14</strong></li>
                      <li><span>Certificates processed today</span><strong>142</strong></li>
                      <li><span>Faculty reviewers active</span><strong>28</strong></li>
                      <li><span>Data export jobs</span><strong>{exporting ? "Running..." : "Idle"}</strong></li>
                    </ul>
                  </section>
                </div>
              </section>
            </>
          )}
            </>
          )}
        </main>
      </div>

      <aside className={`drawer ${drawer ? "open" : ""}`} aria-hidden={!drawer}>
        <div className="backdrop" onClick={() => setDrawer(false)} />
        <div className="panel" role="dialog" aria-label="Filter panel">
          <div className="drawer-head">
            <div><p className="overline">Filters</p><h3>Refine Dashboard Data</h3></div>
            <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close">X</button>
          </div>
          <div className="fields">
            <label>Department
              <select value={filters.department} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}>
                <option>All Departments</option><option>Technical</option><option>Sports</option><option>Cultural</option><option>Leadership</option><option>Research</option>
              </select>
            </label>
            <label>Status
              <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
                <option>All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option>
              </select>
            </label>
            <label>Time Range
              <select value={filters.range} onChange={(e) => setFilters((f) => ({ ...f, range: e.target.value }))}>
                <option>Last 7 days</option><option>Last 30 days</option><option>Current Semester</option><option>Academic Year</option>
              </select>
            </label>
          </div>
          <div className="drawer-actions">
            <button type="button" className="btn muted" onClick={() => setFilters({ department: "All Departments", status: "All Status", range: "Last 30 days" })}>Reset</button>
            <button type="button" className="btn primary" onClick={() => setDrawer(false)}>Apply Filters</button>
          </div>
        </div>
      </aside>

      {tip.show ? <div className="chart-tip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div> : null}
    </div>
  );
}
