import React, { useState } from 'react';

import Sidebar from './components/Sidebar';
import Filters from './components/Filters';
import RequestTable from './components/RequestTable';
import ExemptionTable from './components/ExemptionTable';
import WorkSheetTable from './components/WorkSheetTable';
import RemoteWorkTable from './components/RemoteWorkTable';
import ShiftTable from './components/ShiftTable';

import AddRequestModal from './components/AddRequestModal';
import AddExemptionModal from './components/AddExemptionModal';
import AddWorkSheetModal from './components/AddWorkSheetModal';
import AddRemoteWorkModal from './components/AddRemoteWorkModal';
import AddShiftModal from './components/AddShiftModal';

// NEW: approval UI (import concrete files, not from an index)
import ApprovalFilters from './components/ApprovalFilters';
import AttendanceApprovalTable from './components/AttendanceApprovalTable';
import ApprovalViewModal from './components/ApprovalViewModal';

import useAttendanceRequests from './hooks/useAttendanceRequests';
import { ATTENDANCE_NAV } from './constants';

function ComingSoon({ label }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-base font-semibold text-gray-900">{label}</h3>
      </div>
      <div className="card-body text-sm text-gray-600">
        This section is coming soon.
      </div>
    </div>
  );
}

function ExemptionRequestPage({ perPage, onPerPageChange, onAddNew, onApply }) {
  const [page, setPage] = useState(1);
  const pageCount = 1;
  const rows = []; // placeholder for exemption data

  return (
    <>
      <Filters
        mode="exemption"
        title="Exemption Request"
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        onAddNew={onAddNew}
        onApply={onApply}
      />
      <ExemptionTable
        rows={rows}
        page={page}
        pageCount={pageCount}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
      />
    </>
  );
}

function WorkSheetSection({ perPage, onPerPageChange, onAddNew }) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const pageCount = 1;

  return (
    <>
      <Filters
        mode="worksheet"
        title="WorkSheet"
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        onUploadExcel={() => {}}
        onAddNew={onAddNew}
        onApply={() => {}}
      />
      <WorkSheetTable
        rows={rows}
        page={page}
        pageCount={pageCount}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
      />
    </>
  );
}

function RemoteWorkSection({ perPage, onPerPageChange, onAddNew, rows }) {
  const [page, setPage] = useState(1);
  const pageCount = 1;

  return (
    <>
      <Filters
        mode="remote"
        title="Remote Work Request"
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        onAddNew={onAddNew}
        onApply={() => {}}
      />
      <RemoteWorkTable
        rows={rows}
        page={page}
        pageCount={pageCount}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
      />
    </>
  );
}

function ShiftSection({ perPage, onPerPageChange, onAddNew, onAddIrregular, rows }) {
  const [page, setPage] = useState(1);
  const pageCount = 1;

  return (
    <>
      <Filters
        mode="shift"
        title="Shift Request"
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        onAddNew={onAddNew}
        onAddIrregular={onAddIrregular}
        onApply={() => {}}
      />
      <ShiftTable
        rows={rows}
        page={page}
        pageCount={pageCount}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
      />
    </>
  );
}

export default function AttendancePage() {
  const [nav, setNav] = useState(ATTENDANCE_NAV);
  const [modal, setModal] = useState(null); // 'attendance' | 'exemption' | 'worksheet' | 'remote' | 'shift' | 'shift-irregular'
  const [perPage, setPerPage] = useState(10);
  const { rows, applyFilters } = useAttendanceRequests({});

  // local rows for sections that don't have APIs hooked yet
  const [remoteRows, setRemoteRows] = useState([]);
  const [shiftRows, setShiftRows] = useState([]);

  // ---- NEW: approvals state ----
  const initialApprovalFilters = {
    station: '',
    department: '',
    subDepartment: '',
    employeeGroup: '',
    employee: '',
    employeeCode: '',
    employeeName: '',
    action: 'Pending',
    approvalType: 'Other Approval',
    requestDate: '',
    fromDashboard: '',
    flag: '',
  };
  const [approvalFilters, setApprovalFilters] = useState(initialApprovalFilters);

  const [approvalRows, setApprovalRows] = useState([
    {
      id: 1,
      employee: { name: 'Usama Test', code: '1235456' },
      employeeDetails: 'Stn :HeadOffice\nDept :Finance\nSub Dept :–\nGrp :Head Group',
      requestDate: '14-Jun-2021 (Monday)',
      requestType: 'Attendance Request',
      status: 'Pending',
      forwardedOn: '14-Jun-2021 05:48 PM',
      isFromDashboard: false,
      details: '—',
      approvals: '—',
    },
  ]);

  const [viewRow, setViewRow] = useState(null);

  const activeId = nav.find((i) => i.active)?.id || 'attendance-request';
  const handleNavigate = (id) =>
    setNav((prev) => prev.map((it) => ({ ...it, active: it.id === id })));

  // unified handler for all approval actions
  const handleApprovalAction = (action, row) => {
    if (action === 'view') {
      setViewRow(row);
      return;
    }
    if (action === 'download') {
      const blob = new Blob([JSON.stringify(row, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `request-${row.id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }
    // optimistic status update (replace with API)
    setApprovalRows((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              status:
                action === 'approve'
                  ? 'Approved'
                  : action === 'reject'
                  ? 'Rejected'
                  : action === 'force'
                  ? 'Forcefully Approved'
                  : action === 'cancel'
                  ? 'Cancelled'
                  : r.status,
            }
          : r
      )
    );
  };

  return (
    <div className="bg-gray-50">
      <main className="page grid grid-cols-1 gap-4 lg:grid-cols-[15rem_1fr]">
        <Sidebar items={nav} onNavigate={handleNavigate} />

        <div className="flex flex-col gap-4">
          {/* Attendance */}
          {activeId === 'attendance-request' && (
            <>
              <Filters
                mode="attendance"
                title="Attendance Request"
                onApply={applyFilters}
                perPage={perPage}
                onPerPageChange={setPerPage}
                onUploadExcel={() => {}}
                onAddNew={() => setModal('attendance')}
                onAddIrregular={() => {}}
              />
              <RequestTable rows={rows} />
            </>
          )}

          {/* Exemption */}
          {activeId === 'exemption-request' && (
            <ExemptionRequestPage
              perPage={perPage}
              onPerPageChange={setPerPage}
              onAddNew={() => setModal('exemption')}
              onApply={() => {}}
            />
          )}

          {/* WorkSheet */}
          {activeId === 'worksheet' && (
            <WorkSheetSection
              perPage={perPage}
              onPerPageChange={setPerPage}
              onAddNew={() => setModal('worksheet')}
            />
          )}

          {/* Remote Work Request */}
          {activeId === 'remote-work' && (
            <RemoteWorkSection
              perPage={perPage}
              onPerPageChange={setPerPage}
              onAddNew={() => setModal('remote')}
              rows={remoteRows}
            />
          )}

          {/* Shift Request */}
          {activeId === 'shift-request' && (
            <ShiftSection
              perPage={perPage}
              onPerPageChange={setPerPage}
              onAddNew={() => setModal('shift')}
              onAddIrregular={() => setModal('shift-irregular')}
              rows={shiftRows}
            />
          )}

          {/* Attendance Approval */}
          {activeId === 'attendance-approval' && (
            <>
              <ApprovalFilters
                value={approvalFilters}
                onChange={setApprovalFilters}
                onApply={() => {
                  // hook to API/filter logic with approvalFilters
                  console.log('apply approval filters', approvalFilters);
                }}
                onClear={() => setApprovalFilters(initialApprovalFilters)}
              />
              <AttendanceApprovalTable
                rows={approvalRows.map((r) => ({
                  id: r.id,
                  employeeName: `${r.employee.name} (${r.employee.code})`,
                  employeeCode: r.employee.code,
                  requestDate: r.requestDate,
                  requestType: r.requestType,
                  status: r.status,
                }))}
                onView={(row) => handleApprovalAction('view', row)}
                onForceApprove={(row) => handleApprovalAction('force', row)}
                onDownload={(row) => handleApprovalAction('download', row)}
              />
            </>
          )}

          {/* Other placeholders */}
          {['amend-attendance', 'amend-employee-shift', 'schedule', 'attendance-settings'].includes(
            activeId
          ) && <ComingSoon label={nav.find((n) => n.id === activeId)?.label || ''} />}
        </div>
      </main>

      {/* Modals */}
      <AddRequestModal open={modal === 'attendance'} onClose={() => setModal(null)} />

      <AddExemptionModal open={modal === 'exemption'} onClose={() => setModal(null)} />

      <AddWorkSheetModal
        open={modal === 'worksheet'}
        onClose={() => setModal(null)}
        onSaved={(payload) => {
          console.log('worksheet saved', payload);
        }}
      />

      <AddRemoteWorkModal
        open={modal === 'remote'}
        onClose={() => setModal(null)}
        onSaved={(payload) => {
          setRemoteRows((prev) => [
            {
              id: Date.now(),
              employee: { name: payload.employee },
              remoteDate: payload.remoteDate,
              inDate: payload.inDate,
              outDate: payload.outDate,
              inTime: payload.inTime,
              outTime: payload.outTime,
              details: payload.details,
              status: 'Pending',
              addedOn: payload.addedOn,
              approvals: '—',
            },
            ...prev,
          ]);
        }}
      />

      {/* Shift Modals */}
      <AddShiftModal
        open={modal === 'shift'}
        onClose={() => setModal(null)}
        onSaved={(payload) => {
          setShiftRows((prev) => [
            {
              id: Date.now(),
              employee: { name: payload.employee },
              shiftDate: payload.shiftDate,
              details: payload.details,
              status: payload.status,
              addedOn: payload.addedOn,
              approvals: '—',
            },
            ...prev,
          ]);
        }}
      />
      <AddShiftModal
        irregular
        open={modal === 'shift-irregular'}
        onClose={() => setModal(null)}
        onSaved={(payload) => {
          setShiftRows((prev) => [
            {
              id: Date.now(),
              employee: { name: payload.employee },
              shiftDate: payload.shiftDate,
              details: payload.details,
              status: payload.status,
              addedOn: payload.addedOn,
              approvals: '—',
            },
            ...prev,
          ]);
        }}
      />

      {/* View modal for approvals */}
      <ApprovalViewModal
        open={!!viewRow}
        data={viewRow}
        onClose={() => setViewRow(null)}
        onApprove={(row) => {
          handleApprovalAction('approve', row);
          setViewRow(null);
        }}
        onReject={(row) => {
          handleApprovalAction('reject', row);
          setViewRow(null);
        }}
      />
    </div>
  );
}
