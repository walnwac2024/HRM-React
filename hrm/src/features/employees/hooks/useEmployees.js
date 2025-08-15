import { useEffect, useMemo, useState } from "react";
import { fetchEmployees, exportEmployees } from "../services/employeesApi";

const emptyFilters = {
  station: "", department: "", employee_group: "", designation: "",
  employee_code: "", employee_name: "", user_name: "", status: "",
  documents_attached: "ALL", role_template: "", cnic: "", flag: "ALL",
};

export default function useEmployees() {
  const [filters, setFilters] = useState(emptyFilters);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [openExport, setOpenExport] = useState(false);

  const firstItem = useMemo(() => (page - 1) * perPage + 1, [page, perPage]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const rows = useMemo(() => list.slice((page - 1) * perPage, page * perPage), [list, page, perPage]);

  const load = async () => {
    const { items, count } = await fetchEmployees(filters);
    setList(items);
    setTotal(count);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const apply = async (e) => {
    e?.preventDefault?.();
    setPage(1);
    await load();
  };

  const resetFilters = async () => {
    setFilters(emptyFilters);
    setPage(1);
    await load();
  };

  const setFilter = (name, value) => setFilters((f) => ({ ...f, [name]: value }));

  const exportData = async () => {
    await exportEmployees(filters);
  };

  const uploadExcel = () => console.log("Upload Excel");
  const sendCreds = () => console.log("Send Credentials");
  const addNew = () => console.log("Add New Employee");

  return {
    filters, setFilter, resetFilters,
    perPage, setPerPage,
    page, setPage,
    totalPages, firstItem,
    rows, total,
    openExport, setOpenExport,
    apply, exportData, uploadExcel, sendCreds, addNew,
  };
}
