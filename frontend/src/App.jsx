import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import AuthPages from "./pages/AuthPages.jsx";
import DashboardApp from "./pages/DashboardApp.jsx";
import PublicInfoPage from "./pages/PublicInfoPage.jsx";
import ReportsPage from "./pages/Reports.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

// Temporary frontend-only guard. Real protection (checking a valid
// session/token with the backend) replaces this once the backend exists.
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("cyberintel_auth") === "true";
  return isLoggedIn ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPages />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardApp />
            </ProtectedRoute>
          }
        />
        <Route path="/info/:page" element={<PublicInfoPage />} />
      </Routes>
    </>
  );
}