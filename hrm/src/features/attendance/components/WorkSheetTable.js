import React from "react";

export default function WorkSheetTable({
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
    <div className="card">
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="thead">
              <tr>
                <th className="th w-10">S#</th>
                <th className="th min-w-[240px]">Employee</th>
                <th className="th">Title</th>
                <th className="th w-40">Date</th>
                <th className="th">Description</th>
                <th className="th w-44">Added On</th>
                <th className="th w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="td text-center text-sm text-gray-500">
                    No record found
                  </td>
                </tr>
              )}
              {rows.map((r, idx) => (
                <tr key={r.id ?? idx} className="tr">
                  <td className="td">{idx + 1}</td>
                  <td className="td">
                    <div className="font-medium text-gray-900">{r.employee || "—"}</div>
                  </td>
                  <td className="td">{r.title || "—"}</td>
                  <td className="td">{r.date || "—"}</td>
                  <td className="td whitespace-pre-line">{r.desc || "—"}</td>
                  <td className="td">{r.addedOn || "—"}</td>
                  <td className="td text-right">
                    <button className="kebab" aria-label="Actions">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between pagination-safe">
          <span className="text-sm text-gray-600">Page {safePage} of {safePageCount}</span>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={onPrev} disabled={!canPrev}>Previous</button>
            <button className="btn-outline" onClick={onNext} disabled={!canNext}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
