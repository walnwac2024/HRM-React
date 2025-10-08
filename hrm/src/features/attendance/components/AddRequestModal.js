// src/features/attendance/components/AddRequestModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createAttendanceRequest, getSignInTimeForDate } from "../services/requestApi";

const required = (v) => (v === undefined || v === null || String(v).trim() === "" ? "Required" : "");

export default function AddRequestModal({ open, onClose, onSaved }) {
  const [employee, setEmployee] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [inDate, setInDate] = useState("");
  const [outDate, setOutDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [attendanceType, setAttendanceType] = useState("Other");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Close with ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Copy date into in/out date if empty
  useEffect(() => {
    if (attendanceDate) {
      if (!inDate) setInDate(attendanceDate);
      if (!outDate) setOutDate(attendanceDate);
    }
  }, [attendanceDate, inDate, outDate]);

  // Auto fetch Sign-In time after selecting Employee + Attendance Date
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!employee || !attendanceDate) return;
      try {
        const t = await getSignInTimeForDate(employee, attendanceDate);
        if (!ignore && t) setInTime(t);
      } catch {/* ignore */}
    }
    load();
    return () => { ignore = true; };
  }, [employee, attendanceDate]);

  const errors = useMemo(() => ({
    employee: required(employee),
    attendanceDate: required(attendanceDate),
    inTime: required(inTime),
    outTime: required(outTime),
    reason: required(reason),
  }), [employee, attendanceDate, inTime, outTime, reason]);

  const showErr = (name) => touched[name] && errors[name];
  const fieldClass = (name) =>
    `input ${showErr(name) ? "ring-2 ring-customRed/40 border-customRed/60" : ""}`;

  const reset = () => {
    setEmployee(""); setAttendanceDate(""); setInDate(""); setOutDate("");
    setInTime(""); setOutTime(""); setAttendanceType("Other"); setReason("");
    setTouched({}); setSubmitting(false);
  };

  const handleClose = () => { reset(); onClose?.(); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ employee: true, attendanceDate: true, inTime: true, outTime: true, reason: true });
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await createAttendanceRequest({
        employee, attendanceDate, inDate, inTime, outDate, outTime, attendanceType, reason,
      });
      onSaved?.();
      handleClose();
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 md:p-8">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Add Attendance Request</h2>
          <button className="kebab h-9 w-9 border-gray-300 text-gray-500 hover:bg-gray-50"
                  aria-label="Close" onClick={handleClose}>×</button>
        </div>

        {/* Body (form) — same layout as your first screenshot */}
        <form onSubmit={onSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee */}
            <div>
              <label className="form-label">
                Employee <span className="text-customRed">*</span>
              </label>
              <select
                className={fieldClass("employee")}
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, employee: true }))}
              >
                <option value="">Select One</option>
                {/* TODO: replace with real employees */}
                <option value="E-1001">E-1001 • Sumitha Thomas</option>
                <option value="E-1002">E-1002 • Ahmed Khan</option>
              </select>
            </div>

            {/* Attendance Date */}
            <div>
              <label className="form-label">
                Attendance Date <span className="text-customRed">*</span>
              </label>
              <input
                type="date"
                className={fieldClass("attendanceDate")}
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, attendanceDate: true }))}
              />
            </div>

            {/* In Date */}
            <div>
              <label className="form-label">In Date</label>
              <input type="date" className="input" value={inDate} onChange={(e) => setInDate(e.target.value)} />
            </div>

            {/* In Time (required) */}
            <div>
              <label className="form-label">
                In Time <span className="text-customRed">*</span>
              </label>
              <input
                type="time"
                className={fieldClass("inTime")}
                value={inTime}
                onChange={(e) => setInTime(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, inTime: true }))}
              />
            </div>

            {/* Out Date */}
            <div>
              <label className="form-label">Out Date</label>
              <input type="date" className="input" value={outDate} onChange={(e) => setOutDate(e.target.value)} />
            </div>

            {/* Out Time (required) */}
            <div>
              <label className="form-label">
                Out Time <span className="text-customRed">*</span>
              </label>
              <input
                type="time"
                className={fieldClass("outTime")}
                value={outTime}
                onChange={(e) => setOutTime(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, outTime: true }))}
              />
            </div>

            {/* Attendance Type */}
            <div>
              <label className="form-label">Attendance Type</label>
              <select className="select" value={attendanceType} onChange={(e) => setAttendanceType(e.target.value)}>
                <option value="Other">Other</option>
                <option value="In/Out Adjust">In/Out Adjust</option>
                <option value="Shift Correction">Shift Correction</option>
              </select>
            </div>

            {/* spacer for grid balance */}
            <div className="hidden md:block" />

            {/* Reason (required) */}
            <div className="md:col-span-2">
              <label className="form-label">
                Reason <span className="text-customRed">*</span>
              </label>
              <textarea
                rows={6}
                className={fieldClass("reason")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, reason: true }))}
              />
            </div>
          </div>

          {/* Footer (Submit bottom-left, like screenshot) */}
          <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button type="button" className="btn-outline" onClick={handleClose}>
              Cancel
            </button>
            <span className="text-xs text-gray-500 ml-1">
              Fields marked with <span className="text-customRed">*</span> are mandatory.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
