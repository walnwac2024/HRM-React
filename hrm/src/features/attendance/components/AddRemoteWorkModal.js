// src/features/attendance/components/AddRemoteWorkModal.js
import React, { useEffect, useMemo, useState } from "react";
import { EMPLOYEES } from "../constants";

const required = (v) =>
  v === undefined || v === null || String(v).trim() === "" ? "Required" : "";

export default function AddRemoteWorkModal({ open, onClose, onSaved }) {
  const [employee, setEmployee] = useState("");
  const [remoteDate, setRemoteDate] = useState("");
  const [inDate, setInDate] = useState("");
  const [outDate, setOutDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [reason, setReason] = useState("");

  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});

  // esc + scroll lock
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
      remoteDate: required(remoteDate),
      inTime: required(inTime),
      outTime: required(outTime),
      reason: required(reason),
      // inDate/outDate are optional per reference
    }),
    [employee, remoteDate, inTime, outTime, reason]
  );

  const showErr = (k) => touched[k] && errors[k];

  const input = (k) =>
    `input ${showErr(k) ? "ring-2 ring-customRed/40 border-customRed/60" : ""}`;
  const select = (k) =>
    `select ${showErr(k) ? "ring-2 ring-customRed/40 border-customRed/60" : ""}`;

  const reset = () => {
    setEmployee("");
    setRemoteDate("");
    setInDate("");
    setOutDate("");
    setInTime("");
    setOutTime("");
    setReason("");
    setTouched({});
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({
      employee: true,
      remoteDate: true,
      inTime: true,
      outTime: true,
      reason: true,
    });
    if (Object.values(errors).some(Boolean)) return;

    setBusy(true);
    try {
      // TODO: integrate your API here
      onSaved?.({
        employee,
        remoteDate,
        inDate,
        outDate,
        inTime,
        outTime,
        details: reason,
        status: "Pending",
        addedOn: new Date().toISOString(),
      });
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
          <h2 className="text-lg font-semibold text-gray-800">Add Remote Work Request</h2>
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
                {EMPLOYEES.filter((x) => x !== "--ALL--").map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">
                Remote Work Date <span className="text-customRed">*</span>
              </label>
              <input
                type="date"
                className={input("remoteDate")}
                value={remoteDate}
                onChange={(e) => setRemoteDate(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, remoteDate: true }))}
              />
            </div>

            <div>
              <label className="form-label">In Date</label>
              <input
                type="date"
                className="input"
                value={inDate}
                onChange={(e) => setInDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">
                In Time <span className="text-customRed">*</span>
              </label>
              <input
                type="time"
                className={input("inTime")}
                value={inTime}
                onChange={(e) => setInTime(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, inTime: true }))}
                placeholder="Select Time"
              />
            </div>

            <div>
              <label className="form-label">Out Date</label>
              <input
                type="date"
                className="input"
                value={outDate}
                onChange={(e) => setOutDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">
                Out Time <span className="text-customRed">*</span>
              </label>
              <input
                type="time"
                className={input("outTime")}
                value={outTime}
                onChange={(e) => setOutTime(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, outTime: true }))}
                placeholder="Select Time"
              />
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
                placeholder="Explain why remote work is needed…"
              />
            </div>
          </div>

          <div className="modal-footer flex-col sm:flex-row mt-6">
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
