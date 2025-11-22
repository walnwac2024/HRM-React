import { useEffect, useMemo, useState } from "react";
import api from "../../../utils/api";

// UI filter state (must match Filters)
export const emptyFilters = {
  station: "",
  department: "",
  employee_group: "",
  designation: "",
  employee_code: "",
  employee_name: "",
  user_name: "",
  status: "",
  documents_attached: "ALL",
  role_template: "",
  cnic: "",
  flag: "ALL",
};

// Map UI filter keys -> backend query params
function toApiParams(filters) {
  const params = {};

  if (filters.station) params.station = filters.station;
  if (filters.department) params.department = filters.department;

  if (filters.employee_code) params.employeeCode = filters.employee_code;
  if (filters.employee_name) params.employeeName = filters.employee_name;
  if (filters.user_name) params.userName = filters.user_name;

  if (filters.status) params.status = filters.status;
  if (filters.cnic) params.cnic = filters.cnic;

  // the rest are UI-only for now
  return params;
}

export default function useEmployees() {
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [openExport, setOpenExport] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const firstItem = useMemo(
    () => (total === 0 ? 0 : (page - 1) * perPage + 1),
    [page, perPage, total]
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / perPage)),
    [total, perPage]
  );

  const rows = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [list, page, perPage]
  );

  const load = async (filtersToUse) => {
    const params = toApiParams(filtersToUse);

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/employees", { params });

      const raw = Array.isArray(data) ? data : [];

      const items = raw.map((emp) => ({
        ...emp,
        id: emp.id,

        employee_code: emp.employeeCode ?? emp.Employee_ID ?? "",
        employee_name: emp.name ?? emp.Employee_Name ?? "",
        user_name: emp.userName ?? emp.login_email ?? "",

        station: emp.station ?? emp.Office_Location ?? "",
        department: emp.department ?? emp.Department ?? "",
        designation: emp.designation ?? emp.Designations ?? "",

        cnic: emp.cnic ?? emp.CNIC ?? "",
      }));

      setList(items);
      setTotal(items.length);
    } catch (err) {
      console.error("Failed to load employees", err);
      setList([]);
      setTotal(0);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const apply = (e) => {
    e?.preventDefault?.();
    setPage(1);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
    setAppliedFilters(emptyFilters);
  };

  const setFilter = (name, value) =>
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

  const exportData = async () => {
    try {
      const params = toApiParams(appliedFilters);
      const { data } = await api.get("/employees", { params });
      console.log("Export employees:", data);
    } catch (err) {
      console.error("Failed to export employees", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to export employees"
      );
    }
  };

  const uploadExcel = () => console.log("Upload Excel");
  const sendCreds = () => console.log("Send Credentials");
  const addNew = () => console.log("Add New Employee");

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

    openExport,
    setOpenExport,

    loading,
    error,

    apply,
    exportData,
    uploadExcel,
    sendCreds,
    addNew,
  };
}
