import React from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaUserPlus, FaBuilding, FaCalendarCheck, FaSignInAlt } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">HRM System</h2>

        <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
          <FaTachometerAlt />
          <span>Dashboard</span>
        </Link>

        <Link to="/employees" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
          <FaUsers />
          <span>All Employees</span>
        </Link>

        <Link to="/add-employee" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
          <FaUserPlus />
          <span>Add Employee</span>
        </Link>

        <Link to="/departments" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
          <FaBuilding />
          <span>Departments</span>
        </Link>

        <Link to="/attendance" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
          <FaCalendarCheck />
          <span>Attendance</span>
        </Link>

        <Link to="/login" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
          <FaSignInAlt />
          <span>Login</span>
        </Link>
      </nav>

      {/* Dashboard Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Welcome to Dashboard</h1>
        <p className="text-gray-700">Select an option from the menu to get started.</p>
      </main>
    </div>
  );
};

export default Dashboard;
