// src/features/employees/EmployeesPage.js
import React, { useState } from "react";
import Filters from "./components/Filters";
import ActionsBar from "./components/ActionsBar";
import ExportModal from "./components/ExportModal";
import EmployeesTable from "./components/EmployeesTable";
import UploadExcelModal from "./components/UploadExcelModal";
import SendCredentialsModal from "./components/SendCredentialsModal";
import AddEmployeeModal from "./components/AddEmployeeModal";
import useEmployees from "./hooks/useEmployees";
import EmployeeSidebar from "./components/EmployeeSidebar";

// Screens
import EmployeeProfileRequest from "./components/EmployeeProfileRequest";
import EmployeeTransfer from "./components/EmployeeTransfer";
import EmployeeInfoRequest from "./components/EmployeeInfoRequest"; // ← NEW

// Employee Role screens
import EmployeeRoleMainView from "./components/EmployeeRoleMainView";
import CopyRoleView from "./components/CopyRoleView";
import RoleTemplatesView from "./components/RoleTemplatesView";

export default function EmployeesPage() {
  const [active, setActive] = useState("employee-list");

  const {
    filters, setFilter, resetFilters,
    perPage, setPerPage,
    page, setPage, totalPages, firstItem,
    rows, total,
    openExport, setOpenExport,
    apply, exportData,
  } = useEmployees();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const renderMain = () => {
    // Employee Role routes
    if (active === "employee-role" || active === "employee-role/main") {
      return <EmployeeRoleMainView />;
    }
    if (active === "employee-role/copy") return <CopyRoleView />;
    if (active === "employee-role/templates") return <RoleTemplatesView />;

    // Other routes
    if (active === "employee-profile-request") return <EmployeeProfileRequest />;
    if (active === "employee-transfer") return <EmployeeTransfer />;
    if (active === "employee-info-request") return <EmployeeInfoRequest />; // ← NEW

    // Placeholders for the rest
    if (active !== "employee-list") {
      const labelMap = {
        "employee-approvals": "Employee Approvals",
        "employee-settings": "Employee Settings",
      };
      return (
        <div className="pt-6 pr-6 pb-6">
          <div className="bg-white rounded-lg overflow-hidden shadow border border-slate-200 p-8">
            <h2 className="text-lg font-semibold mb-2">{labelMap[active] ?? "Section"}</h2>
            <p className="text-slate-600">
              This section is a placeholder. Hook up its UI here when ready.
            </p>
          </div>
        </div>
      );
    }

    // Employee List (Filters + Table)
    return (
      <div className="pr-6 pb-6">
        {/* Filters Card */}
        <div className="bg-white rounded-lg overflow-hidden shadow border border-slate-200 mt-[2px]">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-medium">Filters</div>
            {/* icon button colored with customRed */}
            <button className="text-customRed hover:text-customRed/80" title="Toggle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5h18v2H3zM7 11h10v2H7zM10 17h4v2h-4z" />
              </svg>
            </button>
          </div>

          <form onSubmit={apply} className="p-4">
            <Filters filters={filters} onChange={setFilter} />

            {/* ActionsBar already uses customRed styles */}
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
          <EmployeesTable rows={rows} firstItem={firstItem} />
          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <div>Page {page} of {totalPages}</div>
            <div className="space-x-2">
              {/* Outline customRed buttons */}
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
      <div className="mx-auto max-w-[1600px] pt-14 pb-6">
        <div className="flex gap-6 items-stretch">
          <div className="w-[15rem] shrink-0 flex">
            <EmployeeSidebar activeKey={active} onNavigate={setActive} />
          </div>

          <main className="flex-1 flex flex-col">
            {renderMain()}
          </main>
        </div>
      </div>
    </div>
  );
}
