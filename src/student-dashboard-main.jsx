import React from "react";
import ReactDOM from "react-dom/client";
import StudentDashboard from "./StudentDashboard.jsx";
import "./student-dashboard.css";

const rootEl = document.getElementById("student-dashboard-root");
const legacyDashboardRoutes = {
  dashboard: "/student-dashboard",
  achievements: "/student-achievements",
  timeline: "/student-timeline"
};

if (window.location.pathname.endsWith(".html")) {
  const view = rootEl?.dataset.view || "dashboard";
  const target = legacyDashboardRoutes[view] || "/student-dashboard";
  const suffix = `${window.location.search || ""}${window.location.hash || ""}`;
  window.location.replace(`${target}${suffix}`);
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <StudentDashboard initialView={rootEl?.dataset.view || "dashboard"} />
  </React.StrictMode>
);
