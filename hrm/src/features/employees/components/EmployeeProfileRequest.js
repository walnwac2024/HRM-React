import React from "react";
import useEmployeeProfileRequests from "../hooks/useEmployeeProfileRequests";

export default function EmployeeProfileRequest() {
  const {
    // data & filters
    filters, setFilter, resetFilters,
    perPage, setPerPage,
    page, setPage, totalPages, firstItem,
    rows, total,
    apply,
  } = useEmployeeProfileRequests();

  return (
    <div className="pr-6 pb-6">
      {/* Card Header: Title + Filters link */}
      <div className="bg-white rounded-lg overflow-hidden shadow border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-medium">Employee Profile Request</div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm"
            title="Filters"
          >
            <ChevronDown className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filters */}
        <form onSubmit={apply} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Row 1 */}
            <LabeledSelect
              label="Station"
              value={filters.station}
              onChange={(v) => setFilter("station", v)}
              options={["ALL", "Karachi", "Lahore", "Islamabad"]}
            />
            <LabeledSelect
              label="Department"
              value={filters.department}
              onChange={(v) => setFilter("department", v)}
              options={["ALL", "HR", "Engineering", "Marketing"]}
            />
            <LabeledSelect
              label="Employee Group"
              value={filters.empGroup}
              onChange={(v) => setFilter("empGroup", v)}
              options={["ALL", "A", "B", "C"]}
            />
            <LabeledSelect
              label="Designation"
              value={filters.designation}
              onChange={(v) => setFilter("designation", v)}
              options={["ALL", "HR Manager", "Software Engineer", "Designer"]}
            />

            {/* Row 2 */}
            <LabeledInput
              label="Employee Code"
              value={filters.empCode}
              onChange={(v) => setFilter("empCode", v)}
            />
            <LabeledInput
              label="Employee Name"
              value={filters.empName}
              onChange={(v) => setFilter("empName", v)}
            />
            <LabeledInput
              label="User Name"
              value={filters.userName}
              onChange={(v) => setFilter("userName", v)}
            />
            <LabeledSelect
              label="Action"
              value={filters.status}
              onChange={(v) => setFilter("status", v)}
              options={["ALL", "Pending", "Approved", "Rejected"]}
            />

            {/* Row 3 */}
            <LabeledSelect
              label="Documents Attached"
              value={filters.docs}
              onChange={(v) => setFilter("docs", v)}
              options={["ALL", "Yes", "No"]}
            />
            <LabeledSelect
              label="Roles Template"
              value={filters.roleTemplate}
              onChange={(v) => setFilter("roleTemplate", v)}
              options={["ALL", "HR", "IT", "Ops"]}
            />
            <LabeledInput
              label="Cnic #"
              value={filters.cnic}
              onChange={(v) => setFilter("cnic", v)}
            />
            <LabeledSelect
              label="Flag"
              value={filters.flag}
              onChange={(v) => setFilter("flag", v)}
              options={["ALL", "High", "Normal", "Low"]}
            />
          </div>

          {/* Apply / Clear */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-customRed text-white hover:opacity-90"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 px-4 rounded-md border bg-white hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </form>

        {/* Show + Add New Employee (same line above table) */}
        <div className="px-4 pb-3 flex items-center justify-between text-sm">
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

          <button
            type="button"
            className="h-9 px-4 rounded-md bg-customRed text-white hover:opacity-90"
          >
            + Add New Employee
          </button>
        </div>

        {/* Table */}
        <div className="border-t">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="[&>th]:py-3 [&>th]:px-4 [&>th]:text-left">
                  <th style={{ width: 56 }}>S#</th>
                  <th>Employee</th>
                  <th>Details</th>
                  <th>Role Template</th>
                  <th>M. Att Allow</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Approvals</th>
                  <th>Added On</th>
                  <th style={{ width: 80 }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, idx) => (
                  <tr key={r.id} className="[&>td]:py-3 [&>td]:px-4 align-top">
                    <td>{firstItem + idx}</td>

                    <td className="whitespace-nowrap">
                      <div>Code : {r.emp.code}</div>
                      <div>Punch Code : {r.emp.punch}</div>
                      <div>Name : {r.emp.name}</div>
                      <div>CNIC # : {r.emp.cnic}</div>
                      <div>UserName : {r.emp.userName}</div>
                    </td>

                    <td className="whitespace-nowrap">
                      <div>Station : {r.details.station}</div>
                      <div>Department : {r.details.department}</div>
                      <div>Designation : {r.details.designation}</div>
                      <div>Group : {r.details.group}</div>
                      <div>Doc Exists : {r.details.docExists ? "Yes" : "No"}</div>
                    </td>

                    <td>{r.roleTemplate || "-"}</td>
                    <td>{r.mAttAllow ? "Yes" : "No"}</td>

                    <td>
                      <StatusPill status={r.status} />
                    </td>

                    <td>
                      <IconButton title="Details">
                        <CalendarIcon className="h-4 w-4" />
                      </IconButton>
                    </td>

                    <td>
                      <IconButton title="Approvals">
                        <UsersIcon className="h-4 w-4" />
                      </IconButton>
                    </td>

                    <td className="whitespace-nowrap">
                      <div>{r.addedOn}</div>
                      <div className="text-slate-500 text-xs">By {r.addedBy}</div>
                    </td>

                    <td>
                      <IconButton title="Action">
                        <MoreIcon className="h-4 w-4" />
                      </IconButton>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <div>Records 1 - {rows.length} of {total}</div>
            <div className="space-x-2">
              <button
                type="button"
                className="h-8 px-3 rounded border bg-white hover:bg-slate-50 disabled:opacity-40"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <button
                type="button"
                className="h-8 px-3 rounded border bg-white hover:bg-slate-50 disabled:opacity-40"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function LabeledInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <div className="text-[13px] text-slate-600 mb-1">{label}</div>
      <input
        type={type}
        className="h-9 w-full rounded-md border px-3 outline-none focus:ring-2 focus:ring-customRed/30"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function LabeledSelect({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <div className="text-[13px] text-slate-600 mb-1">{label}</div>
      <select
        className="h-9 w-full rounded-md border px-2 outline-none focus:ring-2 focus:ring-customRed/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "Approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2 h-6 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function IconButton({ title, children }) {
  return (
    <button
      type="button"
      title={title}
      className="inline-flex items-center justify-center h-8 w-8 rounded border bg-white hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

/* ---------- tiny inline icons (no deps) ---------- */
function ChevronDown(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}
function CalendarIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function UsersIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function MoreIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
