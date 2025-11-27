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
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onApply}
          className="h-9 px-4 rounded-md bg-customRed text-white text-sm font-medium hover:bg-customRed/90"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={onClear}
          className="h-9 px-4 rounded-md border border-customRed text-customRed text-sm font-medium bg-white hover:bg-customRed/5"
        >
          Clear Filters
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span>
          Show{" "}
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border border-slate-300 rounded px-2 py-1 text-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>{" "}
          Records ({total ?? 0})
        </span>

        <button
          type="button"
          onClick={() => setOpenExport(true)}
          className="h-9 px-4 rounded-md bg-customRed text-white text-sm font-medium hover:bg-customRed/90"
        >
          Export Data
        </button>
        <button
          type="button"
          onClick={onOpenUpload}
          className="h-9 px-4 rounded-md bg-white border border-customRed text-customRed text-sm font-medium hover:bg-customRed/5"
        >
          Upload Excel
        </button>
        <button
          type="button"
          onClick={onSendCreds}
          className="h-9 px-4 rounded-md bg-customRed text-white text-sm font-medium hover:bg-customRed/90"
        >
          Send Credentials
        </button>
        <button
          type="button"
          onClick={onAddNew}
          className="h-9 px-4 rounded-md bg-customRed text-white text-sm font-medium hover:bg-customRed/90"
        >
          + Add New Employee
        </button>
      </div>
    </div>
  );
}
