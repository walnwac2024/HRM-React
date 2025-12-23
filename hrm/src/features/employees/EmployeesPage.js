// src/features/employees/EmployeesPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Filters from "./components/Filters";
import ActionsBar from "./components/ActionsBar";
import ExportModal from "./components/ExportModal";
import EmployeesTable from "./components/EmployeesTable";
import UploadExcelModal from "./components/UploadExcelModal";
import SendCredentialsModal from "./components/SendCredentialsModal";
import AddEmployeeModal from "./components/AddEmployeeModal";
import useEmployees from "./hooks/useEmployees";
import useEmployeeFilterOptions from "./hooks/useEmployeeFilterOptions";
import EmployeeSidebar from "./components/EmployeeSidebar";

// Screens
import EmployeeProfileRequest from "./components/EmployeeProfileRequest";
import EmployeeTransfer from "./components/EmployeeTransfer";
import EmployeeInfoRequest from "./components/EmployeeInfoRequest";
import EmployeeApprovals from "./components/EmployeeApprovals";

// Employee Role screens
import EmployeeRoleMainView from "./components/EmployeeRoleMainView";
import CopyRoleView from "./components/CopyRoleView";
import RoleTemplatesView from "./components/RoleTemplatesView";

// Employee Settings Screen
import EmployeeSettings from "./components/EmployeeSettings";

import EditEmployeeModal from "./components/EditEmployeeModal";
import api from "../../utils/api";

export default function EmployeesPage() {
  const [active, setActive] = useState("employee-list");
  const navigate = useNavigate();

  const {
    filters,
    resetFilters,
    perPage,
    setPerPage,
    page,
    setPage,
    totalPages,
    firstItem,
    rows,
    list,
    total,
    openExport,
    setOpenExport,
    apply,
    exportData,
    loading,
    error,
    refetch,
  } = useEmployees();

  const [uiFilters, setUiFilters] = useState(filters);

  useEffect(() => {
    setUiFilters(filters);
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setUiFilters((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  const handleApply = () => {
    apply(uiFilters);
  };

  const handleClear = () => {
    resetFilters();
  };

  const handleSearchChange = (value) => {
    const next = { ...uiFilters, search: value };
    setUiFilters(next);
    apply(next);
  };

  const {
    options: filterOptions,
    error: filterOptionsError,
  } = useEmployeeFilterOptions();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState(null);

  const handleViewEmployee = (row) => {
    if (!row?.id) return;
    navigate(`/employees/${row.id}`);
  };

  const handleEditEmployee = (row) => {
    if (!row?.id) return;
    setEditEmployeeId(row.id);
  };

  /* ------------------------------------------------------------------
   * ✅ MARK INACTIVE / ACTIVATE (TOGGLE)
   * ------------------------------------------------------------------ */
  const handleMarkInactive = async (row) => {
    if (!row?.id) return;

    const isCurrentlyActive =
      row.isActive === true || Number(row.isActive) === 1;

    const nextActive = !isCurrentlyActive;

    const confirmText = nextActive
      ? "Activate this employee?"
      : "Mark this employee as inactive?";

    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      await api.patch(`/employees/${row.id}/status`, {
        is_active: nextActive ? 1 : 0,
        status: nextActive ? "Active" : "Left",
      });

      refetch();
    } catch (e) {
      console.error("Failed to update employee status", e);
      alert(
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update employee status"
      );
    }
  };

  const handleCloseEdit = (shouldRefresh = false) => {
    setEditEmployeeId(null);
    if (shouldRefresh) refetch();
  };

  const renderMain = () => {
    if (active === "employee-role" || active === "employee-role/main")
      return <EmployeeRoleMainView />;
    if (active === "employee-role/copy") return <CopyRoleView />;
    if (active === "employee-role/templates") return <RoleTemplatesView />;

    if (active === "employee-profile-request")
      return <EmployeeProfileRequest />;
    if (active === "employee-transfer") return <EmployeeTransfer />;
    if (active === "employee-info-request") return <EmployeeInfoRequest />;
    if (active === "employee-approvals") return <EmployeeApprovals />;

    if (active === "employee-settings") return <EmployeeSettings />;

    return (
      <div className="space-y-6">
        {/* Filters Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Filters</h2>
          </div>

          <div className="p-4">
            {filterOptionsError && (
              <div className="mb-3 text-sm text-red-600">
                {filterOptionsError}
              </div>
            )}

            <Filters
              filters={uiFilters}
              onChange={handleFilterChange}
              options={filterOptions}
            />

            <ActionsBar
              onApply={handleApply}
              onClear={handleClear}
              perPage={perPage}
              setPerPage={setPerPage}
              setOpenExport={setOpenExport}
              onOpenUpload={() => setUploadOpen(true)}
              onSendCreds={() => setSendOpen(true)}
              onAddNew={() => setAddOpen(true)}
              total={total}
            />

            {openExport && (
              <ExportModal
                onClose={() => setOpenExport(false)}
                onExport={() => {
                  exportData();
                  setOpenExport(false);
                }}
              />
            )}
          </div>
        </div>

        {/* Results Card */}
        <div className="card">
          <div className="card-header">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Showing {rows.length} of {total} employees
            </div>
            <div className="w-full max-w-xs">
              <input
                type="text"
                placeholder="Search name, code, department..."
                className="input"
                value={uiFilters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="px-4 py-2 text-sm text-gray-500 border-b">
              Loading employees…
            </div>
          )}
          {error && !loading && (
            <div className="px-4 py-2 text-sm text-red-600 border-b">
              {error}
            </div>
          )}

          <EmployeesTable
            rows={rows}
            firstItem={firstItem}
            onViewEmployee={handleViewEmployee}
            onEditEmployee={handleEditEmployee}
            onMarkInactive={handleMarkInactive}
          />

          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <div>
              Page {total === 0 ? 0 : page} of {totalPages}
            </div>
            <div className="space-x-2">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <UploadExcelModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
        />
        <SendCredentialsModal
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          onSend={(payload) => {
            alert(`Pretend sending credentials to: ${payload.employee}`);
            setSendOpen(false);
          }}
        />
        <AddEmployeeModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={() => {
            setAddOpen(false);
            refetch();
          }}
        />

        {editEmployeeId && (
          <EditEmployeeModal
            employeeId={editEmployeeId}
            onClose={handleCloseEdit}
          />
        )}
      </div>
    );
  };

  return (
    <main className="page grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
      <EmployeeSidebar activeKey={active} onNavigate={setActive} />
      <section className="flex-1 min-w-0">{renderMain()}</section>
    </main>
  );
}
