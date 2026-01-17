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
    <div className="modal-overlay">
      <div className="modal-content max-w-5xl">
        <div className="modal-header">
          <h3 className="font-semibold text-gray-800">Add Employee Transfer</h3>
          <button
            type="button"
            className="text-xs font-bold uppercase tracking-wider text-customRed hover:opacity-80 transition-opacity"
            onClick={onClose}
            title="Back"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-6">
          <div className="form-grid lg:grid-cols-2">
            <div>
              <Field label="Employee" required error={errors.employee}>
                <Select value={form.employee} onChange={set("employee")}>
                  <option value="">Select One</option>
                  <option>John Doe</option>
                  <option>Sumitha Thomas</option>
                </Select>
              </Field>

              <div className="mt-4 space-y-4">
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
            </div>

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

            <div className="lg:col-span-2">
              <Field label="Description" required error={errors.description}>
                <textarea
                  rows={6}
                  className="w-full rounded border border-slate-300 focus:border-customRed focus:ring-customRed p-2 text-sm"
                  value={form.description}
                  onChange={set("description")}
                />
              </Field>
            </div>
          </div>

          <div className="modal-footer flex-col sm:flex-row mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 sm:flex-none"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
