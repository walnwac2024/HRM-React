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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 md:p-8">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Remote Work Request</h2>
          <button
            type="button"
            onClick={onClose}
            className="kebab h-9 w-9 border-gray-300 text-gray-500 hover:bg-gray-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-6 py-5">
          {/* Row 1: Employee / Remote Work Date */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </div>

          {/* Row 2: In Date / In Time */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </div>

          {/* Row 3: Out Date / Out Time */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </div>

          {/* Reason */}
          <div className="mt-4">
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

          {/* Footer */}
          <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Submitting..." : "Submit"}
            </button>
            <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>
              Back
            </button>
            <span className="ml-1 text-xs text-gray-500">
              Fields marked with <span className="text-customRed">*</span> are mandatory.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
