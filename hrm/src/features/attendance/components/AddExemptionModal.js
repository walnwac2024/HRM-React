import React, { useEffect, useMemo, useState } from "react";
import { EXEMPTION_TYPES, FLAG_TYPES } from "../constants";
import { saveExemption } from "../services/exemptionApi"; // stub/real service

const required = (v) =>
  v === undefined || v === null || String(v).trim() === "" ? "Required" : "";

export default function AddExemptionModal({ open, onClose, onSaved }) {
  const [employee, setEmployee] = useState("");
  const [date, setDate] = useState("");
  const [flagType, setFlagType] = useState("");
  const [type, setType] = useState("Other");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const errors = useMemo(
    () => ({
      employee: required(employee),
      date: required(date),
      flagType: required(flagType),
      reason: required(reason),
    }),
    [employee, date, flagType, reason]
  );
  const showErr = (k) => touched[k] && errors[k];
  const input = (k) => `input ${showErr(k) ? "ring-2 ring-customRed/40 border-customRed/60" : ""}`;
  const select = (k) => `select ${showErr(k) ? "ring-2 ring-customRed/40 border-customRed/60" : ""}`;

  const reset = () => {
    setEmployee("");
    setDate("");
    setFlagType("");
    setType("Other");
    setReason("");
    setTouched({});
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ employee: true, date: true, flagType: true, reason: true });
    if (Object.values(errors).some(Boolean)) return;

    setBusy(true);
    try {
      await saveExemption({ employee, date, flagType, type, reason });
      onSaved?.();    // parent can refresh table
      reset();
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl">
        {/* Header */}
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-gray-800">Add Exemption Request</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="modal-body">
          <div className="form-grid">
            {/* Employee */}
            <div>
              <label className="form-label">
                Employee <span className="text-customRed">*</span>
              </label>
              <select
                className={select("employee")}
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, employee: true }))}
              >
                <option value="">Select One</option>
                {/* Replace with real employee list */}
                <option value="E-1001">E-1001 • Sumitha Thomas</option>
                <option value="E-1002">E-1002 • Ahmed Khan</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="form-label">
                Date <span className="text-customRed">*</span>
              </label>
              <input
                type="date"
                className={input("date")}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, date: true }))}
              />
            </div>

            {/* Flag Type */}
            <div>
              <label className="form-label">
                Flag Type <span className="text-customRed">*</span>
              </label>
              <select
                className={select("flagType")}
                value={flagType}
                onChange={(e) => setFlagType(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, flagType: true }))}
              >
                <option value="">Select One</option>
                {FLAG_TYPES.filter((x) => x !== "--ALL--").map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>

            {/* Exemption Type */}
            <div>
              <label className="form-label">Exemption Type</label>
              <select
                className="select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {EXEMPTION_TYPES.filter((x) => x !== "--ALL--").map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">
              Reason <span className="text-customRed">*</span>
            </label>
            <textarea
              rows={8}
              className={input("reason")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, reason: true }))}
              placeholder="Describe the exemption reason…"
            />
          </div>

          <div className="modal-footer flex-col sm:flex-row">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button type="submit" className="btn-primary flex-1 sm:flex-none" disabled={busy}>
                {busy ? "Submitting..." : "Submit"}
              </button>
              <button type="button" className="btn-outline flex-1 sm:flex-none" onClick={onClose} disabled={busy}>
                Back
              </button>
            </div>

            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Fields marked with <span className="text-customRed">*</span> are mandatory.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
