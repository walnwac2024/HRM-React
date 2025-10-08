import React, { useState } from 'react';

import Sidebar from './components/Sidebar';
import Filters from './components/Filters';
import RequestTable from './components/RequestTable';
import AddRequestModal from './components/AddRequestModal';

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

/** Very light “Exemption Request” page using the same Filters + table shell */
function ExemptionRequestPage({
  perPage, onPerPageChange, onUploadExcel, onAddNew, onAddIrregular, onApply,
}) {
  return (
    <>
      <Filters
        title="Exemption Request"
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        onUploadExcel={onUploadExcel}
        onAddNew={onAddNew}
        onAddIrregular={onAddIrregular}
        onApply={onApply}
      />
      {/* You can replace rows with exemption data later */}
      <RequestTable rows={[]} page={1} pageCount={1} />
    </>
  );
}

export default function AttendancePage() {
  const [nav, setNav] = useState(ATTENDANCE_NAV);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
          {activeId === 'attendance-request' && (
            <>
              <Filters
                title="Attendance Request"
                onApply={applyFilters}
                perPage={perPage}
                onPerPageChange={setPerPage}
                onUploadExcel={() => {}}
                onAddNew={() => setIsFormOpen(true)}
                onAddIrregular={() => {}}
              />
              <RequestTable rows={rows} />
            </>
          )}

          {activeId === 'exemption-request' && (
            <ExemptionRequestPage
              perPage={perPage}
              onPerPageChange={setPerPage}
              onUploadExcel={() => {}}
              onAddNew={() => setIsFormOpen(true)}
              onAddIrregular={() => {}}
              onApply={applyFilters}
            />
          )}

          {/* For the rest of the sidebar items we can show a placeholder for now */}
          {[
            'worksheet',
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

      <AddRequestModal open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
