import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function DashboardTabsLayout() {
  // use absolute paths so clicks don't stack
  const tabs = [
    { label: "Home",                 to: "/dashboard" },
    { label: "HR Dashboard",         to: "/dashboard/hr" },
    { label: "Payroll Dashboard",    to: "/dashboard/payroll" },
    { label: "Recruitment Dashboard",to: "/dashboard/recruitment" },
    { label: "Organcogram",          to: "/dashboard/organcogram" },
  ];

  const { pathname } = useLocation();

  return (
    <>
      <div className="bg-white border-b rounded-t-xl mb-3 sm:mb-4">
        <div className="px-2 sm:px-4 py-1.5 sm:py-2 flex gap-2 overflow-x-auto">
          {tabs.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              // Home should only be active on /dashboard (not on /dashboard/hr, etc.)
              end={to === "/dashboard"}
              className={({ isActive }) =>
                [
                  "px-3 sm:px-4 py-1.5 text-[11px] sm:text-[12px] uppercase tracking-wide rounded-t-md border transition-colors",
                  isActive
                    ? "bg-customRed text-white border-customRed shadow-sm"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </>
  );
}
