import React, { useState } from "react";

export default function EmployeesTable({ rows, firstItem, onViewEmployee }) {
  const [openRowId, setOpenRowId] = useState(null);

  const toggleMenu = (id) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0] || "";
    return `${parts[0][0] || ""}${parts[1][0] || ""}`;
  };

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
                const name = row.employee_name || row.name || "—";
                const code = row.employee_code || row.employeeCode || "—";

                return (
                  <tr
                    key={row.id ?? idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 align-top text-xs text-slate-500">
                      {firstItem + idx}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase">
                          {getInitials(name)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 leading-snug">
                            {name}
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
                      {row.department || "—"}
                    </td>

                    <td className="px-4 py-3 align-top text-sm text-slate-700">
                      {row.station || "—"}
                    </td>

                    <td className="px-4 py-3 align-top text-sm text-slate-700">
                      {row.designation || "—"}
                    </td>

                    <td className="px-4 py-3 align-top text-right relative">
                      <button
                        type="button"
                        onClick={() => toggleMenu(row.id)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1 transition ${
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
                              onViewEmployee && onViewEmployee(row);
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
                            onClick={() => setOpenRowId(null)}
                          >
                            <span className="inline-flex h-4 w-4 items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-4 w-4"
                              >
                                <path
                                  d="M12 6.75v10.5M6.75 12h10.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            <span>Additional information</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-slate-50"
                            onClick={() => setOpenRowId(null)}
                          >
                            <span className="inline-flex h-4 w-4 items-center justify-center">
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
                            </span>
                            <span>Mark inactive</span>
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
