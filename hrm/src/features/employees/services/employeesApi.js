// Stub API layer. Replace with real HTTP calls (fetch/axios).

const SAMPLE = [
  {
    id: 1,
    code: "E-1001",
    punch_code: "1001",
    employee_name: "Sumitha Thomas",
    cnic: "35202-1234567-1",
    user_name: "sumitha",
    station: "Karachi",
    department: "HR",
    designation: "HR Manager",
    employee_group: "A",
    documents_attached: true,
    role_template: "HR",
    m_att_allow: true,
    status: "Active",
    added_on: "2024-08-01T10:15:00Z",
    modified_on: "2024-08-10T09:05:00Z",
  },
];

export async function fetchEmployees(/* filters */) {
  // TODO: call your backend with filters/page/perPage and return { items, count }
  return Promise.resolve({ items: SAMPLE, count: SAMPLE.length });
}

export async function exportEmployees(/* filters */) {
  console.log("EXPORT with filters");
  return Promise.resolve(true);
}
