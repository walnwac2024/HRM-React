// src/features/employees/components/EmployeeProfileRequest.js
import React from "react";

/* ----------------- MOCK DATA ----------------- */
const useEmployeeProfileRequest = () => {
  const [filters, setFilters] = React.useState({
    station: "ALL",
    department: "ALL",
    empGroup: "ALL",
    designation: "ALL",
    empCode: "",
    empName: "",
    userName: "",
    action: "ALL",
    docs: "ALL",
    rolesTemplate: "ALL",
    cnic: "",
    flag: "ALL",
  });
  const setFilter = (k, v) => setFilters((s) => ({ ...s, [k]: v }));

  const rows = [
    {
      id: 1,
      employee: {
        code: "E-1001",
        punch: "2342344",
        name: "www wwwww",
        cnic: "",
        user: "",
      },
      details: {
        station: "RegionalOffice",
        department: "Marketing",
        designation: "Software Engineer",
        group: "Head Group",
        docExists: "-",
      },
      roleTemplate: "-",
      mAttAllow: "-",
      status: "Pending",
      addedOn: "08-Oct-2020 05:46 PM",
      addedBy: "Asim Qureshi",
    },
    {
      id: 2,
      employee: {
        code: "E-12313",
        punch: "12313",
        name: "wagassaa tagfafat",
        cnic: "-",
        user: "-",
      },
      details: {
        station: "RegionalOffice",
        department: "Marketing",
        designation: "Software Engineer",
        group: "Head Group",
        docExists: "-",
      },
      roleTemplate: "-",
      mAttAllow: "-",
      status: "Approved",
      addedOn: "08-Oct-2020 05:23 PM",
      addedBy: "Asim Qureshi",
    },
  ];

  return {
    filters,
    setFilter,
    apply: (e) => {
      e?.preventDefault?.();
      // hook API here
    },
    reset: () =>
      setFilters({
        station: "ALL",
        department: "ALL",
        empGroup: "ALL",
        designation: "ALL",
        empCode: "",
        empName: "",
        userName: "",
        action: "ALL",
        docs: "ALL",
        rolesTemplate: "ALL",
        cnic: "",
        flag: "ALL",
      }),
    rows,
  };
};

/* ----------------- SMALL UI PARTS ----------------- */
const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow border border-slate-200">{children}</div>
);

const LabeledInput = ({ label, value, onChange, placeholder = "", className = "" }) => (
  <label className={`block ${className}`}>
    <div className="text-[12px] text-slate-600 mb-1">{label}</div>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-md border px-2 text-sm outline-none focus:ring-2 focus:ring-customRed/30"
    />
  </label>
);

const LabeledSelect = ({ label, value, onChange, options = [], className = "" }) => (
  <label className={`block ${className}`}>
    <div className="text-[12px] text-slate-600 mb-1">{label}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border px-2 text-sm outline-none focus:ring-2 focus:ring-customRed/30"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </label>
);

const BrandBtn = ({ children, ...props }) => (
  <button
    {...props}
    className="h-9 px-4 rounded-md bg-customRed text-white hover:opacity-90"
  >
    {children}
  </button>
);

const OutlineBtn = ({ children, ...props }) => (
  <button
    {...props}
    className="h-9 px-4 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
  >
    {children}
  </button>
);

/* ----------------- PAGE ----------------- */
export default function EmployeeProfileRequest() {
  const { filters, setFilter, apply, reset, rows } = useEmployeeProfileRequest();
  const [perPage, setPerPage] = React.useState(10);

  return (
    <div className="w-full px-3 md:px-6 pb-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">Employee Profile Request</div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm"
            title="Filters"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5h18v2H3zM7 11h10v2H7zM10 17h4v2h-4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Filters */}
        <form onSubmit={apply} className="px-4 pb-3 pt-4">
          <div className="grid grid-cols-12 gap-4">
            {/* 12 filters (see previous code, kept same) */}
            <LabeledSelect className="col-span-12 md:col-span-6 lg:col-span-3" label="Station" value={filters.station} onChange={(v) => setFilter("station", v)} options={["ALL", "Karachi", "Lahore"]} />
            <LabeledSelect className="col-span-12 md:col-span-6 lg:col-span-3" label="Department" value={filters.department} onChange={(v) => setFilter("department", v)} options={["ALL", "HR", "Marketing"]} />
            <LabeledSelect className="col-span-12 md:col-span-6 lg:col-span-3" label="Employee Group" value={filters.empGroup} onChange={(v) => setFilter("empGroup", v)} options={["ALL", "A", "B"]} />
            <LabeledSelect className="col-span-12 md:col-span-6 lg:col-span-3" label="Designation" value={filters.designation} onChange={(v) => setFilter("designation", v)} options={["ALL", "Engineer", "Manager"]} />

            <LabeledInput className="col-span-12 md:col-span-6 lg:col-span-3" label="Employee Code" value={filters.empCode} onChange={(v) => setFilter("empCode", v)} />
            <LabeledInput className="col-span-12 md:col-span-6 lg:col-span-3" label="Employee Name" value={filters.empName} onChange={(v) => setFilter("empName", v)} />
            <LabeledInput className="col-span-12 md:col-span-6 lg:col-span-3" label="User Name" value={filters.userName} onChange={(v) => setFilter("userName", v)} />
            <LabeledSelect className="col-span-12 md:col-span-6 lg:col-span-3" label="Action" value={filters.action} onChange={(v) => setFilter("action", v)} options={["ALL", "Approve", "Reject", "Pending"]} />

            <LabeledSelect className="col-span-12 md:col-span-6 lg:col-span-3" label="Documents Attached" value={filters.docs} onChange={(v) => setFilter("docs", v)} options={["ALL", "Yes", "No"]} />
            <LabeledSelect className="col-span-12 md:col-span-6 lg:col-span-3" label="Roles Template" value={filters.rolesTemplate} onChange={(v) => setFilter("rolesTemplate", v)} options={["ALL", "Default", "HR"]} />
            <LabeledInput className="col-span-12 md:col-span-6 lg:col-span-3" label="Cnic #" value={filters.cnic} onChange={(v) => setFilter("cnic", v)} />
            <LabeledSelect className="col-span-12 md:col-span-6 lg:col-span-3" label="Flag" value={filters.flag} onChange={(v) => setFilter("flag", v)} options={["ALL", "High", "Normal"]} />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <BrandBtn type="submit">Apply</BrandBtn>
            <OutlineBtn type="button" onClick={reset}>
              Clear Filters
            </OutlineBtn>
          </div>
        </form>

        {/* Show + Add New */}
        <div className="px-4 py-3 flex items-center justify-between text-sm border-t">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              className="h-9 rounded-md border px-2"
              value={perPage}
              onChange={(e) => setPerPage(parseInt(e.target.value, 10))}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>Records</span>
          </div>

          <BrandBtn type="button">+ Add New Employee</BrandBtn>
        </div>

        {/* TABLE */}
        <div className="border-t">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="[&>th]:py-3 [&>th]:px-4 [&>th]:text-left">
                  <th><input type="checkbox" className="accent-customRed" /></th>
                  <th>S#</th>
                  <th>Employee</th>
                  <th>Details</th>
                  <th>Role Template</th>
                  <th>M. Att Allow</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Approvals</th>
                  <th>Added On</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((r, idx) => (
                  <tr key={r.id} className="[&>td]:py-3 [&>td]:px-4 align-top">
                    <td><input type="checkbox" className="accent-customRed" /></td>
                    <td>{idx + 1}</td>

                    <td>
                      <div className="text-[13px]">
                        <div>Code: {r.employee.code}</div>
                        <div>Punch Code: {r.employee.punch}</div>
                        <div>
                          Name:{" "}
                          <span className="text-customRed">{r.employee.name}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-[13px]">
                        <div>Station: {r.details.station}</div>
                        <div>Department: {r.details.department}</div>
                        <div>Designation: {r.details.designation}</div>
                      </div>
                    </td>
                    <td>{r.roleTemplate}</td>
                    <td>{r.mAttAllow}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          r.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <button className="h-8 w-8 border border-customRed/50 text-customRed rounded hover:bg-customRed/10">
                        D
                      </button>
                    </td>
                    <td>
                      <button className="h-8 w-8 border border-customRed/50 text-customRed rounded hover:bg-customRed/10">
                        A
                      </button>
                    </td>
                    <td>{r.addedOn}</td>
                    <td>
                      <button className="h-8 w-8 bg-customRed text-white rounded mr-1">
                        ✓
                      </button>
                      <button className="h-8 w-8 border rounded">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
