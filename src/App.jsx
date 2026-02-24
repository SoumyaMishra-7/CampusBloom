import { useEffect, useRef, useState } from "react";

const roleMeta = {
  student: {
    label: "Student",
    subtitle: "Build a verified extracurricular portfolio"
  },
  admin: {
    label: "Admin",
    subtitle: "Manage achievements and institution records"
  }
};

const departmentOptions = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Business Administration",
  "Arts & Humanities",
  "Commerce",
  "Life Sciences"
];

const fieldConfig = {
  student: [
    { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "rollNumber", label: "Roll Number", type: "text", autoComplete: "off" },
    { name: "department", label: "Department", type: "select" },
    { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", autoComplete: "new-password" }
  ],
  admin: [
    { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "institutionName", label: "Institution Name", type: "text", autoComplete: "organization" },
    { name: "adminId", label: "Admin ID", type: "text", autoComplete: "off" },
    { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password", autoComplete: "new-password" }
  ]
};

const initialForms = {
  student: {
    fullName: "",
    email: "",
    rollNumber: "",
    department: "",
    password: "",
    confirmPassword: ""
  },
  admin: {
    fullName: "",
    email: "",
    institutionName: "",
    adminId: "",
    password: "",
    confirmPassword: ""
  }
};

const initialVisibility = {
  student: { password: false, confirmPassword: false },
  admin: { password: false, confirmPassword: false }
};

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRoleForm(role, values) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = "Full name is required.";
  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!validateEmail(values.email)) errors.email = "Enter a valid email address.";

  if (role === "student") {
    if (!values.rollNumber.trim()) errors.rollNumber = "Roll number is required.";
    if (!values.department) errors.department = "Select a department.";
  }

  if (role === "admin") {
    if (!values.institutionName.trim()) errors.institutionName = "Institution name is required.";
    if (!values.adminId.trim()) errors.adminId = "Admin ID is required.";
  }

  if (!values.password) errors.password = "Password is required.";
  else if (values.password.length < 8) errors.password = "Use at least 8 characters.";

  if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function RoleIcon({ role }) {
  if (role === "student") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 9.5 12 5l9 4.5-9 4.5L3 9.5Z" />
        <path d="M7 12.3v3.2c0 .8 2.2 2.5 5 2.5s5-1.7 5-2.5v-3.2" />
        <path d="M21 10v5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
      <path d="M18 6h3" />
      <path d="M19.5 4.5v3" />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 4.5 20 21" />
      <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c5.5 0 9 6 9 6a16.7 16.7 0 0 1-3.2 3.8" />
      <path d="M6.6 8.2A16.8 16.8 0 0 0 3 12s3.5 6 9 6c.5 0 1.1-.1 1.6-.1" />
      <path d="M9.8 9.8a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function App() {
  const [role, setRole] = useState("student");
  const [forms, setForms] = useState(initialForms);
  const [errors, setErrors] = useState({ student: {}, admin: {} });
  const [touched, setTouched] = useState({ student: {}, admin: {} });
  const [attempted, setAttempted] = useState({ student: false, admin: false });
  const [visibility, setVisibility] = useState(initialVisibility);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successRole, setSuccessRole] = useState("");
  const [shakeFields, setShakeFields] = useState([]);
  const shakeTimerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(
    () => () => {
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    },
    []
  );

  const currentFields = fieldConfig[role];
  const currentValues = forms[role];
  const currentErrors = errors[role] || {};
  const currentTouched = touched[role] || {};

  const showFieldError = (name) => Boolean(currentErrors[name] && (currentTouched[name] || attempted[role]));

  const setRoleValues = (nextRole, nextValues) => {
    setForms((prev) => ({ ...prev, [nextRole]: nextValues }));
  };

  const syncValidationIfNeeded = (nextRole, nextValues) => {
    if (!attempted[nextRole]) return;
    setErrors((prev) => ({ ...prev, [nextRole]: validateRoleForm(nextRole, nextValues) }));
  };

  const handleFieldChange = (name, value) => {
    const nextValues = { ...forms[role], [name]: value };
    setRoleValues(role, nextValues);
    if (successRole === role) setSuccessRole("");
    if (attempted[role]) syncValidationIfNeeded(role, nextValues);
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({
      ...prev,
      [role]: { ...prev[role], [name]: true }
    }));
    const nextErrors = validateRoleForm(role, forms[role]);
    setErrors((prev) => ({ ...prev, [role]: nextErrors }));
  };

  const handleRoleSwitch = (nextRole) => {
    if (loading || nextRole === role) return;
    setRole(nextRole);
    setShakeFields([]);
  };

  const triggerShake = (fieldNames) => {
    if (!fieldNames.length) return;
    setShakeFields(fieldNames);
    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = window.setTimeout(() => setShakeFields([]), 460);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = validateRoleForm(role, forms[role]);
    const hasErrors = Object.keys(nextErrors).length > 0;
    const allTouched = currentFields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {});

    setTouched((prev) => ({ ...prev, [role]: allTouched }));
    setAttempted((prev) => ({ ...prev, [role]: true }));
    setErrors((prev) => ({ ...prev, [role]: nextErrors }));

    if (hasErrors) {
      triggerShake(Object.keys(nextErrors));
      return;
    }

    setLoading(true);
    setSuccessRole("");
    window.setTimeout(() => {
      setLoading(false);
      setSuccessRole(role);
    }, 1300);
  };

  const handleBackToHome = (event) => {
    event.preventDefault();

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "index.html";
  };

  const togglePasswordVisibility = (fieldName) => {
    setVisibility((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [fieldName]: !prev[role][fieldName]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(135deg,#F8FAFC_0%,#EEF2FF_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(79,70,229,0.12),transparent_42%),radial-gradient(circle_at_85%_18%,rgba(99,102,241,0.10),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.08),transparent_40%)]" />
        <div className="blob-orb blob-orb-a" />
        <div className="blob-orb blob-orb-b" />
        <div className="blob-orb blob-orb-c" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-premium ${
          scrolled
            ? "bg-white/75 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="index.html" className="group inline-flex items-center gap-2.5">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-white/80 text-primary shadow-[0_8px_24px_rgba(79,70,229,0.16)]">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/12 to-accent/10" />
              <img
                src="/brand/campusbloom-icon-primary.svg"
                alt=""
                aria-hidden="true"
                className="relative h-[17px] w-[17px]"
              />
            </span>
            <span className="text-sm font-semibold tracking-[-0.02em] text-ink">
              CampusBloom
            </span>
          </a>

          <a
            href="index.html"
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18 9 12l6-6" />
            </svg>
            Back to Home
          </a>
        </div>
      </header>

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:px-8">
        <div className="relative w-full">
          <div className="pointer-events-none absolute left-1/2 top-8 hidden h-28 w-[72%] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl lg:block" />

          <section className="registration-card glass page-card-enter relative overflow-hidden rounded-[1.6rem] border border-white/60 shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
            <div className="absolute inset-0 opacity-60 [background:linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0))]" />
            <div className="relative grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-5 sm:p-8 lg:p-10">
                <div className="mb-7 sm:mb-8">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Get Started
                  </p>
                  <h1 className="text-[clamp(1.7rem,2.3vw,2.3rem)] font-extrabold tracking-[-0.04em] text-ink">
                    Create your CampusBloom account
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Secure onboarding for institutional admins and students to manage verified extracurricular achievements.
                  </p>
                </div>

                <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/65 p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                  <div className="relative grid grid-cols-2 gap-1">
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-xl bg-primary text-white shadow-[0_12px_24px_rgba(79,70,229,0.28)] transition-all duration-400 ease-premium ${
                        role === "student" ? "left-1" : "left-[calc(50%+0.125rem)]"
                      }`}
                    />

                    {(["student", "admin"]).map((item) => {
                      const active = role === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleRoleSwitch(item)}
                          className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 ease-premium ${
                            active ? "text-white" : "text-slate-600 hover:text-ink"
                          }`}
                          aria-pressed={active}
                        >
                          <RoleIcon role={item} />
                          {roleMeta[item].label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-5 rounded-2xl border border-slate-200/70 bg-white/65 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {roleMeta[role].label} onboarding
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{roleMeta[role].subtitle}</p>
                </div>

                {successRole === role && (
                  <div className="success-pop mb-5 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-slate-700">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-[0_6px_18px_rgba(16,185,129,0.28)]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">Account created successfully</p>
                      <p className="text-xs text-slate-600">
                        Your {roleMeta[role].label.toLowerCase()} registration is ready for the next verification step.
                      </p>
                    </div>
                  </div>
                )}

                <div key={role} className="role-form-enter">
                  <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                    {currentFields.map((field, index) => {
                      const hasError = showFieldError(field.name);
                      const isSuccess =
                        successRole === role && !hasError && String(currentValues[field.name] || "").trim();
                      const isPassword = field.type === "password";
                      const isSelect = field.type === "select";
                      const isVisible = isPassword ? visibility[role][field.name] : false;
                      const hasValue = String(currentValues[field.name] || "").trim().length > 0;
                      const baseInputClass =
                        "peer h-14 w-full rounded-xl border bg-white/90 px-4 pt-5 text-sm text-ink outline-none transition-all duration-300 ease-premium placeholder:text-transparent disabled:cursor-not-allowed disabled:opacity-70";
                      const statusClass = hasError
                        ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        : isSuccess
                          ? "border-accent/50 focus:border-accent focus:ring-4 focus:ring-accent/10"
                          : "border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10";
                      const wrapperShake = shakeFields.includes(field.name) ? "error-shake" : "";

                      return (
                        <div
                          key={field.name}
                          className={`field-reveal ${wrapperShake}`}
                          style={{ animationDelay: `${index * 55}ms` }}
                        >
                          <div className="group relative">
                            {isSelect ? (
                              <>
                                <select
                                  id={`${role}-${field.name}`}
                                  value={currentValues[field.name]}
                                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                  onBlur={() => handleBlur(field.name)}
                                  disabled={loading}
                                  className={`${baseInputClass} ${statusClass} appearance-none pr-11 ${
                                    currentValues[field.name] ? "text-ink" : "text-slate-400"
                                  }`}
                                >
                                  <option value="">Select department</option>
                                  {departmentOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>

                                <label
                                  htmlFor={`${role}-${field.name}`}
                                  className={`pointer-events-none absolute left-4 transition-all duration-300 ease-premium ${
                                    currentValues[field.name]
                                      ? "top-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
                                      : "top-1/2 -translate-y-1/2 text-sm text-slate-500"
                                  }`}
                                >
                                  {field.label}
                                </label>

                                <svg
                                  viewBox="0 0 24 24"
                                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </>
                            ) : (
                              <>
                                <input
                                  id={`${role}-${field.name}`}
                                  type={isPassword && !isVisible ? "password" : field.type}
                                  value={currentValues[field.name]}
                                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                  onBlur={() => handleBlur(field.name)}
                                  autoComplete={field.autoComplete}
                                  placeholder=" "
                                  disabled={loading}
                                  className={`${baseInputClass} ${statusClass} ${isPassword ? "pr-12" : ""}`}
                                />

                                <label
                                  htmlFor={`${role}-${field.name}`}
                                  className={`pointer-events-none absolute left-4 text-slate-500 transition-all duration-300 ease-premium peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-primary ${
                                    hasValue
                                      ? "top-2 translate-y-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
                                      : "top-1/2 -translate-y-1/2 text-sm"
                                  }`}
                                >
                                  {field.label}
                                </label>

                                {isPassword && (
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(field.name)}
                                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-ink"
                                    aria-label={isVisible ? "Hide password" : "Show password"}
                                    tabIndex={0}
                                  >
                                    <EyeIcon open={isVisible} />
                                  </button>
                                )}
                              </>
                            )}

                            <span className="pointer-events-none absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 rounded-full bg-gradient-to-r from-primary via-primary to-accent opacity-80 transition-transform duration-300 ease-premium group-focus-within:scale-x-100" />
                          </div>

                          <div className="mt-1.5 min-h-[18px] px-1 text-xs">
                            {hasError ? (
                              <p className="text-rose-600">{currentErrors[field.name]}</p>
                            ) : isSuccess ? (
                              <p className="text-accent">Looks good</p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.26)] transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
                    >
                      {loading ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </form>
                </div>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <a
                    href="login.html"
                    className="login-link relative inline-block font-semibold text-primary"
                  >
                    Login
                  </a>
                </p>
              </div>

              <aside className="relative hidden overflow-hidden rounded-l-[2.2rem] lg:block">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#1E293B_0%,#0F172A_100%)]" />
                <div className="absolute -right-8 top-8 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
                <div className="absolute bottom-8 left-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
                <div className="relative flex h-full flex-col justify-between p-8 text-white">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
                      <span className="inline-flex h-2 w-2 rounded-full bg-accent shadow-[0_0_18px_rgba(16,185,129,0.7)]" />
                      Institutional-grade onboarding
                    </div>

                    <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.04em]">
                      Trusted setup for extracurricular achievement records
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      CampusBloom helps institutions manage verified achievements while giving students a professional portfolio experience.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      ["Verified achievement timelines", "Portfolio-ready records for students"],
                      ["Admin-managed controls", "Role-specific access and updates"],
                      ["Analytics-ready structure", "Reporting across departments and terms"]
                    ].map(([title, desc], idx) => (
                      <div
                        key={title}
                        className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                        style={{ animationDelay: `${idx * 90}ms` }}
                      >
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-accent">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>
                          </span>
                          {title}
                        </div>
                        <p className="text-xs leading-5 text-slate-300">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                      Security & trust
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Designed for academic institutions with role-based workflows, record verification, and clean audit-friendly data structures.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
