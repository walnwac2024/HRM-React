import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardTabsLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const roleList = user?.roles || [];
  if (user?.role) roleList.push(user.role);
  const isAdmin = roleList.some(r => ["admin", "super_admin", "hr", "developer"].includes(String(r).toLowerCase()));
  const feats = new Set(user?.features || []);

  const allTabs = [
    { label: "Home", to: "/dashboard" },
    { label: "HR Dashboard", to: "/dashboard/hr", code: "hr_dashboard" },
    { label: "Payroll Dashboard", to: "/dashboard/payroll", code: "payroll_dashboard" },
    { label: "Recruitment Dashboard", to: "/dashboard/recruitment", code: "recruitment_dashboard" },
    { label: "Organcogram", to: "/dashboard/organcogram", code: "organogram_view" },
    { label: "News", to: "/dashboard/news" },
  ];

  // Filter tabs: Show if Admin OR has the specific feature code
  const tabs = allTabs.filter(t => !t.code || isAdmin || feats.has(t.code.toLowerCase()));

  return (
    <>
      <div className="bg-white border-b rounded-t-xl mb-3 sm:mb-4">
        <div className="px-2 sm:px-4 py-1.5 sm:py-2 flex gap-2 overflow-x-auto">
          {tabs.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                [
                  "px-3 sm:px-4 py-1.5 text-[11px] sm:text-[12px] uppercase tracking-wide rounded-t-md border transition-colors whitespace-nowrap",
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
