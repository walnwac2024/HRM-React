import React, { useEffect, useMemo, useState } from "react";
import { EMPLOYEES } from "../constants"; // already in your constants
// If you have a real list of projects, replace this with your source
const WORKSHEET_PROJECTS = ["Select One", "Website Revamp", "Payroll Cleanup", "Infra Upgrade"];

const required = (v) =>
  v === undefined || v === null || String(v).trim() === "" ? "Required" : "";

export default function AddWorkSheetModal({ open, onClose, onSaved }) {
  const [employee, setEmployee] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [lines, setLines] = useState([
    { project: "", startDate: "", endDate: "", startTime: "", endTime: "" },
  ]);
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
      title: required(title),
      desc: required(desc),
      // Date is optional in the screenshot, so not required
      // We won't hard-require line-level fields (since they can add/leave blank).
    }),
    [employee, title, desc]
  );
  const showErr = (k) => touched[k] && errors[k];

  const input = (k) =>
    `input ${showErr(k) ? "ring-2 ring-customRed/40 border-customRed/60" : ""}`;
  const select = (k) =>
    `select ${showErr(k) ? "ring-2 ring-customRed/40 border-customRed/60" : ""}`;

  const changeLine = (idx, key, val) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, [key]: val } : l)));

  const addLine = () =>
    setLines((ls) => [...ls, { project: "", startDate: "", endDate: "", startTime: "", endTime: "" }]);

  const removeLine = (idx) =>
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((_, i) => i !== idx)));

  const reset = () => {
    setEmployee("");
    setTitle("");
    setDate("");
    setDesc("");
    setLines([{ project: "", startDate: "", endDate: "", startTime: "", endTime: "" }]);
    setTouched({});
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ employee: true, title: true, desc: true });
    if (Object.values(errors).some(Boolean)) return;

    setBusy(true);
    try {
      // TODO: replace with your API call
      // await worksheetApi.create({ employee, title, date, desc, lines })
      onSaved?.({ employee, title, date, desc, lines });
      reset();
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 md:p-8">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">WorkSheet</h2>
          <button
            type="button"
            onClick={onClose}
            className="kebab h-9 w-9 border-gray-300 text-gray-500 hover:bg-gray-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={submit} className="px-6 py-5">
          {/* Top row */}
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
                {/* If you store codes, change the value accordingly */}
                {EMPLOYEES.filter((x) => x !== "--ALL--").map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">
                Title <span className="text-customRed">*</span>
              </label>
              <input
                className={input("title")}
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              />
            </div>

            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Lines grid */}
          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-gray-900">Lines</div>

            <div className="overflow-x-auto rounded-lg ring-1 ring-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-3 py-2 w-10">S#</th>
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2">Start Date</th>
                    <th className="px-3 py-2">End Date</th>
                    <th className="px-3 py-2">Start Time</th>
                    <th className="px-3 py-2">End Time</th>
                    <th className="px-3 py-2 w-20">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((ln, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">
                        <select
                          className="select"
                          value={ln.project}
                          onChange={(e) => changeLine(i, "project", e.target.value)}
                        >
                          {WORKSHEET_PROJECTS.map((p) => (
                            <option key={p} value={p === "Select One" ? "" : p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          className="input"
                          value={ln.startDate}
                          onChange={(e) => changeLine(i, "startDate", e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          className="input"
                          value={ln.endDate}
                          onChange={(e) => changeLine(i, "endDate", e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          className="input"
                          value={ln.startTime}
                          onChange={(e) => changeLine(i, "startTime", e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          className="input"
                          value={ln.endTime}
                          onChange={(e) => changeLine(i, "endTime", e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => removeLine(i)}
                          disabled={lines.length === 1}
                          title={lines.length === 1 ? "At least one line required" : "Delete"}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" className="btn-chip mt-3" onClick={addLine}>
              + Add New Line
            </button>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="form-label">
              Description <span className="text-customRed">*</span>
            </label>
            <textarea
              rows={8}
              className={input("desc")}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, desc: true }))}
              placeholder="Add description…"
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
