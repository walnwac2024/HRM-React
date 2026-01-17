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
    <div className="card overflow-hidden">
      <div className="table-scroll">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="thead">
            <tr>
              {["S#", "Employee", "Employee Details", "Request Date", "Request Type", "Status", "Forwarded On", "Is From Dashboard", "Details", "Approvals", "Action"].map((h) => (
                <th key={h} className="th border-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={11} className="px-6 py-12 text-center text-slate-400 italic">No records found.</td></tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.id} className="tr border-0">
                  <td className="px-6 py-4 text-slate-400 font-medium">#{idx + 1}</td>
                  <td className="px-6 py-4">
                    <button className="text-customRed font-bold hover:underline text-left block">
                      {r.employee?.name}
                    </button>
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                      {r.employee?.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 leading-relaxed min-w-[200px]">{r.employeeDetails}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{r.requestDate}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{r.requestType}</td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-4 text-slate-500">{r.forwardedOn}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${r.isFromDashboard ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      {r.isFromDashboard ? "Dashboard" : "System"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">—</td>
                  <td className="px-6 py-4 text-slate-400">—</td>
                  <td className="px-6 py-4">
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
