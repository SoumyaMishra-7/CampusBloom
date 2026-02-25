import React from "react";
import ReactDOM from "react-dom/client";
import StudentSettingsPage from "./StudentSettingsPage.jsx";
import "./student-settings.css";

if (window.location.pathname.endsWith(".html")) {
  const suffix = `${window.location.search || ""}${window.location.hash || ""}`;
  window.location.replace(`/student-settings${suffix}`);
}

ReactDOM.createRoot(document.getElementById("student-settings-root")).render(
  <React.StrictMode>
    <StudentSettingsPage />
  </React.StrictMode>
);
