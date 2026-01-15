import React, { useState, useRef, useMemo } from "react";
import api from "../../../utils/api";

export default function UploadExcelModal({ open, onClose, onCreated }) {
  // ✅ Hooks at top-level (always run)
  const [active, setActive] = useState("employees");
  const [files, setFiles] = useState({
    employees: null,
    assets: null,
    dependants: null,
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const tabs = useMemo(
    () => [
      { key: "employees", label: "Employees", template: null, action: "download-template" },
      // { key: "assets",     label: "Assets",     template: "/templates/assets.xlsx" },
      // { key: "dependants", label: "Dependants", template: "/templates/dependants.xlsx" },
    ],
    []
  );

  // helpers (pure functions/handlers)
  const file = files[active];
  const accept = ".xlsx,.xls";

  const pick = (e) => {
    const f = e.target.files?.[0] || null;
    setFiles((s) => ({ ...s, [active]: f }));
  };

  const drop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    if (f) setFiles((s) => ({ ...s, [active]: f }));
  };

  const remove = () => setFiles((s) => ({ ...s, [active]: null }));

  const save = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", active); // employees, assets, etc.

      await api.post("/employees/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Upload successful! Existing records have been updated.");
      onClose?.();
      onCreated?.(); // Refresh list
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Conditional render AFTER hooks (allowed)
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose?.()}>
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* dialog */}
      <div className="relative z-10 w-full max-w-2xl mx-auto mt-14 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Upload Excel Files</h3>
          <button
            className="h-7 w-7 rounded-full grid place-items-center text-slate-600 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* tabs */}
        <div className="px-4 pt-3">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`h-9 px-3 rounded-md text-sm border transition-colors
                  ${active === t.key
                    ? "border-customRed text-customRed bg-red-50"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* body */}
        <div className="p-4">
          <div className="mb-3">
            <span
              className="text-xs text-customRed cursor-pointer hover:underline"
              onClick={async () => {
                if (active === 'employees') {
                  // download from API
                  try {
                    const res = await api.get("/employees/import-template", { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'employees_template.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                  } catch (e) {
                    alert("Failed to download template");
                  }
                } else {
                  alert("Template not available");
                }
              }}
            >
              Download {tabs.find((t) => t.key === active)?.label} Template
            </span>
          </div>

          <div
            className="border-2 border-dashed rounded-xl p-6 text-center
                       border-slate-200 hover:border-customRed transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={drop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={pick}
            />

            {!file ? (
              <>
                <div className="text-slate-600 text-sm">
                  Drag & drop an Excel file here, or{" "}
                  <span className="text-customRed">choose file</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">Accepted: .xlsx, .xls</div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <div className="text-sm text-slate-700">{file.name}</div>
                <button
                  type="button"
                  onClick={remove}
                  className="text-xs text-slate-500 hover:text-customRed"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file}
            onClick={save}
            className={`h-9 px-5 rounded-md text-white text-sm
              ${file ? "bg-customRed hover:opacity-95" : "bg-slate-300 cursor-not-allowed"}`}
          >
            {loading ? "Uploading..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
