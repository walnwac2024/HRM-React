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
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h3 className="font-semibold text-gray-800">Upload Excel Files</h3>
          <button
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-4 pt-4">
          <div className="flex gap-2 p-1 bg-slate-50 rounded-lg w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`h-8 px-4 rounded-md text-xs font-medium transition-all
                  ${active === t.key
                    ? "bg-white text-customRed shadow-sm"
                    : "text-slate-500 hover:text-slate-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body space-y-4">
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-xs font-bold text-customRed hover:underline flex items-center gap-1.5"
              onClick={async () => {
                if (active === 'employees') {
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
              <i className="fas fa-download text-[10px]" />
              Download {tabs.find((t) => t.key === active)?.label} Template
            </button>
          </div>

          <div
            className="border-2 border-dashed rounded-2xl p-10 text-center
                       border-slate-200 hover:border-customRed bg-slate-50/50 transition-all cursor-pointer group"
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
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-customRed group-hover:scale-110 transition-transform">
                  <i className="fas fa-cloud-upload-alt text-xl" />
                </div>
                <div>
                  <div className="text-slate-800 font-bold">
                    Choose an Excel file
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    or drag & drop it here
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Accepted: .xlsx, .xls
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <i className="fas fa-file-excel text-xl" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-800">{file.name}</div>
                  <div className="text-[10px] text-gray-400">Ready to upload</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(); }}
                  className="text-xs font-bold text-customRed hover:opacity-80 transition-opacity"
                >
                  Change File
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer flex-col sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline flex-1 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file}
            onClick={save}
            className={`btn-primary flex-1 sm:flex-none ${!file ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Uploading..." : "Import Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
