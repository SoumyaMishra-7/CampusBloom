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
import { CertificatesProvider } from "./certificates/CertificatesContext.jsx";
import "./index.css";
import "./homepage.css";
import "./student-dashboard.css";
import "./student-certificates.css";
import "./student-public-profile.css";
import "./student-settings.css";
import "./admin-dashboard.css";

// Legacy entry aliases keep old bookmarked HTML routes working after the SPA cleanup.
const pathAliases = {
  "/index.html": "/",
  "/homepage.html": "/",
  "/login.html": "/login",
  "/signup.html": "/signup",
  "/get-started.html": "/signup",
  "/admin-dashboard.html": "/admin-dashboard",
  "/student-dashboard.html": "/student-dashboard",
  "/student-achievements.html": "/student-achievements",
  "/student-timeline.html": "/student-timeline",
  "/student-certificates.html": "/student-certificates",
  "/student-public-profile.html": "/student-public-profile",
  "/student-settings.html": "/student-settings"
};

const routeMeta = {
  "/": {
    title: "CampusBloom",
    description:
      "CampusBloom is a digital extracurricular achievement management and portfolio platform for educational institutions."
  },
  "/login": {
    title: "CampusBloom | Login",
    description: "CampusBloom login page for student and admin access."
  },
  "/signup": {
    title: "CampusBloom | Signup",
    description: "CampusBloom signup page for student and admin onboarding."
  },
  "/admin-dashboard": {
    title: "CampusBloom | Admin Dashboard",
    description: "CampusBloom admin dashboard for institutional extracurricular achievement management."
  },
  "/student-dashboard": {
    title: "CampusBloom | Student Dashboard",
    description:
      "CampusBloom student dashboard for managing extracurricular achievements and portfolio records."
  },
  "/student-achievements": {
    title: "CampusBloom | My Achievements",
    description: "CampusBloom student achievements page for managing extracurricular records."
  },
  "/student-timeline": {
    title: "CampusBloom | Timeline",
    description: "CampusBloom student achievement timeline page."
  },
  "/student-certificates": {
    title: "CampusBloom | Certificates",
    description:
      "CampusBloom certificates page for securely managing and previewing uploaded achievement documents."
  },
  "/student-public-profile": {
    title: "CampusBloom | Student Public Profile",
    description:
      "CampusBloom student public profile showcasing extracurricular achievements and portfolio highlights."
  },
  "/student-settings": {
    title: "CampusBloom | Settings",
    description: "CampusBloom student settings page for account, privacy, notifications, and preferences."
  }
};

function normalizePathname() {
  const rawPath = window.location.pathname.replace(/\/+$/, "") || "/";
  return pathAliases[rawPath] || rawPath;
}

function syncDocumentMeta(path) {
  const nextMeta = routeMeta[path] || routeMeta["/"];
  document.title = nextMeta.title;

  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) {
    descriptionTag.setAttribute("content", nextMeta.description);
  }
}

function StudentRoutes() {
  const rawPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const path = normalizePathname();

  if (path !== rawPath) {
    window.history.replaceState({}, "", path);
  }

  syncDocumentMeta(path);

  // Public routes
  if (path === "/") {
    return <Homepage />;
  }

  if (path === "/signup" || path === "/get-started") {
    return <App />;
  }

  if (path === "/login") {
    return <LoginPage />;
  }

  // Student routes
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

  // Admin routes
  if (path === "/admin-dashboard") {
    return <AdminDashboard />;
  }

  return <Homepage />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CertificatesProvider>
      <StudentRoutes />
    </CertificatesProvider>
  </React.StrictMode>
);
