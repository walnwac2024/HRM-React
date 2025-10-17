import React, { useState } from "react";
import { MoreVertical, Eye, CheckCircle, FileDown } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function AttendanceApprovalTable({ rows, onView, onForceApprove, onDownload }) {
  const RowActionMenu = ({ onView, onForceApprove, onDownload }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button className="rounded-md border border-gray-300 bg-white p-1 hover:bg-gray-50" onClick={() => setOpen((s) => !s)}>
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
        {open && (
          <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-md border border-gray-200 bg-white text-sm shadow-md">
            <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50" onClick={() => { setOpen(false); onView(); }}>
              <Eye className="h-4 w-4" /> View
            </button>
            <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50" onClick={() => { setOpen(false); onForceApprove(); }}>
              <CheckCircle className="h-4 w-4" /> Forcefully Approved
            </button>
            <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50" onClick={() => { setOpen(false); onDownload(); }}>
              <FileDown className="h-4 w-4" /> Download
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
            <tr>
              {["S#", "Employee", "Employee Details", "Request Date", "Request Type", "Status", "Forwarded On", "Is From Dashboard", "Details", "Approvals", "Action"].map((h) => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-500">No records found.</td></tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.id} className="border-t text-gray-800 hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline">{r.employee?.name}</button>
                    <div className="text-xs text-gray-500">({r.employee?.code})</div>
                  </td>
                  <td className="whitespace-pre-line px-4 py-3 text-xs text-gray-600">{r.employeeDetails}</td>
                  <td className="px-4 py-3">{r.requestDate}</td>
                  <td className="px-4 py-3">{r.requestType}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">{r.forwardedOn}</td>
                  <td className="px-4 py-3">{r.isFromDashboard ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">
                    <RowActionMenu
                      onView={() => onView?.(r)}
                      onForceApprove={() => onForceApprove?.(r)}
                      onDownload={() => onDownload?.(r)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
