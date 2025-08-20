import React, { useState, useEffect } from "react";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

export default function EmployeesTable({ rows, firstItem }) {
  // which row's action menu is open (index), or null if none
  const [openIdx, setOpenIdx] = useState(null);

  // Close on click outside or Esc
  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('[data-emp-menu="1"]')) setOpenIdx(null);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpenIdx(null);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left w-10">S#</th>
            <th className="px-4 py-2 text-left">Employee</th>
            <th className="px-4 py-2 text-left">Details</th>
            <th className="px-4 py-2 text-left">Role Template</th>
            <th className="px-4 py-2 text-left">M. Att Allow</th>
            <th className="px-4 py-2 text-left">Active</th>
            <th className="px-4 py-2 text-left">Added On</th>
            <th className="px-4 py-2 text-left">Modified On</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                No employees found.
              </td>
            </tr>
          ) : (
            rows.map((emp, i) => (
              <tr key={emp.id ?? i} className="hover:bg-slate-50">
                <td className="px-4 py-3 align-top">{firstItem + i}</td>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium">Code : {emp.code}</div>
                  <div>Punch Code : {emp.punch_code ?? "—"}</div>
                  <div>Name : {emp.employee_name}</div>
                  <div>Cnic # : {emp.cnic ?? "—"}</div>
                  <div>UserName : {emp.user_name ?? "—"}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div>Station : {emp.station ?? "—"}</div>
                  <div>Department : {emp.department ?? "—"}</div>
                  <div>Designation : {emp.designation ?? "—"}</div>
                  <div>Group : {emp.employee_group ?? "—"}</div>
                  <div>Doc Exists : {emp.documents_attached ? "Yes" : "No"}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  {emp.role_template ?? "—"}
                </td>
                <td className="px-4 py-3 align-top">
                  {emp.m_att_allow ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${
                      emp.status === "Active"
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-slate-300 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div>{fmtDate(emp.added_on)}</div>
                  <div className="text-xs text-slate-500">By System</div>
                </td>
                <td className="px-4 py-3 align-top">
                  {fmtDate(emp.modified_on)}
                </td>

                {/* === Action cell === */}
                <td className="px-4 py-3 align-top">
                  <div className="relative" data-emp-menu="1">
                    <button
                      className="p-2 rounded-md border hover:bg-slate-100 focus:border-customRed focus:ring-1 focus:ring-customRed"
                      title="More"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenIdx(openIdx === i ? null : i);
                      }}
                      data-emp-menu="1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {openIdx === i && (
                      <div
                        className="absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-lg z-20"
                        onClick={(e) => e.stopPropagation()}
                        data-emp-menu="1"
                      >
                        <div className="py-1">
                          {[
                            { label: "Edit" },
                            { label: "View Employee" },
                            { label: "Additional Information" },
                            { label: "Inactive", danger: true },
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-[13px] hover:bg-customRed/5 ${
                                item.danger ? "text-customRed" : "text-slate-700"
                              }`}
                              onClick={() => {
                                // Hook your real handlers here
                                setOpenIdx(null);
                              }}
                              data-emp-menu="1"
                            >
                              <span className="h-4 w-1.5 rounded bg-customRed shrink-0" />
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                {/* === /Action cell === */}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
