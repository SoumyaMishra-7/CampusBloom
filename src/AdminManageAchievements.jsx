import { useEffect, useMemo, useRef, useState } from "react";
import "./admin-manage-achievements.css";

const CATEGORIES = ["Technical", "Sports", "Cultural", "Leadership"];
const LEVELS = ["College", "State", "National"];
const STATUSES = ["Approved", "Pending", "Rejected"];
const STUDENTS = [
  ["S001", "Aarav Sharma"], ["S002", "Diya Nair"], ["S003", "Rohan Mehta"], ["S004", "Sara Khan"],
  ["S005", "Ishita Verma"], ["S006", "Nitin Rao"], ["S007", "Meera Iyer"], ["S008", "Kunal Patel"]
];

const SEED = [
  { id: "ACH-1062", title: "National Robotics Challenge Winner", category: "Technical", level: "National", assigned: ["S001", "S007", "S008"], dateCreated: "2026-02-18", dateOfEvent: "2026-02-16", status: "Approved", eventName: "National Robotics Challenge 2026", description: "Autonomous navigation track winner.", template: "robotics-template.pdf" },
  { id: "ACH-1061", title: "State Athletics Silver Medal", category: "Sports", level: "State", assigned: ["S003"], dateCreated: "2026-02-17", dateOfEvent: "2026-02-12", status: "Pending", eventName: "State Collegiate Sports Meet", description: "Relay silver medal.", template: "" },
  { id: "ACH-1060", title: "Inter-University Debate Finalist", category: "Cultural", level: "State", assigned: ["S002", "S005"], dateCreated: "2026-02-15", dateOfEvent: "2026-02-10", status: "Approved", eventName: "Debate Forum", description: "Policy debate finalist.", template: "debate-template.pdf" },
  { id: "ACH-1059", title: "Community Leadership Fellowship", category: "Leadership", level: "National", assigned: ["S004"], dateCreated: "2026-02-13", dateOfEvent: "2026-02-07", status: "Rejected", eventName: "Youth Leadership Fellowship", description: "Leadership fellowship nomination.", template: "" },
  { id: "ACH-1058", title: "Hackathon Problem Solving Excellence", category: "Technical", level: "College", assigned: ["S001", "S006", "S007"], dateCreated: "2026-02-11", dateOfEvent: "2026-02-05", status: "Pending", eventName: "CampusBloom HackSprint", description: "Top problem-solving score.", template: "" },
  { id: "ACH-1057", title: "Classical Music Ensemble Performance", category: "Cultural", level: "College", assigned: ["S005"], dateCreated: "2026-02-03", dateOfEvent: "2026-02-01", status: "Approved", eventName: "BloomFest 2026", description: "Cultural fest ensemble recognition.", template: "" },
  { id: "ACH-1056", title: "College Chess Championship", category: "Sports", level: "College", assigned: ["S002", "S004"], dateCreated: "2026-01-31", dateOfEvent: "2026-01-30", status: "Approved", eventName: "Campus Chess Championship", description: "Annual chess competition award.", template: "" },
  { id: "ACH-1055", title: "Student Council Governance Excellence", category: "Leadership", level: "College", assigned: ["S004", "S005"], dateCreated: "2026-01-24", dateOfEvent: "2026-01-22", status: "Pending", eventName: "Student Council Awards", description: "Governance excellence recognition.", template: "leadership-template.docx" }
];

const EMPTY_FORM = { title: "", description: "", category: "", level: "", eventName: "", dateOfEvent: "", template: "", assigned: [] };

const fmtDate = (v) => new Date(`${v}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });

function CountUp({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const run = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 650, 1);
      const e = 1 - (1 - p) ** 3;
      setN(Math.round(value * e));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n.toLocaleString()}</>;
}

function FloatingField({ label, error, filled, children }) {
  return (
    <label className={`ama-field ${filled ? "filled" : ""} ${error ? "err" : ""}`}>
      {children}
      <span>{label}</span>
      {error ? <small>{error}</small> : null}
    </label>
  );
}

export default function AdminManageAchievementsView() {
  const [rows, setRows] = useState(SEED);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ category: "All", level: "All", status: "All", date: "", sort: "Newest" });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [], label: "" });
  const [exporting, setExporting] = useState("");
  const pickerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onMouse = (e) => !pickerRef.current?.contains(e.target) && setPickerOpen(false);
    const onKey = (e) => e.key === "Escape" && (setDrawerOpen(false), setMobileFiltersOpen(false), setDeleteState((s) => ({ ...s, open: false })), setPickerOpen(false));
    document.addEventListener("mousedown", onMouse);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => setPage(1), [q, filters]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = rows.filter((r) => {
      const names = r.assigned.map((id) => STUDENTS.find((x) => x[0] === id)?.[1] || "").join(" ").toLowerCase();
      return (
        (!s || r.title.toLowerCase().includes(s) || r.category.toLowerCase().includes(s) || names.includes(s)) &&
        (filters.category === "All" || r.category === filters.category) &&
        (filters.level === "All" || r.level === filters.level) &&
        (filters.status === "All" || r.status === filters.status) &&
        (!filters.date || r.dateCreated === filters.date || r.dateOfEvent === filters.date)
      );
    });
    list.sort((a, b) => {
      if (filters.sort === "Most Awarded") return b.assigned.length - a.assigned.length || b.dateCreated.localeCompare(a.dateCreated);
      return filters.sort === "Oldest" ? a.dateCreated.localeCompare(b.dateCreated) : b.dateCreated.localeCompare(a.dateCreated);
    });
    return list;
  }, [rows, q, filters]);

  const stats = useMemo(() => ({
    total: rows.length,
    approved: rows.filter((r) => r.status === "Approved").length,
    pending: rows.filter((r) => r.status === "Pending").length,
    month: rows.filter((r) => r.dateCreated.startsWith("2026-02")).length
  }), [rows]);

  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const visible = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const visibleIds = visible.map((r) => r.id);
  const allVisibleChecked = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const setF = (key, value) => setFilters((p) => ({ ...p, [key]: value }));
  const resetFilters = () => {
    setQ("");
    setFilters({ category: "All", level: "All", status: "All", date: "", sort: "Newest" });
  };

  const openCreate = () => {
    setFormMode("create");
    setEditId("");
    setForm(EMPTY_FORM);
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (r) => {
    setFormMode("edit");
    setEditId(r.id);
    setForm({ title: r.title, description: r.description, category: r.category, level: r.level, eventName: r.eventName, dateOfEvent: r.dateOfEvent, template: r.template || "", assigned: [...r.assigned] });
    setErrors({});
    setDrawerOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.category) e.category = "Required";
    if (!form.level) e.level = "Required";
    if (!form.eventName.trim()) e.eventName = "Required";
    if (!form.dateOfEvent) e.dateOfEvent = "Required";
    if (!form.assigned.length) e.assigned = "Select at least one student";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const save = (e) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 380);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setRows((prev) => {
        if (formMode === "edit") {
          return prev.map((r) => (r.id === editId ? { ...r, ...form } : r));
        }
        const next = Math.max(...prev.map((r) => Number(r.id.split("-")[1]))) + 1;
        return [{ id: `ACH-${next}`, ...form, dateCreated: "2026-02-24", status: "Pending" }, ...prev];
      });
      setSaving(false);
      setDrawerOpen(false);
      setToast({ type: "ok", title: formMode === "edit" ? "Achievement updated" : "Achievement created", text: "Changes saved successfully." });
      setForm(EMPTY_FORM);
    }, 1100);
  };

  const toggleOne = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const togglePage = () => setSelected((p) => (allVisibleChecked ? p.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...p, ...visibleIds]))));
  const askDelete = (ids, label) => setDeleteState({ open: true, ids, label });
  const confirmDelete = () => {
    setRows((p) => p.filter((r) => !deleteState.ids.includes(r.id)));
    setSelected((p) => p.filter((id) => !deleteState.ids.includes(id)));
    setDeleteState({ open: false, ids: [], label: "" });
    setToast({ type: "danger", title: "Deleted", text: `Removed ${deleteState.ids.length} achievement${deleteState.ids.length > 1 ? "s" : ""}.` });
  };
  const bulkApprove = () => {
    if (!selected.length) return;
    setRows((p) => p.map((r) => (selected.includes(r.id) ? { ...r, status: "Approved" } : r)));
    setToast({ type: "ok", title: "Bulk approve complete", text: `${selected.length} records marked Approved.` });
  };
  const exportFile = (kind) => {
    if (exporting) return;
    setExporting(kind);
    setTimeout(() => {
      setExporting("");
      setToast({ type: "ok", title: `${kind} export queued`, text: "Export generation started." });
    }, 1300);
  };
  const selectedStudents = form.assigned.map((id) => STUDENTS.find((x) => x[0] === id)).filter(Boolean);

  return (
    <div className="ama-page">
      <section className="ama-head ama-reveal" style={{ "--ama-delay": "20ms" }}>
        <div>
          <h1>Manage Achievements</h1>
          <p>Create, assign, and manage extracurricular achievements.</p>
        </div>
        <button type="button" className="ama-btn ama-btn-primary ama-add" onClick={openCreate}>
          <span>+</span> Add Achievement
        </button>
      </section>

      {loading ? (
        <section className="ama-skeleton">
          <div className="ama-skel-stats">{[0, 1, 2, 3].map((i) => <div key={i} className="ama-skel-card" />)}</div>
          <div className="ama-skel-filter" />
          <div className="ama-skel-table">{[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="ama-skel-row" />)}</div>
        </section>
      ) : (
        <>
          <section className="ama-stats ama-reveal" style={{ "--ama-delay": "70ms" }}>
            <article className="ama-stat"><p>Total Achievements</p><h3><CountUp value={stats.total} /></h3><span>Registry size</span></article>
            <article className="ama-stat"><p>Approved</p><h3><CountUp value={stats.approved} /></h3><span className="ok">Verified records</span></article>
            <article className="ama-stat"><p>Pending</p><h3><CountUp value={stats.pending} /></h3><span className="warn">Awaiting review</span></article>
            <article className="ama-stat"><p>This Month Added</p><h3><CountUp value={stats.month} /></h3><span>February 2026</span></article>
          </section>

          <section className="ama-filters ama-reveal" style={{ "--ama-delay": "120ms" }}>
            <div className="ama-filter-grid">
              <label className="ama-control ama-control-search"><span>Search</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, student, or category" /></label>
              <label className="ama-control"><span>Category</span><select value={filters.category} onChange={(e) => setF("category", e.target.value)}><option value="All">All</option>{CATEGORIES.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="ama-control"><span>Level</span><select value={filters.level} onChange={(e) => setF("level", e.target.value)}><option value="All">All</option>{LEVELS.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="ama-control"><span>Status</span><select value={filters.status} onChange={(e) => setF("status", e.target.value)}><option value="All">All</option>{STATUSES.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="ama-control"><span>Date</span><input type="date" value={filters.date} onChange={(e) => setF("date", e.target.value)} /></label>
              <label className="ama-control"><span>Sort</span><select value={filters.sort} onChange={(e) => setF("sort", e.target.value)}><option>Newest</option><option>Oldest</option><option>Most Awarded</option></select></label>
            </div>
            <div className="ama-filter-right">
              <button type="button" className="ama-btn ama-btn-soft ama-mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>Filters</button>
              <button type="button" className="ama-btn ama-btn-ghost" onClick={resetFilters}>Reset</button>
            </div>
          </section>

          <section className="ama-card ama-reveal" style={{ "--ama-delay": "160ms" }}>
            <header className="ama-toolbar">
              <div><h2>Achievements Table</h2><p>{filtered.length} records</p></div>
              <div className="ama-toolbar-actions">
                <button type="button" className="ama-btn ama-btn-soft" onClick={() => exportFile("Excel")}>{exporting === "Excel" ? <span className="ama-spin" /> : null} Export Excel</button>
                <button type="button" className="ama-btn ama-btn-soft" onClick={() => exportFile("PDF")}>{exporting === "PDF" ? <span className="ama-spin" /> : null} Export PDF</button>
              </div>
            </header>

            {selected.length > 0 ? (
              <div className="ama-bulk">
                <span>{selected.length} selected</span>
                <div>
                  <button type="button" className="ama-btn ama-btn-soft" onClick={bulkApprove}>Bulk Approve</button>
                  <button type="button" className="ama-btn ama-btn-danger-soft" onClick={() => askDelete(selected, "")}>Bulk Delete</button>
                  <button type="button" className="ama-btn ama-btn-ghost" onClick={() => setSelected([])}>Clear</button>
                </div>
              </div>
            ) : null}

            <div className="ama-table-wrap">
              <table className="ama-table">
                <thead>
                  <tr>
                    <th className="chk"><input type="checkbox" checked={allVisibleChecked} onChange={togglePage} aria-label="Select all visible" /></th>
                    <th>Achievement Title</th><th>Category</th><th>Level</th><th>Assigned Students</th><th>Date Created</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length ? visible.map((r) => (
                    <tr key={r.id}>
                      <td className="chk"><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} aria-label={r.title} /></td>
                      <td><div className="ama-title"><strong>{r.title}</strong><span>{r.id} • {r.eventName}</span></div></td>
                      <td><span className={`ama-pill ${r.category.toLowerCase()}`}>{r.category}</span></td>
                      <td>{r.level}</td>
                      <td>{r.assigned.length}</td>
                      <td>{fmtDate(r.dateCreated)}</td>
                      <td><span className={`ama-status ${r.status.toLowerCase()}`}>{r.status}</span></td>
                      <td>
                        <div className="ama-row-actions">
                          <button type="button" className="ama-icon" onClick={() => setToast({ type: "ok", title: "View", text: `${r.title} details loaded.` })}>VW</button>
                          <button type="button" className="ama-icon" onClick={() => openEdit(r)}>ED</button>
                          <button type="button" className="ama-icon danger" onClick={() => askDelete([r.id], r.title)}>DL</button>
                          <button type="button" className="ama-link" onClick={() => openEdit(r)}>Assign</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8}><div className="ama-empty">No achievements match the selected filters.</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="ama-pager">
              <div>Showing {filtered.length ? (cur - 1) * pageSize + 1 : 0}-{Math.min(cur * pageSize, filtered.length)} of {filtered.length}</div>
              <div className="ama-pager-right">
                <button type="button" className="ama-btn ama-btn-ghost" disabled={cur === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <span>Page {cur} / {pages}</span>
                <button type="button" className="ama-btn ama-btn-ghost" disabled={cur === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</button>
              </div>
            </footer>
          </section>
        </>
      )}

      <aside className={`ama-drawer ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="ama-overlay" onClick={() => setDrawerOpen(false)} />
        <div className={`ama-drawer-panel ${shake ? "shake" : ""}`} role="dialog" aria-label="Achievement form">
          <div className="ama-drawer-head">
            <div>
              <p>{formMode === "edit" ? "Edit Achievement" : "Add Achievement"}</p>
              <h3>{formMode === "edit" ? "Update and reassign achievement" : "Create achievement record"}</h3>
            </div>
            <button type="button" className="ama-icon" onClick={() => setDrawerOpen(false)}>X</button>
          </div>

          <form className="ama-form" onSubmit={save} noValidate>
            <FloatingField label="Achievement Title" error={errors.title} filled={Boolean(form.title)}>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </FloatingField>
            <FloatingField label="Description" error={errors.description} filled={Boolean(form.description)}>
              <textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </FloatingField>
            <div className="ama-grid2">
              <FloatingField label="Category" error={errors.category} filled={Boolean(form.category)}>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  <option value=""></option>{CATEGORIES.map((v) => <option key={v}>{v}</option>)}
                </select>
              </FloatingField>
              <FloatingField label="Level" error={errors.level} filled={Boolean(form.level)}>
                <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}>
                  <option value=""></option>{LEVELS.map((v) => <option key={v}>{v}</option>)}
                </select>
              </FloatingField>
            </div>
            <FloatingField label="Event Name" error={errors.eventName} filled={Boolean(form.eventName)}>
              <input value={form.eventName} onChange={(e) => setForm((p) => ({ ...p, eventName: e.target.value }))} />
            </FloatingField>
            <div className="ama-grid2">
              <FloatingField label="Date of Event" error={errors.dateOfEvent} filled={Boolean(form.dateOfEvent)}>
                <input type="date" value={form.dateOfEvent} onChange={(e) => setForm((p) => ({ ...p, dateOfEvent: e.target.value }))} />
              </FloatingField>
              <FloatingField label="Upload Certificate Template (optional)" error={null} filled={Boolean(form.template)}>
                <input value={form.template} onChange={(e) => setForm((p) => ({ ...p, template: e.target.value }))} placeholder=" " />
              </FloatingField>
            </div>

            <div className={`ama-picker-wrap ${errors.assigned ? "err" : ""}`} ref={pickerRef}>
              <button type="button" className={`ama-picker-btn ${form.assigned.length ? "filled" : ""}`} onClick={() => setPickerOpen((p) => !p)}>
                <span>Assign Students</span>
                <strong>{form.assigned.length ? `${form.assigned.length} selected` : "Choose students"}</strong>
              </button>
              {pickerOpen ? (
                <div className="ama-picker-menu">
                  {STUDENTS.map(([id, name]) => {
                    const checked = form.assigned.includes(id);
                    return (
                      <label key={id}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setForm((p) => ({
                              ...p,
                              assigned: checked ? p.assigned.filter((x) => x !== id) : [...p.assigned, id]
                            }))
                          }
                        />
                        <div><strong>{name}</strong><span>{id}</span></div>
                      </label>
                    );
                  })}
                </div>
              ) : null}
              {selectedStudents.length ? (
                <div className="ama-chip-list">
                  {selectedStudents.map(([id, name]) => (
                    <span key={id} className="ama-chip">
                      {name}
                      <button type="button" onClick={() => setForm((p) => ({ ...p, assigned: p.assigned.filter((x) => x !== id) }))}>x</button>
                    </span>
                  ))}
                </div>
              ) : null}
              {errors.assigned ? <small className="ama-inline-err">{errors.assigned}</small> : null}
            </div>

            <div className="ama-form-actions">
              <button type="button" className="ama-btn ama-btn-ghost" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button type="submit" className="ama-btn ama-btn-primary" disabled={saving}>
                {saving ? <span className="ama-spin" /> : null}
                {saving ? "Saving..." : "Save Achievement"}
              </button>
            </div>
          </form>
        </div>
      </aside>

      <aside className={`ama-mobile-drawer ${mobileFiltersOpen ? "open" : ""}`} aria-hidden={!mobileFiltersOpen}>
        <div className="ama-overlay" onClick={() => setMobileFiltersOpen(false)} />
        <div className="ama-mobile-panel" role="dialog" aria-label="Mobile filters">
          <div className="ama-drawer-head">
            <div><p>Filters</p><h3>Refine achievements</h3></div>
            <button type="button" className="ama-icon" onClick={() => setMobileFiltersOpen(false)}>X</button>
          </div>
          <div className="ama-mobile-fields">
            <label><span>Search</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <label><span>Category</span><select value={filters.category} onChange={(e) => setF("category", e.target.value)}><option value="All">All</option>{CATEGORIES.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label><span>Level</span><select value={filters.level} onChange={(e) => setF("level", e.target.value)}><option value="All">All</option>{LEVELS.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label><span>Status</span><select value={filters.status} onChange={(e) => setF("status", e.target.value)}><option value="All">All</option>{STATUSES.map((v) => <option key={v}>{v}</option>)}</select></label>
            <label><span>Date</span><input type="date" value={filters.date} onChange={(e) => setF("date", e.target.value)} /></label>
            <label><span>Sort</span><select value={filters.sort} onChange={(e) => setF("sort", e.target.value)}><option>Newest</option><option>Oldest</option><option>Most Awarded</option></select></label>
          </div>
          <div className="ama-form-actions">
            <button type="button" className="ama-btn ama-btn-ghost" onClick={resetFilters}>Reset</button>
            <button type="button" className="ama-btn ama-btn-primary" onClick={() => setMobileFiltersOpen(false)}>Apply Filters</button>
          </div>
        </div>
      </aside>

      {deleteState.open ? (
        <div className="ama-modal-layer" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="ama-overlay" onClick={() => setDeleteState((s) => ({ ...s, open: false }))} />
          <div className="ama-confirm">
            <div className="ama-alert">!</div>
            <h3>Confirm deletion</h3>
            <p>{deleteState.ids.length > 1 ? `Delete ${deleteState.ids.length} selected achievements?` : `Delete "${deleteState.label}"?`} This action cannot be undone.</p>
            <div className="ama-form-actions">
              <button type="button" className="ama-btn ama-btn-ghost" onClick={() => setDeleteState((s) => ({ ...s, open: false }))}>Cancel</button>
              <button type="button" className="ama-btn ama-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`ama-toast ${toast.type === "danger" ? "danger" : ""}`} role="status" aria-live="polite">
          <strong>{toast.title}</strong>
          <span>{toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
