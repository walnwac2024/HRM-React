import React from "react";

export default function ActionsBar({
  onApply,
  onClear,
  perPage,
  setPerPage,
  setOpenExport,
  onUploadExcel,
  onSendCreds,
  onAddNew,
  total,
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 w-full">
      <button type="submit" onClick={onApply} className="h-8 px-4 rounded bg-customRed text-white hover:bg-customRed/90 text-sm">
        Apply
      </button>

      <button type="button" onClick={onClear}
        className="h-8 px-4 inline-flex items-center rounded border border-customRed text-customRed bg-white hover:bg-customRed/10 text-sm">
        Clear Filters
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-slate-600">Show</span>
        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="h-8 rounded border-slate-300 text-sm focus:border-customRed focus:ring-customRed"
        >
          {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="text-sm text-slate-600">Records ({total})</span>

        <button type="button" onClick={() => setOpenExport(true)}
          className="h-8 px-3 inline-flex items-center gap-1 rounded bg-customRed text-white hover:bg-customRed/90 text-sm">
          <i className="fas fa-file-export text-[12px]" /> Export Data
        </button>

        <button type="button" onClick={onUploadExcel}
          className="h-8 px-3 inline-flex items-center gap-1 rounded border border-customRed text-customRed bg-white hover:bg-customRed/10 text-sm">
          <i className="fas fa-file-upload text-[12px]" /> Upload Excel
        </button>

        <button type="button" onClick={onSendCreds}
          className="h-8 px-3 inline-flex items-center gap-1 rounded bg-customRed text-white hover:bg-customRed/90 text-sm">
          <i className="fas fa-paper-plane text-[12px]" /> Send Credentials
        </button>

        <button type="button" onClick={onAddNew}
          className="h-8 px-3 inline-flex items-center gap-1 rounded bg-customRed text-white hover:bg-customRed/90 text-sm">
          <i className="fas fa-user-plus text-[12px]" /> + Add New Employee
        </button>
      </div>
    </div>
  );
}
