import { useMemo, useState } from "react";

export default function useEmployeeProfileRequests() {
  // ------- filters (UI only) -------
  const [filters, setFilters] = useState({
    station: "ALL",
    department: "ALL",
    empGroup: "ALL",
    designation: "ALL",
    empCode: "",
    empName: "",
    userName: "",
    status: "ALL",
    docs: "ALL",
    roleTemplate: "ALL",
    cnic: "",
    flag: "ALL",
  });

  const setFilter = (k, v) => setFilters((s) => ({ ...s, [k]: v }));
  const resetFilters = () =>
    setFilters({
      station: "ALL",
      department: "ALL",
      empGroup: "ALL",
      designation: "ALL",
      empCode: "",
      empName: "",
      userName: "",
      status: "ALL",
      docs: "ALL",
      roleTemplate: "ALL",
      cnic: "",
      flag: "ALL",
    });

  // ------- mock rows -------
  const seed = useMemo(
    () => [
      {
        id: "r1",
        emp: {
          code: "E-1001",
          punch: "1001",
          name: "Sumitha Thomas",
          cnic: "35202-1234567-1",
          userName: "sumitha",
        },
        details: {
          station: "Karachi",
          department: "HR",
          designation: "HR Manager",
          group: "A",
          docExists: true,
        },
        roleTemplate: "HR",
        mAttAllow: true,
        status: "Pending",
        addedOn: "Aug 01, 2024, 03:15 PM",
        addedBy: "System",
      },
      {
        id: "r2",
        emp: {
          code: "E-1002",
          punch: "1002",
          name: "Umer R.",
          cnic: "35202-7654321-0",
          userName: "umer",
        },
        details: {
          station: "Karachi",
          department: "Engineering",
          designation: "Software Engineer",
          group: "A",
          docExists: true,
        },
        roleTemplate: "IT",
        mAttAllow: false,
        status: "Approved",
        addedOn: "Aug 10, 2024, 02:05 PM",
        addedBy: "Asim Qureshi",
      },
    ],
    []
  );

  // ------- paging -------
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const total = seed.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const firstItem = (page - 1) * perPage + 1;
  const rows = seed.slice((page - 1) * perPage, page * perPage);

  // ------- submit -------
  const apply = (e) => {
    e?.preventDefault?.();
    // Later: wire up backend query using filters, perPage, page, etc.
  };

  return {
    filters,
    setFilter,
    resetFilters,
    perPage,
    setPerPage,
    page,
    setPage,
    totalPages,
    firstItem,
    rows,
    total,
    apply,
  };
}
