import React from "react";
import ReactDOM from "react-dom/client";
import AdminDashboard from "./AdminDashboard.jsx";
import "./admin-dashboard.css";

if (window.location.pathname.endsWith(".html")) {
  const suffix = `${window.location.search || ""}${window.location.hash || ""}`;
  window.location.replace(`/admin-dashboard${suffix}`);
}

ReactDOM.createRoot(document.getElementById("admin-dashboard-root")).render(
  <React.StrictMode>
    <AdminDashboard />
  </React.StrictMode>
);
