import React, { useState } from "react";
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

export default function EmployeesPage() {
  const [active, setActive] = useState("employee-list");
  const navigate = useNavigate();

  const {
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
    apply,
    exportData,
    loading,
    error,
  } = useEmployees();

  const {
    options: filterOptions,
    error: filterOptionsError,
  } = useEmployeeFilterOptions();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const handleViewEmployee = (row) => {
    if (!row?.id) return;
    navigate(`/employees/${row.id}`);
  };

  const renderMain = () => {
    if (active === "employee-role" || active === "employee-role/main")
      return <EmployeeRoleMainView />;
    if (active === "employee-role/copy") return <CopyRoleView />;
    if (active === "employee-role/templates") return <RoleTemplatesView />;

    if (active === "employee-profile-request") return <EmployeeProfileRequest />;
    if (active === "employee-transfer") return <EmployeeTransfer />;
    if (active === "employee-info-request") return <EmployeeInfoRequest />;
    if (active === "employee-approvals") return <EmployeeApprovals />;

    if (active === "employee-settings") return <EmployeeSettings />;

    // Employee List
    return (
      <div className="pr-6 pb-6">
        {/* Filters Card */}
        <div className="bg-white rounded-lg overflow-hidden shadow border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-medium">Filters</div>
            <button className="text-customRed hover:text-customRed/80" title="Toggle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 5h18v2H3zM7 11h10v2H7zM10 17h4v2h-4z" />
              </svg>
            </button>
          </div>

          <form onSubmit={apply} className="p-4">
            {filterOptionsError && (
              <div className="mb-3 text-sm text-red-600">
                {filterOptionsError}
              </div>
            )}

            <Filters
              filters={filters}
              onChange={setFilter}
              options={filterOptions}
            />

            <ActionsBar
              onClear={resetFilters}
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
          </form>
        </div>

        {/* Results Card */}
        <div className="mt-4 bg-white rounded-lg overflow-hidden shadow border border-slate-200">
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
        <UploadExcelModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
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
          onSave={() => setAddOpen(false)}
        />
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
