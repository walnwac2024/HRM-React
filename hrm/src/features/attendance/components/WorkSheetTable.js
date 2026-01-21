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
    <div className="card !overflow-visible">
      <div className="table-scroll">
        <table className="min-w-full text-sm table-auto sm:table-fixed">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-12 hidden sm:table-cell">S#</th>
              <th className="px-4 py-3 min-w-[200px]">Employee</th>
              <th className="px-4 py-3 min-w-[150px]">Title</th>
              <th className="px-4 py-3 w-40">Date</th>
              <th className="px-4 py-3 min-w-[200px]">Description</th>
              <th className="px-4 py-3 w-16 text-right sticky right-0 bg-slate-50">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-outfit">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">
                  No worksheet found.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.id ?? idx} className="hover:bg-slate-50/80 transition-colors border-b last:border-0 font-outfit">
                  <td className="px-4 py-4 align-top text-xs text-slate-400 hidden sm:table-cell font-mono">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-bold text-slate-800 leading-tight truncate text-[14px]">
                      {r.employee || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600 text-[13px]">
                    {r.title || "—"}
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600 text-[13px]">
                    {r.date || "—"}
                  </td>
                  <td className="px-4 py-4 align-top text-slate-500 text-[13px] whitespace-pre-line leading-relaxed">
                    {r.desc || "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-right sticky right-0">
                    <button className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-customRed hover:bg-red-50 transition-colors">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
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
