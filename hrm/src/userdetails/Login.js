// src/userdetails/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { initCsrf } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Login({
  onSubmit,
  illustrationSrc = process.env.PUBLIC_URL + "/hrm.jpg",
  status,
  serverErrors = [],
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState([]);

  const navigate = useNavigate();
  const { setUser, login: ctxLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const errs = [];
    if (!email) errs.push("Email is required.");
    if (!password) errs.push("Password is required.");
    if (errs.length) return setErrors(errs);

    const payload = {
      email: String(email).trim().toLowerCase(),
      password: String(password).trim(),
      remember,
    };

    try {
      // fetch CSRF token + set interceptor
      await initCsrf();

      // prefer AuthContext.login if you kept it
      if (typeof ctxLogin === "function") {
        const u = await ctxLogin(payload.email, payload.password, payload.remember);
        if (!u) throw new Error("Login failed");
        navigate("/dashboard", { replace: true });
        return;
      }

      // fallback: call API directly with the shared instance
      const res = await api.post("/login", payload);

      const u =
        res?.data?.user?.user ||
        res?.data?.user ||
        null;
      if (!u) throw new Error(res?.data?.message || "Login response missing user.");

      setUser(u);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (Array.isArray(err?.response?.data?.errors) &&
          err.response.data.errors.join(", ")) ||
        err?.message ||
        "Request failed.";

      if (/csrf/i.test(msg)) {
        setErrors(["Invalid CSRF token. Refresh the page and try again."]);
      } else if (err?.code === "ERR_NETWORK") {
        setErrors(["Network/CORS error. Is the API running on :5000?"]);
      } else if (err?.code === "ECONNABORTED") {
        setErrors(["Request timed out."]);
      } else {
        setErrors([msg]);
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col md:flex-row bg-white">
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Welcome back! <br />
              <span className="underline decoration-customRed">Sign in</span> to continue.
            </h1>
          </div>

          {status ? <div className="text-sm text-green-600">{status}</div> : null}

          {(serverErrors.length > 0 || errors.length > 0) && (
            <ul className="text-sm text-red-600 space-y-1">
              {[...serverErrors, ...errors].map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-customRed focus:border-customRed outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
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
                  {show ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-6.75 0-10.5-7.5-10.5-7.5a18.34 18.34 0 0 1 3.16-4.14" />
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

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
              <Link to="/forgot-password" className="text-customRed hover:underline">
                Forget Password?
              </Link>
            </div>

            <div>
              <button type="submit" className="w-full bg-customRed text-white font-semibold py-2 rounded-md hover:bg-red-700 transition-all">
                Sign in →
              </button>
            </div>
          </form>

          <p className="text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <Link to="/register" className="text-customRed font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 h-screen bg-gray-50 items-center justify-center px-6 py-8 overflow-hidden">
        <div className="max-w-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Simplify HR.<br />Empower your workforce.
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
