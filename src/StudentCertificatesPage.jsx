import { useEffect, useMemo, useRef, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "student-dashboard.html" },
  { label: "My Achievements", href: "student-achievements.html" },
  { label: "Timeline", href: "student-timeline.html" },
  { label: "Certificates", href: "student-certificates.html" },
  { label: "Public Profile", href: "student-public-profile.html" },
  { label: "Settings", href: "student-settings.html" }
];

const initialCertificates = [
  {
    id: 1,
    title: "Smart Campus IoT Hackathon Winner",
    event: "National Innovation Hackathon",
    uploadedAt: "2026-02-15",
    category: "Technical",
    type: "PDF",
    sizeMB: 1.8,
    status: "Verified",
    achievementLink: "student-achievements.html",
    remarks: "Verified by Innovation Cell and faculty mentor.",
    previewKind: "pdf"
  },
  {
    id: 2,
    title: "Intercollege Basketball Tournament",
    event: "Sports Council Meet",
    uploadedAt: "2026-01-29",
    category: "Sports",
    type: "Image",
    sizeMB: 2.4,
    status: "Verified",
    achievementLink: "student-achievements.html",
    remarks: "Uploaded scorecard and participation certificate validated.",
    previewKind: "image"
  },
  {
    id: 3,
    title: "State Cultural Fusion Performance",
    event: "Kala Utsav",
    uploadedAt: "2026-01-17",
    category: "Cultural",
    type: "PDF",
    sizeMB: 1.3,
    status: "Pending",
    achievementLink: "student-achievements.html",
    remarks: "Awaiting department coordinator verification remarks.",
    previewKind: "pdf"
  },
  {
    id: 4,
    title: "Student Council Event Lead",
    event: "Annual Tech-Cultural Fest",
    uploadedAt: "2025-12-22",
    category: "Leadership",
    type: "Image",
    sizeMB: 3.1,
    status: "Verified",
    achievementLink: "student-achievements.html",
    remarks: "Committee approval verified with organizing team signatures.",
    previewKind: "image"
  }
];

const categoryCls = {
  Technical: "cc-cat-technical",
  Sports: "cc-cat-sports",
  Cultural: "cc-cat-cultural",
  Leadership: "cc-cat-leadership"
};

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
    case "search":
      return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
    case "bell":
      return <svg {...p}><path d="M15 17H9" /><path d="M18 17H6c1.3-1.2 2-3 2-4.8V10a4 4 0 1 1 8 0v2.2c0 1.8.7 3.6 2 4.8Z" /></svg>;
    case "moon":
      return <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg>;
    case "sun":
      return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
    case "upload":
      return <svg {...p}><path d="M12 16V6" /><path d="m8.5 9.5 3.5-3.5 3.5 3.5" /><path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" /></svg>;
    case "download":
      return <svg {...p}><path d="M12 4v10" /><path d="m8.5 10.5 3.5 3.5 3.5-3.5" /><path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" /></svg>;
    case "link":
      return <svg {...p}><path d="M10 13a5 5 0 0 0 7.1 0l2.1-2.1a5 5 0 0 0-7.1-7.1L10.9 5" /><path d="M14 11a5 5 0 0 0-7.1 0l-2.1 2.1a5 5 0 0 0 7.1 7.1L13.1 19" /></svg>;
    case "close":
      return <svg {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>;
    case "menu":
      return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StudentCertificatesPage() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("cb.cert.darkMode") === "true");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("cb.cert.sidebar") === "true");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [fileType, setFileType] = useState("All");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [selected, setSelected] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [invalidPulse, setInvalidPulse] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 850);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("cb.cert.darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("cb.cert.sidebar", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-cc-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const next = certificates.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.event.toLowerCase().includes(q);
      const matchesCat = category === "All" || c.category === category;
      const matchesType = fileType === "All" || c.type === fileType;
      return matchesSearch && matchesCat && matchesType;
    });
    next.sort((a, b) => {
      return sort === "oldest"
        ? new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        : new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
    return next;
  }, [category, certificates, fileType, search, sort]);

  const simulateUpload = (file) => {
    if (!file) return;
    const sizeMB = +(file.size / (1024 * 1024)).toFixed(2);
    if (sizeMB > 5) {
      setInvalidPulse(true);
      setToast("File too large. Max 5MB allowed.");
      window.setTimeout(() => setInvalidPulse(false), 450);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const timer = window.setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 10;
      if (progress >= 100) {
        window.clearInterval(timer);
        setUploadProgress(100);
        const isPdf = file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
        setCertificates((prev) => [
          {
            id: Date.now(),
            title: file.name.replace(/\.[^.]+$/, ""),
            event: "Manual Upload",
            uploadedAt: new Date().toISOString(),
            category: "Technical",
            type: isPdf ? "PDF" : "Image",
            sizeMB,
            status: "Pending",
            achievementLink: "student-achievements.html",
            remarks: "Awaiting admin review and verification remarks.",
            previewKind: isPdf ? "pdf" : "image"
          },
          ...prev
        ]);
        window.setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          setToast("Certificate uploaded successfully");
        }, 400);
        return;
      }
      setUploadProgress(progress);
    }, 180);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    simulateUpload(file);
  };

  const onChooseFile = (e) => {
    const file = e.target.files?.[0];
    simulateUpload(file);
    e.target.value = "";
  };

  const downloadAll = () => {
    const blob = new Blob([JSON.stringify(certificates, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campusbloom-certificates-export.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Downloaded certificate registry export");
  };

  return (
    <div className={`cc-app ${darkMode ? "cc-dark" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="cc-sidebar">
        <div className="cc-sidebar-top">
          <a href="student-dashboard.html" className="cc-logo">
            <span className="cc-logo-mark">
              <img src="/brand/campusbloom-icon-inverted.svg" alt="" aria-hidden="true" />
            </span>
            <span className="cc-logo-text">CampusBloom</span>
          </a>
          <button type="button" className="cc-icon-btn cc-sidebar-toggle" onClick={() => setSidebarCollapsed((p) => !p)} aria-label="Toggle sidebar">
            <Icon type="menu" />
          </button>
        </div>

        <nav className="cc-nav" aria-label="Student navigation">
          {navItems.map((item) =>
            item.href ? (
              <a key={item.label} href={item.href} className={`cc-nav-item ${item.label === "Certificates" ? "active" : ""}`} title={item.label}>
                <span className="cc-nav-dot" />
                <span className="cc-nav-label">{item.label}</span>
              </a>
            ) : (
              <button key={item.label} type="button" className="cc-nav-item" onClick={() => setToast(`${item.label} page not created yet`)}>
                <span className="cc-nav-dot" />
                <span className="cc-nav-label">{item.label}</span>
              </button>
            )
          )}
        </nav>
      </aside>

      <div className="cc-shell">
        <header className="cc-topbar">
          <div className="cc-search-mini">
            <Icon type="search" />
            <span>Certificate Vault</span>
          </div>
          <div className="cc-top-actions">
            <button type="button" className="cc-icon-btn" onClick={() => setDarkMode((p) => !p)} aria-label="Toggle dark mode">
              <Icon type={darkMode ? "sun" : "moon"} />
            </button>
            <button type="button" className="cc-icon-btn" aria-label="Notifications">
              <Icon type="bell" />
            </button>
            <a href="student-dashboard.html" className="cc-profile-chip">SM</a>
          </div>
        </header>

        <main className="cc-main">
          <div className="cc-container">
            <section className="cc-header" data-cc-reveal>
              <div>
                <p className="cc-eyebrow">Document Vault</p>
                <h1>Certificates</h1>
                <p>Securely manage and preview your uploaded achievement documents.</p>
              </div>
              <div className="cc-header-actions">
                <button
                  type="button"
                  className={`cc-btn cc-primary ${uploading ? "loading" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Icon type="upload" />
                  {uploading ? "Uploading..." : "Upload Certificate"}
                </button>
                <button type="button" className="cc-btn cc-outline" onClick={downloadAll}>
                  <Icon type="download" />
                  Download All
                </button>
                <input ref={fileInputRef} type="file" hidden onChange={onChooseFile} accept=".pdf,image/*" />
              </div>
            </section>

            <section
              className={`cc-upload-zone ${dragActive ? "drag-active" : ""} ${invalidPulse ? "invalid-pulse" : ""}`}
              data-cc-reveal
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            >
              <div className="cc-upload-inner">
                <span className="cc-upload-icon"><Icon type="upload" /></span>
                <div>
                  <h3>Drag & drop certificate files here</h3>
                  <p>Supports PDF and image files up to 5MB. Use the upload button for manual selection.</p>
                </div>
              </div>
              {uploading ? (
                <div className="cc-upload-progress" aria-label={`Upload progress ${uploadProgress}%`}>
                  <div className="cc-upload-bar"><span style={{ width: `${uploadProgress}%` }} /></div>
                  <small>{uploadProgress}% processing document</small>
                </div>
              ) : null}
            </section>

            <section className="cc-filter-bar" data-cc-reveal>
              <label className="cc-field">
                <span>Search</span>
                <div className="cc-input-wrap">
                  <Icon type="search" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or event"
                  />
                </div>
              </label>

              <label className="cc-field">
                <span>Category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Technical">Technical</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </label>

              <label className="cc-field">
                <span>File Type</span>
                <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                  <option value="All">All</option>
                  <option value="PDF">PDF</option>
                  <option value="Image">Image</option>
                </select>
              </label>

              <label className="cc-field">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </label>
            </section>

            <section className="cc-grid-section" data-cc-reveal>
              {loading ? (
                <div className="cc-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <article className="cc-card cc-skeleton-card" key={i} aria-hidden="true">
                      <div className="cc-skeleton cc-skeleton-thumb" />
                      <div className="cc-skeleton cc-skeleton-line short" />
                      <div className="cc-skeleton cc-skeleton-line" />
                      <div className="cc-skeleton cc-skeleton-line short" />
                    </article>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="cc-empty">
                  <div className="cc-empty-art" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <h3>No certificates uploaded yet.</h3>
                  <p>Upload your first certificate to build a secure achievement document vault.</p>
                  <button type="button" className="cc-btn cc-primary" onClick={() => fileInputRef.current?.click()}>
                    Upload your first certificate
                  </button>
                </div>
              ) : (
                <div className="cc-grid">
                  {filtered.map((cert, idx) => (
                    <article className="cc-card" key={cert.id} style={{ transitionDelay: `${idx * 70}ms` }}>
                      <div className={`cc-thumb ${cert.previewKind === "pdf" ? "pdf" : "image"}`}>
                        <div className="cc-thumb-overlay">{cert.previewKind === "pdf" ? "PDF Preview" : "Image Preview"}</div>
                        <div className="cc-thumb-watermark">CampusBloom</div>
                      </div>

                      <div className="cc-card-body">
                        <div className="cc-card-top">
                          <span className={`cc-pill ${categoryCls[cert.category]}`}>{cert.category}</span>
                          <span className={`cc-pill ${cert.status === "Verified" ? "cc-status-verified" : "cc-status-pending"}`}>
                            {cert.status}
                          </span>
                        </div>

                        <h3>{cert.title}</h3>
                        <p className="cc-meta">{cert.event}</p>
                        <p className="cc-meta">Uploaded: {formatDate(cert.uploadedAt)} • {cert.type} • {cert.sizeMB}MB</p>

                        <div className="cc-card-actions">
                          <button type="button" className="cc-btn cc-soft" onClick={() => setSelected(cert)}>Preview</button>
                          <button type="button" className="cc-btn cc-outline" onClick={() => setToast(`Downloading ${cert.title}`)}>Download</button>
                          <a href={cert.achievementLink} className="cc-btn cc-linkish">
                            <Icon type="link" />
                            View Linked Achievement
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {selected ? (
        <div className="cc-modal-backdrop" role="dialog" aria-modal="true" aria-label="Certificate preview modal">
          <div className="cc-modal">
            <div className="cc-modal-viewer">
              <div className={`cc-doc-view ${selected.previewKind}`}>
                <div className="cc-doc-toolbar">
                  <span>{selected.type} Document Preview</span>
                  <button type="button" className="cc-icon-btn" onClick={() => setSelected(null)} aria-label="Close preview">
                    <Icon type="close" />
                  </button>
                </div>
                <div className="cc-doc-canvas">
                  <div className="cc-doc-sheet">
                    <p className="cc-doc-brand">CampusBloom Secure Vault</p>
                    <h3>{selected.title}</h3>
                    <p>{selected.event}</p>
                    <div className="cc-doc-stamp">{selected.status}</div>
                  </div>
                </div>
              </div>
            </div>
            <aside className="cc-modal-meta">
              <h3>{selected.title}</h3>
              <div className="cc-meta-list">
                <div><span>Category</span><strong>{selected.category}</strong></div>
                <div><span>Date uploaded</span><strong>{formatDate(selected.uploadedAt)}</strong></div>
                <div><span>Verification</span><strong>{selected.status}</strong></div>
                <div><span>File type</span><strong>{selected.type}</strong></div>
                <div><span>File size</span><strong>{selected.sizeMB}MB</strong></div>
              </div>
              <div className="cc-remarks">
                <p>Admin remarks</p>
                <div>{selected.remarks || "No remarks available yet."}</div>
              </div>
              <div className="cc-modal-actions">
                <button type="button" className="cc-btn cc-outline" onClick={() => setToast(`Downloading ${selected.title}`)}>
                  <Icon type="download" />
                  Download
                </button>
                <a href={selected.achievementLink} className="cc-btn cc-primary">
                  <Icon type="link" />
                  Linked Achievement
                </a>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {toast ? <div className="cc-toast">{toast}</div> : null}
    </div>
  );
}

export default StudentCertificatesPage;
