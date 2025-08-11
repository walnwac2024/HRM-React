import React from 'react';
import { BrowserRouter as Router, Routes,Route, Link } from 'react-router-dom';

// import Login from './userdetails/Login';
// import Login from './userdetails/Login';
import Login from './userdetails/Login';
//code updated after removing the git file from the git repo

function App() {
  return (
    <Router>
      {/* routes */}
      <div className="p-4">
        {/* Navigation */}
        <nav className="mb-4 flex space-x-4">
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={<h1 className="text-2xl font-bold">Home Page</h1>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
