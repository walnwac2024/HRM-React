import React from "react";
import { CheckCircle, XCircle, Clock, MinusCircle, AlertCircle } from "lucide-react";

export default function StatusBadge({ status = "Pending" }) {
  const s = String(status).toUpperCase();

  let cls = "bg-slate-50 text-slate-700 ring-slate-200";
  let Icon = MinusCircle;

  if (s === "APPROVED" || s === "PRESENT") {
    cls = "bg-emerald-50 text-emerald-700 ring-emerald-200";
    Icon = CheckCircle;
  } else if (s === "REJECTED" || s === "ABSENT") {
    cls = "bg-rose-50 text-rose-700 ring-rose-200";
    Icon = XCircle;
  } else if (s === "LATE") {
    cls = "bg-amber-50 text-amber-700 ring-amber-200";
    Icon = Clock;
  } else if (s === "PENDING" || s === "NOT_MARKED") {
    cls = "bg-amber-50 text-amber-700 ring-amber-200";
    Icon = Clock;
  } else if (s === "UNMARKED") {
    cls = "bg-slate-50 text-slate-500 ring-slate-100";
    Icon = MinusCircle;
  } else if (s === "HOLIDAY" || s === "OFF_DAY") {
    cls = "bg-blue-50 text-blue-700 ring-blue-100";
    Icon = AlertCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${cls}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
