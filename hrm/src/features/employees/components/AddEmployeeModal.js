// src/features/employees/components/AddEmployeeModal.jsx
import React, { useEffect, useState } from "react";
import { FaTimes, FaEye, FaEyeSlash, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../utils/api";

const DOC_TYPES = [
  "CNIC",
  "Passport",
  "Offer Letter",
  "Appointment Letter",
  "Contract",
  "Degree",
  "Certification",
  "Experience Letter",
  "NDA",
  "Other",
];

const MARITAL_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];

export default function AddEmployeeModal({ open, onClose, onCreated, onSave }) {
  const [loading, setLoading] = useState(false);
  const [lookups, setLookups] = useState({
    stations: [],
    departments: [],
    designations: [],
    userTypes: [],
  });

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    // employment
    employeeCode: "", // auto-generated, read-only (shown)
    fullName: "",
    designation: "",
    department: "",
    station: "",
    status: "Active",

    // personal
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    religion: "",
    maritalStatus: "",
    address: "",
    cnic: "",

    // job & contact
    dateOfJoining: "",
    personalContact: "",
    officialContact: "",
    emergencyContact: "",
    emergencyRelation: "",
    reportingTo: "",
    officialEmail: "",
    allowPortalLogin: true,
    password: "",
    userType: "",
  });

  // ✅ documents state now includes file
  // array of { title, type, file, issuedAt, expiresAt }
  const [documents, setDocuments] = useState([]);

  // ----------------------------------------------------
  // helpers
  // ----------------------------------------------------
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canAddMoreDocs = documents.length < 10;

  const addDocumentRow = () => {
    if (!canAddMoreDocs) return;
    setDocuments((prev) => [
      ...prev,
      { title: "", type: "", file: null, issuedAt: "", expiresAt: "" },
    ]);
  };

  const removeDocumentRow = (idx) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateDocumentField = (idx, field, value) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === idx ? { ...doc, [field]: value } : doc))
    );
  };

  // ----------------------------------------------------
  // load dropdown options from backend
  // ----------------------------------------------------
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadLookups() {
      try {
        const [stationsRes, departmentsRes, designationsRes, userTypesRes] =
          await Promise.all([
            api.get("/employees/lookups/stations"),
            api.get("/employees/lookups/departments"),
            api.get("/employees/lookups/designations"),
            api.get("/employees/lookups/user-types"),
          ]);

        if (cancelled) return;

        setLookups({
          stations: stationsRes.data || [],
          departments: departmentsRes.data || [],
          designations: designationsRes.data || [],
          userTypes: userTypesRes.data || [],
        });
      } catch (err) {
        console.error("Failed to load employee lookups", err);
        if (!cancelled) toast.error("Failed to load dropdown options.");
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // ----------------------------------------------------
  // validation
  // ----------------------------------------------------
  const validate = () => {
    const errors = [];

    if (!form.fullName.trim()) errors.push("Full Name is required.");
    if (!form.designation.trim()) errors.push("Designation is required.");
    if (!form.department.trim()) errors.push("Department is required.");
    if (!form.station.trim()) errors.push("Station / Office is required.");
    if (!form.status.trim()) errors.push("Status is required.");

    if (!form.dateOfBirth) errors.push("Date of Birth is required.");
    if (!form.gender.trim()) errors.push("Gender is required.");

    if (!form.dateOfJoining) errors.push("Date of Joining is required.");

    if (!form.officialEmail.trim()) {
      errors.push("Official Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.officialEmail)) {
      errors.push("Official Email is not valid.");
    }

    if (form.allowPortalLogin) {
      if (!form.password || form.password.length < 6) {
        errors.push(
          "Password is required (min 6 characters) when portal login is allowed."
        );
      }
      if (!form.userType.trim()) {
        errors.push("User Type / Permission Level is required.");
      }
    }

    // ✅ doc validation (optional but helpful)
    const anyDocHasFile = documents.some((d) => d.file);
    if (anyDocHasFile) {
      for (const d of documents) {
        if (d.file && !d.title.trim()) {
          errors.push("Document title is required when a file is selected.");
          break;
        }
      }
    }

    return errors;
  };

  // ----------------------------------------------------
  // submit
  // ----------------------------------------------------
  const handleSubmit = async (e) => {
    e?.preventDefault();

    const errors = validate();
    if (errors.length) {
      toast.error(errors[0]);
      return;
    }

    // ✅ step-1 payload (employee only, no docs)
    const payload = {
      // employment
      employeeCode: form.employeeCode || null,
      fullName: form.fullName.trim(),
      designation: form.designation,
      department: form.department,
      station: form.station,
      status: form.status,

      // personal
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender,
      bloodGroup: form.bloodGroup || "",
      religion: form.religion || "",
      maritalStatus: form.maritalStatus || "",
      address: form.address || "",
      cnic: form.cnic || "",

      // job & contact
      dateOfJoining: form.dateOfJoining || null,
      personalContact: form.personalContact || "",
      officialContact: form.officialContact || "",
      emergencyContact: form.emergencyContact || "",
      emergencyRelation: form.emergencyRelation || "",
      reportingTo: form.reportingTo || "",

      // optional HR fields (kept for future)
      offerLetter: "",
      probation: "",

      // login
      officialEmail: form.officialEmail.trim(),
      allowPortalLogin: !!form.allowPortalLogin,
      password: form.password,
      userType: form.userType || null,
    };

    try {
      setLoading(true);

      // ✅ STEP 1: create employee
      const res = await api.post("/employees", payload);
      const created = res.data;

      const code = created?.employeeCode || "(auto)";
      toast.success(`Employee created successfully. ID: ${code}`);

      // if backend generated code, show it in the form until modal closes
      if (!form.employeeCode && created?.employeeCode) {
        setForm((prev) => ({ ...prev, employeeCode: created.employeeCode }));
      }

      // ✅ STEP 2: upload documents if any files selected
      const docsToUpload = documents.filter((d) => d.file);
      if (created?.id && docsToUpload.length) {
        const fd = new FormData();

        docsToUpload.forEach((d) => {
          // backend expects: files (array)
          fd.append("files", d.file);

          // backend reads these arrays:
          fd.append("titles", d.title.trim());
          fd.append("types", d.type || "");
          fd.append("issued_at", d.issuedAt || "");
          fd.append("expires_at", d.expiresAt || "");
        });

        await api.post(`/employees/${created.id}/documents`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(`Uploaded ${docsToUpload.length} document(s).`);
      }

      if (typeof onCreated === "function") {
        onCreated(created);
      } else if (typeof onSave === "function") {
        onSave(created);
      }

      onClose?.();
    } catch (err) {
      console.error("Create employee error:", err);

      // ✅ show real backend message
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create employee. Please check data and try again.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-[98%] max-h-[96vh] overflow-hidden flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">Add New Employee</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* body */}
        <form
          className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
          onSubmit={handleSubmit}
        >
          {/* Employment Details */}
          <section className="border rounded-lg p-4 bg-slate-50/40">
            <h3 className="font-semibold mb-3">Employment Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Employee ID / Code (auto)">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 bg-slate-100 text-slate-500 px-3 text-sm"
                  value={
                    form.employeeCode
                      ? form.employeeCode
                      : "Will be generated on save"
                  }
                  disabled
                />
              </Field>

              <Field label="Full Name" required>
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </Field>

              <Field label="Designation" required>
                <select
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  value={form.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                >
                  <option value="">Select Designation</option>
                  {lookups.designations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Department" required>
                <select
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  value={form.department}
                  onChange={(e) => updateField("department", e.target.value)}
                >
                  <option value="">Select Department</option>
                  {lookups.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Station / Office" required>
                <select
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  value={form.station}
                  onChange={(e) => updateField("station", e.target.value)}
                >
                  <option value="">Select Station</option>
                  {lookups.stations.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status" required>
                <select
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Probation">Probation</option>
                  <option value="Left">Left</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </Field>
            </div>
          </section>

          {/* Personal Information */}
          <section className="border rounded-lg p-4 bg-slate-50/40">
            <h3 className="font-semibold mb-3">Personal Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Date of Birth" required>
                <input
                  type="date"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                />
              </Field>

              <Field label="Gender" required>
                <select
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Blood Group">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.bloodGroup}
                  onChange={(e) => updateField("bloodGroup", e.target.value)}
                />
              </Field>

              <Field label="Religion">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.religion}
                  onChange={(e) => updateField("religion", e.target.value)}
                />
              </Field>

              <Field label="Marital Status">
                <select
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  value={form.maritalStatus}
                  onChange={(e) => updateField("maritalStatus", e.target.value)}
                >
                  <option value="">Select</option>
                  {MARITAL_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="CNIC">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.cnic}
                  onChange={(e) => updateField("cnic", e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Address">
                <textarea
                  className="w-full min-h-[70px] rounded border border-slate-300 px-3 py-2 text-sm"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* Job & Contact Information */}
          <section className="border rounded-lg p-4 bg-slate-50/40">
            <h3 className="font-semibold mb-3">Job & Contact Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Date of Joining" required>
                <input
                  type="date"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.dateOfJoining}
                  onChange={(e) => updateField("dateOfJoining", e.target.value)}
                />
              </Field>

              <Field label="Personal Contact">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.personalContact}
                  onChange={(e) =>
                    updateField("personalContact", e.target.value)
                  }
                />
              </Field>

              <Field label="Official Contact">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.officialContact}
                  onChange={(e) =>
                    updateField("officialContact", e.target.value)
                  }
                />
              </Field>

              <Field label="Emergency Contact">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.emergencyContact}
                  onChange={(e) =>
                    updateField("emergencyContact", e.target.value)
                  }
                />
              </Field>

              <Field label="Emergency Relation">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.emergencyRelation}
                  onChange={(e) =>
                    updateField("emergencyRelation", e.target.value)
                  }
                />
              </Field>

              <Field label="Reporting To">
                <input
                  type="text"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.reportingTo}
                  onChange={(e) => updateField("reportingTo", e.target.value)}
                />
              </Field>

              <Field label="Official Email (used for login)" required>
                <input
                  type="email"
                  className="h-9 w-full rounded border border-slate-300 px-3 text-sm"
                  value={form.officialEmail}
                  onChange={(e) =>
                    updateField("officialEmail", e.target.value)
                  }
                />
              </Field>

              <Field label="Password" required={form.allowPortalLogin}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="h-9 w-full rounded border border-slate-300 px-3 text-sm pr-8"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    disabled={!form.allowPortalLogin}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-slate-500"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </Field>

              <Field label="User Type / Permission Level">
                <select
                  className="h-9 w-full rounded border border-slate-300 px-2 text-sm"
                  value={form.userType}
                  onChange={(e) => updateField("userType", e.target.value)}
                  disabled={!form.allowPortalLogin}
                >
                  <option value="">Select user type</option>
                  {lookups.userTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-3">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.allowPortalLogin}
                  onChange={(e) =>
                    updateField("allowPortalLogin", e.target.checked)
                  }
                />
                <span>Allow portal login (uses Official Email)</span>
              </label>
            </div>
          </section>

          {/* Documents Section */}
          <section className="border rounded-lg p-4 bg-slate-50/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Employee Documents</h3>
              <button
                type="button"
                onClick={addDocumentRow}
                disabled={!canAddMoreDocs}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-customRed text-customRed text-xs hover:bg-customRed/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaPlus />
                <span>Add Document</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-500">
                No documents added yet. You can add up to 10 documents (CNIC,
                Offer Letter, Contract, etc.).
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="grid md:grid-cols-[1.5fr,1fr,1.5fr,1fr,1fr,auto] gap-2 items-end bg-white rounded border border-slate-200 p-2"
                  >
                    <div>
                      <Label>Title</Label>
                      <input
                        type="text"
                        className="h-8 w-full rounded border border-slate-300 px-2 text-xs"
                        value={doc.title}
                        onChange={(e) =>
                          updateDocumentField(idx, "title", e.target.value)
                        }
                        placeholder="e.g. CNIC, Contract"
                      />
                    </div>

                    <div>
                      <Label>Type</Label>
                      <select
                        className="h-8 w-full rounded border border-slate-300 px-2 text-xs"
                        value={doc.type}
                        onChange={(e) =>
                          updateDocumentField(idx, "type", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {DOC_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ✅ REAL FILE UPLOAD (replaces "path") */}
                    <div>
                      <Label>File</Label>
                      <input
                        type="file"
                        className="h-8 w-full rounded border border-slate-300 px-2 text-xs bg-white"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          updateDocumentField(idx, "file", file);
                          // auto title if empty
                          if (file && !doc.title.trim()) {
                            updateDocumentField(idx, "title", file.name);
                          }
                        }}
                      />
                      {doc.file ? (
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                          Selected: {doc.file.name}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <Label>Issued At</Label>
                      <input
                        type="date"
                        className="h-8 w-full rounded border border-slate-300 px-2 text-xs"
                        value={doc.issuedAt || ""}
                        onChange={(e) =>
                          updateDocumentField(idx, "issuedAt", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Expires At</Label>
                      <input
                        type="date"
                        className="h-8 w-full rounded border border-slate-300 px-2 text-xs"
                        value={doc.expiresAt || ""}
                        onChange={(e) =>
                          updateDocumentField(idx, "expiresAt", e.target.value)
                        }
                      />
                    </div>

                    <div className="pb-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeDocumentRow(idx)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50 text-xs"
                        title="Remove document"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </form>

        {/* footer */}
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2 bg-white">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-4 rounded border border-slate-300 bg-white text-sm hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-9 px-5 rounded bg-customRed text-white text-sm hover:bg-customRed/90 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* small helpers */

function Field({ label, required, children }) {
  return (
    <div className="text-sm">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label className="block mb-1 text-xs font-medium text-slate-700">
      {children}
      {required && <span className="text-red-500 align-middle ml-0.5">*</span>}
    </label>
  );
}
