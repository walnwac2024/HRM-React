import React, { useState, memo } from "react";

function EmployeesTable({
  rows = [],
  firstItem = 1,
  onViewEmployee,
  onEditEmployee,
  onMarkInactive, // ✅ now toggles: active->inactive OR inactive->active (parent decides)
}) {
  const [openRowId, setOpenRowId] = useState(null);

  const toggleMenu = (id) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
    return `${parts[0][0]?.toUpperCase() || ""}${
      parts[1][0]?.toUpperCase() || ""
    }`;
  };

  // Use same base-url logic as profile/topbar
  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/v1";
  const FILE_BASE = API_BASE.replace(/\/api\/v1\/?$/, "");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100/80 border-b border-slate-200">
            <tr className="text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
              <th className="px-4 py-2 w-12">S#</th>
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Station</th>
              <th className="px-4 py-2">Designation</th>
              <th className="px-4 py-2 w-16 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const isOpen = openRowId === row.id;

                const name =
                  row.employee_name || row.Employee_Name || row.name || "—";
                const code =
                  row.employee_code ||
                  row.employeeCode ||
                  row.Employee_ID ||
                  "—";
                const department = row.department || row.Department || "—";
                const station =
                  row.station || row.Office_Location || row.location || "—";
                const designation =
                  row.designation || row.Designations || row.title || "—";

                const isInactive =
                  row.isActive === false || Number(row.isActive) === 0;

                const avatarUrl = row.profile_picture
                  ? `${FILE_BASE}${row.profile_picture}`
                  : null;
                const initials = getInitials(name);

                return (
                  <tr
                    key={row.id ?? `${firstItem}-${idx}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isInactive ? "opacity-70" : ""
                    }`}
                  >
                    <td className="px-4 py-3 align-top text-xs text-slate-500">
                      {firstItem + idx}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        {/* Avatar / initials */}
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={name}
                            className="mt-0.5 h-9 w-9 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase">
                            {initials}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-slate-800 leading-snug truncate">
                              {name}
                            </div>

                            {isInactive && (
                              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                Inactive
                              </span>
                            )}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            <span className="font-medium text-slate-600">
                              Code:
                            </span>{" "}
                            {code}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top text-sm text-slate-700">
                      {department}
                    </td>

                    <td className="px-4 py-3 align-top text-sm text-slate-700">
                      {station}
                    </td>

                    <td className="px-4 py-3 align-top text-sm text-slate-700">
                      {designation}
                    </td>

                    <td className="px-4 py-3 align-top text-right relative">
                      <button
                        type="button"
                        onClick={() => toggleMenu(row.id)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200 hover:bg-slate-50 transition ${
                          isOpen ? "bg-slate-100 text-slate-700" : ""
                        }`}
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                      >
                        <span className="sr-only">Actions</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div
                          className="absolute right-0 mt-2 w-44 origin-top-right rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 z-20"
                          role="menu"
                        >
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setOpenRowId(null);
                              onViewEmployee?.(row);
                            }}
                          >
                            <span className="inline-flex h-4 w-4 items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-4 w-4"
                              >
                                <path
                                  d="M2.25 12s2.25-5.25 9.75-5.25S21.75 12 21.75 12 19.5 17.25 12 17.25 2.25 12 2.25 12z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="2.25"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </span>
                            <span>View employee</span>
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setOpenRowId(null);
                              onEditEmployee?.(row);
                            }}
                          >
                            <span className="inline-flex h-4 w-4 items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-4 w-4"
                              >
                                <path
                                  d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.121L15.621 4a1.5 1.5 0 0 0-2.121 0L4 13.879V20z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            <span>Edit employee</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 ${
                              isInactive ? "text-emerald-600" : "text-red-600"
                            }`}
                            onClick={() => {
                              setOpenRowId(null);
                              onMarkInactive?.(row); // ✅ parent toggles based on row.isActive
                            }}
                          >
                            <span className="inline-flex h-4 w-4 items-center justify-center">
                              {isInactive ? (
                                // check icon
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="h-4 w-4"
                                >
                                  <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : (
                                // X icon
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="h-4 w-4"
                                >
                                  <path
                                    d="M15 9l-6 6m0-6l6 6"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span>{isInactive ? "Activate employee" : "Mark inactive"}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(EmployeesTable);
