// src/features/employees/components/Filters.jsx
import React, { useCallback } from "react";

const LabeledInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  className = "",
}) => {
  const handleChange = useCallback(
    (e) => {
      onChange?.(name, e.target.value);
    },
    [name, onChange]
  );

  const handleBlur = (e) => {
    const active = document.activeElement;
    const body = document.body;

    // If some extension (e.g. ColorZilla) stole focus to BODY with this flag,
    // immediately take it back so typing feels normal.
    if (active === body && body?.getAttribute("cz-shortcut-listen") === "true") {
      e.target.focus();
      return;
    }
  };

  return (
    <label className={`block ${className}`}>
      <div className="text-[12px] text-slate-600 mb-1">{label}</div>
      <input
        type="text"
        name={name}
        value={value ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-customRed/30 focus:border-customRed"
      />
    </label>
  );
};

const LabeledSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  className = "",
}) => {
  const handleChange = useCallback(
    (e) => {
      onChange?.(name, e.target.value);
    },
    [name, onChange]
  );

  return (
    <label className={`block ${className}`}>
      <div className="text-[12px] text-slate-600 mb-1">{label}</div>
      <select
        name={name}
        value={value ?? ""}
        onChange={handleChange}
        className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-customRed/30 focus:border-customRed"
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </label>
  );
};

function Filters({ filters, onChange, options }) {
  const {
    stations = [],
    departments = [],
    groups = [],
    designations = [],
    statuses = [],
    roleTemplates = [],
  } = options || {};

  // Helper to render simple string arrays
  const asSimpleOptions = (arr) => arr.map((v) => ({ value: v, label: v }));

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Row 1 */}
      <LabeledSelect
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Station"
        name="station"
        value={filters.station}
        onChange={onChange}
        options={[{ value: "", label: "" }, ...asSimpleOptions(stations)]}
      />

      <LabeledSelect
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Department"
        name="department"
        value={filters.department}
        onChange={onChange}
        options={[{ value: "", label: "" }, ...asSimpleOptions(departments)]}
      />

      <LabeledSelect
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Employee Group"
        name="employee_group"
        value={filters.employee_group}
        onChange={onChange}
        options={[{ value: "", label: "" }, ...asSimpleOptions(groups)]}
      />

      <LabeledSelect
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Designation"
        name="designation"
        value={filters.designation}
        onChange={onChange}
        options={[{ value: "", label: "" }, ...asSimpleOptions(designations)]}
      />

      {/* Row 2 */}
      <LabeledInput
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Employee Code"
        name="employee_code"
        value={filters.employee_code}
        onChange={onChange}
      />

      <LabeledInput
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Employee Name"
        name="employee_name"
        value={filters.employee_name}
        onChange={onChange}
      />

      <LabeledInput
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="User Name"
        name="user_name"
        value={filters.user_name}
        onChange={onChange}
      />

      <LabeledSelect
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Status"
        name="status"
        value={filters.status}
        onChange={onChange}
        options={[{ value: "", label: "" }, ...asSimpleOptions(statuses)]}
      />

      {/* Row 3 */}
      <LabeledSelect
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Documents Attached"
        name="documents_attached"
        value={filters.documents_attached}
        onChange={onChange}
        options={["ALL", "YES", "NO"].map((v) => ({ value: v, label: v }))}
      />

      <LabeledSelect
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Roles Template"
        name="role_template"
        value={filters.role_template}
        onChange={onChange}
        options={[
          { value: "", label: "" },
          ...asSimpleOptions(roleTemplates),
        ]}
      />

      <LabeledInput
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Cnic #"
        name="cnic"
        value={filters.cnic}
        onChange={onChange}
      />

      <LabeledSelect
        className="col-span-12 md:col-span-6 lg:col-span-3"
        label="Flag"
        name="flag"
        value={filters.flag}
        onChange={onChange}
        options={["ALL", "YES", "NO"].map((v) => ({ value: v, label: v }))}
      />
    </div>
  );
}

export default React.memo(Filters);
