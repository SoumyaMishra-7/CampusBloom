import { useEffect, useMemo, useState } from "react";
import "./admin-approvals-management.css";

const ROWS = [
  { id: "APR-3201", student: "Aarav Sharma", studentId: "S001", title: "National Robotics Challenge Winner", category: "Technical", level: "National", department: "CSE", submissionType: "Achievement", submittedAt: "2026-02-24T09:20:00", hasCertificate: true, status: "Pending", eventName: "National Robotics Challenge 2026", eventDate: "2026-02-16", description: "Team autonomous navigation event winner.", remarks: "", certificateFile: "robotics-aarav.pdf" },
  { id: "APR-3200", student: "Diya Nair", studentId: "S002", title: "Inter-University Debate Finalist", category: "Cultural", level: "State", department: "ECE", submissionType: "Certificate", submittedAt: "2026-02-24T08:42:00", hasCertificate: true, status: "Pending", eventName: "Debate Forum", eventDate: "2026-02-10", description: "Reached final round in policy debate.", remarks: "", certificateFile: "debate-diya.jpg" },
  { id: "APR-3199", student: "Rohan Mehta", studentId: "S003", title: "State Athletics Silver Medal", category: "Sports", level: "State", department: "Sports", submissionType: "Achievement", submittedAt: "2026-02-23T15:04:00", hasCertificate: true, status: "Pending", eventName: "State Collegiate Sports Meet", eventDate: "2026-02-12", description: "Relay silver medal performance.", remarks: "", certificateFile: "athletics-rohan.png" },
  { id: "APR-3198", student: "Sara Khan", studentId: "S004", title: "Community Leadership Fellowship", category: "Leadership", level: "National", department: "MBA", submissionType: "Achievement", submittedAt: "2026-02-23T12:18:00", hasCertificate: false, status: "Rejected", eventName: "Youth Leadership Fellowship", eventDate: "2026-02-07", description: "Leadership fellowship nomination record.", remarks: "Event year mismatch", certificateFile: "" },
  { id: "APR-3197", student: "Ishita Verma", studentId: "S005", title: "Classical Music Ensemble Performance", category: "Cultural", level: "College", department: "Arts", submissionType: "Certificate", submittedAt: "2026-02-23T11:30:00", hasCertificate: true, status: "Approved", eventName: "BloomFest 2026", eventDate: "2026-02-01", description: "Cultural fest ensemble recognition.", remarks: "Verified with coordinator", certificateFile: "music-ishita.pdf" },
  { id: "APR-3196", student: "Nitin Rao", studentId: "S006", title: "Hackathon Problem Solving Excellence", category: "Technical", level: "College", department: "CSE", submissionType: "Certificate", submittedAt: "2026-02-22T17:56:00", hasCertificate: true, status: "Pending", eventName: "CampusBloom HackSprint", eventDate: "2026-02-05", description: "Top problem-solving score in hackathon.", remarks: "", certificateFile: "hackathon-nitin.pdf" },
  { id: "APR-3195", student: "Meera Iyer", studentId: "S007", title: "National Robotics Challenge Winner", category: "Technical", level: "National", department: "CSE", submissionType: "Certificate", submittedAt: "2026-02-22T16:08:00", hasCertificate: true, status: "Approved", eventName: "National Robotics Challenge 2026", eventDate: "2026-02-16", description: "Team achievement certificate upload.", remarks: "Roster matched", certificateFile: "robotics-meera.jpeg" },
  { id: "APR-3194", student: "Kunal Patel", studentId: "S008", title: "Hackathon Problem Solving Excellence", category: "Technical", level: "College", department: "ECE", submissionType: "Certificate", submittedAt: "2026-02-22T10:13:00", hasCertificate: true, status: "Pending", eventName: "CampusBloom HackSprint", eventDate: "2026-02-05", description: "Certificate upload pending manual review.", remarks: "", certificateFile: "hackathon-kunal.png" }
];

const CATS = ["Technical", "Sports", "Cultural", "Leadership"];
const DEPTS = ["CSE", "ECE", "Sports", "MBA", "Arts"];
const TYPES = ["Achievement", "Certificate"];
const STATUSES = ["Pending", "Approved", "Rejected"];
const DATE_RANGES = ["Today", "Last 7 Days", "Last 30 Days", "Academic Term"];

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
const fmtDateTime = (d) =>
  new Date(d).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });

function CountUp({ value, suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const run = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 700, 1);
      const e = 1 - (1 - p) ** 3;
      setN(Math.round(value * e));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}{suffix}</>;
}

export default function AdminApprovalsManagementView() {
  const [rows, setRows] = useState(ROWS);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [toast, setToast] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState({ open: false, action: "" });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [notif, setNotif] = useState(4);
  const [progress, setProgress] = useState(68);
  const [filters, setFilters] = useState({
    dateRange: "Last 7 Days",
    category: "All",
    department: "All",
    submissionType: "All",
    status: "Pending"
  });
  const [timeline, setTimeline] = useState([
    "APR-3201 entered pending queue",
    "APR-3197 approved by Admin AK",
    "APR-3198 rejected with remarks",
    "Auto-refresh synchronized submissions"
  ]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => setPage(1), [filters]);

  useEffect(() => {
    const tick = setInterval(() => {
      setNotif((n) => Math.min(9, n + 1));
      setProgress((p) => (p >= 92 ? 70 : p + 2));
      setTimeline((prev) => [`Auto-refresh queue sync • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, ...prev].slice(0, 6));
    }, 22000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && (setFiltersOpen(false), setReviewItem(null), setBulkConfirm({ open: false, action: "" }));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const now = new Date("2026-02-24T00:00:00");
    return rows.filter((r) => {
      const dt = new Date(r.submittedAt);
      let dateOk = true;
      if (filters.dateRange === "Today") dateOk = r.submittedAt.startsWith("2026-02-24");
      if (filters.dateRange === "Last 7 Days") dateOk = (now - dt) / 86400000 <= 7;
      if (filters.dateRange === "Last 30 Days") dateOk = (now - dt) / 86400000 <= 30;
      if (filters.dateRange === "Academic Term") dateOk = dt >= new Date("2026-01-01T00:00:00");
      return (
        dateOk &&
        (filters.category === "All" || r.category === filters.category) &&
        (filters.department === "All" || r.department === filters.department) &&
        (filters.submissionType === "All" || r.submissionType === filters.submissionType) &&
        (filters.status === "All" || r.status === filters.status)
      );
    }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [rows, filters]);

  const stats = useMemo(() => {
    const today = "2026-02-24";
    const approvedToday = rows.filter((r) => r.status === "Approved" && r.submittedAt.startsWith(today)).length;
    const rejectedToday = rows.filter((r) => r.status === "Rejected" && r.submittedAt.startsWith(today)).length;
    const pending = rows.filter((r) => r.status === "Pending").length;
    return { pending, approvedToday, rejectedToday, avgHours: 6.4 };
  }, [rows]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const visibleIds = visible.map((r) => r.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggleOne = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleVisible = () => setSelected((p) => (allVisibleSelected ? p.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...p, ...visibleIds]))));
  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const openReview = (row) => {
    setReviewItem(row);
    setReviewRemarks(row.remarks || "");
    setNotif((n) => Math.max(0, n - 1));
  };

  const updateStatus = (id, status, remarks) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, remarks: remarks ?? r.remarks } : r))
    );
    setTimeline((prev) => [`${id} ${status.toLowerCase()} by Admin AK`, ...prev].slice(0, 6));
    setToast({ type: status === "Rejected" ? "danger" : "ok", title: `${status} successfully`, text: `${id} updated.` });
  };

  const runBulk = (action) => setBulkConfirm({ open: true, action });
  const confirmBulkAction = () => {
    const { action } = bulkConfirm;
    if (!action || !selected.length) return;
    setBulkLoading(true);
    setTimeout(() => {
      if (action === "Bulk Approve") {
        setRows((prev) => prev.map((r) => (selected.includes(r.id) ? { ...r, status: "Approved" } : r)));
      }
      if (action === "Bulk Reject") {
        setRows((prev) => prev.map((r) => (selected.includes(r.id) ? { ...r, status: "Rejected" } : r)));
      }
      setBulkLoading(false);
      setBulkConfirm({ open: false, action: "" });
      setToast({ type: action.includes("Reject") ? "danger" : "ok", title: action, text: `${selected.length} items processed.` });
      setTimeline((prev) => [`${action} executed for ${selected.length} approvals`, ...prev].slice(0, 6));
    }, 1200);
  };

  return (
    <div className="aap-page">
      <section className="aap-head aap-reveal" style={{ "--aap-delay": "20ms" }}>
        <div>
          <div className="aap-head-line">
            <h1>Approvals</h1>
            <span className="aap-notify">Queue Alerts <b>{notif}</b></span>
          </div>
          <p>Review and manage pending achievement submissions.</p>
        </div>
        <button type="button" className="aap-btn aap-btn-primary" onClick={() => setFiltersOpen(true)}>
          Filter Panel
        </button>
      </section>

      {loading ? (
        <section className="aap-skeleton">
          <div className="aap-skel-stats">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aap-skel-card" />)}</div>
          <div className="aap-skel-main">
            <div className="aap-skel-table">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aap-skel-row" />)}</div>
            <div className="aap-skel-side">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="aap-skel-row small" />)}</div>
          </div>
        </section>
      ) : (
        <>
          <section className="aap-stats aap-reveal" style={{ "--aap-delay": "70ms" }}>
            <article className="aap-stat pending"><p>Total Pending</p><h3><CountUp value={stats.pending} /></h3><span>Needs moderation</span></article>
            <article className="aap-stat approved"><p>Approved Today</p><h3><CountUp value={stats.approvedToday} /></h3><span>Completed actions</span></article>
            <article className="aap-stat rejected"><p>Rejected Today</p><h3><CountUp value={stats.rejectedToday} /></h3><span>With remarks</span></article>
            <article className="aap-stat"><p>Average Approval Time</p><h3><CountUp value={Math.round(stats.avgHours * 10)} suffix="m" /></h3><span>{stats.avgHours}h average SLA</span></article>
          </section>

          <section className="aap-layout aap-reveal" style={{ "--aap-delay": "120ms" }}>
            <div className="aap-main-card">
              <div className="aap-main-head">
                <div>
                  <h2>Approval Queue</h2>
                  <p>{filtered.length} submissions in current filter set</p>
                </div>
                <div className="aap-efficiency">
                  <span>Approval Progress</span>
                  <div className="aap-progress">
                    <div className="aap-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <strong>{progress}%</strong>
                </div>
              </div>

              {selected.length > 0 ? (
                <div className="aap-bulkbar">
                  <span>{selected.length} selected</span>
                  <div>
                    <button type="button" className="aap-btn aap-btn-soft" onClick={() => runBulk("Bulk Approve")}>Bulk Approve</button>
                    <button type="button" className="aap-btn aap-btn-danger-soft" onClick={() => runBulk("Bulk Reject")}>Bulk Reject</button>
                    <button type="button" className="aap-btn aap-btn-soft" onClick={() => runBulk("Export Selected")}>Export Selected</button>
                    <button type="button" className="aap-btn aap-btn-ghost" onClick={() => setSelected([])}>Clear</button>
                  </div>
                </div>
              ) : null}

              <div className="aap-table-wrap">
                <table className="aap-table">
                  <thead>
                    <tr>
                      <th className="chk"><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} /></th>
                      <th>Student Name</th>
                      <th>Achievement Title</th>
                      <th>Category</th>
                      <th>Submission Date</th>
                      <th>Attached Certificate</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.length ? visible.map((row) => (
                      <tr key={row.id}>
                        <td className="chk"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleOne(row.id)} /></td>
                        <td>
                          <div className="aap-cell-grid">
                            <strong>{row.student}</strong>
                            <span>{row.studentId} • {row.department}</span>
                          </div>
                        </td>
                        <td>
                          <div className="aap-cell-grid">
                            <strong>{row.title}</strong>
                            <span>{row.id} • {row.submissionType}</span>
                          </div>
                        </td>
                        <td><span className={`aap-pill ${row.category.toLowerCase()}`}>{row.category}</span></td>
                        <td>{fmtDateTime(row.submittedAt)}</td>
                        <td><span className={`aap-cert ${row.hasCertificate ? "yes" : "no"}`}>{row.hasCertificate ? "Yes" : "No"}</span></td>
                        <td><span className={`aap-status ${row.status.toLowerCase()}`}>{row.status}</span></td>
                        <td>
                          <div className="aap-actions">
                            <button type="button" className="aap-mini" onClick={() => openReview(row)}>Review</button>
                            <button type="button" className="aap-mini ok" onClick={() => updateStatus(row.id, "Approved")}>Approve</button>
                            <button type="button" className="aap-mini danger" onClick={() => updateStatus(row.id, "Rejected")}>Reject</button>
                            <button type="button" className="aap-link" onClick={() => setToast({ type: "ok", title: "Student Profile", text: `Opened ${row.student}'s profile.` })}>Student Profile</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={8}><div className="aap-empty">No submissions match the current filters.</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <footer className="aap-pager">
                <div>Showing {filtered.length ? (current - 1) * pageSize + 1 : 0}-{Math.min(current * pageSize, filtered.length)} of {filtered.length}</div>
                <div className="aap-pager-right">
                  <button type="button" className="aap-btn aap-btn-ghost" disabled={current === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                  <span>Page {current} / {totalPages}</span>
                  <button type="button" className="aap-btn aap-btn-ghost" disabled={current === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
                </div>
              </footer>
            </div>

            <aside className="aap-side">
              <section className="aap-side-card">
                <header>
                  <h3>Approval Timeline History</h3>
                  <p>Latest workflow events</p>
                </header>
                <ul className="aap-timeline">
                  {timeline.map((item, i) => (
                    <li key={`${item}-${i}`}>
                      <span className="dot" />
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="aap-side-card">
                <header>
                  <h3>Admin Efficiency Metrics</h3>
                  <p>Current shift performance</p>
                </header>
                <ul className="aap-metrics">
                  <li><span>Avg review completion</span><strong>06m 24s</strong></li>
                  <li><span>Queue auto-refresh</span><strong>Every 22s</strong></li>
                  <li><span>Approvals handled today</span><strong>19</strong></li>
                  <li><span>Requests changes issued</span><strong>6</strong></li>
                </ul>
              </section>
            </aside>
          </section>
        </>
      )}

      <aside className={`aap-filter-drawer ${filtersOpen ? "open" : ""}`} aria-hidden={!filtersOpen}>
        <div className="aap-overlay" onClick={() => setFiltersOpen(false)} />
        <div className="aap-filter-panel" role="dialog" aria-label="Approval filters">
          <div className="aap-drawer-head">
            <div><p>Filters</p><h3>Refine approval queue</h3></div>
            <button type="button" className="aap-mini" onClick={() => setFiltersOpen(false)}>Close</button>
          </div>
          <div className="aap-filter-fields">
            <label><span>Date Range</span><select value={filters.dateRange} onChange={(e) => setF("dateRange", e.target.value)}>{DATE_RANGES.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label><span>Category</span><select value={filters.category} onChange={(e) => setF("category", e.target.value)}><option value="All">All</option>{CATS.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label><span>Department</span><select value={filters.department} onChange={(e) => setF("department", e.target.value)}><option value="All">All</option>{DEPTS.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label><span>Submission Type</span><select value={filters.submissionType} onChange={(e) => setF("submissionType", e.target.value)}><option value="All">All</option>{TYPES.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label><span>Status</span><select value={filters.status} onChange={(e) => setF("status", e.target.value)}><option value="All">All</option>{STATUSES.map((v) => <option key={v}>{v}</option>)}</select></label>
          </div>
          <div className="aap-drawer-actions">
            <button type="button" className="aap-btn aap-btn-ghost" onClick={() => setFilters({ dateRange: "Last 7 Days", category: "All", department: "All", submissionType: "All", status: "Pending" })}>Reset</button>
            <button type="button" className="aap-btn aap-btn-primary" onClick={() => setFiltersOpen(false)}>Apply Filters</button>
          </div>
        </div>
      </aside>

      <aside className={`aap-review ${reviewItem ? "open" : ""}`} aria-hidden={!reviewItem}>
        <div className="aap-overlay" onClick={() => setReviewItem(null)} />
        {reviewItem ? (
          <div className="aap-review-panel" role="dialog" aria-label="Review submission">
            <div className="aap-drawer-head">
              <div><p>Review Submission</p><h3>{reviewItem.id}</h3></div>
              <button type="button" className="aap-mini" onClick={() => setReviewItem(null)}>Close</button>
            </div>
            <div className="aap-review-body">
              <section className="aap-review-left">
                <div className="aap-detail-card">
                  <h4>{reviewItem.title}</h4>
                  <p>{reviewItem.description}</p>
                  <div className="aap-badges">
                    <span className={`aap-pill ${reviewItem.category.toLowerCase()}`}>{reviewItem.category}</span>
                    <span className="aap-pill level">{reviewItem.level}</span>
                    <span className="aap-pill type">{reviewItem.submissionType}</span>
                  </div>
                </div>
                <div className="aap-detail-grid">
                  <div><span>Event</span><strong>{reviewItem.eventName}</strong></div>
                  <div><span>Event Date</span><strong>{fmtDate(reviewItem.eventDate)}</strong></div>
                  <div><span>Submission Date</span><strong>{fmtDateTime(reviewItem.submittedAt)}</strong></div>
                  <div><span>Status</span><strong className={`st-${reviewItem.status.toLowerCase()}`}>{reviewItem.status}</strong></div>
                </div>
                <section className="aap-review-history">
                  <h4>Approval Timeline</h4>
                  <ul>
                    <li>Submission received and queued</li>
                    <li>Auto validation completed</li>
                    <li>Awaiting admin review</li>
                  </ul>
                </section>
              </section>

              <section className="aap-review-right">
                <div className="aap-cert-preview">
                  <div className="aap-cert-head">
                    <strong>Certificate Preview</strong>
                    <span>{reviewItem.hasCertificate ? reviewItem.certificateFile : "No attachment"}</span>
                  </div>
                  {reviewItem.hasCertificate ? (
                    <div className="aap-cert-canvas">
                      <div className="doc">
                        <b>{reviewItem.certificateFile.split(".").pop()?.toUpperCase()}</b>
                        <p>{reviewItem.title}</p>
                        <small>{reviewItem.student}</small>
                      </div>
                    </div>
                  ) : (
                    <div className="aap-no-cert">No certificate uploaded for this submission.</div>
                  )}
                </div>
                <div className="aap-student-card">
                  <h4>Student Details</h4>
                  <div><span>Name</span><strong>{reviewItem.student}</strong></div>
                  <div><span>Student ID</span><strong>{reviewItem.studentId}</strong></div>
                  <div><span>Department</span><strong>{reviewItem.department}</strong></div>
                  <div><span>Submission Timestamp</span><strong>{fmtDateTime(reviewItem.submittedAt)}</strong></div>
                </div>
                <label className="aap-remarks">
                  <span>Admin Remarks</span>
                  <textarea rows={4} value={reviewRemarks} onChange={(e) => setReviewRemarks(e.target.value)} placeholder="Add approval/rejection notes..." />
                </label>
              </section>
            </div>
            <div className="aap-review-actions">
              <button type="button" className="aap-btn aap-btn-indigo-outline" onClick={() => { updateStatus(reviewItem.id, "Pending", reviewRemarks || "Requested changes"); setToast({ type: "ok", title: "Request sent", text: `${reviewItem.id} marked for changes.` }); setReviewItem(null); }}>
                Request Changes
              </button>
              <div className="aap-right-actions">
                <button type="button" className="aap-btn aap-btn-danger" onClick={() => { updateStatus(reviewItem.id, "Rejected", reviewRemarks); setReviewItem(null); }}>
                  Reject
                </button>
                <button type="button" className="aap-btn aap-btn-emerald" onClick={() => { updateStatus(reviewItem.id, "Approved", reviewRemarks); setReviewItem(null); }}>
                  Approve
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </aside>

      {bulkConfirm.open ? (
        <div className="aap-modal-layer" role="dialog" aria-modal="true" aria-label="Confirm bulk action">
          <div className="aap-overlay" onClick={() => !bulkLoading && setBulkConfirm({ open: false, action: "" })} />
          <div className="aap-confirm">
            <div className="aap-confirm-icon">{bulkConfirm.action.includes("Reject") ? "!" : "✓"}</div>
            <h3>{bulkConfirm.action}</h3>
            <p>{bulkConfirm.action} for {selected.length} selected submissions?</p>
            <div className="aap-confirm-actions">
              <button type="button" className="aap-btn aap-btn-ghost" disabled={bulkLoading} onClick={() => setBulkConfirm({ open: false, action: "" })}>Cancel</button>
              <button type="button" className="aap-btn aap-btn-primary" disabled={bulkLoading} onClick={confirmBulkAction}>
                {bulkLoading ? <span className="aap-spin" /> : null}
                {bulkLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`aap-toast ${toast.type === "danger" ? "danger" : ""}`} role="status" aria-live="polite">
          <strong>{toast.title}</strong>
          <span>{toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
