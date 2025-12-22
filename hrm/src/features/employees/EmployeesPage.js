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
      <div className="pr-6 pb-6">
        {/* Filters Card */}
        <div className="bg-white rounded-lg overflow-hidden shadow border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-medium">Filters</div>
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
        <div className="mt-4 bg-white rounded-lg overflow-hidden shadow border border-slate-200">
          <div className="px-4 py-3 flex items-center justify-between border-b bg-slate-50/70">
            <div className="text-xs text-slate-500">
              Showing {rows.length} of {total} employees
            </div>
            <div className="w-full max-w-xs">
              <input
                type="text"
                placeholder="Search name, code, department..."
                className="h-8 w-full rounded border border-slate-300 px-3 text-xs
                           focus:outline-none focus:ring-2 focus:ring-customRed/50
                           focus:border-customRed"
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
                className="h-8 px-3 rounded border border-customRed text-customRed bg-white hover:bg-customRed/10 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <button
                type="button"
                className="h-8 px-3 rounded border border-customRed text-customRed bg-white hover:bg-customRed/10 disabled:opacity-40 disabled:cursor-not-allowed"
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] pt-5 pb-6">
        <div className="flex gap-6 items-start">
          <div className="w-[15rem] shrink-0">
            <EmployeeSidebar activeKey={active} onNavigate={setActive} />
          </div>

          <main className="flex-1 min-w-0">{renderMain()}</main>
        </div>
      </div>
    </div>
  );
}
