// src/features/employees/components/CompanyInformation.js
import React from "react";

export default function CompanyInformation(props) {
  const {
    form = {},
    set: parentSet,
    errors = {},
    showError = () => false,
    markTouched = () => () => {},
  } = props;

  // Guard if parent didn't pass a setter
  const set = typeof parentSet === "function" ? parentSet : () => () => {};

  const baseInput =
    "w-full h-9 border rounded px-3 focus:ring-customRed focus:border-customRed";
  const normalBorder = "border-slate-300";
  const errorBorder = "border-customRed";
  const sectionHeader =
    "text-[13px] font-semibold text-slate-700 bg-gray-100 border border-slate-200 rounded px-3 py-2";

  return (
    <div className="space-y-6 pb-[12.10rem]">
      {/* Station / Department / Designation / Status / Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Station:">
          <select
            className={`${baseInput} ${normalBorder} px-2`}
            value={form.station || ""}
            onChange={set("station")}
            onBlur={markTouched("station")}
          >
            <option value="">Select One</option>
            <option>Regional Office</option>
            <option>Head Office</option>
            <option>Remote</option>
            <option>Warehouse</option>
          </select>
        </Field>

        <Field
          label="Department:"
          required
          error={showError("department") && errors.department}
        >
          <select
            className={`${baseInput} ${
              showError("department") ? errorBorder : normalBorder
            } px-2`}
            value={form.department || ""}
            onChange={set("department")}
            onBlur={markTouched("department")}
          >
            <option value="">Select One</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>Human Resources</option>
            <option>Engineering</option>
            <option>Finance</option>
          </select>
        </Field>

        {/* DESIGNATION — now required */}
        <Field
          label="Designation:"
          required
          error={showError("designation") && errors.designation}
        >
          <select
            className={`${baseInput} ${
              showError("designation") ? errorBorder : normalBorder
            } px-2`}
            value={form.designation || ""}
            onChange={set("designation")}
            onBlur={markTouched("designation")}
          >
            <option value="">Select One</option>
            <option>Software Engineer</option>
            <option>Senior Engineer</option>
            <option>Team Lead</option>
            <option>Manager</option>
            <option>Director</option>
          </select>
        </Field>

        <Field
          label="Employee Status:"
          required
          error={showError("employeeStatus") && errors.employeeStatus}
        >
          <select
            className={`${baseInput} ${
              showError("employeeStatus") ? errorBorder : normalBorder
            } px-2`}
            value={form.employeeStatus || ""}
            onChange={set("employeeStatus")}
            onBlur={markTouched("employeeStatus")}
          >
            <option value="">Select One</option>
            <option>Permanent</option>
            <option>Contract</option>
            <option>Intern</option>
            <option>Probation</option>
          </select>
        </Field>

        <Field
          label="Employee Group:"
          required
          error={showError("employeeGroup") && errors.employeeGroup}
        >
          <select
            className={`${baseInput} ${
              showError("employeeGroup") ? errorBorder : normalBorder
            } px-2`}
            value={form.employeeGroup || ""}
            onChange={set("employeeGroup")}
            onBlur={markTouched("employeeGroup")}
          >
            <option value="">Select One</option>
            <option>Head Group</option>
            <option>Staff</option>
            <option>Operations</option>
            <option>Executives</option>
          </select>
        </Field>
      </div>

      {/* Appointment Information */}
      <div className={sectionHeader}>Appointment Information</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Joining Date:">
          <input
            type="date"
            className={`${baseInput} ${normalBorder}`}
            value={form.joiningDate || ""}
            onChange={set("joiningDate")}
            onBlur={markTouched("joiningDate")}
          />
        </Field>

        <Field label="Confirmation Due Date:">
          <input
            type="date"
            className={`${baseInput} ${normalBorder}`}
            value={form.confirmationDueDate || ""}
            onChange={set("confirmationDueDate")}
            onBlur={markTouched("confirmationDueDate")}
          />
        </Field>

        <Field label="Confirmation Date:">
          <input
            type="date"
            className={`${baseInput} ${normalBorder}`}
            value={form.confirmationDate || ""}
            onChange={set("confirmationDate")}
            onBlur={markTouched("confirmationDate")}
          />
        </Field>
      </div>

      {/* Leaving Information */}
      <div className={sectionHeader}>Leaving Information</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Resign Date:">
          <input
            type="date"
            className={`${baseInput} ${normalBorder}`}
            value={form.resignDate || ""}
            onChange={set("resignDate")}
            onBlur={markTouched("resignDate")}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">
        {label} {required && <span className="text-customRed">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[12px] text-customRed">{error}</p>
      ) : null}
    </div>
  );
}
