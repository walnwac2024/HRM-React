import React from "react";

export default function ActionsBar({
  onApply,          // handled by the form submit; button stays type="submit"
  onClear,
  perPage,
  setPerPage,
  setOpenExport,
  onUploadExcel,    // legacy callback (kept as fallback)
  onSendCreds,
  onAddNew,
  total,
  onOpenUpload,     // preferred: opens the UploadExcel modal (UI only)
}) {
  const handleUploadClick = () => {
    // prefer the new UI modal opener, otherwise fall back to legacy handler
    if (onOpenUpload) onOpenUpload();
    else if (onUploadExcel) onUploadExcel();
  };

  const handlePerPage = (e) => setPerPage?.(Number(e.target.value));

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 w-full">
      {/* Submit relies on form onSubmit=onApply to avoid calling it twice */}
      <button
        type="submit"
        className="h-8 px-4 rounded bg-customRed text-white hover:bg-customRed/90 text-sm"
      >
        Apply
      </button>

      <button
        type="button"
        onClick={onClear}
        className="h-8 px-4 inline-flex items-center rounded border border-customRed text-customRed bg-white hover:bg-customRed/10 text-sm"
      >
        Clear Filters
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-slate-600">Show</span>

        <label htmlFor="per-page" className="sr-only">Records per page</label>
        <select
          id="per-page"
          value={perPage}
          onChange={handlePerPage}
          className="h-8 rounded border-slate-300 text-sm focus:border-customRed focus:ring-customRed"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <span className="text-sm text-slate-600">
          Records ({total ?? 0})
        </span>

        <button
          type="button"
          onClick={() => setOpenExport?.(true)}
          className="h-8 px-3 inline-flex items-center gap-1 rounded bg-customRed text-white hover:bg-customRed/90 text-sm"
        >
          <i className="fas fa-file-export text-[12px]" />
          <span className="hidden sm:inline">Export Data</span>
        </button>

        <button
          type="button"
          onClick={handleUploadClick}
          className="h-8 px-3 inline-flex items-center gap-1 rounded border border-customRed text-customRed bg-white hover:bg-customRed/10 text-sm"
        >
          <i className="fas fa-file-upload text-[12px]" />
          <span className="hidden sm:inline">Upload Excel</span>
        </button>

        <button
          type="button"
          onClick={onSendCreds}
          className="h-8 px-3 inline-flex items-center gap-1 rounded bg-customRed text-white hover:bg-customRed/90 text-sm"
        >
          <i className="fas fa-paper-plane text-[12px]" />
          <span className="hidden sm:inline">Send Credentials</span>
        </button>

        <button
          type="button"
          onClick={onAddNew}
          className="h-8 px-3 inline-flex items-center gap-1 rounded bg-customRed text-white hover:bg-customRed/90 text-sm"
        >
          <i className="fas fa-user-plus text-[12px]" />
          <span className="hidden sm:inline">+ Add New Employee</span>
        </button>
      </div>
    </div>
  );
}
