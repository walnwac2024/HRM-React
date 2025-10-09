import React, { useState } from "react";
import Filters from "./Filters";
import WorkSheetTable from "./WorkSheetTable";
import WorkSheetForm from "./AddWorkSheetModal";

export default function WorkSheetPage() {
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // stub rows until API is wired
  const [rows, setRows] = useState([]);

  if (showForm) {
    return (
      <WorkSheetForm
        onBack={() => setShowForm(false)}
        onSaved={(created) => {
          setRows((r) => [{ id: Date.now(), title: created.title, employee: { name: created.employee }, date: created.date, status: "Pending", addedOn: created.addedOn }, ...r]);
        }}
      />
    );
    // If you prefer a modal, swap to a modal like your AddExemptionModal pattern.
  }

  return (
    <>
      <Filters
        mode="worksheet"
        title="WorkSheet"
        perPage={perPage}
        onPerPageChange={setPerPage}
        onUploadExcel={() => {}}
        onAddNew={() => setShowForm(true)}  // redirect-like switch to form
        onApply={() => {}}
      />
      <WorkSheetTable
        rows={rows}
        page={page}
        pageCount={1}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(1, p + 1))}
      />
    </>
  );
}
