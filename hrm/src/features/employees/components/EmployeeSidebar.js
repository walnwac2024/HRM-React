import React, { useEffect, useState } from "react";

function MenuIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-[14px] w-[14px] ${className}`} fill="currentColor">
      <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
    </svg>
  );
}

const MENU = [
  { key: "employee-list", label: "Employee List" },
  { key: "employee-profile-request", label: "Employee Profile Request", status: "working" },
  { key: "employee-transfer", label: "Employee Transfer", status: "working" },
  { key: "employee-info-request", label: "Employee Info Request", status: "working" },
  { key: "employee-approvals", label: "Employee Approvals", status: "working" },
  { key: "employee-settings", label: "Employee Settings", status: "working" },
];

const ROLE_SUBMENU = [
  { key: "employee-role/main", label: "Employee Role", status: "working" },
  { key: "employee-role/copy", label: "Copy Role", status: "working" },
  { key: "employee-role/templates", label: "Role Templates", status: "working" },
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

  const badge = (
    <span className="ml-auto px-1 py-0.5 rounded bg-amber-50 text-[8px] text-amber-600 font-bold uppercase border border-amber-200">
      Working
    </span>
  );

  return (
    <aside className="w-60 shrink-0 ml-4">
      <div className="sticky top-5">
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow">
          <div className="px-4 pt-3 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Employee
            </span>
          </div>

          <nav className="px-2 pb-3">
            <ul className="space-y-1.5">
              {MENU.slice(0, 3).map((item) => {
                const isActive = activeKey === item.key;
                const isWorking = item.status === "working";
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => !isWorking && onNavigate?.(item.key)}
                      className={`${itemBase} ${isActive
                        ? "bg-customRed/10 text-customRed"
                        : isWorking
                          ? "text-slate-400 cursor-not-allowed opacity-75"
                          : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      <span
                        className={`${leftBarBase} ${isActive ? "bg-customRed" : "bg-transparent"
                          }`}
                      />
                      <MenuIcon
                        className={`${iconBase} ${isActive ? "text-customRed" : "text-slate-400"
                          }`}
                      />
                      <span className="truncate pr-1">{item.label}</span>
                      {isWorking && badge}
                    </button>
                  </li>
                );
              })}

              {/* Employee Role (collapsible) */}
              <li>
                <button
                  type="button"
                  onClick={() => setRoleOpen((v) => !v)}
                  className={`${itemBase} ${activeKey.startsWith("employee-role")
                    ? "bg-customRed/10 text-customRed"
                    : "text-slate-400 opacity-75"
                    }`}
                >
                  <span
                    className={`${leftBarBase} ${activeKey.startsWith("employee-role")
                      ? "bg-customRed"
                      : "bg-transparent"
                      }`}
                  />
                  <MenuIcon
                    className={`${iconBase} ${activeKey.startsWith("employee-role")
                      ? "text-customRed"
                      : "text-slate-400"
                      }`}
                  />
                  <span className="truncate pr-1">Employee Role</span>
                  {badge}
                </button>

                {roleOpen && (
                  <div className="mt-1 ml-7">
                    {ROLE_SUBMENU.map((sub) => {
                      const active = activeKey === sub.key;
                      return (
                        <button
                          key={sub.key}
                          type="button"
                          className={`w-full text-left px-3 py-1.5 rounded text-[13px] opacity-60 cursor-not-allowed text-slate-400`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>

              {MENU.slice(3).map((item) => {
                const isActive = activeKey === item.key;
                const isWorking = item.status === "working";
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => !isWorking && onNavigate?.(item.key)}
                      className={`${itemBase} ${isActive
                        ? "bg-customRed/10 text-customRed"
                        : isWorking
                          ? "text-slate-400 cursor-not-allowed opacity-75"
                          : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      <span
                        className={`${leftBarBase} ${isActive ? "bg-customRed" : "bg-transparent"
                          }`}
                      />
                      <MenuIcon
                        className={`${iconBase} ${isActive ? "text-customRed" : "text-slate-400"
                          }`}
                      />
                      <span className="truncate pr-1">{item.label}</span>
                      {isWorking && badge}
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
