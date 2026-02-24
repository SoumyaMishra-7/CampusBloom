import React from "react";
import ReactDOM from "react-dom/client";
import StudentCertificatesPage from "./StudentCertificatesPage.jsx";
import "./student-certificates.css";

ReactDOM.createRoot(document.getElementById("student-certificates-root")).render(
  <React.StrictMode>
    <StudentCertificatesPage />
  </React.StrictMode>
);

