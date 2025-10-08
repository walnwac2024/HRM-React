// src/features/attendance/services/requestApi.js

// TODO: replace these with real API calls

export async function getSignInTimeForDate(employeeIdOrCode, isoDate) {
  // Example: call your backend:
  // const { data } = await api.get(`/attendance/signin-time`, { params: { emp: employeeIdOrCode, date: isoDate }});
  // return data.time;

  // Demo fallback so the UI auto-fills:
  await new Promise((r) => setTimeout(r, 150));
  return "09:00";
}

export async function createAttendanceRequest(payload) {
  // Example: real call
  // return api.post('/attendance/requests', payload);

  console.log("Submitting attendance request:", payload);
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true };
}
