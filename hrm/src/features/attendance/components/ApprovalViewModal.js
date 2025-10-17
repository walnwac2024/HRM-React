import React from "react";
import { XCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

const btnBase =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
const btnPrimary = `${btnBase} bg-red-600 text-white hover:opacity-90 focus:ring-red-600`;
const btnSecondary = `${btnBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300`;

export default function ApprovalViewModal({ open, data, onClose, onApprove, onReject }) {
  if (!open || !data) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900">Attendance Request Details</h3>
          <button className="rounded p-1 hover:bg-gray-100" onClick={onClose}>
            <XCircle className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md border border-gray-200 p-3">
              <div className="mb-2 text-sm font-semibold text-gray-700">Employee Info</div>
              <dl className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <dt className="text-gray-500">Name</dt>
                <dd>{data.employeeName || data.employee?.name}</dd>
                <dt className="text-gray-500">Code</dt>
                <dd>{data.employeeCode || data.employee?.code}</dd>
              </dl>
            </div>
            <div className="rounded-md border border-gray-200 p-3">
              <div className="mb-2 text-sm font-semibold text-gray-700">Request Details</div>
              <dl className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <dt className="text-gray-500">Type</dt><dd>{data.requestType}</dd>
                <dt className="text-gray-500">Request Date</dt><dd>{data.requestDate}</dd>
                <dt className="text-gray-500">Status</dt><dd><StatusBadge status={data.status} /></dd>
                <dt className="text-gray-500">Forwarded On</dt><dd>{data.forwardedOn}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t px-4 py-3">
          <button className={btnSecondary} onClick={onClose}>Close</button>
          <button className={btnPrimary} onClick={() => onApprove?.(data)}>Approve</button>
          <button className={btnSecondary} onClick={() => onReject?.(data)}>Reject</button>
        </div>
      </div>
    </div>
  );
}
