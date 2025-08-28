// src/features/employees/components/RoleTemplateModal.js
import React, { useState, useMemo } from "react";

export default function RoleTemplateModal({
  open,
  onClose,
  onSave,
  templates = [], // optional: [{id:'admin', name:'System Administrator (Full Access)'}]
}) {
  const [title, setTitle] = useState("");
  const [cloneOn, setCloneOn] = useState(false);
  const [cloneFrom, setCloneFrom] = useState("");

  // quick reset when opened/closed
  React.useEffect(() => {
    if (!open) return;
    setTitle("");
    setCloneOn(false);
    setCloneFrom("");
  }, [open]);

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (cloneOn && !cloneFrom) return false;
    return true;
  }, [title, cloneOn, cloneFrom]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
        {/* header - slim, like the reference */}
        <div className="flex items-center justify-between bg-slate-100 px-4 py-2.5 border-b">
          <h3 className="text-sm font-semibold text-slate-700">Add New Template</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 grid place-items-center rounded hover:bg-slate-200"
            aria-label="Close"
            title="Close"
          >
            <svg
              className="h-4 w-4 text-slate-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="px-4 py-4 space-y-4">
          {/* Template Title */}
          <div className="space-y-1.5">
            <label className="text-[13px] text-slate-600">
              Template Title <span className="text-customRed">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Template for HR"
              className="h-9 w-full rounded border border-slate-300 px-3 text-[14px] focus:border-customRed focus:ring-customRed"
            />
          </div>

          {/* Clone toggle row */}
          <div className="flex items-center gap-3">
            <Toggle
              checked={cloneOn}
              onChange={setCloneOn}
              ariaLabel="Clone it From Another Template?"
            />
            <span className="text-[13px] text-slate-700">
              Clone it From Another Template ?
            </span>
          </div>

          {/* When toggle is ON show select */}
          {cloneOn && (
            <div className="space-y-1.5">
              <label className="text-[13px] text-slate-600">Select Template</label>
              <select
                value={cloneFrom}
                onChange={(e) => setCloneFrom(e.target.value)}
                className="h-9 w-full rounded border border-slate-300 px-2 text-[14px] focus:border-customRed focus:ring-customRed"
              >
                <option value="">Select One</option>
                {templates.map((t) => (
                  <option key={t.id ?? t.value ?? t.name} value={t.id ?? t.value ?? t.name}>
                    {t.name ?? t.label ?? String(t)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* footer - right aligned Save like reference */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t bg-white">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave?.({
                title: title.trim(),
                cloneFrom: cloneOn ? cloneFrom : null,
              })
            }
            className={[
              "h-9 rounded px-4 text-sm text-white shadow-sm",
              canSave
                ? "bg-customRed hover:bg-customRed/90"
                : "bg-customRed/60 cursor-not-allowed",
            ].join(" ")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny toggle used above ---------- */
function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange?.(!checked)}
      className={[
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked ? "bg-customRed" : "bg-slate-300",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
