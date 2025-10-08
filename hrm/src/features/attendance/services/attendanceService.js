// attendance/services/attendanceService.js
const demoRows = [
  {
    id: 1,
    employee: { code: 'E-1001', punch: '1001', name: 'Sumitha Thomas' },
    date: '2024-08-10',
    changeType: 'In/Out Adjust',
    status: 'Pending',
    details: 'Late arrival due to traffic',
    approvals: 'Line Mgr',
    addedOn: '2024-08-10 09:15',
  },
];

export async function fetchAttendanceRequests(filters) {
  // Example for real API:
  // return fetch(`/api/attendance?${new URLSearchParams(filters)}`).then(r => r.json());
  await new Promise((r) => setTimeout(r, 200)); // simulate latency
  return demoRows;
}
