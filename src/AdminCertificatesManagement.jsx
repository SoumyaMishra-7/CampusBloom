import { useEffect, useMemo, useState } from "react";
import "./admin-certificates-management.css";

const CERTS = [
  { id: "CERT-2201", student: "Aarav Sharma", studentId: "S001", achievement: "National Robotics Challenge Winner", category: "Technical", uploadedDate: "2026-02-23", status: "Pending", fileType: "PDF", fileName: "robotics-aarav.pdf", fraudRisk: "Low", notes: "Awaiting faculty verification", history: ["Uploaded by student", "Auto-check passed"] },
  { id: "CERT-2200", student: "Diya Nair", studentId: "S002", achievement: "Inter-University Debate Finalist", category: "Cultural", uploadedDate: "2026-02-22", status: "Verified", fileType: "Image", fileName: "debate-diya.jpg", fraudRisk: "Low", notes: "Signature visible", history: ["Uploaded by student", "Verified by Admin AK"] },
  { id: "CERT-2199", student: "Rohan Mehta", studentId: "S003", achievement: "State Athletics Silver Medal", category: "Sports", uploadedDate: "2026-02-22", status: "Pending", fileType: "Image", fileName: "athletics-rohan.png", fraudRisk: "Medium", notes: "Stamp unclear in lower corner", history: ["Uploaded by student", "AI quality check flagged stamp clarity"] },
  { id: "CERT-2198", student: "Sara Khan", studentId: "S004", achievement: "Community Leadership Fellowship", category: "Leadership", uploadedDate: "2026-02-21", status: "Rejected", fileType: "PDF", fileName: "leadership-sara.pdf", fraudRisk: "High", notes: "Mismatch in event year metadata", history: ["Uploaded by student", "Metadata mismatch detected", "Rejected by Admin AK"] },
  { id: "CERT-2197", student: "Ishita Verma", studentId: "S005", achievement: "Classical Music Ensemble Performance", category: "Cultural", uploadedDate: "2026-02-20", status: "Verified", fileType: "PDF", fileName: "music-ishita.pdf", fraudRisk: "Low", notes: "Verified with event committee list", history: ["Uploaded by student", "Verified by Admin AK"] },
  { id: "CERT-2196", student: "Nitin Rao", studentId: "S006", achievement: "Hackathon Problem Solving Excellence", category: "Technical", uploadedDate: "2026-02-19", status: "Pending", fileType: "PDF", fileName: "hackathon-nitin.pdf", fraudRisk: "Medium", notes: "Review QR authenticity", history: ["Uploaded by student", "AI check flagged QR mismatch confidence 62%"] },
  { id: "CERT-2195", student: "Meera Iyer", studentId: "S007", achievement: "National Robotics Challenge Winner", category: "Technical", uploadedDate: "2026-02-18", status: "Verified", fileType: "Image", fileName: "robotics-meera.jpeg", fraudRisk: "Low", notes: "Cross-verified with team roster", history: ["Uploaded by student", "Verified by Admin AK"] },
  { id: "CERT-2194", student: "Kunal Patel", studentId: "S008", achievement: "Hackathon Problem Solving Excellence", category: "Technical", uploadedDate: "2026-02-17", status: "Rejected", fileType: "Image", fileName: "hackathon-kunal.png", fraudRisk: "High", notes: "Tampering suspected around seal area", history: ["Uploaded by student", "AI tamper hint generated", "Rejected by Admin AK"] }
];

const CATS = ["Technical", "Sports", "Cultural", "Leadership"];
const STATUSES = ["Verified", "Pending", "Rejected"];
const FILE_TYPES = ["PDF", "Image"];
const SORTS = ["Newest", "Oldest", "Student A-Z", "High Risk First"];
const DATE_RANGES = ["All Time", "Today", "Last 7 Days", "Last 30 Days"];

const fmtDate = (v) => new Date(`${v}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });

function CountUp({ value }) {
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
  return <>{n.toLocaleString()}</>;
}

export default function AdminCertificatesManagementView() {
  const [rows, setRows] = useState(CERTS);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ status: "All", category: "All", dateRange: "All Time", fileType: "All", sort: "Newest" });
  const [viewMode, setViewMode] = useState("table");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [remarks, setRemarks] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [exporting, setExporting] = useState("");
  const [toast, setToast] = useState(null);
  const [newUploads, setNewUploads] = useState(3);
  const [timeline, setTimeline] = useState([
    "CERT-2201 uploaded by Aarav Sharma",
    "CERT-2199 AI stamp clarity flag generated",
    "CERT-2200 verified by Admin AK"
  ]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setPage(1);
  }, [q, filters, viewMode]);

  useEffect(() => {
    const t = setInterval(() => {
      setNewUploads((v) => Math.min(9, v + 1));
      setTimeline((prev) => [`New certificate upload detected • ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, ...prev].slice(0, 5));
    }, 20000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const now = new Date("2026-02-24T00:00:00");
    const list = rows.filter((r) => {
      const matchesSearch = !s || r.student.toLowerCase().includes(s) || r.achievement.toLowerCase().includes(s);
      const matchesStatus = filters.status === "All" || r.status === filters.status;
      const matchesCategory = filters.category === "All" || r.category === filters.category;
      const matchesType = filters.fileType === "All" || r.fileType === filters.fileType;
      let matchesDate = true;
      const uploaded = new Date(`${r.uploadedDate}T00:00:00`);
      if (filters.dateRange === "Today") matchesDate = r.uploadedDate === "2026-02-24";
      if (filters.dateRange === "Last 7 Days") matchesDate = (now - uploaded) / 86400000 <= 7;
      if (filters.dateRange === "Last 30 Days") matchesDate = (now - uploaded) / 86400000 <= 30;
      return matchesSearch && matchesStatus && matchesCategory && matchesType && matchesDate;
    });

    list.sort((a, b) => {
      if (filters.sort === "Oldest") return a.uploadedDate.localeCompare(b.uploadedDate);
      if (filters.sort === "Student A-Z") return a.student.localeCompare(b.student);
      if (filters.sort === "High Risk First") {
        const rank = { High: 0, Medium: 1, Low: 2 };
        return (rank[a.fraudRisk] ?? 9) - (rank[b.fraudRisk] ?? 9) || b.uploadedDate.localeCompare(a.uploadedDate);
      }
      return b.uploadedDate.localeCompare(a.uploadedDate);
    });
    return list;
  }, [rows, q, filters]);

  const stats = useMemo(() => ({
    total: rows.length,
    verified: rows.filter((r) => r.status === "Verified").length,
    pending: rows.filter((r) => r.status === "Pending").length,
    rejected: rows.filter((r) => r.status === "Rejected").length
  }), [rows]);

  const pageSize = viewMode === "grid" ? 8 : 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleIds = visible.map((r) => r.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const setF = (key, value) => setFilters((p) => ({ ...p, [key]: value }));
  const toggleOne = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleVisible = () => setSelected((p) => (allVisibleSelected ? p.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...p, ...visibleIds]))));

  const changeStatus = (id, status, note) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status, notes: note ?? r.notes, history: [...r.history, `${status} by Admin AK`] } : r)));
    setTimeline((prev) => [`${id} marked ${status}`, ...prev].slice(0, 5));
    setToast({ type: status === "Rejected" ? "danger" : "ok", title: `Certificate ${status}`, text: `${id} updated successfully.` });
  };

  const exportData = (kind) => {
    if (exporting) return;
    setExporting(kind);
    setTimeout(() => {
      setExporting("");
      setToast({ type: "ok", title: `${kind} export queued`, text: "Certificate export generation started." });
    }, 1200);
  };

  const runBulkAction = () => {
    if (!bulkAction || !selected.length) return;
    setConfirmBulk(true);
  };

  const confirmBulkAction = () => {
    setBulkLoading(true);
    setTimeout(() => {
      if (bulkAction === "Bulk Verify") {
        setRows((prev) => prev.map((r) => (selected.includes(r.id) ? { ...r, status: "Verified", history: [...r.history, "Verified by Admin AK (bulk)"] } : r)));
      }
      if (bulkAction === "Bulk Reject") {
        setRows((prev) => prev.map((r) => (selected.includes(r.id) ? { ...r, status: "Rejected", history: [...r.history, "Rejected by Admin AK (bulk)"] } : r)));
      }
      setBulkLoading(false);
      setConfirmBulk(false);
      setToast({ type: bulkAction === "Bulk Reject" ? "danger" : "ok", title: bulkAction, text: `${selected.length} certificates processed.` });
      if (bulkAction === "Bulk Download") setToast({ type: "ok", title: "Bulk Download", text: `${selected.length} files prepared for download.` });
      setTimeline((prev) => [`${bulkAction} executed for ${selected.length} certificates`, ...prev].slice(0, 5));
    }, 1300);
  };

  return (
    <div className="acm-page">
      <section className="acm-head acm-reveal" style={{ "--acm-delay": "20ms" }}>
        <div>
          <div className="acm-title-line">
            <h1>Certificates Management</h1>
            <span className="acm-notify-badge">New Uploads {newUploads > 0 ? <b>{newUploads}</b> : null}</span>
          </div>
          <p>Review, verify, and manage uploaded achievement certificates.</p>
        </div>
        <div className="acm-head-actions">
          <button type="button" className="acm-btn acm-btn-soft" onClick={() => exportData("Excel")}>
            {exporting === "Excel" ? <span className="acm-spin" /> : null} Export Excel
          </button>
          <button type="button" className="acm-btn acm-btn-soft" onClick={() => exportData("PDF")}>
            {exporting === "PDF" ? <span className="acm-spin" /> : null} Export PDF
          </button>
          <select className="acm-bulk-select" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
            <option value="">Bulk Actions</option>
            <option>Bulk Verify</option>
            <option>Bulk Reject</option>
            <option>Bulk Download</option>
          </select>
          <button type="button" className="acm-btn acm-btn-primary" disabled={!bulkAction || !selected.length} onClick={runBulkAction}>
            Run
          </button>
        </div>
      </section>

      {loading ? (
        <section className="acm-skeleton">
          <div className="acm-skel-stats">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="acm-skel-card" />)}</div>
          <div className="acm-skel-filter" />
          <div className="acm-skel-table">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="acm-skel-row" />)}</div>
        </section>
      ) : (
        <>
          <section className="acm-stats acm-reveal" style={{ "--acm-delay": "70ms" }}>
            <article className="acm-stat"><p>Total Certificates</p><h3><CountUp value={stats.total} /></h3><span>Uploaded documents</span></article>
            <article className="acm-stat verified"><p>Verified Certificates</p><h3><CountUp value={stats.verified} /></h3><span>Moderation complete</span></article>
            <article className="acm-stat pending"><p>Pending Verification</p><h3><CountUp value={stats.pending} /></h3><span>Requires review</span></article>
            <article className="acm-stat rejected"><p>Rejected Certificates</p><h3><CountUp value={stats.rejected} /></h3><span>Actioned with remarks</span></article>
          </section>

          <section className="acm-filters acm-reveal" style={{ "--acm-delay": "110ms" }}>
            <div className="acm-filter-grid">
              <label className="acm-control acm-search"><span>Search</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by student name or achievement" /></label>
              <label className="acm-control"><span>Status</span><select value={filters.status} onChange={(e) => setF("status", e.target.value)}><option value="All">All</option>{STATUSES.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="acm-control"><span>Category</span><select value={filters.category} onChange={(e) => setF("category", e.target.value)}><option value="All">All</option>{CATS.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="acm-control"><span>Date Range</span><select value={filters.dateRange} onChange={(e) => setF("dateRange", e.target.value)}>{DATE_RANGES.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="acm-control"><span>File Type</span><select value={filters.fileType} onChange={(e) => setF("fileType", e.target.value)}><option value="All">All</option>{FILE_TYPES.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="acm-control"><span>Sort</span><select value={filters.sort} onChange={(e) => setF("sort", e.target.value)}>{SORTS.map((v) => <option key={v}>{v}</option>)}</select></label>
            </div>
            <div className="acm-filter-foot">
              <div className="acm-view-toggle" role="tablist" aria-label="Certificates view mode">
                <button type="button" className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>Table View</button>
                <button type="button" className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid View</button>
              </div>
              <button type="button" className="acm-btn acm-btn-ghost" onClick={() => { setQ(""); setFilters({ status: "All", category: "All", dateRange: "All Time", fileType: "All", sort: "Newest" }); }}>
                Reset Filters
              </button>
            </div>
          </section>

          <section className="acm-layout acm-reveal" style={{ "--acm-delay": "150ms" }}>
            <div className="acm-main-card">
              {selected.length > 0 ? (
                <div className="acm-bulk-bar">
                  <span>{selected.length} selected</span>
                  <div>
                    <button type="button" className="acm-btn acm-btn-soft" onClick={() => { setBulkAction("Bulk Verify"); setConfirmBulk(true); }}>Bulk Verify</button>
                    <button type="button" className="acm-btn acm-btn-danger-soft" onClick={() => { setBulkAction("Bulk Reject"); setConfirmBulk(true); }}>Bulk Reject</button>
                    <button type="button" className="acm-btn acm-btn-soft" onClick={() => { setBulkAction("Bulk Download"); setConfirmBulk(true); }}>Bulk Download</button>
                    <button type="button" className="acm-btn acm-btn-ghost" onClick={() => setSelected([])}>Clear</button>
                  </div>
                </div>
              ) : null}

              {viewMode === "table" ? (
                <div className="acm-table-wrap">
                  <table className="acm-table">
                    <thead>
                      <tr>
                        <th className="chk"><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} /></th>
                        <th>Student Name</th>
                        <th>Achievement Title</th>
                        <th>Category</th>
                        <th>Uploaded Date</th>
                        <th>Status</th>
                        <th>File Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length ? visible.map((row) => (
                        <tr key={row.id}>
                          <td className="chk"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleOne(row.id)} /></td>
                          <td>
                            <div className="acm-name-cell">
                              <strong>{row.student}</strong>
                              <span>{row.studentId}</span>
                            </div>
                          </td>
                          <td>
                            <div className="acm-title-cell">
                              <strong>{row.achievement}</strong>
                              <span>{row.id}</span>
                            </div>
                          </td>
                          <td><span className={`acm-pill ${row.category.toLowerCase()}`}>{row.category}</span></td>
                          <td>{fmtDate(row.uploadedDate)}</td>
                          <td><span className={`acm-status ${row.status.toLowerCase()}`}>{row.status}</span></td>
                          <td>{row.fileType}</td>
                          <td>
                            <div className="acm-row-actions">
                              <button type="button" className="acm-mini" onClick={() => { setPreview(row); setRemarks(row.notes || ""); setZoom(100); }}>Preview</button>
                              <button type="button" className="acm-mini ok" onClick={() => changeStatus(row.id, "Verified")}>Verify</button>
                              <button type="button" className="acm-mini danger" onClick={() => changeStatus(row.id, "Rejected")}>Reject</button>
                              <button type="button" className="acm-mini" onClick={() => setToast({ type: "ok", title: "Download", text: `${row.fileName} download started.` })}>Download</button>
                              <button type="button" className="acm-link" onClick={() => setToast({ type: "ok", title: "Student Profile", text: `Opened ${row.student}'s profile.` })}>Student Profile</button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={8}><div className="acm-empty">No certificates match the selected filters.</div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="acm-grid">
                  {visible.map((row) => (
                    <article key={row.id} className="acm-card">
                      <label className="acm-card-check">
                        <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleOne(row.id)} />
                      </label>
                      <div className="acm-thumb" onClick={() => { setPreview(row); setRemarks(row.notes || ""); setZoom(100); }} role="button" tabIndex={0}>
                        <div className="acm-doc-mark">{row.fileType === "PDF" ? "PDF" : "IMG"}</div>
                        <div className="acm-thumb-title">{row.fileName}</div>
                      </div>
                      <div className="acm-card-body">
                        <div className="acm-card-head">
                          <div>
                            <strong>{row.student}</strong>
                            <span>{row.achievement}</span>
                          </div>
                          <span className={`acm-status ${row.status.toLowerCase()}`}>{row.status}</span>
                        </div>
                        <div className="acm-card-meta">
                          <span>{row.category}</span>
                          <span>{fmtDate(row.uploadedDate)}</span>
                          <span className={`acm-risk ${row.fraudRisk.toLowerCase()}`}>AI {row.fraudRisk} Risk</span>
                        </div>
                        <div className="acm-card-actions">
                          <button type="button" className="acm-btn acm-btn-soft" onClick={() => changeStatus(row.id, "Verified")}>Verify</button>
                          <button type="button" className="acm-btn acm-btn-danger-soft" onClick={() => changeStatus(row.id, "Rejected")}>Reject</button>
                          <button type="button" className="acm-btn acm-btn-ghost" onClick={() => setToast({ type: "ok", title: "Download", text: `${row.fileName} download started.` })}>Download</button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {!visible.length ? <div className="acm-empty acm-grid-empty">No certificates match the selected filters.</div> : null}
                </div>
              )}

              <footer className="acm-pager">
                <div>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</div>
                <div className="acm-pager-right">
                  <button type="button" className="acm-btn acm-btn-ghost" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                  <span>Page {currentPage} / {totalPages}</span>
                  <button type="button" className="acm-btn acm-btn-ghost" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
                </div>
              </footer>
            </div>

            <aside className="acm-side">
              <section className="acm-side-card">
                <header>
                  <h3>Verification History Log</h3>
                  <p>Recent moderation actions</p>
                </header>
                <ul className="acm-log">
                  {timeline.map((item, i) => (
                    <li key={`${item}-${i}`}>
                      <span className="dot" />
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="acm-side-card">
                <header>
                  <h3>Fraud Detection Queue</h3>
                  <p>AI-assisted moderation indicators</p>
                </header>
                <div className="acm-risk-list">
                  {rows.filter((r) => r.fraudRisk !== "Low").slice(0, 4).map((r) => (
                    <button key={r.id} type="button" className="acm-risk-row" onClick={() => { setPreview(r); setRemarks(r.notes || ""); setZoom(100); }}>
                      <div>
                        <strong>{r.id}</strong>
                        <span>{r.student} • {r.achievement}</span>
                      </div>
                      <b className={r.fraudRisk.toLowerCase()}>{r.fraudRisk}</b>
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </>
      )}

      {preview ? (
        <div className="acm-preview-layer" role="dialog" aria-modal="true" aria-label="Certificate preview">
          <div className="acm-preview-backdrop" onClick={() => setPreview(null)} />
          <div className="acm-preview">
            <div className="acm-preview-viewer">
              <div className="acm-preview-toolbar">
                <strong>{preview.fileName}</strong>
                <div>
                  <button type="button" className="acm-mini" onClick={() => setZoom((z) => Math.max(50, z - 10))}>-</button>
                  <span className="acm-zoom">{zoom}%</span>
                  <button type="button" className="acm-mini" onClick={() => setZoom((z) => Math.min(200, z + 10))}>+</button>
                </div>
              </div>
              <div className="acm-doc-stage">
                <div className="acm-doc-canvas" style={{ transform: `scale(${zoom / 100})` }}>
                  <div className="acm-doc-surface">
                    <h4>{preview.fileType} Certificate Preview</h4>
                    <p>{preview.achievement}</p>
                    <p>Awarded to {preview.student}</p>
                    <p>Uploaded on {fmtDate(preview.uploadedDate)}</p>
                    <div className="acm-doc-seal">CampusBloom Verification Workspace</div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="acm-preview-side">
              <div className="acm-preview-side-head">
                <div>
                  <p>{preview.id}</p>
                  <h3>{preview.student}</h3>
                  <span>{preview.studentId}</span>
                </div>
                <button type="button" className="acm-mini" onClick={() => setPreview(null)}>Close</button>
              </div>
              <div className="acm-detail-list">
                <div><span>Achievement</span><strong>{preview.achievement}</strong></div>
                <div><span>Category</span><strong>{preview.category}</strong></div>
                <div><span>Uploaded Date</span><strong>{fmtDate(preview.uploadedDate)}</strong></div>
                <div><span>File Type</span><strong>{preview.fileType}</strong></div>
                <div><span>Status</span><strong className={`status-${preview.status.toLowerCase()}`}>{preview.status}</strong></div>
                <div><span>AI Fraud Detection</span><strong className={`risk-${preview.fraudRisk.toLowerCase()}`}>{preview.fraudRisk} Risk</strong></div>
              </div>
              <label className="acm-remarks">
                <span>Admin Remarks</span>
                <textarea rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add moderation notes or verification remarks..." />
              </label>
              <section className="acm-history-panel">
                <h4>Activity Timeline</h4>
                <ul>
                  {preview.history.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}
                </ul>
              </section>
              <div className="acm-preview-actions">
                <button type="button" className="acm-btn acm-btn-soft" onClick={() => setToast({ type: "ok", title: "Download", text: `${preview.fileName} download started.` })}>Download</button>
                <button type="button" className="acm-btn acm-btn-emerald" onClick={() => { changeStatus(preview.id, "Verified", remarks); setPreview(null); }}>Verify</button>
                <button type="button" className="acm-btn acm-btn-danger" onClick={() => { changeStatus(preview.id, "Rejected", remarks); setPreview(null); }}>Reject</button>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {confirmBulk ? (
        <div className="acm-modal-layer" role="dialog" aria-modal="true" aria-label="Confirm bulk action">
          <div className="acm-preview-backdrop" onClick={() => !bulkLoading && setConfirmBulk(false)} />
          <div className="acm-confirm">
            <div className="acm-confirm-icon">{bulkAction.includes("Reject") ? "!" : "✓"}</div>
            <h3>{bulkAction}</h3>
            <p>{bulkAction} for {selected.length} selected certificates?</p>
            <div className="acm-confirm-actions">
              <button type="button" className="acm-btn acm-btn-ghost" disabled={bulkLoading} onClick={() => setConfirmBulk(false)}>Cancel</button>
              <button type="button" className="acm-btn acm-btn-primary" disabled={bulkLoading} onClick={confirmBulkAction}>
                {bulkLoading ? <span className="acm-spin" /> : null}
                {bulkLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`acm-toast ${toast.type === "danger" ? "danger" : ""}`} role="status" aria-live="polite">
          <strong>{toast.title}</strong>
          <span>{toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
