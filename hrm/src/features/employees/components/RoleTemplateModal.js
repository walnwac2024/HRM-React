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
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        <div className="modal-header">
          <h3 className="text-sm font-semibold text-gray-800">Add New Template</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body space-y-4">
          {/* Template Title */}
          <div className="space-y-1.5">
            <label className="form-label">
              Template Title <span className="text-customRed">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Template for HR"
              className="input"
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
            <div className="space-y-1.5 pt-2">
              <label className="form-label">Select Template</label>
              <select
                value={cloneFrom}
                onChange={(e) => setCloneFrom(e.target.value)}
                className="input"
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

        <div className="modal-footer flex-col sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline flex-1 sm:flex-none"
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
            className={`btn-primary flex-1 sm:flex-none ${!canSave ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            Save Template
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
