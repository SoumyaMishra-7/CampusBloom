import React from "react";
import ReactDOM from "react-dom/client";
import StudentCertificatesPage from "./StudentCertificatesPage.jsx";
import "./student-certificates.css";

if (window.location.pathname.endsWith(".html")) {
  const suffix = `${window.location.search || ""}${window.location.hash || ""}`;
  window.location.replace(`/student-certificates${suffix}`);
}

ReactDOM.createRoot(document.getElementById("student-certificates-root")).render(
  <React.StrictMode>
    <StudentCertificatesPage />
  </React.StrictMode>
);
