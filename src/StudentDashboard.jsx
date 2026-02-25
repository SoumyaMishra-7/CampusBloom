import { useEffect, useMemo, useRef, useState } from "react";

const navItems = [
  { label: "Dashboard", view: "dashboard", href: "/student-dashboard" },
  { label: "My Achievements", view: "achievements", href: "/student-achievements" },
  { label: "Timeline", view: "timeline", href: "/student-timeline" },
  { label: "Certificates", view: "certificates", href: "/student-certificates" },
  { label: "Public Profile", view: "public-profile", href: "/student-public-profile" },
  { label: "Settings", view: "settings", href: "/student-settings" }
];

const stats = [
  { key: "total", label: "Total Achievements", value: 148, icon: "trophy" },
  { key: "awards", label: "Awards Won", value: 32, icon: "medal" },
  { key: "certs", label: "Certificates Uploaded", value: 64, icon: "certificate" },
  { key: "events", label: "Participation Events", value: 96, icon: "target" }
];

const achievementData = [
  {
    title: "Smart Campus IoT Hackathon Winner",
    category: "Technical",
    level: "National",
    date: "Feb 12, 2026",
    status: "Approved",
    skills: ["IoT", "Python", "Team Leadership"]
  },
  {
    title: "Intercollege Basketball Tournament",
    category: "Sports",
    level: "College",
    date: "Jan 28, 2026",
    status: "Approved",
    skills: ["Teamwork", "Discipline", "Strategy"]
  },
  {
    title: "Classical Fusion Performance",
    category: "Cultural",
    level: "State",
    date: "Jan 15, 2026",
    status: "Pending",
    skills: ["Stage Performance", "Coordination", "Creativity"]
  },
  {
    title: "Student Council Event Lead",
    category: "Leadership",
    level: "College",
    date: "Dec 20, 2025",
    status: "Approved",
    skills: ["Event Planning", "Communication", "Execution"]
  },
  {
    title: "Open Source Contribution Sprint",
    category: "Technical",
    level: "State",
    date: "Dec 05, 2025",
    status: "Approved",
    skills: ["Git", "React", "Problem Solving"]
  },
  {
    title: "Track & Field 400m Finals",
    category: "Sports",
    level: "State",
    date: "Nov 19, 2025",
    status: "Pending",
    skills: ["Athletics", "Consistency", "Time Management"]
  }
];

const timelineItems = [
  {
    date: "Feb 2026",
    title: "National Hackathon Winner",
    note: "Approved by Innovation Cell",
    category: "Technical"
  },
  {
    date: "Jan 2026",
    title: "Intercollege Basketball Tournament",
    note: "Certificate verified and portfolio published",
    category: "Sports"
  },
  {
    date: "Jan 2026",
    title: "State Cultural Performance Submission",
    note: "Awaiting faculty coordinator approval",
    category: "Cultural"
  },
  {
    date: "Dec 2025",
    title: "Student Council Event Leadership",
    note: "Added impact metrics and event photos",
    category: "Leadership"
  }
];

const quickActions = [
  ["Upload Certificate", "upload"],
  ["Generate Portfolio PDF", "download"],
  ["Share Public Profile", "share"],
  ["Edit Profile", "edit"]
];

const categoryColorClass = {
  Technical: "cat-technical",
  Sports: "cat-sports",
  Cultural: "cat-cultural",
  Leadership: "cat-leadership"
};

const storageKeys = {
  sidebarCollapsed: "cb.student.sidebarCollapsed",
  darkMode: "cb.student.darkMode",
  filter: "cb.student.filter",
  sortBy: "cb.student.sortBy",
  activeNav: "cb.student.activeNav",
  favorites: "cb.student.favorites"
};

function Counter({ value }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(true);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let start = 0;
    const duration = 1300;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function Icon({ type }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  switch (type) {
    case "trophy":
      return (
        <svg {...props}>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
          <path d="M17 6h3a2 2 0 0 1-2 2h-1" />
          <path d="M7 6H4a2 2 0 0 0 2 2h1" />
        </svg>
      );
    case "medal":
      return (
        <svg {...props}>
          <path d="m8 3 4 5 4-5" />
          <circle cx="12" cy="15" r="5" />
          <path d="m10.7 15 1 1 1.6-2" />
        </svg>
      );
    case "certificate":
      return (
        <svg {...props}>
          <path d="M7 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M8 7h8M8 10h5" />
          <path d="m10 15 2 2 2-2v6l-2-1-2 1v-6z" />
        </svg>
      );
    case "target":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M15 17H9" />
          <path d="M18 17H6c1.3-1.2 2-3 2-4.8V10a4 4 0 1 1 8 0v2.2c0 1.8.7 3.6 2 4.8Z" />
          <path d="M10.5 20a1.5 1.5 0 0 0 3 0" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "moon":
      return (
        <svg {...props}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "upload":
      return (
        <svg {...props}>
          <path d="M12 16V6" />
          <path d="m8.5 9.5 3.5-3.5 3.5 3.5" />
          <path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
        </svg>
      );
    case "download":
      return (
        <svg {...props}>
          <path d="M12 4v10" />
          <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
          <path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
        </svg>
      );
    case "share":
      return (
        <svg {...props}>
          <circle cx="18" cy="5" r="2" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="19" r="2" />
          <path d="m7.8 11 8.4-4.7M7.8 13l8.4 4.7" />
        </svg>
      );
    case "edit":
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5z" />
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <path d="m12 3 2.6 5.2 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9l5.8-.8L12 3z" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 12 4 4 10-10" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function StudentDashboard({ initialView = "dashboard" }) {
  const initialNavLabel =
    navItems.find((item) => item.view === initialView)?.label ||
    (localStorage.getItem(storageKeys.activeNav) || "Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(storageKeys.sidebarCollapsed) === "true");
  const [activeNav, setActiveNav] = useState(initialNavLabel);
  const [filter, setFilter] = useState(() => localStorage.getItem(storageKeys.filter) || "All");
  const [sortBy, setSortBy] = useState(() => localStorage.getItem(storageKeys.sortBy) || "date-desc");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(storageKeys.darkMode) === "true");
  const [loading, setLoading] = useState(true);
  const [favoriteTitles, setFavoriteTitles] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKeys.favorites);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [toast, setToast] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const achievementsSectionRef = useRef(null);
  const timelineSectionRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKeys.sidebarCollapsed, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem(storageKeys.darkMode, String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(storageKeys.filter, filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem(storageKeys.sortBy, sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem(storageKeys.activeNav, activeNav);
  }, [activeNav]);

  useEffect(() => {
    localStorage.setItem(storageKeys.favorites, JSON.stringify(favoriteTitles));
  }, [favoriteTitles]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (loading) return;

    const viewRef =
      initialView === "achievements"
        ? achievementsSectionRef
        : initialView === "timeline"
          ? timelineSectionRef
          : null;

    if (!viewRef?.current) return;

    window.requestAnimationFrame(() => {
      viewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [initialView, loading]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [loading]);

  const filteredAchievements = useMemo(() => {
    const filtered = achievementData.filter((item) => {
      const categoryOk = filter === "All" || item.category === filter;
      const searchOk =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()));
      const favoriteOk = !favoritesOnly || favoriteTitles.includes(item.title);
      return categoryOk && searchOk && favoriteOk;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return sortBy === "date-asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return sorted;
  }, [favoriteTitles, favoritesOnly, filter, search, sortBy]);

  const categoryCounts = useMemo(() => {
    const base = { Technical: 0, Sports: 0, Cultural: 0, Leadership: 0 };
    achievementData.forEach((item) => {
      base[item.category] += 1;
    });
    return base;
  }, []);

  const maxCategory = Math.max(...Object.values(categoryCounts), 1);
  const extracurricularScore = 84;
  const favoriteCount = favoriteTitles.length;

  const toggleFavorite = (title) => {
    setFavoriteTitles((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
  };

  const handleQuickAction = (label) => {
    if (label === "Generate Portfolio PDF") {
      const payload = {
        generatedAt: new Date().toISOString(),
        student: "Soumya",
        achievements: filteredAchievements.map((item) => ({
          title: item.title,
          category: item.category,
          level: item.level,
          status: item.status
        }))
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "campusbloom-portfolio-export.json";
      a.click();
      URL.revokeObjectURL(url);
      setToast("Portfolio export generated");
      return;
    }

    if (label === "Share Public Profile") {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(`${window.location.origin}/student-profile/soumya`).catch(() => {});
      }
      setToast("Public profile link copied");
      return;
    }

    setToast(`${label} opened`);
  };

  return (
    <div className={`sd-app ${darkMode ? "sd-dark" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sd-sidebar">
        <div className="sd-sidebar-top">
          <a href="/student-dashboard" className="sd-logo">
            <span className="sd-logo-mark">
              <img src="/brand/campusbloom-icon-inverted.svg" alt="" aria-hidden="true" />
            </span>
            <span className="sd-logo-text">CampusBloom</span>
          </a>

          <button
            type="button"
            className="icon-btn sidebar-toggle"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon type="menu" />
          </button>
        </div>

        <nav className="sd-nav" aria-label="Sidebar navigation">
          {navItems.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className={`sd-nav-item ${activeNav === item.label ? "active" : ""}`}
                onClick={() => setActiveNav(item.label)}
                title={item.label}
              >
                <span className="sd-nav-dot" />
                <span className="sd-nav-label">{item.label}</span>
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                className={`sd-nav-item ${activeNav === item.label ? "active" : ""}`}
                onClick={() => {
                  setActiveNav(item.label);
                  setToast(`${item.label} page not created yet`);
                }}
                title={item.label}
              >
                <span className="sd-nav-dot" />
                <span className="sd-nav-label">{item.label}</span>
              </button>
            )
          )}
        </nav>

        <div className="sd-sidebar-card">
          <p>Portfolio Completion</p>
          <div className="sd-mini-progress">
            <span style={{ width: "78%" }} />
          </div>
          <small>78% profile strength</small>
        </div>
      </aside>

      <div className="sd-shell">
        <header className="sd-topbar">
          <div className="sd-search-wrap">
            <Icon type="search" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search achievements or skills..."
              aria-label="Search achievements or skills"
            />
          </div>

          <div className="sd-top-actions">
            <button
              type="button"
              className="icon-btn theme-btn"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              <Icon type={darkMode ? "sun" : "moon"} />
            </button>

            <button
              type="button"
              className={`icon-btn notify-btn ${showNotifications ? "active" : ""}`}
              aria-label="Notifications"
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <Icon type="bell" />
              <span className="notify-badge">3</span>
            </button>

            <button type="button" className="profile-chip" aria-label="Student profile menu">
              <span className="profile-meta">
                <strong>Soumya</strong>
                <small>Student</small>
              </span>
              <span className="avatar">SM</span>
            </button>
          </div>

          {showNotifications ? (
            <div className="notifications-popover" role="dialog" aria-label="Recent notifications">
              <div className="notification-item">
                <span className="notification-icon"><Icon type="check" /></span>
                <div>
                  <strong>Hackathon achievement approved</strong>
                  <p>Innovation Cell verified your national-level entry.</p>
                </div>
              </div>
              <div className="notification-item">
                <span className="notification-icon"><Icon type="upload" /></span>
                <div>
                  <strong>Certificate upload reminder</strong>
                  <p>Add proof for your cultural performance to complete review.</p>
                </div>
              </div>
              <div className="notification-item">
                <span className="notification-icon"><Icon type="share" /></span>
                <div>
                  <strong>Profile viewed by placement cell</strong>
                  <p>Your public profile was accessed today.</p>
                </div>
              </div>
            </div>
          ) : null}
        </header>

        <main className="sd-main">
          <div className="sd-container">
            <section className="sd-hero-head" data-reveal>
              <div>
                <p className="sd-eyebrow">Student Dashboard</p>
                <h1>Track achievements, build your portfolio, and showcase your skills</h1>
                <p className="sd-muted">
                  A structured view of extracurricular growth across technical, sports, cultural, and leadership activities.
                </p>
              </div>
              <a href="/login" className="primary-btn">
                Switch Account
              </a>
            </section>

            <section className="stats-grid" data-reveal>
              {loading
                ? stats.map((item) => (
                    <article className="metric-card skeleton-card" key={item.key} aria-hidden="true">
                      <div className="skeleton skeleton-icon" />
                      <div className="skeleton skeleton-line short" />
                      <div className="skeleton skeleton-line" />
                    </article>
                  ))
                : stats.map((item, index) => (
                    <article className="metric-card" key={item.key} style={{ transitionDelay: `${index * 70}ms` }}>
                      <div className="metric-icon">
                        <Icon type={item.icon} />
                      </div>
                      <p>{item.label}</p>
                      <h2>
                        <Counter value={item.value} />
                      </h2>
                    </article>
                  ))}
            </section>

            <div className="dashboard-grid">
              <div className="dashboard-main-col">
                <section className="panel chart-panel" data-reveal>
                  <div className="panel-head">
                    <div>
                      <h3>Achievement Distribution</h3>
                      <p>By category across your extracurricular records</p>
                    </div>
                    <span className="head-pill">Interactive Snapshot</span>
                  </div>

                  <div className="chart-layout">
                    <div className="bar-chart">
                      {Object.entries(categoryCounts).map(([category, count]) => (
                        <div key={category} className="bar-row">
                          <div className={`bar-label ${categoryColorClass[category]}`}>{category}</div>
                          <div className="bar-track">
                            <span
                              className={`bar-fill ${categoryColorClass[category]}`}
                              style={{ width: `${(count / maxCategory) * 100}%` }}
                            />
                          </div>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="score-ring-card">
                      <div
                        className="score-ring"
                        style={{ ["--score-deg"]: `${(extracurricularScore / 100) * 360}deg` }}
                        aria-label={`Overall extracurricular score ${extracurricularScore}%`}
                      >
                        <div className="score-ring-inner">
                          <span>{extracurricularScore}%</span>
                          <small>Overall Score</small>
                        </div>
                      </div>
                      <p>Balanced profile with strong momentum across technical and leadership activities.</p>
                    </div>
                  </div>
                </section>

                <section className="panel achievements-panel" data-reveal ref={achievementsSectionRef}>
                  <div className="panel-head">
                    <div>
                      <h3>Recent Achievements</h3>
                      <p>Verified records and pending submissions with skill context</p>
                    </div>
                    <div className="panel-controls">
                      <label className="select-wrap compact">
                        <span className="sr-only">Sort achievements</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                          <option value="date-desc">Latest First</option>
                          <option value="date-asc">Oldest First</option>
                          <option value="title-asc">Title A-Z</option>
                          <option value="status">Status</option>
                        </select>
                      </label>
                      <label className="select-wrap">
                        <span className="sr-only">Filter achievements by category</span>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                          <option value="All">All Categories</option>
                          <option value="Technical">Technical</option>
                          <option value="Sports">Sports</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Leadership">Leadership</option>
                        </select>
                      </label>
                      <button
                        type="button"
                        className={`toggle-chip ${favoritesOnly ? "active" : ""}`}
                        onClick={() => setFavoritesOnly((prev) => !prev)}
                      >
                        <Icon type="star" />
                        Favorites {favoriteCount ? `(${favoriteCount})` : ""}
                      </button>
                    </div>
                  </div>

                  <div className="achievement-grid">
                    {loading
                      ? Array.from({ length: 6 }).map((_, idx) => (
                          <article className="achievement-card skeleton-card" key={`sk-${idx}`} aria-hidden="true">
                            <div className="skeleton skeleton-line short" />
                            <div className="skeleton skeleton-line" />
                            <div className="skeleton skeleton-pill-row" />
                            <div className="skeleton skeleton-line short" />
                          </article>
                        ))
                      : filteredAchievements.map((item, idx) => (
                          <article className="achievement-card" key={`${item.title}-${idx}`} style={{ transitionDelay: `${idx * 60}ms` }}>
                            <div className="achievement-top">
                              <span className={`category-pill ${categoryColorClass[item.category]}`}>{item.category}</span>
                              <div className="achievement-actions-inline">
                                <button
                                  type="button"
                                  className={`favorite-btn ${favoriteTitles.includes(item.title) ? "active" : ""}`}
                                  onClick={() => toggleFavorite(item.title)}
                                  aria-label={favoriteTitles.includes(item.title) ? "Remove from favorites" : "Add to favorites"}
                                >
                                  <Icon type="star" />
                                </button>
                                <span className={`status-pill ${item.status === "Approved" ? "status-approved" : "status-pending"}`}>
                                  {item.status}
                                </span>
                              </div>
                            </div>

                            <h4>{item.title}</h4>

                            <div className="achievement-meta">
                              <span className="meta-chip">{item.level}</span>
                              <span className="meta-chip">{item.date}</span>
                            </div>

                            <div className="skill-tags">
                              {item.skills.map((skill) => (
                                <span key={skill}>{skill}</span>
                              ))}
                            </div>

                            <button type="button" className="secondary-btn" onClick={() => setSelectedAchievement(item)}>
                              View Certificate
                            </button>
                          </article>
                        ))}
                  </div>

                  {!loading && filteredAchievements.length === 0 ? (
                    <div className="empty-state">No achievements match your current filter/search.</div>
                  ) : null}
                </section>

                <section className="panel timeline-panel" data-reveal ref={timelineSectionRef}>
                  <div className="panel-head">
                    <div>
                      <h3>Achievement Timeline</h3>
                      <p>Chronological milestones with approval progression</p>
                    </div>
                  </div>

                  <div className="timeline-list">
                    <span className="timeline-line" aria-hidden="true" />
                    {timelineItems.map((item, idx) => (
                      <article className="timeline-item" key={`${item.date}-${item.title}`} style={{ transitionDelay: `${idx * 90}ms` }}>
                        <span className={`timeline-dot ${categoryColorClass[item.category]}`} aria-hidden="true" />
                        <div className="timeline-date">{item.date}</div>
                        <div className="timeline-content">
                          <h4>{item.title}</h4>
                          <p>{item.note}</p>
                          <span className={`category-pill ${categoryColorClass[item.category]}`}>{item.category}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="dashboard-side-col">
                <section className="quick-actions panel glass-panel" data-reveal>
                  <div className="panel-head compact">
                    <div>
                      <h3>Quick Actions</h3>
                      <p>Portfolio and documentation tools</p>
                    </div>
                  </div>

                  <div className="quick-actions-list">
                    {quickActions.map(([label, icon], idx) => (
                      <button
                        key={label}
                        type="button"
                        className="quick-btn"
                        style={{ transitionDelay: `${idx * 60}ms` }}
                        onClick={() => handleQuickAction(label)}
                      >
                        <span className="quick-icon">
                          <Icon type={icon} />
                        </span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="panel insights-panel" data-reveal>
                  <div className="panel-head compact">
                    <div>
                      <h3>Student Skills Spotlight</h3>
                      <p>Strengths inferred from recent achievements</p>
                    </div>
                  </div>

                  <div className="skill-cloud">
                    {[
                      "Leadership",
                      "Problem Solving",
                      "Teamwork",
                      "Communication",
                      "Execution",
                      "Creativity",
                      "Discipline",
                      "React",
                      "IoT",
                      "Event Planning"
                    ].map((skill, idx) => (
                      <span key={skill} style={{ transitionDelay: `${idx * 50}ms` }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {selectedAchievement ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Certificate preview">
          <div className="modal-card">
            <div className="modal-head">
              <div>
                <h3>{selectedAchievement.title}</h3>
                <p>
                  {selectedAchievement.category} | {selectedAchievement.level} | {selectedAchievement.date}
                </p>
              </div>
              <button type="button" className="icon-btn modal-close" onClick={() => setSelectedAchievement(null)} aria-label="Close preview">
                <Icon type="close" />
              </button>
            </div>

            <div className="certificate-preview">
              <div className="certificate-sheet">
                <p className="certificate-brand">CampusBloom Verified Record</p>
                <h4>{selectedAchievement.title}</h4>
                <p className="certificate-meta">
                  Category: <strong>{selectedAchievement.category}</strong>
                </p>
                <p className="certificate-meta">
                  Level: <strong>{selectedAchievement.level}</strong>
                </p>
                <p className="certificate-meta">
                  Status: <strong>{selectedAchievement.status}</strong>
                </p>
                <div className="certificate-skills">
                  {selectedAchievement.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export default StudentDashboard;
