import React from "react";

export default function ExportModal({ onClose, onExport }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-lg border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">Export Data</h3>
          <button className="h-7 w-7 rounded-full grid place-items-center text-slate-600 hover:text-slate-800" onClick={onClose}>&times;</button>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full grid place-items-center border-2 border-customRed">
            <i className="fas fa-file-excel text-customRed" />
          </div>
          <div className="text-slate-700 font-medium">Employees List</div>
          <p className="text-slate-500 text-sm mt-1">Download all employees as an Excel file.</p>
        </div>

        <div className="px-4 py-3 border-t flex justify-center gap-2">
          <button className="h-8 px-4 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="h-8 px-6 inline-flex items-center gap-1 rounded bg-customRed text-white hover:bg-customRed/90 text-sm" onClick={onExport}>
            <i className="fas fa-download text-[12px]" /> Export
          </button>
        </div>
      </div>
    </div>
  );
}
