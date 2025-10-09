import React, { useState } from 'react';

import Sidebar from './components/Sidebar';
import Filters from './components/Filters';
import RequestTable from './components/RequestTable';
import ExemptionTable from './components/ExemptionTable';
import WorkSheetTable from './components/WorkSheetTable';      // <-- NEW

import AddRequestModal from './components/AddRequestModal';
import AddExemptionModal from './components/AddExemptionModal';
import AddWorkSheetModal from './components/AddWorkSheetModal'; // <-- NEW

import useAttendanceRequests from './hooks/useAttendanceRequests';
import { ATTENDANCE_NAV } from './constants';

function ComingSoon({ label }) {
  return (
    <div className="card">
      <div className="card-header"><h3 className="text-base font-semibold text-gray-900">{label}</h3></div>
      <div className="card-body text-sm text-gray-600">This section is coming soon.</div>
    </div>
  );
}

function ExemptionRequestPage({ perPage, onPerPageChange, onAddNew, onApply }) {
  const [page, setPage] = useState(1);
  const pageCount = 1;
  const rows = []; // TODO: hook to your exemption data

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
  const pageCount = 1;
  const [rows, setRows] = useState([]); // local table rows for now

  return (
    <>
      <Filters
        mode="worksheet"
        title="WorkSheet"
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        onUploadExcel={() => {}}
        onAddNew={onAddNew} // open modal
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

export default function AttendancePage() {
  const [nav, setNav] = useState(ATTENDANCE_NAV);
  const [modal, setModal] = useState(null); // 'attendance' | 'exemption' | 'worksheet'
  const { rows, applyFilters } = useAttendanceRequests({});
  const [perPage, setPerPage] = useState(10);

  const activeId = nav.find((i) => i.active)?.id || 'attendance-request';
  const handleNavigate = (id) =>
    setNav((prev) => prev.map((it) => ({ ...it, active: it.id === id })));

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

          {/* Others */}
          {[
            'remote-work',
            'shift-request',
            'amend-attendance',
            'amend-employee-shift',
            'attendance-approval',
            'schedule',
            'attendance-settings',
          ].includes(activeId) && (
            <ComingSoon label={nav.find((n) => n.id === activeId)?.label || ''} />
          )}
        </div>
      </main>

      {/* Modals */}
      <AddRequestModal open={modal === 'attendance'} onClose={() => setModal(null)} />
      <AddExemptionModal open={modal === 'exemption'} onClose={() => setModal(null)} />
      <AddWorkSheetModal
        open={modal === 'worksheet'}
        onClose={() => setModal(null)}
        onSaved={(payload) => {
          // hook in a refresh of worksheet table if needed
          console.log("worksheet saved", payload);
        }}
      />
    </div>
  );
}
