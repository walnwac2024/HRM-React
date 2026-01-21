import React from "react";

/* tolerant helpers copied from RequestTable to keep look/feel + data mapping */
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

export default function ExemptionTable({
  rows = [],
  page = 1,
  pageCount = 1,
  onPrev = () => { },
  onNext = () => { },
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageCount = Math.max(1, Number(pageCount) || 1);
  const canPrev = safePage > 1;
  const canNext = safePage < safePageCount;

  return (
    <div className="card !overflow-visible">
      <div className="table-scroll">
        <table className="min-w-full text-sm table-auto sm:table-fixed">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-12 hidden sm:table-cell">S#</th>
              <th className="px-4 py-3 min-w-[200px]">Employee</th>
              <th className="px-4 py-3 w-40">Date</th>
              <th className="px-4 py-3 w-40">Flag Type</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3 min-w-[150px]">Details</th>
              <th className="px-4 py-3 w-16 text-right sticky right-0 bg-slate-50">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-outfit">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400 italic">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const name =
                  pick(row, "employee.name", "employee.fullName", "employeeName", "name", "fullName") ||
                  [pick(row, "firstName", "employee.firstName"), pick(row, "lastName", "employee.lastName")]
                    .filter(Boolean)
                    .join(" ");

                const code = pick(row, "employee.code", "employeeCode", "code", "empCode");
                const punch = pick(row, "employee.punch", "punch", "punchCode");
                const date = fmtDate(pick(row, "date", "exemptionDate", "exemption_date"));
                const flagType = pick(row, "flagType", "flag", "flag_type");
                const status = pick(row, "status", "state");
                const details = pick(row, "details", "reason", "note", "description");

                return (
                  <tr key={row.id ?? idx} className="hover:bg-slate-50/80 transition-colors border-b last:border-0 font-outfit">
                    <td className="px-4 py-4 align-top text-xs text-slate-400 hidden sm:table-cell font-mono">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-bold text-slate-800 leading-tight truncate text-[14px]">
                        {name || "—"}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 font-medium">
                        <span className="opacity-60">ID:</span> {code || "—"} <span className="mx-1">•</span> <span className="opacity-60">Punch:</span> {punch || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top text-slate-600">
                      <div className="font-medium text-[13px]">{date || "—"}</div>
                    </td>

                    <td className="px-4 py-4 align-top text-slate-600">
                      <div className="text-[13px]">{flagType || "—"}</div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span className={`badge ${statusClass(status)}`}>{status || "—"}</span>
                    </td>

                    <td className="px-4 py-4 align-top text-slate-500 text-[13px] whitespace-pre-line leading-relaxed">
                      {details || "—"}
                    </td>

                    <td className="px-4 py-3 align-top text-right sticky right-0">
                      <button className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-customRed hover:bg-red-50 transition-colors">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 flex items-center justify-between text-sm pagination-safe">
        <div className="text-slate-500 font-medium">
          Page {safePage} of {safePageCount}
        </div>
        <div className="space-x-2">
          <button
            type="button"
            className="btn-outline"
            onClick={onPrev}
            disabled={!canPrev}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={onNext}
            disabled={!canNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
