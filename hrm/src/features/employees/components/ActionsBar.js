// src/features/employees/components/ActionsBar.js
import React from "react";

export default function ActionsBar({
  onApply,
  onClear,
  perPage,
  setPerPage,
  setOpenExport,
  onOpenUpload,
  onSendCreds,
  onAddNew,
  total,
}) {
  return (
    <div className="mt-6 mb-6 p-2 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">

      {/* Zone 1: Filters (Left) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onApply}
          className="btn-outline h-10 px-6 bg-white border-slate-200 text-slate-700 hover:border-customRed hover:text-customRed"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={onClear}
          className="btn-ghost h-10 px-4 text-slate-500 hover:text-slate-800"
        >
          Clear
        </button>
      </div>

      {/* Zone 2: Utilities (Center) */}
      <div className="flex items-center gap-1">
        <div className="flex items-center mr-2 px-3 h-10 bg-white rounded-xl border border-slate-200 text-sm text-slate-600">
          <span className="mr-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">Show</span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="bg-transparent outline-none font-semibold text-slate-800 cursor-pointer"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="w-px h-6 bg-slate-300 mx-2" />

        <button
          type="button"
          onClick={() => setOpenExport(true)}
          className="btn-ghost h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-customRed hover:bg-white hover:shadow-sm"
          title="Export Data"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </button>

        <button
          type="button"
          onClick={onOpenUpload}
          className="btn-ghost h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-customRed hover:bg-white hover:shadow-sm"
          title="Upload Excel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        </button>

        <button
          type="button"
          onClick={onSendCreds}
          className="btn-ghost h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-customRed hover:bg-white hover:shadow-sm"
          title="Send Credentials"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
        </button>
      </div>

      {/* Zone 3: Primary CTA (Right) */}
      <div>
        <button
          type="button"
          onClick={onAddNew}
          className="btn-primary shadow-lg shadow-customRed/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Employee
        </button>
      </div>
    </div>
  );
}
