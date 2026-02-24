import { useEffect, useRef, useState } from "react";

const values = [
  ["Recognition", "Verified extracurricular records with trusted institutional validation"],
  ["Analytics", "Track participation trends across terms, departments, and categories"],
  ["Digital Portfolio", "Showcase student growth beyond academics in a professional format"],
  ["Secure System", "Role-based workflows with evidence-backed approvals and control"]
];

const features = [
  {
    title: "Verified Achievement Timeline",
    desc: "Centralize competitions, clubs, leadership, certifications, and event participation with evidence and approval history."
  },
  {
    title: "Admin Workflow Console",
    desc: "Institution teams review, validate, and manage submissions through clean, role-specific approval pipelines."
  },
  {
    title: "Portfolio-Ready Profiles",
    desc: "Transform approved records into polished student portfolios suitable for internships, scholarships, and placements."
  },
  {
    title: "Institutional Reporting",
    desc: "Generate insights on engagement and achievement performance across departments, programs, and cohorts."
  }
];

const steps = [
  ["Submit", "Students or coordinators add achievements with date, category, and evidence."],
  ["Verify", "Admins review submissions and approve records using standardized institutional checks."],
  ["Showcase", "Approved achievements enrich portfolios and power campus-wide dashboards instantly."]
];

const stats = [
  ["Institutions onboarded", 120, "+"],
  ["Achievements managed", 85000, "+"],
  ["Student portfolios", 24000, "+"],
  ["Faster admin review", 72, "%"]
];

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStart(true);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    let t0 = 0;
    const dur = 1400;
    const run = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(Math.floor(value * e));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  return (
    <span ref={ref}>
      {shown.toLocaleString()}
      {suffix}
    </span>
  );
}

function Icon({ kind }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  if (kind === "bars") {
    return (
      <svg {...common}>
        <path d="M4 20V9" />
        <path d="M10 20V5" />
        <path d="M16 20v-8" />
        <path d="M22 20H2" />
      </svg>
    );
  }
  if (kind === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5c0 5-3.3 8.1-7 10-3.7-1.9-7-5-7-10V6l7-3z" />
        <path d="m9.5 12.5 1.6 1.6 3.5-3.7" />
      </svg>
    );
  }
  if (kind === "folder") {
    return (
      <svg {...common}>
        <path d="M3 8a2 2 0 0 1 2-2h4l1.8 2H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.3l5-.7L12 3z" />
    </svg>
  );
}

function Homepage() {
  const [navSolid, setNavSolid] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        setNavSolid(y > 12);
        setProgress((y / max) * 100);
        setParallax(y * 0.14);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="cb-home">
      <div className="scroll-line" style={{ width: `${Math.min(progress, 100)}%` }} />

      <header className={`top-nav ${navSolid ? "solid" : ""}`}>
        <div className="container nav-row">
          <a href="#top" className="brand">
            <span className="brand-mark">
              <img src="/brand/campusbloom-icon-primary.svg" alt="" aria-hidden="true" />
            </span>
            <span>CampusBloom</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="login.html">Login</a>
            <a href="get-started.html" className="btn primary small">
              Get Started
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <div className="blob blob-a" style={{ transform: `translateY(${-parallax * 0.35}px)` }} />
            <div className="blob blob-b" style={{ transform: `translateY(${-parallax * 0.2}px)` }} />
            <div className="grid-mask" />
            <div className="particles">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} style={{ ["--i"]: i }} />
              ))}
            </div>
          </div>

          <div className="container hero-grid">
            <div className="hero-copy reveal-up" data-reveal>
              <p className="eyebrow">Institutional Achievement Platform</p>
              <h1>Showcase Achievements Beyond Academics</h1>
              <p className="sub">
                A premium digital extracurricular achievement management and portfolio system for educational institutions,
                built to verify records, highlight student growth, and unlock campus-wide insights.
              </p>

              <div className="hero-actions">
                <a href="get-started.html" className="btn primary glow">
                  Get Started
                </a>
                <a href="#features" className="btn ghost">
                  Explore Features
                </a>
              </div>

              <div className="hero-tags">
                <span><i /> Secure approvals</span>
                <span>Portfolio-ready outputs</span>
              </div>
            </div>

            <div className="hero-visual reveal-up" data-reveal style={{ transform: `translateY(${-parallax * 0.08}px)` }}>
              <div className="mockup">
                <div className="mock-top">
                  <div className="dots"><span /><span /><span /></div>
                  <div className="pill">CampusBloom Dashboard</div>
                </div>

                <div className="mock-layout">
                  <div className="card main-card">
                    <div className="row between">
                      <h3>Achievement Overview</h3>
                      <span className="live">Live</span>
                    </div>
                    <div className="bars">
                      <span style={{ ["--h"]: "45%" }} />
                      <span style={{ ["--h"]: "62%" }} />
                      <span style={{ ["--h"]: "80%" }} />
                      <span style={{ ["--h"]: "70%" }} />
                      <span style={{ ["--h"]: "88%" }} />
                      <em />
                    </div>
                    <div className="mini-stats">
                      <div><small>Verified</small><b>12,480</b></div>
                      <div><small>Departments</small><b>18</b></div>
                    </div>
                  </div>

                  <div className="card small-card">
                    <small>Portfolio Completion</small>
                    <div className="ring"><span>84%</span></div>
                  </div>

                  <div className="card small-card">
                    <small>Categories</small>
                    <div className="chips">
                      <span>Sports</span>
                      <span>Tech</span>
                      <span>Cultural</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="float-panel fp-a">
                <p>Verification queue</p>
                <strong>26 Pending</strong>
                <span>Updated 2 mins ago</span>
              </div>

              <div className="float-panel fp-b">
                <p>Placement-ready profiles</p>
                <strong>+18% this term</strong>
                <span>Compared to last cycle</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container value-strip reveal-up" data-reveal>
          {values.map(([title, desc], idx) => (
            <article className="value-item" key={title} style={{ transitionDelay: `${idx * 70}ms` }}>
              <div className="icon-box">
                <Icon kind={idx === 1 ? "bars" : idx === 2 ? "folder" : idx === 3 ? "shield" : "star"} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="features" className="container section">
          <div className="section-head reveal-up" data-reveal>
            <p className="eyebrow">Features</p>
            <h2>Built like a modern SaaS platform, tailored for institutions</h2>
            <p>
              CampusBloom combines verification workflows, portfolio publishing, and analytics in one inspiring interface.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((item, idx) => (
              <article className="feature-card reveal-up" data-reveal key={item.title} style={{ transitionDelay: `${idx * 90}ms` }}>
                <div className="feature-icon">
                  <span className="orb" />
                  <Icon kind={idx === 1 ? "shield" : idx === 2 ? "folder" : idx === 3 ? "bars" : "star"} />
                </div>
                <span className="badge">{["Evidence-first", "Role-based", "Career-ready", "Analytics"][idx]}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section soft">
          <div className="container">
            <div className="section-head narrow reveal-up" data-reveal>
              <p className="eyebrow">How It Works</p>
              <h2>Simple workflow for students, coordinators, and administrators</h2>
              <p>Capture activities, verify records, and present achievements in a trusted institutional system.</p>
            </div>

            <div className="timeline reveal-up" data-reveal>
              <span className="timeline-line" aria-hidden="true" />
              {steps.map(([title, desc], idx) => (
                <article className="timeline-step" key={title} style={{ transitionDelay: `${idx * 120}ms` }}>
                  <div className="step-num">0{idx + 1}</div>
                  <div className="step-card">
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container section preview">
          <div className="preview-left reveal-up" data-reveal style={{ transform: `translateY(${-parallax * 0.04}px)` }}>
            <div className="preview-shell">
              <div className="pv-card tall">
                <p>Department Leaderboard</p>
                <div className="leader-list">
                  <div><span>Computer Science</span><b>92</b></div>
                  <div><span>Mechanical</span><b>81</b></div>
                  <div><span>Electronics</span><b>79</b></div>
                  <div><span>Business</span><b>73</b></div>
                </div>
              </div>
              <div className="pv-card">
                <p>Approval SLA</p>
                <div className="meter"><span /></div>
                <small>74% within 24 hours</small>
              </div>
              <div className="pv-card">
                <p>Activity Mix</p>
                <div className="donut" />
              </div>
              <div className="pv-card wide">
                <p>Monthly Trend</p>
                <div className="trend">
                  <span /><span /><span /><span /><span /><span />
                </div>
              </div>
            </div>
          </div>

          <div className="preview-right reveal-up" data-reveal>
            <p className="eyebrow">Dashboard Preview</p>
            <h2>Unified visibility for portfolios, approvals, and campus-level insights</h2>
            <ul className="bullet-list">
              <li>Department-level dashboards and institution-wide visibility</li>
              <li>Evidence-backed verification pipeline and approval history</li>
              <li>Portfolio outputs that highlight leadership, skill, and participation</li>
              <li>Reporting-friendly structure for accreditation and institutional review</li>
            </ul>
            <a href="login.html" className="btn primary glow">See It in Action</a>
          </div>
        </section>

        <section className="stats">
          <div className="container">
            <div className="section-head reveal-up" data-reveal>
              <p className="eyebrow">Platform Impact</p>
              <h2>Built for institutions that take student development seriously</h2>
            </div>
            <div className="stats-grid">
              {stats.map(([label, value, suffix], idx) => (
                <article className="stat-card reveal-up" data-reveal key={label} style={{ transitionDelay: `${idx * 90}ms` }}>
                  <h3><Counter value={value} suffix={suffix} /></h3>
                  <p>{label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container">
            <div className="cta-card reveal-up" data-reveal>
              <p className="eyebrow">Start Now</p>
              <h2>Ready to celebrate achievements the right way?</h2>
              <p>
                Launch a modern extracurricular achievement management and portfolio experience for your institution.
              </p>
              <div className="cta-actions">
                <a href="get-started.html" className="btn primary glow">Get Started</a>
                <a href="#top" className="btn ghost">Back to Top</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-row">
          <div>
            <a href="#top" className="brand">
              <span className="brand-mark">
                <img src="/brand/campusbloom-icon-primary.svg" alt="" aria-hidden="true" />
              </span>
              <span>CampusBloom</span>
            </a>
            <p>Digital extracurricular achievement management and portfolio system for educational institutions.</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="login.html">Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
