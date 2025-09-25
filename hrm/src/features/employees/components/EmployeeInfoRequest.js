// src/features/employees/components/EmployeeInfoRequest.js
import React, { useEffect, useMemo, useState } from "react";
import apiService from "../../../utils/apiService";

/**
 * Employee Info Request
 * - Clean, compact filter bar (4-up grid on desktop)
 * - Primary actions in brand color (customRed)
 * - Table with icon-only cells for "Details" and "Approvals"
 * - Works with optional `rows` prop; falls back to a demo row
 */

export default function EmployeeInfoRequest({ rows: externalRows = [] }) {
  // ----- Demo / fallback data (safe if you already provide rows via props)
  const demoRows = useMemo(
    () => [
      {
        id: 1,
        sn: 1,
        name: "Abdullah Jan Farooqui",
        station: "RegionalOffice",
        department: "Management",
        designation: "Chief Information Officer",
        group: "Head Group",
        status: "Rejected",
        addedOn: "08-Oct-2020 05:49 PM",
        addedBy: "Asim Qureshi",
      },
    ],
    []
  );
  const rows = externalRows.length ? externalRows : demoRows;
  const [employee, setEmployee]=useState([])
   const featchempdata=async ()=>{
    try {
     const response= apiService.get('/all-employee')
      
      setEmployee(response.data)
    } catch (error) {
      console.log('Error',error)
    }
   }
   useEffect(()=>{
      featchempdata()
   },[])
  // ----- Filters state (replace with your real source of options/data)
  const [filters, setFilters] = useState({
    station: "",
    department: "",
    employeeGroup: "",
    employee: "",
    action: "ALL",
    requestType: "My Requests",
    flag: "ALL",
    perPage: 10,
  });

  const set = (name) => (e) => setFilters((f) => ({ ...f, [name]: e.target.value }));

  const handleApply = (e) => {
    e.preventDefault();
    // TODO: call your fetch with `filters`
    // console.log("Apply with filters:", filters);
  };

  const handleClear = () => {
    setFilters({
      station: "",
      department: "",
      employeeGroup: "",
      employee: "",
      action: "ALL",
      requestType: "My Requests",
      flag: "ALL",
      perPage: 10,
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <h2 className="text-[15px] font-semibold text-slate-800">Employee Info Request</h2>
        <button className="text-xs text-slate-500 hover:text-slate-700">Filters</button>
      </div>

      {/* Filters */}
      <form onSubmit={handleApply} className="px-5 pt-4 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Station">
            <Select value={filters.station} onChange={set("station")} />
          </Field>
          <Field label="Department">
            <Select value={filters.department} onChange={set("department")} />
          </Field>
          <Field label="Employee Group">
            <Select value={filters.employeeGroup} onChange={set("employeeGroup")} />
          </Field>
          <Field label="Employee">
            <Select value={filters.employee} onChange={set("employee")} />
          </Field>

          <Field label="Action">
            <Select value={filters.action} onChange={set("action")}>
              <option value="ALL">ALL</option>
              <option value="ADD">ADD</option>
              <option value="UPDATE">UPDATE</option>
            </Select>
          </Field>
          <Field label="Request Type">
            <Select value={filters.requestType} onChange={set("requestType")}>
              <option>My Requests</option>
              <option>All Requests</option>
            </Select>
          </Field>
          <Field label="Flag">
            <Select value={filters.flag} onChange={set("flag")}>
              <option>ALL</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </Select>
          </Field>

          {/* Per page with records counter + primary CTA on desktop row */}
          <div className="flex items-end justify-between md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-600">Show</span>
              <select
                className="h-9 w-[84px] rounded-md border border-slate-300 bg-white px-2 text-[13px] outline-none focus:border-customRed focus:ring-customRed"
                value={filters.perPage}
                onChange={set("perPage")}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[13px] text-slate-600">( {rows.length} ) Records</span>
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <button
              type="submit"
              className="h-9 rounded-md bg-customRed px-4 text-white shadow-sm hover:bg-customRed/90 focus:outline-none"
            >
              Apply
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="h-9 rounded-md border border-slate-300 bg-white px-4 text-slate-700 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 h-9 rounded-md bg-customRed px-4 text-white shadow-sm hover:bg-customRed/90"
            onClick={() => {
              // TODO: open apply-for-employee-info modal
            }}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/15">+</span>
            <span>Apply for Employee Info</span>
          </button>
        </div>
      </form>

      {/* Divider for breathing room above table */}
      <div className="mt-3 border-t border-slate-200" />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <Th className="w-12">S#</Th>
              <Th className="min-w-[220px]">Employee Name</Th>
              <Th>Details</Th>
              <Th className="w-32">Status</Th>
              <Th className="w-48">Added On</Th>
              <Th className="w-24">Details</Th>
              <Th className="w-24">Approvals</Th>
              <Th className="w-16">Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <Td>{r.sn ?? r.id}</Td>

                <Td className="text-customRed hover:underline cursor-pointer">{r.name}</Td>

                <Td>
                  <div className="text-[13px] text-slate-700 leading-5">
                    <div>
                      <span className="font-medium">Station :</span> {r.station}
                    </div>
                    <div>
                      <span className="font-medium">Department :</span> {r.department}
                    </div>
                    <div>
                      <span className="font-medium">Designation :</span> {r.designation}
                    </div>
                    <div>
                      <span className="font-medium">Group :</span> {r.group}
                    </div>
                  </div>
                </Td>

                <Td>
                  <StatusPill value={r.status} />
                </Td>

                <Td>
                  <div className="text-[13px] text-slate-700">
                    {r.addedOn}
                    <div className="text-slate-500">By {r.addedBy}</div>
                  </div>
                </Td>

                {/* ICON-ONLY CELLS (Details / Approvals) */}
                <Td>
                  <IconButton
                    title="Details"
                    onClick={() => {
                      // TODO: open details modal
                    }}
                  >
                    <CalendarIcon />
                  </IconButton>
                </Td>

                <Td>
                  <IconButton
                    title="Approvals"
                    onClick={() => {
                      // TODO: open approvals
                    }}
                  >
                    <UsersIcon />
                  </IconButton>
                </Td>

                <Td>
                  <IconButton title="More actions" onClick={() => {}}>
                    <EllipsisIcon />
                  </IconButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------
 * Small UI helpers
 * ------------------------- */

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[12px] font-medium text-slate-600">{label}</span>
    {children}
  </label>
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-[13px] outline-none focus:border-customRed focus:ring-customRed"
  >
    {children ?? (
      <>
        <option value="">--ALL--</option>
      </>
    )}
  </select>
);

const Th = ({ className = "", children }) => (
  <th className={["px-4 py-3 text-[13px] font-semibold", className].join(" ")}>{children}</th>
);

const Td = ({ className = "", children }) => (
  <td className={["px-4 py-3 align-top text-slate-800", className].join(" ")}>{children}</td>
);

const StatusPill = ({ value = "" }) => {
  const color =
    value.toLowerCase() === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : value.toLowerCase() === "pending"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-medium",
        color,
      ].join(" ")}
    >
      {value}
    </span>
  );
};

const IconButton = ({ title, className = "", ...props }) => (
  <button
    {...props}
    title={title}
    aria-label={title}
    className={[
      "h-8 w-8 inline-flex items-center justify-center rounded-md",
      "border border-slate-300 text-slate-600 hover:text-customRed hover:border-customRed/40 hover:bg-customRed/5",
      "transition-colors",
      className,
    ].join(" ")}
  />
);

const CalendarIcon = ({ className = "" }) => (
  <svg className={["h-4 w-4", className].join(" ")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const UsersIcon = ({ className = "" }) => (
  <svg className={["h-4 w-4", className].join(" ")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const EllipsisIcon = ({ className = "" }) => (
  <svg className={["h-4 w-4", className].join(" ")} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);
