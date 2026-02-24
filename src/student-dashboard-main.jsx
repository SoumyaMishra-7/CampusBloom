import React from "react";
import ReactDOM from "react-dom/client";
import StudentDashboard from "./StudentDashboard.jsx";
import "./student-dashboard.css";

ReactDOM.createRoot(document.getElementById("student-dashboard-root")).render(
  <React.StrictMode>
    <StudentDashboard initialView={document.getElementById("student-dashboard-root")?.dataset.view || "dashboard"} />
  </React.StrictMode>
);
