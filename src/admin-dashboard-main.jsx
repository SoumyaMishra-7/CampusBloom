import React from "react";
import ReactDOM from "react-dom/client";
import AdminDashboard from "./AdminDashboard.jsx";
import "./admin-dashboard.css";

ReactDOM.createRoot(document.getElementById("admin-dashboard-root")).render(
  <React.StrictMode>
    <AdminDashboard />
  </React.StrictMode>
);
