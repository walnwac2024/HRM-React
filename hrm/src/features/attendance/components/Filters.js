import React, { useState } from 'react';
import {
  STATIONS, DEPARTMENTS, SUB_DEPARTMENTS, EMPLOYEE_GROUPS, EMPLOYEES,
  STATUSES, REQUEST_TYPES, FLAGS, MARK_FROM_DASHBOARD,
  ATTENDANCE_TYPES, EXEMPTION_TYPES, FLAG_TYPES,
  WORKSHEET_ACTIONS, WORKSHEET_YEARS, WORKSHEET_MONTHS,
} from '../constants';

function Field({ label, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

/**
 * Reusable filters for:
 * mode: 'attendance' | 'exemption' | 'worksheet' | 'remote' | 'shift'
 */
export default function Filters({
  mode = 'attendance',
  title = 'Attendance Request',
  onApply,
  perPage = 10,
  onPerPageChange = () => {},
  onUploadExcel = () => {},
  onAddNew = () => {},
  onAddIrregular = () => {},
}) {
  const isExemption = mode === 'exemption';
  const isWorksheet = mode === 'worksheet';
  const isRemote = mode === 'remote';
  const isShift = mode === 'shift';

  const [vals, setVals] = useState({
    station: '--ALL--',
    department: '--ALL--',
    subDepartment: '--ALL--',
    employeeGroup: '--ALL--',
    employee: '--ALL--',
    date: '', // attendance / exemption / remote / shift date
    status: '--ALL--',
    employeeCode: '',
    employeeName: '',
    requestType: 'My Requests',
    flagType: '--ALL--',            // exemption only
    flag: '--ALL--',
    isMarkFromDashboard: '--ALL--', // attendance only
    type: '--ALL--',                // attendance/exemption type
    // worksheet-only
    titleText: '',
    year: '--ALL--',
    month: '--ALL--',
    action: 'ALL',
  });

  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  const resetVals = () =>
    setVals({
      station: '--ALL--',
      department: '--ALL--',
      subDepartment: '--ALL--',
      employeeGroup: '--ALL--',
      employee: '--ALL--',
      date: '',
      status: '--ALL--',
      employeeCode: '',
      employeeName: '',
      requestType: 'My Requests',
      flagType: '--ALL--',
      flag: '--ALL--',
      isMarkFromDashboard: '--ALL--',
      type: '--ALL--',
      titleText: '',
      year: '--ALL--',
      month: '--ALL--',
      action: 'ALL',
    });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="card-body">
        {/* Row 1 (shared) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Station">
            <select className="select" value={vals.station} onChange={set('station')}>
              {STATIONS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>

          <Field label="Department">
            <select className="select" value={vals.department} onChange={set('department')}>
              {DEPARTMENTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>

          <Field label="Sub Department">
            <select className="select" value={vals.subDepartment} onChange={set('subDepartment')}>
              {SUB_DEPARTMENTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>

          <Field label="Employee Group">
            <select className="select" value={vals.employeeGroup} onChange={set('employeeGroup')}>
              {EMPLOYEE_GROUPS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
        </div>

        {/* Row 2 */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Employee">
            <select className="select" value={vals.employee} onChange={set('employee')}>
              {EMPLOYEES.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>

          {/* Attendance/Exemption/Remote/Shift show date; Worksheet has its own fields */}
          {!isWorksheet && (
            <>
              <Field
                label={
                  isExemption ? 'Exemption Date'
                  : isRemote   ? 'Remote Work Date'
                  : isShift    ? 'Shift Date'
                  : 'Attendance Date'
                }
              >
                <input type="date" className="input" value={vals.date} onChange={set('date')} />
              </Field>

              <Field label="Status">
                <select className="select" value={vals.status} onChange={set('status')}>
                  {STATUSES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>

              {isExemption ? (
                <Field label="Flag Type">
                  <select className="select" value={vals.flagType} onChange={set('flagType')}>
                    {FLAG_TYPES.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
              ) : (
                // Show Employee Code for Attendance AND Shift; hide for Exemption/Remote
                (mode === 'attendance' || isShift) && (
                  <Field label="Employee Code">
                    <input
                      className="input"
                      placeholder="Employee Code"
                      value={vals.employeeCode}
                      onChange={set('employeeCode')}
                    />
                  </Field>
                )
              )}
            </>
          )}

          {/* Worksheet-specific Row 2 right side */}
          {isWorksheet && (
            <>
              <Field label="Title">
                <input
                  className="input"
                  placeholder="Type something"
                  value={vals.titleText}
                  onChange={set('titleText')}
                />
              </Field>

              <Field label="Year">
                <select className="select" value={vals.year} onChange={set('year')}>
                  {WORKSHEET_YEARS.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>

              <Field label="Month">
                <select className="select" value={vals.month} onChange={set('month')}>
                  {WORKSHEET_MONTHS.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
            </>
          )}
        </div>

        {/* Row 3 */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Employee Name">
            <input
              className="input"
              placeholder="Employee Name"
              value={vals.employeeName}
              onChange={set('employeeName')}
            />
          </Field>

          <Field label="Request Type">
            <select className="select" value={vals.requestType} onChange={set('requestType')}>
              {REQUEST_TYPES.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>

          <Field label="Flag">
            <select className="select" value={vals.flag} onChange={set('flag')}>
              {FLAGS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>

          {/* Attendance-only control */}
          {!isExemption && !isWorksheet && !isRemote && !isShift && (
            <Field label="Is Mark From Dashboard">
              <select
                className="select"
                value={vals.isMarkFromDashboard}
                onChange={set('isMarkFromDashboard')}
              >
                {MARK_FROM_DASHBOARD.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          )}

          {isWorksheet && (
            <Field label="Action">
              <select className="select" value={vals.action} onChange={set('action')}>
                {WORKSHEET_ACTIONS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          )}
        </div>

        {/* Row 4 (attendance/exemption types only) */}
        {!isWorksheet && !isRemote && !isShift && (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Field label={isExemption ? 'Exemption Type' : 'Attendance Type'}>
              <select className="select" value={vals.type} onChange={set('type')}>
                {(isExemption ? EXEMPTION_TYPES : ATTENDANCE_TYPES).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-primary" onClick={() => onApply?.(vals)}>Apply</button>
            <button className="btn-outline" onClick={resetVals}>Clear Filters</button>
          </div>

          <div className="flex flex-wrap items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-gray-700">Show</span>
            <select
              className="btn-chip !px-2"
              value={perPage}
              onChange={(e) => onPerPageChange?.(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-sm text-gray-700">Records</span>

            {/* Upload Excel: Attendance + Worksheet only */}
            {!isExemption && !isRemote && !isShift && (
              <button onClick={onUploadExcel} className="btn-outline">Upload Excel</button>
            )}

            <button onClick={onAddNew} className="btn-primary">
              {isWorksheet ? '+ Add New WorkSheet' : '+ Add New Request'}
            </button>

            {/* Irregular button:
               - Attendance -> Irregular Attendance
               - Shift      -> Irregular Shift
               - Otherwise hidden */}
            {!isWorksheet && !isRemote && !isExemption && isShift && (
              <button onClick={onAddIrregular} className="btn-outline">
                + Add Irregular Shift Request
              </button>
            )}
            {!isWorksheet && !isRemote && !isExemption && !isShift && (
              <button onClick={onAddIrregular} className="btn-outline">
                + Add Irregular Attendance Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
