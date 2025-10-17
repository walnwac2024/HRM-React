import React from "react";
import { ChevronDown } from "lucide-react";

const btnBase =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
const btnPrimary = `${btnBase} bg-red-600 text-white hover:opacity-90 focus:ring-red-600`;
const btnSecondary = `${btnBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300`;

export default function ApprovalFilters({
  value,
  onChange,
  onApply,
  onClear,
  perPage = 10,
  onPerPageChange = () => {},
}) {
  const v = value || {};
  const set = (k, val) => onChange?.({ ...v, [k]: val });

  const Select = ({ label, value, onChange, options }) => (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <select
          className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-9 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    </label>
  );

  const Input = ({ label, value, onChange, type = "text", placeholder }) => (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
      />
    </label>
  );

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 text-lg font-semibold text-gray-900">
        Attendance Approval
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Select label="Station" value={v.station || ""} onChange={(val) => set("station", val)} options={[{ value: "", label: "--ALL--" }]} />
        <Select label="Department" value={v.department || ""} onChange={(val) => set("department", val)} options={[{ value: "", label: "--ALL--" }]} />
        <Select label="Sub Department" value={v.subDepartment || ""} onChange={(val) => set("subDepartment", val)} options={[{ value: "", label: "--ALL--" }]} />
        <Select label="Employee Group" value={v.employeeGroup || ""} onChange={(val) => set("employeeGroup", val)} options={[{ value: "", label: "--ALL--" }]} />

        <Select label="Employee" value={v.employee || ""} onChange={(val) => set("employee", val)} options={[{ value: "", label: "--ALL--" }]} />
        <Input label="Employee Code" value={v.employeeCode || ""} onChange={(val) => set("employeeCode", val)} placeholder="Employee Code" />
        <Input label="Employee Name" value={v.employeeName || ""} onChange={(val) => set("employeeName", val)} placeholder="Employee Name" />
        <Select label="Request Type" value={v.requestType || ""} onChange={(val) => set("requestType", val)} options={[{ value: "", label: "--ALL--" }]} />

        <Select label="Action" value={v.action || "Pending"} onChange={(val) => set("action", val)} options={[
          { value: "", label: "--ALL--" },
          { value: "Pending", label: "Pending" },
          { value: "Approved", label: "Approved" },
          { value: "Rejected", label: "Rejected" },
        ]} />
        <Select label="Approval Type" value={v.approvalType || "Other Approval"} onChange={(val) => set("approvalType", val)} options={[
          { value: "", label: "--ALL--" },
          { value: "Other Approval", label: "Other Approval" },
          { value: "Regular", label: "Regular" },
        ]} />
        <Input label="Request Date" type="date" value={v.requestDate || ""} onChange={(val) => set("requestDate", val)} />
        <Select label="Flag" value={v.flag || ""} onChange={(val) => set("flag", val)} options={[{ value: "", label: "--ALL--" }]} />
        <Select label="Is Mark From Dashboard" value={v.fromDashboard || ""} onChange={(val) => set("fromDashboard", val)} options={[
          { value: "", label: "--ALL--" },
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className={btnPrimary} onClick={() => onApply?.(v)}>Apply</button>
        <button className={btnSecondary} onClick={onClear}>Clear Filters</button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700"
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700">Records</span>
        </div>
      </div>
    </div>
  );
}
