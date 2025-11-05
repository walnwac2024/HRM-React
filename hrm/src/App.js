// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/pages/ProtectedRoute/ProtectedRoute";

import Login from "./userdetails/Login";
import Layout from "./components/pages/Layout/Layout";
import Dashboard from "./Dashbord/Dashbord";
import DashboardTabsLayout from "./components/pages/DashboardTabsLayout";
import EmployeesPage from "./features/employees/EmployeesPage";
import { initCsrf } from "./utils/api";

// Auth context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Updated import path for AttendancePage
import { AttendancePage } from "./features/attendance";

const HRDashboard = () => <div className="p-6 text-sm">HR Dashboard — coming soon.</div>;
const PayrollDashboard = () => <div className="p-6 text-sm">Payroll Dashboard — coming soon.</div>;
const RecruitmentDashboard = () => <div className="p-6 text-sm">Recruitment Dashboard — coming soon.</div>;
const Organcogram = () => <div className="p-6 text-sm">Organcogram — coming soon.</div>;

/**
 * PublicOnly:
 * If authenticated, redirect to /dashboard (prevents seeing login while signed in)
 */
function PublicOnly({ children }) {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return null; // wait for /me
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initCsrf(); // axios base, withCredentials, csrf interceptor
      } catch (e) {
        console.error("CSRF init failed", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return <div className="p-6 text-gray-600">Loading…</div>;

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />

          {/* Protected: EVERYTHING under Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard + tabs */}
            <Route path="/dashboard/*" element={<DashboardTabsLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="hr" element={<HRDashboard />} />
              <Route path="payroll" element={<PayrollDashboard />} />
              <Route path="recruitment" element={<RecruitmentDashboard />} />
              <Route path="organcogram" element={<Organcogram />} />
            </Route>

            {/* Other top-level pages */}
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/organization" element={<div className="p-4">Organization</div>} />
            <Route path="/recruitment" element={<div className="p-4">Recruitment</div>} />
            <Route path="/timesheet" element={<div className="p-4">Timesheet</div>} />
            <Route path="/leave" element={<div className="p-4">Leave</div>} />
            <Route path="/performance" element={<div className="p-4">Performance</div>} />
            <Route path="/payroll" element={<div className="p-4">Payroll</div>} />
            <Route path="/reports" element={<div className="p-4">Reports</div>} />
          </Route>

          {/* Unauthorized placeholder (used if you add role guards) */}
          <Route path="/unauthorized" element={<div className="p-6">Unauthorized</div>} />

          {/* 404 */}
          <Route path="*" element={<h1 className="p-6">Page Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
