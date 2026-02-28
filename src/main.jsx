import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Homepage from "./Homepage.jsx";
import LoginPage from "./LoginPage.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import StudentCertificatesPage from "./StudentCertificatesPage.jsx";
import StudentPublicProfile from "./StudentPublicProfile.jsx";
import StudentSettingsPage from "./StudentSettingsPage.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import "./index.css";
import "./student-dashboard.css";
import "./student-certificates.css";
import "./student-public-profile.css";
import "./student-settings.css";
import "./admin-dashboard.css";

function StudentRoutes() {
  const rawPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const pathAliases = {
    "/index.html": "/",
    "/homepage.html": "/",
    "/login.html": "/login",
    "/get-started.html": "/signup"
  };
  const path = pathAliases[rawPath] || rawPath;

  if (path !== rawPath) {
    window.history.replaceState({}, "", path);
  }

  if (path === "/") {
    return <Homepage />;
  }

  if (path === "/signup" || path === "/get-started") {
    return <App />;
  }

  if (path === "/student-dashboard") {
    return <StudentDashboard initialView="dashboard" />;
  }

  if (path === "/student-achievements") {
    return <StudentDashboard initialView="achievements" />;
  }

  if (path === "/student-timeline") {
    return <StudentDashboard initialView="timeline" />;
  }

  if (path === "/student-certificates") {
    return <StudentCertificatesPage />;
  }

  if (path === "/student-public-profile") {
    return <StudentPublicProfile />;
  }

  if (path === "/student-settings") {
    return <StudentSettingsPage />;
  }

  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/admin-dashboard") {
    return <AdminDashboard />;
  }

  return <Homepage />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StudentRoutes />
  </React.StrictMode>
);
