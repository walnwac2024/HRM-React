// src/features/employees/components/Filters.jsx
import React from "react";

const Field = ({ label, children }) => (
  <div>
    <label className="text-sm text-slate-600">{label}</label>
    {children}
  </div>
);

export default function Filters({ filters, onChange, options }) {
  const set = (name) => (e) => onChange(name, e.target.value);

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

  const {
    stations = [],
    departments = [],
    groups = [],
    designations = [],
    statuses = [],
    roleTemplates = [],
  } = options || {};

  const renderOptions = (items) =>
    items.map((v) => (
      <option key={v} value={v}>
        {v}
      </option>
    ));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Row 1 */}
      <Field label="Station">
        <Select
          name="station"
          value={filters.station}
          onChange={set("station")}
        >
          <option value=""></option>
          {renderOptions(stations)}
        </Select>
      </Field>

      <Field label="Department">
        <Select
          name="department"
          value={filters.department}
          onChange={set("department")}
        >
          <option value=""></option>
          {renderOptions(departments)}
        </Select>
      </Field>

      <Field label="Employee Group">
        <Select
          name="employee_group"
          value={filters.employee_group}
          onChange={set("employee_group")}
        >
          <option value=""></option>
          {renderOptions(groups)}
        </Select>
      </Field>

      <Field label="Designation">
        <Select
          name="designation"
          value={filters.designation}
          onChange={set("designation")}
        >
          <option value=""></option>
          {renderOptions(designations)}
        </Select>
      </Field>

      {/* Row 2 */}
      <Field label="Employee Code">
        <Input
          name="employee_code"
          value={filters.employee_code}
          onChange={set("employee_code")}
        />
      </Field>

      <Field label="Employee Name">
        <Input
          name="employee_name"
          value={filters.employee_name}
          onChange={set("employee_name")}
        />
      </Field>

      <Field label="User Name">
        <Input
          name="user_name"
          value={filters.user_name}
          onChange={set("user_name")}
        />
      </Field>

      <Field label="Status">
        <Select
          name="status"
          value={filters.status}
          onChange={set("status")}
        >
          <option value=""></option>
          {renderOptions(statuses)}
        </Select>
      </Field>

      {/* Row 3 */}
      <Field label="Documents Attached">
        <Select
          name="documents_attached"
          value={filters.documents_attached}
          onChange={set("documents_attached")}
        >
          {["ALL", "YES", "NO"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Roles Template">
        <Select
          name="role_template"
          value={filters.role_template}
          onChange={set("role_template")}
        >
          <option value=""></option>
          {renderOptions(roleTemplates)}
        </Select>
      </Field>

      <Field label="Cnic #">
        <Input name="cnic" value={filters.cnic} onChange={set("cnic")} />
      </Field>

      <Field label="Flag">
        <Select name="flag" value={filters.flag} onChange={set("flag")}>
          {["ALL", "YES", "NO"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
