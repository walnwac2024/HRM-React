import React from 'react';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-800">Attendance Request Form</h3>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer flex-col sm:flex-row">
          <button onClick={onClose} className="btn-outline flex-1 sm:flex-none">Cancel</button>
          <button className="btn-primary flex-1 sm:flex-none">Submit Request</button>
        </div>
      </div>
    </div>
  );
}
