// src/components/pages/Topbar/Topbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome, FaCog, FaUsers, FaUser, FaCalendarAlt,
  FaCalendarCheck, FaChartLine, FaThLarge, FaChartBar, FaBell, FaClock
} from "react-icons/fa";

const menu = [
  { key: "dashboard",    label: "Dashboard",    Icon: FaHome,          to: "/dashboard" },
  { key: "organization", label: "Organization", Icon: FaCog,           to: "/organization" },
  { key: "recruitment",  label: "Recruitment",  Icon: FaUsers,         to: "/recruitment" },
  { key: "employee",     label: "Employee",     Icon: FaUser,          to: "/employees" },
  { key: "timesheet",    label: "Timesheet",    Icon: FaCalendarAlt,   to: "/timesheet" },
  { key: "leave",        label: "Leave",        Icon: FaCalendarCheck, to: "/leave" },
  { key: "attendance",   label: "Attendance",   Icon: FaClock,         to: "/attendance" }, // Added
  { key: "performance",  label: "Performance",  Icon: FaChartLine,     to: "/performance" },
  { key: "payroll",      label: "Payroll",      Icon: FaThLarge,       to: "/payroll" },
  { key: "reports",      label: "Reports",      Icon: FaChartBar,      to: "/reports" },
];

function getInitials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Topbar({ userName = "User", logoSrc }) {
  const location = useLocation();

  // Default to public/hrm-logo.png; use PUBLIC_URL so it works under any base path
  const defaultLogo = `${process.env.PUBLIC_URL}/hrm-logo.png`;
  const fallbackLogo = `${process.env.PUBLIC_URL}/logo192.png`;
  const logo = logoSrc || defaultLogo;

  const activeMenu = menu.find((m) => location.pathname.startsWith(m.to));
  const activeLabel = activeMenu?.label ?? "";

  return (
    <header className="w-full">
      {/* Top white bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-screen-2xl h-14 px-4 flex items-center">
          {/* Left: logo (clickable) */}
          <Link
            to="/dashboard"
            className="flex items-center shrink-0 mr-5"
            aria-label="Go to dashboard"
          >
            <img
              src={logo}
              alt="HRM Logo"
              className="h-8 w-auto"
              onError={(e) => {
                if (e.currentTarget.src !== fallbackLogo) {
                  e.currentTarget.src = fallbackLogo;
                }
              }}
            />
          </Link>

          {/* Center: menu (wrap to avoid horizontal scroll) */}
          <nav className="hidden md:flex flex-wrap justify-center items-end gap-6 text-slate-500 flex-1">
            {menu.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              const Icon = item.Icon;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`group mx-auto flex flex-col items-center justify-center leading-none px-2 ${
                    isActive ? "text-customRed" : "hover:text-customRed"
                  }`}
                >
                  <Icon
                    className={`text-[18px] mb-1 ${
                      isActive
                        ? "text-customRed"
                        : "text-slate-500 opacity-80 group-hover:text-customRed"
                    }`}
                  />
                  <span className="text-[10px] uppercase tracking-wide">
                    {item.label}
                  </span>
                  {isActive ? (
                    <span className="mt-1 h-0.5 w-8 bg-customRed rounded-full" />
                  ) : (
                    <span className="mt-1 h-0.5 w-8 bg-transparent group-hover:bg-customRed rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: divider + bell + user chip */}
          <div className="ml-5 pl-5 border-l border-gray-200 flex items-center gap-4">
            <button
              className="relative text-slate-500 hover:text-customLightGrey"
              aria-label="Notifications"
            >
              <FaBell className="text-[18px]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full" />
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white text-[11px] font-bold">
                {getInitials(userName)}
              </span>
              <span className="hidden sm:block text-xs text-slate-700 max-w-[140px] truncate">
                {userName}
              </span>
            </div>
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
