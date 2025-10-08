// src/features/attendance/services/exemptionApi.js

export async function saveExemption(payload) {
  // TODO: replace with a real API call
  console.log("Saving exemption request:", payload);
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
}
