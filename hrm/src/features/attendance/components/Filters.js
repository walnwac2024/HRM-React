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

        {/* Actions Section */}
        <div className="mt-8 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 border-t border-slate-100 pt-6">
          {/* Group 1: Filter Logic Actions */}
          <div className="grid grid-cols-2 sm:flex items-center gap-3">
            <button
              className="btn-primary flex-1 sm:flex-none"
              onClick={() => onApply?.(vals)}
            >
              Apply Filter
            </button>
            <button
              className="btn-outline flex-1 sm:flex-none"
              onClick={resetVals}
            >
              Clear
            </button>
          </div>

          {/* Group 2: Table Utilities & Primary Actions */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1 justify-end">
            {/* Show Records Selector */}
            <div className="flex items-center px-4 h-11 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-customRed min-w-[120px]">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-3">Show</span>
              <select
                className="bg-transparent outline-none font-bold text-slate-800 cursor-pointer flex-1 appearance-none pr-6"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1rem' }}
                value={perPage}
                onChange={(e) => onPerPageChange?.(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Action Buttons Group - Responsive Grid/Flex */}
            <div className="grid grid-cols-2 lg:grid-cols-3 sm:flex flex-wrap items-center gap-2">
              {!isExemption && !isRemote && !isShift && (
                <button
                  onClick={onUploadExcel}
                  className="btn-utility flex-1 sm:flex-none"
                >
                  Upload
                </button>
              )}

              <button
                onClick={onAddNew}
                className="btn-primary flex-1 sm:flex-none shadow-lg shadow-red-500/20"
              >
                {isWorksheet ? '+ WorkSheet' : '+ New Request'}
              </button>

              {/* Irregular Actions */}
              {!isWorksheet && !isRemote && !isExemption && (
                <button
                  onClick={onAddIrregular}
                  className="btn-utility flex-1 sm:flex-none"
                  title={isShift ? "Add Irregular Shift" : "Add Irregular Attendance"}
                >
                  + Irregular
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
