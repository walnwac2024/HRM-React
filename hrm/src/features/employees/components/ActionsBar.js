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
    <div className="mt-6 mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Zone 1 & 2 Container (Stacked on mobile, Row on tablet+) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
        {/* Zone 1: Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApply}
            className="btn-primary h-10 px-6 font-bold flex-1 sm:flex-none"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClear}
            className="btn-outline h-10 px-4 flex-1 sm:flex-none"
          >
            Clear
          </button>
        </div>

        {/* Divider (Hidden on mobile) */}
        <div className="hidden sm:block w-px h-6 bg-slate-200" />

        {/* Zone 2: Utilities */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center px-3 h-10 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 flex-1 sm:flex-none">
            <span className="mr-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider hidden xs:block">Show</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="bg-transparent outline-none font-bold text-slate-800 cursor-pointer flex-1"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenExport(true)}
              className="btn-outline h-10 px-3 flex items-center gap-2 text-sm font-medium"
              title="Export Data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export
            </button>

            <button
              type="button"
              onClick={onOpenUpload}
              className="btn-outline h-10 px-3 flex items-center gap-2 text-sm font-medium"
              title="Import Excel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Import
            </button>

            <button
              type="button"
              onClick={onSendCreds}
              className="btn-outline h-10 px-3 flex items-center gap-2 text-sm font-medium"
              title="Send Credentials"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              Creds
            </button>
          </div>
        </div>
      </div>

      {/* Zone 3: Primary CTA */}
      <div className="pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex md:block">
        <button
          type="button"
          onClick={onAddNew}
          className="btn-primary w-full md:w-auto shadow-lg shadow-customRed/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Employee
        </button>
      </div>
    </div>
  );
}
