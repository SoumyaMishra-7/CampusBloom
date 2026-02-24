import { useEffect, useMemo, useRef, useState } from "react";

const stats = [
  ["Total Achievements", 148],
  ["Awards Won", 32],
  ["Participation Events", 96],
  ["Certificates Uploaded", 64]
];

const achievements = [
  {
    title: "Smart Campus IoT Hackathon Winner",
    category: "Technical",
    level: "National",
    date: "Feb 12, 2026",
    description: "Led a team to build an IoT-driven campus energy optimization prototype with real-time sensor monitoring.",
    featured: true
  },
  {
    title: "Intercollege Basketball Tournament Finalist",
    category: "Sports",
    level: "College",
    date: "Jan 28, 2026",
    description: "Represented department team and contributed in semifinals and finals with strategic coordination.",
    featured: true
  },
  {
    title: "State Cultural Fusion Performance",
    category: "Cultural",
    level: "State",
    date: "Jan 15, 2026",
    description: "Performed in a multidisciplinary cultural showcase combining classical and contemporary formats.",
    featured: true
  },
  {
    title: "Student Council Event Lead",
    category: "Leadership",
    level: "College",
    date: "Dec 20, 2025",
    description: "Managed inter-department event planning, volunteer coordination, and execution logistics."
  },
  {
    title: "Open Source Contribution Sprint",
    category: "Technical",
    level: "State",
    date: "Dec 05, 2025",
    description: "Contributed UI improvements and bug fixes to a student-led open-source initiative."
  },
  {
    title: "Track & Field 400m Finals",
    category: "Sports",
    level: "State",
    date: "Nov 19, 2025",
    description: "Qualified for the state finals and maintained consistent performance across heats."
  }
];

const timeline = [
  ["Feb 2026", "National Hackathon Winner", "Technical"],
  ["Jan 2026", "Intercollege Basketball Finalist", "Sports"],
  ["Jan 2026", "State Cultural Performance", "Cultural"],
  ["Dec 2025", "Student Council Event Lead", "Leadership"]
];

const badges = [
  { label: "Gold - Innovation", tone: "gold" },
  { label: "Silver - Leadership", tone: "silver" },
  { label: "Bronze - Consistency", tone: "bronze" }
];

const categoryClass = {
  Technical: "pp-cat-technical",
  Sports: "pp-cat-sports",
  Cultural: "pp-cat-cultural",
  Leadership: "pp-cat-leadership"
};

function Counter({ value }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStarted(true);
        io.disconnect();
      },
      { threshold: 0.45 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let t0 = 0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / 1200, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(value * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value]);

  return <span ref={ref}>{count}</span>;
}

function StudentPublicProfile() {
  const [tab, setTab] = useState("All");
  const [isPublic, setIsPublic] = useState(true);
  const [toast, setToast] = useState("");
  const [bannerOffset, setBannerOffset] = useState(0);
  const [ownerView] = useState(true);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setBannerOffset(window.scrollY * 0.12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-pp-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(
    () => (tab === "All" ? achievements : achievements.filter((a) => a.category === tab)),
    [tab]
  );

  const featured = achievements.filter((a) => a.featured).slice(0, 3);
  const score = 84;

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setToast("Public link copied");
    } catch {
      setToast("Unable to copy link");
    }
  };

  const downloadPortfolio = () => {
    const payload = {
      student: "Soumya Mishra",
      department: "Computer Science",
      year: "Final Year",
      visibility: isPublic ? "Public" : "Private",
      achievements
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campusbloom-public-portfolio.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Portfolio export downloaded");
  };

  const shareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
    setToast("Opening LinkedIn share");
  };

  return (
    <div className="pp-page">
      <header className="pp-topnav">
        <div className="pp-container pp-topnav-inner">
          <a href="student-dashboard.html" className="pp-brand">
            <span className="pp-brand-mark">
              <img src="/brand/campusbloom-icon-primary.svg" alt="" aria-hidden="true" />
            </span>
            <span>CampusBloom</span>
          </a>
          <a href="student-dashboard.html" className="pp-back-btn">
            Back to Dashboard
          </a>
        </div>
      </header>

      <main>
        <section className="pp-banner-wrap">
          <div className="pp-banner" style={{ transform: `translateY(${-bannerOffset}px)` }}>
            <div className="pp-banner-grid" />
          </div>

          <div className="pp-container pp-hero" data-pp-reveal>
            <div className="pp-profile-main">
              <div className="pp-avatar" aria-hidden="true">
                SM
              </div>
              <div className="pp-profile-text">
                <h1>Soumya Mishra</h1>
                <p className="pp-subline">Computer Science • Final Year</p>
                <p className="pp-bio">
                  Student builder focused on technology, leadership, and structured extracurricular growth with evidence-backed records.
                </p>
              </div>
            </div>

            <div className="pp-hero-actions">
              <button type="button" className="pp-btn pp-btn-primary" onClick={copyLink}>
                Copy Public Link
              </button>
              <button type="button" className="pp-btn pp-btn-ghost" onClick={downloadPortfolio}>
                Download Portfolio PDF
              </button>
              <button type="button" className="pp-btn pp-btn-ghost" onClick={shareLinkedIn}>
                Share on LinkedIn
              </button>
            </div>
          </div>
        </section>

        <section className="pp-container pp-section" data-pp-reveal>
          <div className="pp-stats-grid">
            {stats.map(([label, value], idx) => (
              <article className="pp-stat-card" key={label} style={{ transitionDelay: `${idx * 70}ms` }}>
                <p>{label}</p>
                <h2>
                  <Counter value={value} />
                </h2>
              </article>
            ))}
          </div>
        </section>

        <section className="pp-container pp-section pp-two-col">
          <div className="pp-main-col">
            <section className="pp-panel" data-pp-reveal>
              <div className="pp-panel-head">
                <div>
                  <p className="pp-eyebrow">Highlights</p>
                  <h3>Top Achievements</h3>
                </div>
              </div>

              <div className="pp-feature-grid">
                {featured.map((item, idx) => (
                  <article className="pp-feature-card" key={item.title} style={{ transitionDelay: `${idx * 80}ms` }}>
                    <div className="pp-card-top">
                      <span className={`pp-pill ${categoryClass[item.category]}`}>{item.category}</span>
                      <span className="pp-pill pp-level">{item.level}</span>
                    </div>
                    <h4>{item.title}</h4>
                    <p className="pp-date">{item.date}</p>
                    <p className="pp-desc">{item.description}</p>
                    <button type="button" className="pp-btn pp-btn-soft">
                      View Certificate
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="pp-panel" data-pp-reveal>
              <div className="pp-panel-head">
                <div>
                  <p className="pp-eyebrow">Portfolio</p>
                  <h3>Achievements by Category</h3>
                </div>
              </div>

              <div className="pp-tabs" role="tablist" aria-label="Achievement categories">
                {["All", "Technical", "Sports", "Cultural", "Leadership"].map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={tab === name}
                    className={`pp-tab ${tab === name ? "active" : ""}`}
                    onClick={() => setTab(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="pp-grid-fade" key={tab}>
                <div className="pp-achievement-grid">
                  {filtered.map((item) => (
                    <article className="pp-achievement-card" key={`${item.title}-${item.date}`}>
                      <div className="pp-card-top">
                        <span className={`pp-pill ${categoryClass[item.category]}`}>{item.category}</span>
                        <span className="pp-pill pp-level">{item.level}</span>
                      </div>
                      <h4>{item.title}</h4>
                      <p className="pp-date">{item.date}</p>
                      <p className="pp-desc compact">{item.description}</p>
                      <button type="button" className="pp-link-btn">
                        View Certificate
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="pp-panel" data-pp-reveal>
              <div className="pp-panel-head">
                <div>
                  <p className="pp-eyebrow">Timeline</p>
                  <h3>Timeline Preview</h3>
                </div>
              </div>

              <div className="pp-timeline">
                <span className="pp-timeline-line" aria-hidden="true" />
                {timeline.map(([date, title, category], idx) => (
                  <article className="pp-timeline-item" key={`${date}-${title}`} style={{ transitionDelay: `${idx * 90}ms` }}>
                    <span className={`pp-timeline-dot ${categoryClass[category]}`} aria-hidden="true" />
                    <div className="pp-timeline-date">{date}</div>
                    <div className="pp-timeline-content">
                      <h4>{title}</h4>
                      <span className={`pp-pill ${categoryClass[category]}`}>{category}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="pp-side-col">
            <section className="pp-panel pp-sticky" data-pp-reveal>
              <div className="pp-panel-head">
                <div>
                  <p className="pp-eyebrow">Profile Score</p>
                  <h3>Extracurricular Strength</h3>
                </div>
              </div>

              <div className="pp-score-ring" style={{ ["--pp-score"]: `${(score / 100) * 360}deg` }}>
                <div className="pp-score-inner">
                  <strong>{score}%</strong>
                  <span>Portfolio Score</span>
                </div>
              </div>

              <p className="pp-side-note">
                Strong balance across technical and leadership activities with consistent institutional participation.
              </p>
            </section>

            <section className="pp-panel" data-pp-reveal>
              <div className="pp-panel-head">
                <div>
                  <p className="pp-eyebrow">Badges</p>
                  <h3>Recognition Badges</h3>
                </div>
              </div>
              <div className="pp-badge-list">
                {badges.map((badge) => (
                  <div key={badge.label} className={`pp-badge-card ${badge.tone}`}>
                    <span className="pp-badge-icon" aria-hidden="true" />
                    <div>{badge.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {ownerView ? (
              <section className="pp-panel" data-pp-reveal>
                <div className="pp-panel-head">
                  <div>
                    <p className="pp-eyebrow">Visibility</p>
                    <h3>Privacy Toggle</h3>
                  </div>
                </div>

                <div className="pp-privacy-row">
                  <div>
                    <strong>{isPublic ? "Public Profile" : "Private Profile"}</strong>
                    <p>{isPublic ? "Visible to institutions and recruiters" : "Only visible to you"}</p>
                  </div>

                  <button
                    type="button"
                    className={`pp-switch ${isPublic ? "active" : ""}`}
                    onClick={() => setIsPublic((prev) => !prev)}
                    aria-pressed={isPublic}
                    aria-label="Toggle public profile visibility"
                  >
                    <span />
                  </button>
                </div>
              </section>
            ) : null}
          </aside>
        </section>
      </main>

      {toast ? <div className="pp-toast">{toast}</div> : null}
    </div>
  );
}

export default StudentPublicProfile;
