import React from "react";

export default function RemoteWorkTable({
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

  const statusClass = (s = "") => {
    const v = String(s).toLowerCase();
    if (v.includes("pending")) return "badge badge-red";
    if (v.includes("approve")) return "badge badge-green";
    return "badge badge-gray";
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="thead">
              <tr>
                <th className="th w-10">S#</th>
                <th className="th min-w-[240px]">Employee</th>
                <th className="th">Employee Details</th>
                <th className="th w-44">Remote Work Date</th>
                <th className="th w-32">Status</th>
                <th className="th w-44">Added On</th>
                <th className="th">Details</th>
                <th className="th w-40">Approvals</th>
                <th className="th w-16 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="td text-center text-sm text-gray-500">
                    No record found
                  </td>
                </tr>
              )}

              {rows.map((r, idx) => (
                <tr key={r.id ?? idx} className="tr">
                  <td className="td">{idx + 1}</td>

                  <td className="td">
                    <div className="font-medium text-gray-900">{r.employee?.name || r.employee || "—"}</div>
                    <div className="text-[13px] text-gray-500">
                      Code: {r.employee?.code || "—"} <span className="mx-1">•</span>
                      Punch: {r.employee?.punch || "—"}
                    </div>
                  </td>

                  <td className="td">{r.employeeDetails || "—"}</td>
                  <td className="td">{r.remoteDate || "—"}</td>

                  <td className="td">
                    <span className={statusClass(r.status)}>{r.status || "Pending"}</span>
                  </td>

                  <td className="td">{r.addedOn || "—"}</td>
                  <td className="td whitespace-pre-line">{r.details || "—"}</td>
                  <td className="td">{r.approvals || "—"}</td>

                  <td className="td text-right">
                    <button className="kebab" aria-label="Actions">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between pagination-safe">
          <span className="text-sm text-gray-600">
            Page {safePage} of {safePageCount}
          </span>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={onPrev} disabled={!canPrev}>Previous</button>
            <button className="btn-outline" onClick={onNext} disabled={!canNext}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
