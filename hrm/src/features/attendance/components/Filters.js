import React, { useState } from 'react';
import SharedDropdown from '../../../components/common/SharedDropdown';
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
  onPerPageChange = () => { },
  onUploadExcel = () => { },
  onAddNew = () => { },
  onAddIrregular = () => { },
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

  const set = (k) => (val) => setVals((v) => ({ ...v, [k]: val }));

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SharedDropdown
            label="Station"
            value={vals.station}
            onChange={set('station')}
            options={STATIONS}
            searchable
          />

          <SharedDropdown
            label="Department"
            value={vals.department}
            onChange={set('department')}
            options={DEPARTMENTS}
            searchable
          />

          <SharedDropdown
            label="Sub Department"
            value={vals.subDepartment}
            onChange={set('subDepartment')}
            options={SUB_DEPARTMENTS}
            searchable
          />

          <SharedDropdown
            label="Employee Group"
            value={vals.employeeGroup}
            onChange={set('employeeGroup')}
            options={EMPLOYEE_GROUPS}
          />
        </div>

        {/* Row 2 */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <SharedDropdown
            label="Employee"
            value={vals.employee}
            onChange={set('employee')}
            options={EMPLOYEES}
            searchable
          />

          {/* Attendance/Exemption/Remote/Shift show date; Worksheet has its own fields */}
          {!isWorksheet && (
            <>
              <Field
                label={
                  isExemption ? 'Exemption Date'
                    : isRemote ? 'Remote Work Date'
                      : isShift ? 'Shift Date'
                        : 'Attendance Date'
                }
              >
                <input type="date" className="input" value={vals.date} onChange={set('date')} />
              </Field>

              <SharedDropdown
                label="Status"
                value={vals.status}
                onChange={set('status')}
                options={STATUSES}
              />

              {isExemption ? (
                <SharedDropdown
                  label="Flag Type"
                  value={vals.flagType}
                  onChange={set('flagType')}
                  options={FLAG_TYPES}
                />
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

              <SharedDropdown
                label="Year"
                value={vals.year}
                onChange={set('year')}
                options={WORKSHEET_YEARS}
              />

              <SharedDropdown
                label="Month"
                value={vals.month}
                onChange={set('month')}
                options={WORKSHEET_MONTHS}
              />
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

          <SharedDropdown
            label="Request Type"
            value={vals.requestType}
            onChange={set('requestType')}
            options={REQUEST_TYPES}
          />

          <SharedDropdown
            label="Flag"
            value={vals.flag}
            onChange={set('flag')}
            options={FLAGS}
          />

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
            <SharedDropdown
              label="Action"
              value={vals.action}
              onChange={set('action')}
              options={WORKSHEET_ACTIONS}
            />
          )}
        </div>

        {/* Row 4 (attendance/exemption types only) */}
        {!isWorksheet && !isRemote && !isShift && (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
            <SharedDropdown
              label={isExemption ? 'Exemption Type' : 'Attendance Type'}
              value={vals.type}
              onChange={set('type')}
              options={isExemption ? EXEMPTION_TYPES : ATTENDANCE_TYPES}
            />
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
