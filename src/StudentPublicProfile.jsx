import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost, apiPut } from "./api";
import { downloadPortfolioPdf } from "./downloads";

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
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [toast, setToast] = useState("");
  const [bannerOffset, setBannerOffset] = useState(0);
  const [ownerView] = useState(true);

  useEffect(() => {
    Promise.all([apiGet("/api/student/profile/public"), apiGet("/api/student/settings")])
      .then(([profileResponse, settingsResponse]) => {
        setProfile(profileResponse);
        setSettings(settingsResponse);
      })
      .catch((error) => setToast(error.message));
  }, []);

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
  }, [profile]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const achievements = profile?.achievements || [];
  const filtered = useMemo(
    () => (tab === "All" ? achievements : achievements.filter((a) => a.category === tab)),
    [achievements, tab]
  );

  const featured = achievements.filter((a) => a.featured).slice(0, 3);
  const score = profile?.extracurricularScore || 0;
  const isPublic = settings?.privacy?.publicProfile ?? profile?.publicProfile ?? true;

  const copyLink = async () => {
    try {
      await apiPost("/api/student/profile/share");
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setToast("Public link copied");
    } catch (error) {
      setToast(error.message);
    }
  };

  const downloadPortfolio = async () => {
    try {
      await apiPost("/api/student/profile/export");
      downloadPortfolioPdf({
        studentName: profile?.fullName,
        department: profile?.department,
        year: profile?.year,
        visibility: isPublic ? "Public" : "Private",
        bio: profile?.bio,
        achievements
      });
      setToast("Portfolio export downloaded as PDF");
    } catch (error) {
      setToast(error.message);
    }
  };

  const shareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
    setToast("Opening LinkedIn share");
  };

  const toggleVisibility = async () => {
    if (!settings) return;
    const nextPrivacy = {
      ...settings.privacy,
      publicProfile: !settings.privacy.publicProfile
    };
    try {
      const updatedPrivacy = await apiPut("/api/student/settings/privacy", nextPrivacy);
      setSettings((prev) => ({ ...prev, privacy: updatedPrivacy }));
      setProfile((prev) => (prev ? { ...prev, publicProfile: updatedPrivacy.publicProfile } : prev));
      setToast(updatedPrivacy.publicProfile ? "Profile is now public" : "Profile is now private");
    } catch (error) {
      setToast(error.message);
    }
  };

  return (
    <div className="pp-page">
      <header className="pp-topnav">
        <div className="pp-container pp-topnav-inner">
          <a href="/student-dashboard" className="pp-brand">
            <span className="pp-brand-mark">
              <img src="/brand/campusbloom-icon-primary.svg" alt="" aria-hidden="true" />
            </span>
            <span>CampusBloom</span>
          </a>
          <a href="/student-dashboard" className="pp-back-btn">
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
                {(profile?.fullName || "SM").split(" ").map((word) => word[0]).slice(0, 2).join("")}
              </div>
              <div className="pp-profile-text">
                <h1>{profile?.fullName || "Loading..."}</h1>
                <p className="pp-subline">{profile?.department || ""} • {profile?.year || ""}</p>
                <p className="pp-bio">
                  {profile?.bio || "Loading public profile..."}
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
            {(profile?.stats || []).map((item, idx) => (
              <article className="pp-stat-card" key={item.key} style={{ transitionDelay: `${idx * 70}ms` }}>
                <p>{item.label}</p>
                <h2>
                  <Counter value={item.value} />
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
                    <p className="pp-date">{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
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
                      <p className="pp-date">{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
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
                {(profile?.timeline || []).map((item, idx) => (
                  <article className="pp-timeline-item" key={`${item.date}-${item.title}`} style={{ transitionDelay: `${idx * 90}ms` }}>
                    <span className={`pp-timeline-dot ${categoryClass[item.category]}`} aria-hidden="true" />
                    <div className="pp-timeline-date">{item.date}</div>
                    <div className="pp-timeline-content">
                      <h4>{item.title}</h4>
                      <span className={`pp-pill ${categoryClass[item.category]}`}>{item.category}</span>
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
                {(profile?.badges || []).map((badge) => (
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
                    onClick={toggleVisibility}
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
