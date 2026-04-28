import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import App from "./App.jsx";
import Homepage from "./Homepage.jsx";
import LoginPage from "./LoginPage.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import StudentCertificatesPage from "./StudentCertificatesPage.jsx";
import StudentPublicProfile from "./StudentPublicProfile.jsx";
import StudentSettingsPage from "./StudentSettingsPage.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import { CertificatesProvider } from "./certificates/CertificatesContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { getAnyAuthToken, getAuthUserFromToken } from "./services/authSession.js";
import store from "./store/index.js";
import "./index.css";
import "./homepage.css";
import "./student-dashboard.css";
import "./student-certificates.css";
import "./student-public-profile.css";
import "./student-settings.css";
import "./admin-dashboard.css";

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
  "/dashboard": {
    title: "CampusBloom | Dashboard",
    description: "CampusBloom dashboard for authenticated users."
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

function RouteMetaSync() {
  const location = useLocation();

  React.useEffect(() => {
    const nextMeta = routeMeta[location.pathname] || routeMeta["/"];
    document.title = nextMeta.title;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute("content", nextMeta.description);
    }
  }, [location.pathname]);

  return null;
}

function PublicOnlyRoute({ children }) {
  const token = getAnyAuthToken();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function DashboardRedirect() {
  const user = getAuthUserFromToken("");
  if (user?.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Navigate to="/student-dashboard" replace />;
}

function AppRoutes() {
  return (
    <>
      <RouteMetaSync />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route
          path="/login"
          element={(
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/signup"
          element={(
            <PublicOnlyRoute>
              <App />
            </PublicOnlyRoute>
          )}
        />

        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/student-dashboard"
          element={(
            <ProtectedRoute role="student">
              <StudentDashboard initialView="dashboard" />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student-achievements"
          element={(
            <ProtectedRoute role="student">
              <StudentDashboard initialView="achievements" />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student-timeline"
          element={(
            <ProtectedRoute role="student">
              <StudentDashboard initialView="timeline" />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student-certificates"
          element={(
            <ProtectedRoute role="student">
              <StudentCertificatesPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student-public-profile"
          element={(
            <ProtectedRoute role="student">
              <StudentPublicProfile />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/student-settings"
          element={(
            <ProtectedRoute role="student">
              <StudentSettingsPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin-dashboard"
          element={(
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          )}
        />

        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/homepage.html" element={<Navigate to="/" replace />} />
        <Route path="/login.html" element={<Navigate to="/login" replace />} />
        <Route path="/signup.html" element={<Navigate to="/signup" replace />} />
        <Route path="/get-started.html" element={<Navigate to="/signup" replace />} />
        <Route path="/admin-dashboard.html" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="/student-dashboard.html" element={<Navigate to="/student-dashboard" replace />} />
        <Route path="/student-achievements.html" element={<Navigate to="/student-achievements" replace />} />
        <Route path="/student-timeline.html" element={<Navigate to="/student-timeline" replace />} />
        <Route path="/student-certificates.html" element={<Navigate to="/student-certificates" replace />} />
        <Route path="/student-public-profile.html" element={<Navigate to="/student-public-profile" replace />} />
        <Route path="/student-settings.html" element={<Navigate to="/student-settings" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <CertificatesProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CertificatesProvider>
    </Provider>
  </React.StrictMode>
);
