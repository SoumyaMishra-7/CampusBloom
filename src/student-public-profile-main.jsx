import React from "react";
import ReactDOM from "react-dom/client";
import StudentPublicProfile from "./StudentPublicProfile.jsx";
import "./student-public-profile.css";

if (window.location.pathname.endsWith(".html")) {
  const suffix = `${window.location.search || ""}${window.location.hash || ""}`;
  window.location.replace(`/student-public-profile${suffix}`);
}

ReactDOM.createRoot(document.getElementById("student-public-profile-root")).render(
  <React.StrictMode>
    <StudentPublicProfile />
  </React.StrictMode>
);
