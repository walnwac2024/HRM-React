import React from "react";

/* --------- tolerant helpers ---------- */
const get = (obj, path) =>
  !obj ? undefined : path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);

function pick(row, ...keys) {
  for (const k of keys) {
    const v = k.includes(".") ? get(row, k) : row?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}
function fmtDate(val) {
  const v = Array.isArray(val) ? val[0] : val;
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const hasTime = d.getHours() + d.getMinutes() !== 0;
  return hasTime ? `${yyyy}-${mm}-${dd} ${hh}:${mi}` : `${yyyy}-${mm}-${dd}`;
}
function statusClass(s = "") {
  const v = String(s).toLowerCase();
  if (v.includes("pending")) return "badge-red";
  if (v.includes("active") || v.includes("approve")) return "badge-green";
  return "badge-gray";
}

/* ------------------------------ Table ------------------------------ */
export default function RequestTable({
  rows = [],
  page = 1,
  pageCount = 1,
  onPrev = () => {},
  onNext = () => {},
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageCount = Math.max(1, Number(pageCount) || 1);
  const canPrev = safePage > 1;
  const canNext = safePage < safePageCount;

  return (
    <div className="card">
      <div className="card-body">
        <div className="overflow-x-auto"> {/* keep layout tidy on small screens */}
          <table className="table">
            <thead className="thead">
              <tr>
                <th className="th w-14">S#</th>
                <th className="th min-w-[240px]">Employee</th>
                <th className="th w-44">Attendance Date</th>
                <th className="th w-44">Change Type</th>
                <th className="th w-32">Status</th>
                <th className="th">Details</th>
                <th className="th w-44">Approvals</th>
                <th className="th w-48">Added On</th>
                <th className="th w-16 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, idx) => {
                const name =
                  pick(row, "employee.name", "employee.fullName", "employeeName", "name", "fullName") ||
                  [pick(row, "firstName", "employee.firstName"), pick(row, "lastName", "employee.lastName")]
                    .filter(Boolean)
                    .join(" ");

                const code = pick(row, "employee.code", "employeeCode", "code", "empCode");
                const punch = pick(row, "employee.punch", "punch", "punchCode");
                const date = fmtDate(pick(row, "attendanceDate", "date", "attendance_date"));
                const changeType = pick(row, "changeType", "type", "change");
                const status = pick(row, "status", "state");
                const details = pick(row, "details", "reason", "note", "description");
                const approvals = pick(row, "approvals", "approver", "approvedBy", "lineManager", "lineMgr");
                const addedOn = fmtDate(pick(row, "addedOn", "createdAt", "created_on", "added_at"));

                return (
                  <tr key={row.id ?? idx} className="row tr">
                    <td className="td">{idx + 1}</td>

                    <td className="td">
                      <div className="font-medium text-gray-900">{name || "—"}</div>
                      <div className="text-[13px] text-gray-500">
                        {`Code: ${code || "—"}`} <span className="mx-1">•</span> {`Punch: ${punch || "—"}`}
                      </div>
                    </td>

                    <td className="td">{date || "—"}</td>
                    <td className="td">{changeType || "—"}</td>

                    <td className="td">
                      <span className={`badge ${statusClass(status)}`}>{status || "—"}</span>
                    </td>

                    <td className="td whitespace-pre-line">{details || "—"}</td>
                    <td className="td">{approvals || "—"}</td>
                    <td className="td">{addedOn || "—"}</td>

                    <td className="td text-right">
                      <button aria-label="Actions" className="kebab">⋯</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* bottom bar: Page X of Y (left) + disabled-aware controls (right) */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Page {safePage} of {safePageCount}
          </span>

          <div className="flex gap-2">
            <button
              className="btn-outline"
              onClick={onPrev}
              disabled={!canPrev}
              aria-disabled={!canPrev}
            >
              Previous
            </button>
            <button
              className="btn-outline"
              onClick={onNext}
              disabled={!canNext}
              aria-disabled={!canNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
