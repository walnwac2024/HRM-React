// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Standalone (no Topbar)
import Login from "./userdetails/Login";

// App layout (Topbar + <Outlet />)
import Layout from "./components/pages/Layout/Layout";

// Dashboard home (your big grid)
import Dashboard from "./Dashbord/Dashbord";

// Tabs layout that renders the bar + <Outlet />
import DashboardTabsLayout from "./components/pages/DashboardTabsLayout";

// Employees feature page
import EmployeesPage from "./features/employees";

// --- temporary placeholders for the other tabs (swap later) ---
const HRDashboard = () => <div className="p-6 text-sm">HR Dashboard — coming soon.</div>;
const PayrollDashboard = () => <div className="p-6 text-sm">Payroll Dashboard — coming soon.</div>;
const RecruitmentDashboard = () => <div className="p-6 text-sm">Recruitment Dashboard — coming soon.</div>;
const Organcogram = () => <div className="p-6 text-sm">Organcogram — coming soon.</div>;
// --------------------------------------------------------------

export default function App() {
  return (
    <Router>
      <Routes>
        {/* routes without the Topbar */}
        <Route path="/login" element={<Login />} />

        {/* routes that share the Topbar via Layout */}
        <Route element={<Layout />}>
          {/* redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard + persistent secondary tabs */}
          <Route path="/dashboard/*" element={<DashboardTabsLayout />}>
            <Route index element={<Dashboard />} />                 {/* /dashboard */}
            <Route path="hr" element={<HRDashboard />} />           {/* /dashboard/hr */}
            <Route path="payroll" element={<PayrollDashboard />} /> {/* /dashboard/payroll */}
            <Route path="recruitment" element={<RecruitmentDashboard />} />
            <Route path="organcogram" element={<Organcogram />} />
          </Route>

          {/* Other top-level pages (menu targets) */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/organization" element={<div className="p-4">Organization</div>} />
          <Route path="/recruitment" element={<div className="p-4">Recruitment</div>} />
          <Route path="/timesheet" element={<div className="p-4">Timesheet</div>} />
          <Route path="/leave" element={<div className="p-4">Leave</div>} />
          <Route path="/performance" element={<div className="p-4">Performance</div>} />
          <Route path="/payroll" element={<div className="p-4">Payroll</div>} />
          <Route path="/reports" element={<div className="p-4">Reports</div>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1 className="p-6">Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}
