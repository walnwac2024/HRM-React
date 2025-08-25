import React from "react";

const MENU = [
  { key: "employee-list", label: "Employee List", icon: IconList },
  { key: "employee-profile-request", label: "Employee Profile Request", icon: IconProfile },
  { key: "employee-transfer", label: "Employee Transfer", icon: IconTransfer },
  { key: "employee-role", label: "Employee Role", icon: IconShield },
  { key: "employee-info-request", label: "Employee Info Request", icon: IconInfo },
  { key: "employee-approvals", label: "Employee Approvals", icon: IconCheck },
  { key: "employee-settings", label: "Employee Settings", icon: IconSettings },
];

export default function EmployeeSidebar({ activeKey, onNavigate }) {
  return (
    <aside className="w-60 shrink-0 ml-4">
      <div className="sticky top-20">
        {/* 🔽 height reduced here */}
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
              {MENU.map((item) => {
                const Icon = item.icon;
                const isActive = activeKey === item.key;

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
