import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function StatusBadge({ status = "Pending" }) {
  const cls =
    status === "Approved"
      ? "bg-green-50 text-green-700 ring-green-200"
      : status === "Rejected"
      ? "bg-red-50 text-red-700 ring-red-200"
      : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>
      {status === "Approved" && <CheckCircle className="h-4 w-4" />}
      {status === "Rejected" && <XCircle className="h-4 w-4" />}
      {status === "Pending" && <Clock className="h-4 w-4" />}
      {status}
    </span>
  );
}
