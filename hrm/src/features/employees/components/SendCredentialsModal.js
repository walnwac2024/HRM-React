import React, { useMemo, useState } from "react";

export default function SendCredentialsModal({ open, onClose, onSend }) {
  // Hooks must be top-level
  const [form, setForm] = useState({
    station: "",
    department: "",
    group: "",
    employee: "",
  });

  // Demo options (replace with real data later)
  const stations    = useMemo(() => ["--ALL--", "Karachi", "Lahore", "Islamabad"], []);
  const departments = useMemo(() => ["--ALL--", "Management", "HR", "Finance"], []);
  const groups      = useMemo(() => ["--ALL--", "A", "B", "C"], []);
  const employees   = useMemo(
    () => ["Abdullah Jan Farooqui (272)", "John Doe (101)", "Jane Smith (102)"],
    []
  );

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const canSend = Boolean(form.employee);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-3xl mx-auto mt-14 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-slate-800">
            Which Employees would you like to send login credentials?
          </h3>
          <button
            className="h-7 w-7 rounded-full grid place-items-center text-slate-600 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Station */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Station</label>
              <select
                value={form.station}
                onChange={set("station")}
                className="w-full h-9 rounded border border-slate-300 text-sm
                           focus:border-customRed focus:ring-customRed"
              >
                {stations.map((v) => (
                  <option key={v} value={v === "--ALL--" ? "" : v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Department</label>
              <select
                value={form.department}
                onChange={set("department")}
                className="w-full h-9 rounded border border-slate-300 text-sm
                           focus:border-customRed focus:ring-customRed"
              >
                {departments.map((v) => (
                  <option key={v} value={v === "--ALL--" ? "" : v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Employee Group */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Employee Group</label>
              <select
                value={form.group}
                onChange={set("group")}
                className="w-full h-9 rounded border border-slate-300 text-sm
                           focus:border-customRed focus:ring-customRed"
              >
                {groups.map((v) => (
                  <option key={v} value={v === "--ALL--" ? "" : v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Employee (required) */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={form.employee}
                onChange={set("employee")}
                className="w-full h-9 rounded border border-slate-300 text-sm
                           focus:border-customRed focus:ring-customRed"
              >
                <option value="">Select employee…</option>
                {employees.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSend}
            onClick={() => onSend?.(form)}
            className={`h-9 px-6 rounded-md text-white text-sm
              ${canSend ? "bg-customRed hover:opacity-95" : "bg-slate-300 cursor-not-allowed"}`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
