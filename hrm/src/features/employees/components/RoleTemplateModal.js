import React, { useEffect, useState } from "react";

export default function RoleTemplateModal({
  open,
  onClose,
  onSave,
  options = [],     // [{key, label}]
  initial = "",     // e.g. "admin"
}) {
  const [value, setValue] = useState(initial || "");

  // when the modal re-opens, reset to the current template
  useEffect(() => {
    if (open) setValue(initial || "");
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* card */}
      <div className="relative z-10 w-[520px] max-w-[95vw] rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Role Template</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Roles Template</label>
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-9 rounded border border-slate-300 px-3 focus:border-customRed focus:ring-customRed"
            >
              <option value="">Select One</option>
              {options.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => value && onSave?.(value)}
            disabled={!value}
            className={
              "h-9 px-5 rounded text-white " +
              (value
                ? "bg-customRed hover:bg-customRed/90 active:bg-customRed/80"
                : "bg-slate-300 cursor-not-allowed")
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
