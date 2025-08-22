// src/features/employees/components/EmployeeDocuments.js
import React, { useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaUpload,
  FaDownload,
  FaEye,
  FaTimes,
} from "react-icons/fa";

const DOC_TYPES = [
  "Matric Marksheet",
  "Intermediate Marksheet",
  "Bachelor Degree",
  "CNIC",
  "Resume",
  "Offer Letter",
];

const fmtBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
};

export default function EmployeeDocuments({ form, set }) {
  const docs = form?.documents ?? [];

  // always render at least one row
  useEffect(() => {
    if (!docs.length) {
      set("documents")([
        {
          title: "Document 1",
          type: "",
          file: null,
          uploadedBy: "",
          uploadedOn: "",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDocs = (next) => set("documents")(next);

  const setField = (idx, key) => (eOrVal) => {
    const value = eOrVal?.target ? eOrVal.target.value : eOrVal;
    const next = [...docs];
    next[idx] = { ...next[idx], [key]: value };
    updateDocs(next);
  };

  const onPickFile = (idx) => (e) => {
    const file = e.target.files?.[0] || null;
    const next = [...docs];
    next[idx] = {
      ...next[idx],
      file,
      uploadedBy: file ? "You" : "",
      uploadedOn: file ? new Date().toISOString().slice(0, 10) : "",
    };
    updateDocs(next);
  };

  const clearFile = (idx) => {
    const next = [...docs];
    next[idx] = { ...next[idx], file: null, uploadedBy: "", uploadedOn: "" };
    updateDocs(next);
  };

  const addLine = () =>
    updateDocs([
      ...docs,
      {
        title: `Document ${docs.length + 1}`,
        type: "",
        file: null,
        uploadedBy: "",
        uploadedOn: "",
      },
    ]);

  const removeLine = (idx) => {
    const next = docs.filter((_, i) => i !== idx);
    updateDocs(
      next.length
        ? next
        : [
            {
              title: "Document 1",
              type: "",
              file: null,
              uploadedBy: "",
              uploadedOn: "",
            },
          ]
    );
  };

  const previewFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name || "document";
    a.click();
    URL.revokeObjectURL(url);
  };

  const baseInput =
    "h-9 w-full border border-slate-300 rounded px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-customRed/40 focus:border-customRed";

  return (
    // Slightly increased bottom padding to align with other tabs
    <div className="space-y-6 pb-[16.20rem]">
      {docs.map((d, idx) => {
        const hasFile = !!d.file;
        const fileName = hasFile ? d.file.name : "";
        const fileSize = hasFile ? fmtBytes(d.file.size) : "";
        const fileInputId = `doc-file-${idx}`;

        return (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Row header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-customRed/10 text-customRed grid place-items-center text-[12px] font-semibold">
                  {idx + 1}
                </span>

                <div className="grid sm:grid-cols-2 gap-3 items-center">
                  <div className="min-w-[220px]">
                    <label className="block text-[12px] text-slate-600 mb-1">
                      Title
                    </label>
                    <input
                      className={baseInput}
                      value={d.title ?? ""}
                      onChange={setField(idx, "title")}
                      placeholder="Document title"
                    />
                  </div>

                  <div className="min-w-[220px]">
                    <label className="block text-[12px] text-slate-600 mb-1">
                      Document Type
                    </label>
                    <select
                      className={`${baseInput} pr-8`}
                      value={d.type ?? ""}
                      onChange={setField(idx, "type")}
                    >
                      <option value="">Select type</option>
                      {DOC_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeLine(idx)}
                className="h-9 px-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
                title="Delete row"
              >
                <FaTrash /> Delete
              </button>
            </div>

            {/* Row content */}
            <div className="px-3 sm:px-4 py-3">
              <div className="grid lg:grid-cols-12 gap-4">
                {/* Upload / File chip */}
                <div className="lg:col-span-6">
                  <label className="block text-[12px] text-slate-600 mb-1">
                    Choose File
                  </label>

                  {!hasFile ? (
                    <label
                      htmlFor={fileInputId}
                      className="block w-full rounded-lg border border-dashed border-slate-300 hover:border-customRed/60 hover:bg-customRed/5 cursor-pointer transition p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-9 rounded-md border border-customRed text-customRed grid place-items-center">
                          <FaUpload className="text-[13px]" />
                        </span>
                        <div>
                          <div className="text-sm text-slate-800">
                            Click to upload
                            <span className="text-slate-500">
                              {" "}
                              or drag &amp; drop here
                            </span>
                          </div>
                          <div className="text-[12px] text-slate-500">
                            PNG, JPG, PDF up to ~10MB
                          </div>
                        </div>
                      </div>
                      <input
                        id={fileInputId}
                        type="file"
                        className="hidden"
                        onChange={onPickFile(idx)}
                      />
                    </label>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      {/* filename chip */}
                      <span
                        className="truncate max-w-[320px] px-2.5 py-1.5 rounded-md bg-gray-100 border border-slate-200 text-slate-800"
                        title={`${fileName}${fileSize ? ` • ${fileSize}` : ""}`}
                      >
                        {fileName}
                        {fileSize ? (
                          <span className="text-slate-500"> • {fileSize}</span>
                        ) : null}
                      </span>

                      {/* actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => previewFile(d.file)}
                          className="h-9 px-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
                          title="Preview"
                        >
                          <FaEye className="text-[12px]" /> Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadFile(d.file)}
                          className="h-9 px-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
                          title="Download"
                        >
                          <FaDownload className="text-[12px]" /> Download
                        </button>

                        <label
                          htmlFor={fileInputId}
                          className="h-9 px-3 rounded-md border border-customRed text-customRed bg-white hover:bg-customRed/5 text-sm inline-flex items-center gap-2 cursor-pointer"
                          title="Change file"
                        >
                          <FaUpload className="text-[12px]" /> Change
                        </label>

                        <button
                          type="button"
                          onClick={() => clearFile(idx)}
                          className="h-9 px-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
                          title="Remove"
                        >
                          <FaTimes className="text-[12px]" /> Remove
                        </button>

                        <input
                          id={fileInputId}
                          type="file"
                          className="hidden"
                          onChange={onPickFile(idx)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="lg:col-span-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] text-slate-600 mb-1">
                        Uploaded By
                      </label>
                      {d.uploadedBy ? (
                        <span className="inline-block px-2 py-1 rounded-full bg-slate-100 text-slate-800 text-[12px]">
                          {d.uploadedBy}
                        </span>
                      ) : (
                        <span className="inline-block text-slate-400 text-[13px]">
                          —
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[12px] text-slate-600 mb-1">
                        Uploaded On
                      </label>
                      {d.uploadedOn ? (
                        <span className="inline-block px-2 py-1 rounded-full bg-slate-100 text-slate-800 text-[12px]">
                          {d.uploadedOn}
                        </span>
                      ) : (
                        <span className="inline-block text-slate-400 text-[13px]">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="pt-1">
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-customRed text-customRed bg-white hover:bg-customRed/5 text-sm"
        >
          <FaPlus className="text-[12px]" /> Add New Line
        </button>
      </div>
    </div>
  );
}
