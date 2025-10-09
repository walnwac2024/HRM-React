// src/features/employees/components/EmployeeSidebar.js
import React, { useEffect, useState } from "react";

/** Uniform menu icon (Attendance uses the same icon for all items) */
function MenuIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-[14px] w-[14px] ${className}`} fill="currentColor">
      <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
    </svg>
  );
}

const MENU = [
  { key: "employee-list", label: "Employee List" },
  { key: "employee-profile-request", label: "Employee Profile Request" },
  { key: "employee-transfer", label: "Employee Transfer" },
  // Employee Role is below as a collapsible section
  { key: "employee-info-request", label: "Employee Info Request" },
  { key: "employee-approvals", label: "Employee Approvals" },
  { key: "employee-settings", label: "Employee Settings" },
];

const ROLE_SUBMENU = [
  { key: "employee-role/main", label: "Employee Role" },
  { key: "employee-role/copy", label: "Copy Role" },
  { key: "employee-role/templates", label: "Role Templates" },
];

export default function EmployeeSidebar({ activeKey = "", onNavigate }) {
  const [roleOpen, setRoleOpen] = useState(false);

  useEffect(() => {
    if (activeKey.startsWith("employee-role")) setRoleOpen(true);
  }, [activeKey]);

  const itemBase =
    "group relative grid grid-cols-[18px_1fr] items-center w-full h-9 rounded-md pl-3 pr-2 text-left text-[13px] font-medium outline-none transition-colors";
  const leftBarBase =
    "pointer-events-none absolute left-0 top-1.5 h-[calc(100%-12px)] w-[4px] rounded-r";
  const iconBase = "h-[14px] w-[14px]";

  return (
    <aside className="w-60 shrink-0 ml-4">
      <div className="sticky top-20">
        <div className="min-h-[500px] max-h-[650px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow">
          {/* Header (matches Attendance) */}
          <div className="px-4 pt-3 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Employee
            </span>
          </div>

          {/* List */}
          <nav className="px-2 pb-3">
            <ul className="space-y-1.5">
              {/* top 3 items */}
              {MENU.slice(0, 3).map((item) => {
                const isActive = activeKey === item.key;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className={`${itemBase} ${
                        isActive
                          ? "bg-customRed/10 text-customRed"
                          : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`${leftBarBase} ${
                          isActive ? "bg-customRed" : "bg-transparent group-hover:bg-slate-300"
                        }`}
                      />
                      <MenuIcon
                        className={`${iconBase} ${
                          isActive ? "text-customRed" : "text-slate-500 group-hover:text-slate-700"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}

              {/* Employee Role (collapsible), matches Attendance item with chevron */}
              <li>
                <button
                  type="button"
                  onClick={() => setRoleOpen((v) => !v)}
                  aria-expanded={roleOpen}
                  className={`${itemBase} ${
                    activeKey.startsWith("employee-role")
                      ? "bg-customRed/10 text-customRed"
                      : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                  }`}
                >
                  <span
                    className={`${leftBarBase} ${
                      activeKey.startsWith("employee-role")
                        ? "bg-customRed"
                        : "bg-transparent group-hover:bg-slate-300"
                    }`}
                  />
                  <MenuIcon
                    className={`${iconBase} ${
                      activeKey.startsWith("employee-role")
                        ? "text-customRed"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  <span className="truncate">Employee Role</span>
                  <span className="pointer-events-none absolute right-2 text-slate-500 group-hover:text-slate-700">
                    {roleOpen ? (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    ) : (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </span>
                </button>

                {roleOpen && (
                  <div className="mt-1 ml-7">
                    {ROLE_SUBMENU.map((sub) => {
                      const active = activeKey === sub.key;
                      return (
                        <button
                          key={sub.key}
                          type="button"
                          onClick={() => onNavigate?.(sub.key)}
                          className={`w-full text-left px-3 py-1.5 rounded text-[13px] transition-colors ${
                            active
                              ? "text-customRed font-semibold bg-customRed/10"
                              : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>

              {/* rest of items */}
              {MENU.slice(3).map((item) => {
                const isActive = activeKey === item.key;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className={`${itemBase} ${
                        isActive
                          ? "bg-customRed/10 text-customRed"
                          : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`${leftBarBase} ${
                          isActive ? "bg-customRed" : "bg-transparent group-hover:bg-slate-300"
                        }`}
                      />
                      <MenuIcon
                        className={`${iconBase} ${
                          isActive ? "text-customRed" : "text-slate-500 group-hover:text-slate-700"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
}
