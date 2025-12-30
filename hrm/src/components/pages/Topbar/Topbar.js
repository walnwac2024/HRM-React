// src/components/pages/Topbar/Topbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCog,
  FaUsers,
  FaUser,
  FaCalendarAlt,
  FaCalendarCheck,
  FaChartLine,
  FaThLarge,
  FaChartBar,
  FaBell,
  FaClock,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../utils/api";

// Map backend keys -> route + icon + fallback label
const TAB_META = {
  dashboard: { to: "/dashboard", Icon: FaHome, label: "Dashboard" },
  organization: { to: "/organization", Icon: FaCog, label: "Organization" },
  recruitment: { to: "/recruitment", Icon: FaUsers, label: "Recruitment" },
  employee: { to: "/employees", Icon: FaUser, label: "Employee" },
  timesheet: { to: "/timesheet", Icon: FaCalendarAlt, label: "Timesheet" },
  leave: { to: "/leave", Icon: FaCalendarCheck, label: "Leave" },
  attendance: { to: "/attendance", Icon: FaClock, label: "Attendance" },
  performance: { to: "/performance", Icon: FaChartLine, label: "Performance" },
  payroll: { to: "/payroll", Icon: FaThLarge, label: "Payroll" },
  reports: { to: "/reports", Icon: FaChartBar, label: "Reports" },
  permissions: { to: "/permissions", Icon: FaShieldAlt, label: "Permissions" },
};

function getInitials(nameOrEmail = "User") {
  const base = String(nameOrEmail).trim();
  const name = base.includes("@")
    ? base.split("@")[0].replace(/[._-]+/g, " ")
    : base;
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U"
  );
}

export default function Topbar({ logoSrc }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tabs, logout } = useAuth();

  // ✅ Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifyRef = useRef(null);

  // ✅ Dropdown State
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (e) {
      console.error("fetchNotifications error", e);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (e) {
      console.error("markRead error", e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error("markAllRead error", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 300000); // 5 mins
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    function onDocClick(e) {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (showNotifications && notifyRef.current && !notifyRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }

    function onEsc(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, showNotifications]);

  // resolve logo
  const defaultLogo = `${process.env.PUBLIC_URL}/hrm-logo.png`;
  const fallbackLogo = `${process.env.PUBLIC_URL}/logo192.png`;
  const logo = logoSrc || defaultLogo;

  // Build menu
  const safeTabs = Array.isArray(tabs) ? tabs : [];
  const menu = safeTabs.map((t) => {
    const meta = TAB_META[t.key] || {};
    return {
      key: t.key,
      label: t.label || meta.label || t.key,
      to: meta.to || `/${t.key}`,
      Icon: meta.Icon || FaHome,
    };
  });

  const activeMenu = menu.find((m) => location.pathname.startsWith(m.to));
  const activeLabel = activeMenu?.label ?? "";

  const userName = user?.name || user?.email || "User";
  const initials = getInitials(userName);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/v1";
  const FILE_BASE = API_BASE.replace(/\/api\/v1\/?$/, "");

  // ✅ support both profile_img and profile_picture
  const rawAvatar = user?.profile_img || user?.profile_picture || null;
  const avatarUrl = rawAvatar
    ? rawAvatar.startsWith("http")
      ? rawAvatar
      : `${FILE_BASE}${rawAvatar.startsWith("/") ? rawAvatar : `/${rawAvatar}`}`
    : null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      setOpen(false);
      navigate("/login", { replace: true });
    }
  };

  const isAuthed = !!user;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="w-full">
      {/* Top white bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-screen-2xl h-14 px-4 flex items-center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center shrink-0 mr-5" aria-label="Go to dashboard">
            <img
              src={logo}
              alt="HRM Logo"
              className="h-8 w-auto"
              onError={(e) => {
                if (e.currentTarget.src !== fallbackLogo) e.currentTarget.src = fallbackLogo;
              }}
            />
          </Link>

          {/* Menu */}
          <nav className="hidden md:flex flex-wrap justify-center items-end gap-6 text-slate-500 flex-1">
            {menu.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              const Icon = item.Icon;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`group mx-auto flex flex-col items-center justify-center leading-none px-2 ${isActive ? "text-customRed" : "hover:text-customRed"}`}
                >
                  <Icon className={`text-[18px] mb-1 ${isActive ? "text-customRed" : "text-slate-500 opacity-80 group-hover:text-customRed"}`} />
                  <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
                  {isActive ? (
                    <span className="mt-1 h-0.5 w-8 bg-customRed rounded-full" />
                  ) : (
                    <span className="mt-1 h-0.5 w-8 bg-transparent group-hover:bg-customRed rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: bell + user */}
          <div className="ml-5 pl-5 border-l border-gray-200 flex items-center gap-4 relative">
            <div className="relative" ref={notifyRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-slate-500 hover:text-customLightGrey pt-1.5"
                aria-label="Notifications"
                type="button"
              >
                <FaBell className="text-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 -right-1 min-w-[14px] h-[14px] flex items-center justify-center bg-red-600 text-white text-[8px] font-bold rounded-full px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-10 w-72 sm:w-80 rounded-md border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] text-customRed hover:underline">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && markRead(n.id)}
                          className={`px-3 py-2.5 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-red-50/30" : ""}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? "bg-red-500" : "bg-gray-200"}`} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-bold text-gray-800 leading-tight mb-0.5">{n.title}</div>
                              <div className="text-[11px] text-gray-600 leading-normal line-clamp-2">{n.message}</div>
                              <div className="text-[9px] text-gray-400 mt-1">
                                {new Date(n.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {isAuthed && (
              <>
                <button
                  ref={btnRef}
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-label="User menu"
                  type="button"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User" className="h-7 w-7 rounded-full object-cover border border-red-200" />
                  ) : (
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white text-[11px] font-bold">
                      {initials}
                    </span>
                  )}
                  <span className="hidden sm:block text-xs text-slate-700 max-w-[140px] truncate">{userName}</span>
                </button>

                {open && (
                  <div ref={dropdownRef} role="menu" className="absolute right-0 top-10 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-50">
                    <div className="px-3 py-2 border-b">
                      <div className="text-xs text-slate-500">Signed in as</div>
                      <div className="text-sm font-medium text-slate-800 truncate">{userName}</div>
                      {user?.role && <div className="text-[11px] text-slate-500" aria-label="Role">{user.role}</div>}
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                      role="menuitem"
                    >
                      <FaUser className="opacity-70" />
                      My Profile
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                      role="menuitem"
                    >
                      <FaCog className="opacity-70" />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                      type="button"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-customRed text-white h-7 text-xs">
        <div className="mx-auto max-w-screen-2xl h-full px-4 flex items-center">
          <span className="uppercase tracking-wide">{activeLabel}</span>
        </div>
      </div>
    </header>
  );
}
