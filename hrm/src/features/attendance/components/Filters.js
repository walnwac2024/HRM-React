import React, { useState } from 'react';
import {
  STATIONS,
  DEPARTMENTS,
  SUB_DEPARTMENTS,
  EMPLOYEE_GROUPS,
  EMPLOYEES,
  STATUSES,
  REQUEST_TYPES,
  FLAGS,
  MARK_FROM_DASHBOARD,
  ATTENDANCE_TYPES,
} from '../constants';

function Field({ label, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function Filters({
  title = 'Attendance Request',          // <— NEW (lets us reuse on Exemption page)
  onApply,
  perPage = 10,
  onPerPageChange = () => {},
  onUploadExcel = () => {},
  onAddNew = () => {},
  onAddIrregular = () => {},
}) {
  const [vals, setVals] = useState({
    station: '--ALL--',
    department: '--ALL--',
    subDepartment: '--ALL--',
    employeeGroup: '--ALL--',
    employee: '--ALL--',
    attendanceDate: '',
    status: '--ALL--',
    employeeCode: '',
    employeeName: '',
    requestType: 'My Requests',
    flag: '--ALL--',
    isMarkFromDashboard: '--ALL--',
    attendanceType: '--ALL--',
  });

  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="card-body">
        {/* Row 1 */}
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

          <Field label="Attendance Date">
            <input type="date" className="input" value={vals.attendanceDate} onChange={set('attendanceDate')} />
          </Field>

          <Field label="Status">
            <select className="select" value={vals.status} onChange={set('status')}>
              {STATUSES.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>

          <Field label="Employee Code">
            <input className="input" placeholder="Employee Code" value={vals.employeeCode} onChange={set('employeeCode')} />
          </Field>
        </div>

        {/* Row 3 */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Employee Name">
            <input className="input" placeholder="Employee Name" value={vals.employeeName} onChange={set('employeeName')} />
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

          <Field label="Is Mark From Dashboard">
            <select className="select" value={vals.isMarkFromDashboard} onChange={set('isMarkFromDashboard')}>
              {MARK_FROM_DASHBOARD.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
        </div>

        {/* Row 4 */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Attendance Type">
            <select className="select" value={vals.attendanceType} onChange={set('attendanceType')}>
              {ATTENDANCE_TYPES.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
        </div>

        {/* Actions row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-primary" onClick={() => onApply?.(vals)}>Apply</button>
            <button
              className="btn-outline"
              onClick={() =>
                setVals({
                  station: '--ALL--',
                  department: '--ALL--',
                  subDepartment: '--ALL--',
                  employeeGroup: '--ALL--',
                  employee: '--ALL--',
                  attendanceDate: '',
                  status: '--ALL--',
                  employeeCode: '',
                  employeeName: '',
                  requestType: 'My Requests',
                  flag: '--ALL--',
                  isMarkFromDashboard: '--ALL--',
                  attendanceType: '--ALL--',
                })
              }
            >
              Clear Filters
            </button>
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

            <button onClick={onUploadExcel} className="btn-outline">Upload Excel</button>
            <button onClick={onAddNew} className="btn-primary">+ Add New Request</button>
            <button onClick={onAddIrregular} className="btn-outline">+ Add Irregular Attendance Request</button>
          </div>
        </div>
      </div>
    </div>
  );
}
