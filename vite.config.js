import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        homepage: resolve(__dirname, "homepage.html"),
        login: resolve(__dirname, "login.html"),
        getStarted: resolve(__dirname, "get-started.html"),
        adminDashboard: resolve(__dirname, "admin-dashboard.html"),
        studentDashboard: resolve(__dirname, "student-dashboard.html"),
        studentTimeline: resolve(__dirname, "student-timeline.html"),
        studentCertificates: resolve(__dirname, "student-certificates.html"),
        studentAchievements: resolve(__dirname, "student-achievements.html"),
        studentPublicProfile: resolve(__dirname, "student-public-profile.html"),
        studentSettings: resolve(__dirname, "student-settings.html")
      }
    }
  }
});
