import React, { useState } from "react";
import { MoreVertical, Eye, CheckCircle, FileDown } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function AttendanceApprovalTable({ rows, onView, onForceApprove, onDownload }) {
  const RowActionMenu = ({ onView, onForceApprove, onDownload }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button
          className="kebab h-9 w-9"
          onClick={() => setOpen((s) => !s)}
          title="Actions"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-[5] bg-transparent" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-10 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in duration-200">
              <div className="p-1.5">
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-customRed rounded-xl transition-colors text-[13px] font-medium"
                  onClick={() => { setOpen(false); onView(); }}
                >
                  <Eye className="h-4 w-4 opacity-70" /> View Details
                </button>
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-colors text-[13px] font-medium"
                  onClick={() => { setOpen(false); onForceApprove(); }}
                >
                  <CheckCircle className="h-4 w-4 opacity-70" /> Force Approve
                </button>
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors text-[13px] font-medium"
                  onClick={() => { setOpen(false); onDownload(); }}
                >
                  <FileDown className="h-4 w-4 opacity-70" /> Download
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="card !overflow-visible">
      <div className="table-scroll">
        <table className="min-w-full text-sm table-auto sm:table-fixed">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-12 hidden sm:table-cell">S#</th>
              <th className="px-4 py-3 min-w-[200px]">Employee</th>
              <th className="px-4 py-3 w-44">Request Date</th>
              <th className="px-4 py-3 w-40">Request Type</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3 w-16 text-right sticky right-0 bg-slate-50">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-outfit">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors border-b last:border-0 font-outfit">
                  <td className="px-4 py-4 align-top text-xs text-slate-400 hidden sm:table-cell font-mono">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-bold text-slate-800 leading-tight truncate text-[14px]">
                      {r.employeeName || r.employee?.name || "—"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 font-medium">
                      <span className="opacity-60">ID:</span> {r.employeeCode || r.employee?.code || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600">
                    <div className="font-medium text-[13px]">{r.requestDate || "—"}</div>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600">
                    <div className="text-[13px]">{r.requestType || "—"}</div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-right sticky right-0">
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
