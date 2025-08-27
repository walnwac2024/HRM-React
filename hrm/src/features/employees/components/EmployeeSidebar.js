// src/features/employees/components/EmployeeSidebar.js
import React, { useEffect, useState } from "react";

/* Top-level items (Employee Role handled below as a collapsible item) */
const MENU = [
  { key: "employee-list", label: "Employee List", icon: IconList },
  { key: "employee-profile-request", label: "Employee Profile Request", icon: IconProfile },
  { key: "employee-transfer", label: "Employee Transfer", icon: IconTransfer },
  // NOTE: Employee Role will be inserted as a collapsible *below* this list.
  { key: "employee-info-request", label: "Employee Info Request", icon: IconInfo },
  { key: "employee-approvals", label: "Employee Approvals", icon: IconCheck },
  { key: "employee-settings", label: "Employee Settings", icon: IconSettings },
];

const ROLE_SUBMENU = [
  { key: "employee-role/main", label: "Employee Role" },
  { key: "employee-role/copy", label: "Copy Role" },
  { key: "employee-role/templates", label: "Role Templates" },
];

export default function EmployeeSidebar({ activeKey, onNavigate }) {
  const [roleOpen, setRoleOpen] = useState(false);

  // Auto-open the Role group if any of its children are active
  useEffect(() => {
    if ((activeKey || "").startsWith("employee-role")) setRoleOpen(true);
  }, [activeKey]);

  const isActiveTop = (key) => activeKey === key;

  return (
    <aside className="w-60 shrink-0 ml-4">
      <div className="sticky top-20">
        <div className="min-h-[500px] max-h-[650px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Employee
            </span>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-2 pt-3">
            <ul className="space-y-1.5">
              {MENU.slice(0, 3).map((item) => {
                const Icon = item.icon;
                const isActive = isActiveTop(item.key);
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "group relative grid grid-cols-[18px_1fr] items-center",
                        "w-full h-9 rounded-md pl-3 pr-2 text-left",
                        "text-[13px] font-medium outline-none transition-colors",
                        isActive
                          ? "bg-customRed/10 text-customRed"
                          : "text-gray-700 hover:bg-gray-100 focus:bg-gray-100",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "pointer-events-none absolute left-0 top-1.5 h-[calc(100%-12px)] w-[2px] rounded-r",
                          isActive ? "bg-customRed" : "bg-transparent group-hover:bg-gray-300",
                        ].join(" ")}
                      />
                      <Icon
                        className={[
                          "h-[14px] w-[14px]",
                          isActive ? "text-customRed" : "text-gray-500 group-hover:text-gray-700",
                        ].join(" ")}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}

              {/* Employee Role (collapsible) — label remains in the same place */}
              <li>
                <button
                  type="button"
                  onClick={() => setRoleOpen((v) => !v)}
                  aria-expanded={roleOpen}
                  className={[
                    "group relative grid grid-cols-[18px_1fr] items-center",
                    "w-full h-9 rounded-md pl-3 pr-2 text-left",
                    "text-[13px] font-medium outline-none transition-colors",
                    activeKey.startsWith("employee-role")
                      ? "bg-customRed/10 text-customRed"
                      : "text-gray-700 hover:bg-gray-100 focus:bg-gray-100",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "pointer-events-none absolute left-0 top-1.5 h-[calc(100%-12px)] w-[2px] rounded-r",
                      activeKey.startsWith("employee-role")
                        ? "bg-customRed"
                        : "bg-transparent group-hover:bg-gray-300",
                    ].join(" ")}
                  />
                  <IconShield
                    className={[
                      "h-[14px] w-[14px]",
                      activeKey.startsWith("employee-role")
                        ? "text-customRed"
                        : "text-gray-500 group-hover:text-gray-700",
                    ].join(" ")}
                  />
                  <span className="truncate">Employee Role</span>

                  {/* Chevron absolutely on the right so text position never shifts */}
                  <span className="pointer-events-none absolute right-2 text-gray-500 group-hover:text-gray-700">
                    {roleOpen ? (
                      <IconChevronDown className="h-3 w-3" />
                    ) : (
                      <IconChevronRight className="h-3 w-3" />
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
                          className={[
                            "w-full text-left px-3 py-1.5 rounded",
                            "text-[13px] transition-colors",
                            active
                              ? "text-customRed font-semibold bg-customRed/10"
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
                          ].join(" ")}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>

              {/* The rest of the menu */}
              {MENU.slice(3).map((item) => {
                const Icon = item.icon;
                const isActive = isActiveTop(item.key);
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(item.key)}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "group relative grid grid-cols-[18px_1fr] items-center",
                        "w-full h-9 rounded-md pl-3 pr-2 text-left",
                        "text-[13px] font-medium outline-none transition-colors",
                        isActive
                          ? "bg-customRed/10 text-customRed"
                          : "text-gray-700 hover:bg-gray-100 focus:bg-gray-100",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "pointer-events-none absolute left-0 top-1.5 h-[calc(100%-12px)] w-[2px] rounded-r",
                          isActive ? "bg-customRed" : "bg-transparent group-hover:bg-gray-300",
                        ].join(" ")}
                      />
                      <Icon
                        className={[
                          "h-[14px] w-[14px]",
                          isActive ? "text-customRed" : "text-gray-500 group-hover:text-gray-700",
                        ].join(" ")}
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

/* ---- icons ---- */
function IconList(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>)}
function IconProfile(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.5 8.5 0 0 1 13 0"/></svg>)}
function IconTransfer(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="8 21 3 21 3 16"/></svg>)}
function IconShield(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/></svg>)}
function IconInfo(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>)}
function IconCheck(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>)}
function IconSettings(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82l-.06.06z"/></svg>)}
function IconChevronRight(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>)}
function IconChevronDown(props){return(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>)}
