import React from "react";

export default function ExportModal({ onClose, onExport }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="modal-header">
          <h3 className="font-medium text-gray-800">Export Data</h3>
          <button className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-gray-100 transition-colors" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body py-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center border-2 border-customRed">
            <i className="fas fa-file-excel text-customRed text-xl" />
          </div>
          <div className="text-slate-700 font-bold mb-1">Employees List</div>
          <p className="text-slate-500 text-sm">Download all employees as an Excel file.</p>
        </div>

        <div className="modal-footer flex-col sm:flex-row">
          <button className="btn-outline flex-1 sm:flex-none" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary flex-1 sm:flex-none inline-flex items-center justify-center gap-2" onClick={onExport}>
            <i className="fas fa-download text-[12px]" /> Export Now
          </button>
        </div>
      </div>
    </div>
  );
}
