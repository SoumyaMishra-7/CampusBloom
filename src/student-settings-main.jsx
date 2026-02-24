import React from "react";
import ReactDOM from "react-dom/client";
import StudentSettingsPage from "./StudentSettingsPage.jsx";
import "./student-settings.css";

ReactDOM.createRoot(document.getElementById("student-settings-root")).render(
  <React.StrictMode>
    <StudentSettingsPage />
  </React.StrictMode>
);

