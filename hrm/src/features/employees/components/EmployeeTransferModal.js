// src/features/employees/components/EmployeeTransferModal.js
import React, { useMemo, useState } from "react";

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm text-slate-700 mb-1">
      {label} {required && <span className="text-customRed">*</span>}
    </label>
    {children}
    {error ? <p className="mt-1 text-[12px] text-customRed">{error}</p> : null}
  </div>
);

const Select = (props) => (
  <select
    {...props}
    className="w-full h-9 rounded border border-slate-300 focus:border-customRed focus:ring-customRed"
  />
);

const Input = (props) => (
  <input
    {...props}
    className="w-full h-9 rounded border border-slate-300 focus:border-customRed focus:ring-customRed"
  />
);

export default function EmployeeTransferModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    employee: "",
    prefix: "None",
    employeeCode: "",
    station: "",
    department: "",
    transferDate: "",
    punchCode: "",
    reportsTo: "",
    scheduledReport: "",
    automatedAlert: "",
    description: "",
  });

  const set = (name) => (e) => {
    const v = e?.target?.value ?? e;
    setForm((f) => ({ ...f, [name]: v }));
  };

  const errors = useMemo(() => {
    const e = {};
    if (!form.employee) e.employee = "Employee is required.";
    if (!form.station) e.station = "Station is required.";
    if (!form.department) e.department = "Department is required.";
    if (!form.punchCode) e.punchCode = "Punch Code is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  }, [form]);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (Object.keys(errors).length) return;
    onSubmit?.(form);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* card */}
      <div className="relative z-10 w-[98%] max-w-5xl bg-white rounded-xl shadow-xl border border-slate-200">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Add Employee Transfer</h3>
          <button
            type="button"
            className="text-customRed hover:opacity-90"
            onClick={onClose}
            title="Back"
          >
            &larr; Back
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT column */}
            <div className="space-y-4">
              <Field label="Employee" required error={errors.employee}>
                <Select value={form.employee} onChange={set("employee")}>
                  <option value="">Select One</option>
                  {/* TODO: replace sample with real employees */}
                  <option>John Doe</option>
                  <option>Sumitha Thomas</option>
                </Select>
              </Field>

              <Field label="Prefix">
                <Select value={form.prefix} onChange={set("prefix")}>
                  <option>None</option>
                  <option>Mr</option>
                  <option>Ms</option>
                  <option>Mrs</option>
                </Select>
              </Field>

              <Field label="Employee Code">
                <Input value={form.employeeCode} onChange={set("employeeCode")} />
              </Field>

              <Field label="Station" required error={errors.station}>
                <Select value={form.station} onChange={set("station")}>
                  <option value="">Select One</option>
                  <option>RegionalOffice</option>
                  <option>HeadOffice</option>
                </Select>
              </Field>

              <Field label="Department" required error={errors.department}>
                <Select value={form.department} onChange={set("department")}>
                  <option value="">Select One</option>
                  <option>Marketing</option>
                  <option>HR</option>
                  <option>IT</option>
                  <option>Finance</option>
                </Select>
              </Field>

              <Field label="Configure Automated Alert">
                <Select
                  value={form.automatedAlert}
                  onChange={set("automatedAlert")}
                >
                  <option value="">Select One</option>
                  <option>Email</option>
                  <option>SMS</option>
                  <option>None</option>
                </Select>
              </Field>
            </div>

            {/* RIGHT column */}
            <div className="space-y-4">
              <Field label="Transfer Date">
                <Input
                  type="date"
                  value={form.transferDate}
                  onChange={set("transferDate")}
                />
              </Field>

              <Field label="Punch Code" required error={errors.punchCode}>
                <Input value={form.punchCode} onChange={set("punchCode")} />
              </Field>

              <Field label="Employee Reports To">
                <Select value={form.reportsTo} onChange={set("reportsTo")}>
                  <option value="">Select One</option>
                  <option>Manager 1</option>
                  <option>Manager 2</option>
                </Select>
              </Field>

              <Field label="Configure Scheduled Report">
                <Select
                  value={form.scheduledReport}
                  onChange={set("scheduledReport")}
                >
                  <option value="">Select One</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </Select>
              </Field>
            </div>
          </div>

          {/* Description */}
          <Field label="Description" required error={errors.description}>
            <textarea
              rows={6}
              className="w-full rounded border border-slate-300 focus:border-customRed focus:ring-customRed p-2"
              value={form.description}
              onChange={set("description")}
            />
          </Field>

          {/* footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded border border-slate-300 bg-white hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded bg-customRed text-white hover:bg-customRed/90"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
