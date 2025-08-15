import React from "react";
import Filters from "./components/Filters";
import ActionsBar from "./components/ActionsBar";
import ExportModal from "./components/ExportModal";
import EmployeesTable from "./components/EmployeesTable";
import useEmployees from "./hooks/useEmployees";

export default function EmployeesPage() {
  const {
    filters, setFilter, resetFilters, perPage, setPerPage,
    page, setPage, totalPages, firstItem,
    rows, total,
    openExport, setOpenExport,
    apply, exportData, uploadExcel, sendCreds, addNew,
  } = useEmployees();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Filter Card */}
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-medium">Filters</div>
          <button className="text-slate-500 hover:text-slate-700" title="Toggle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5h18v2H3zM7 11h10v2H7zM10 17h4v2h-4z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={apply} className="p-4">
          <Filters filters={filters} onChange={setFilter} />

          <ActionsBar
            onApply={apply}
            onClear={resetFilters}
            perPage={perPage}
            setPerPage={setPerPage}
            setOpenExport={setOpenExport}
            onUploadExcel={uploadExcel}
            onSendCreds={sendCreds}
            onAddNew={addNew}
            total={total}
          />

          {openExport && (
            <ExportModal
              onClose={() => setOpenExport(false)}
              onExport={() => { exportData(); setOpenExport(false); }}
            />
          )}
        </form>
      </div>

      {/* Results */}
      <div className="mt-4 bg-white rounded-lg shadow border border-slate-200">
        <EmployeesTable rows={rows} firstItem={firstItem} />

        {/* Simple pagination */}
        <div className="px-4 py-3 flex items-center justify-between text-sm">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="space-x-2">
            <button
              className="h-8 px-3 rounded border bg-white hover:bg-slate-50 disabled:opacity-40"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              className="h-8 px-3 rounded border bg-white hover:bg-slate-50 disabled:opacity-40"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
