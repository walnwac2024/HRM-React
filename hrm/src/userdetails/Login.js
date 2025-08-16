// src/userdetails/Login.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Login({
  onSubmit,                         // optional: (payload) => Promise<void>
  illustrationSrc = process.env.PUBLIC_URL + "/hrm.jpg",
  status,                           // optional: string from server
  serverErrors = [],                // optional: array of strings from server
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState([]);
  const { setUser } = useAuth();
const navigate = useNavigate(); 
  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors([]);

  const nextErrors = [];
  if (!email) nextErrors.push("Email is required.");
  if (!password) nextErrors.push("Password is required.");
  if (nextErrors.length) return setErrors(nextErrors);

  const payload = { email, password, remember };
  const url = "http://localhost:5000/api/v1/login"; // adjust if needed

  try {
 

  const res = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    timeout: 15000,
    validateStatus: () => true,
  });

  if (res.status >= 200 && res.status < 300) {
    console.log("the result is:",res)
    setUser(res.data)
    navigate("/dashboard");
  } else {
    const msg =
      res.data?.message ||
      res.data?.error ||
      (Array.isArray(res.data?.errors) && res.data.errors.join(", ")) ||
      (typeof res.data === "string" ? res.data : null) ||
      `Request failed with status ${res.status}`;
    setErrors([msg]);
  }
} catch (err) {
  const code = err?.code;
  let msg =
    err?.message ||
    (err?.response?.data?.message ||
      err?.response?.data?.error ||
      (Array.isArray(err?.response?.data?.errors) &&
        err.response.data.errors.join(", "))) ||
    "Request failed.";

  if (code === "ERR_NETWORK") msg = "Network/CORS error.";
  else if (code === "ECONNABORTED") msg = "Request timed out.";

  setErrors([msg]);
}

};


  return (
    <div className="min-h-screen overflow-hidden flex flex-col md:flex-row bg-white">
      {/* Left: Form Section */}
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Welcome back! <br />
              <span className="underline decoration-customRed">Sign in</span> to continue.
            </h1>
          </div>

          {/* Session Status */}
          {status ? <div className="text-sm text-green-600">{status}</div> : null}

          {/* Validation Errors */}
          {(serverErrors.length > 0 || errors.length > 0) && (
            <ul className="text-sm text-red-600 space-y-1">
              {[...serverErrors, ...errors].map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-customRed focus:border-customRed outline-none"
              />
            </div>

            {/* Password with eye toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md bg-blue-50 focus:ring-customRed focus:border-customRed outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-customRed transition"
                  aria-label="Toggle password visibility"
                >
                  {!show ? (
                    // eye
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    // eye-off
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-6.75 0-10.5-7.5-10.5-7.5a18.34 18.34 0 0 1 3.16-4.14" />
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="text-customRed border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-600">Remember Me</span>
              </label>

              {/* Update these links to your routes if needed */}
              <Link to="/forgot-password" className="text-customRed hover:underline">
                Forget Password?
              </Link>
            </div>

            {/* Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-customRed text-white font-semibold py-2 rounded-md hover:bg-red-700 transition-all"
              >
                Sign in →
              </button>
            </div>
          </form>

          {/* Optional Register Link */}
          <p className="text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <Link to="/register" className="text-customRed font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Preview/Brand Section */}
      <div className="hidden md:flex w-1/2 h-screen bg-gray-50 items-center justify-center px-6 py-8 overflow-hidden">
        <div className="max-w-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Simplify HR.<br />
            Empower your workforce.<br />
          </h2>
          <div className="mt-6 flex justify-center">
            <img
              src={illustrationSrc}
              alt="HRM Illustration"
              className="max-w-[300px] max-h-[300px] w-full h-auto rounded-xl shadow-md border border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
