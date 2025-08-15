// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Standalone pages
import Login from './userdetails/Login';

// Layout (Topbar + Outlet)
import Layout from './components/pages/Layout/Layout';

// Dashboard page (your big component)
import Dashboard from './Dashbord/Dashbord'; // <-- matches your folder/file name

function App() {
  return (
    <Router>
      <Routes>
        {/* No Topbar */}
        <Route path="/login" element={<Login />} />

        {/* With Topbar via Layout */}
        <Route element={<Layout />}>
          {/* Make / redirect to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Show your Dashboard page */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Stubs for menu links; replace with real pages later */}
          <Route path="/organization" element={<div className="p-4">Organization</div>} />
          <Route path="/recruitment"  element={<div className="p-4">Recruitment</div>} />
          <Route path="/employees"    element={<div className="p-4">Employees</div>} />
          <Route path="/timesheet"    element={<div className="p-4">Timesheet</div>} />
          <Route path="/leave"        element={<div className="p-4">Leave</div>} />
          <Route path="/performance"  element={<div className="p-4">Performance</div>} />
          <Route path="/payroll"      element={<div className="p-4">Payroll</div>} />
          <Route path="/reports"      element={<div className="p-4">Reports</div>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1 className="p-6">Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
