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
  const [activeTab, setActiveTab] = useState("employment");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [lookups, setLookups] = useState({
    stations: [],
    departments: [],
    designations: [],
    userTypes: [],
    shifts: [],
    statuses: [],
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
    personalEmail: "",
    allowPortalLogin: true,
    password: "",
    userType: "",
    shiftId: "",
    profileImg: null,
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
        const [stationsRes, departmentsRes, designationsRes, userTypesRes, shiftsRes, statusesRes] =
          await Promise.all([
            api.get("/employees/lookups/stations"),
            api.get("/employees/lookups/departments"),
            api.get("/employees/lookups/designations"),
            api.get("/employees/lookups/user-types"),
            api.get("/attendance/settings/shifts"),
            api.get("/employees/lookups/statuses"),
          ]);

        if (cancelled) return;

        setLookups({
          stations: stationsRes.data || [],
          departments: departmentsRes.data || [],
          designations: designationsRes.data || [],
          userTypes: userTypesRes.data || [],
          shifts: shiftsRes.data?.shifts || [],
          statuses: statusesRes.data || [],
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
    if (!form.shiftId) errors.push("Default Shift is required.");

    if (!form.dateOfBirth) errors.push("Date of Birth is required.");
    if (!form.gender.trim()) errors.push("Gender is required.");

    if (!form.dateOfJoining) errors.push("Date of Joining is required.");

    if (!form.officialEmail.trim()) {
      errors.push("Official Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.officialEmail)) {
      errors.push("Official Email is not valid.");
    }

    if (!form.personalEmail.trim()) {
      errors.push("Personal Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalEmail)) {
      errors.push("Personal Email is not valid.");
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
      personalEmail: form.personalEmail.trim(),
      allowPortalLogin: !!form.allowPortalLogin,
      password: form.password,
      userType: form.userType || null,
      shiftId: form.shiftId || null,
    };

    try {
      setLoading(true);

      // ✅ STEP 1: create employee
      const res = await api.post("/employees", payload);
      const created = res.data;
      setSuccessData(created);
      setIsSuccess(true);

      const code = created?.employeeCode || "(auto)";
      toast.success(`Employee created successfully. ID: ${code}`);

      // if backend generated code, show it in the form until modal closes
      if (!form.employeeCode && created?.employeeCode) {
        setForm((prev) => ({ ...prev, employeeCode: created.employeeCode }));
      }

      // ✅ STEP 1.5: upload profile image if present
      if (created?.id && form.profileImg) {
        const fd = new FormData();
        fd.append("image", form.profileImg);
        await api.post(`/employees/${created.id}/avatar`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Profile image uploaded.");
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
    <div className="modal-overlay">
      <div className="modal-content max-w-5xl">
        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Employee Added!</h2>
            <p className="text-slate-500 max-w-md mb-8">
              New employee <span className="font-bold text-slate-800">{successData?.fullName || successData?.name}</span> has been successfully onboarded with ID <span className="text-customRed font-bold">{successData?.employeeCode}</span>.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setForm({
                    employeeCode: "", fullName: "", designation: "", department: "", station: "", status: "Active",
                    dateOfBirth: "", gender: "", bloodGroup: "", religion: "", maritalStatus: "", address: "", cnic: "",
                    dateOfJoining: "", personalContact: "", officialContact: "", emergencyContact: "", emergencyRelation: "",
                    reportingTo: "", officialEmail: "", personalEmail: "", allowPortalLogin: true, password: "", userType: "", shiftId: "",
                    profileImg: null,
                  });
                  setDocuments([]);
                  setIsSuccess(false);
                  setActiveTab("employment");
                }}
                className="btn-primary h-11 px-8 rounded-2xl"
              >
                Add Another
              </button>
              <button
                onClick={handleClose}
                className="btn-outline h-11 px-8 rounded-2xl"
              >
                Return to List
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="modal-header">
              <div>
                <h2 className="h2 text-slate-900">Add New Employee</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Onboarding Process</p>
              </div>
              <button
                onClick={handleClose}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-50 border-b overflow-x-auto no-scrollbar">
              {[
                { id: "employment", label: "Employment" },
                { id: "personal", label: "Personal" },
                { id: "contact", label: "Contact Info" },
                { id: "emails", label: "Email Addresses" },
                { id: "account", label: "Account & Portal" },
                { id: "documents", label: "Documents" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 sm:px-8 py-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === t.id
                    ? "border-customRed text-customRed bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="modal-body">
              <form id="add-employee-form" onSubmit={handleSubmit}>
                {/* Employment Details */}
                {activeTab === "employment" && (
                  <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="section-divider">
                      <div className="section-indicator" />
                      <h3 className="section-title">Employment Details</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Field label="Employee ID / Code (auto)">
                        <input
                          type="text"
                          className="input bg-slate-100 text-slate-500"
                          value={form.employeeCode || "Will be generated on save"}
                          disabled
                        />
                      </Field>

                      <Field label="Full Name" required>
                        <input
                          type="text"
                          className="input"
                          value={form.fullName}
                          onChange={(e) => updateField("fullName", e.target.value)}
                        />
                      </Field>

                      <Field label="Designation" required>
                        <select
                          className="select"
                          value={form.designation}
                          onChange={(e) => updateField("designation", e.target.value)}
                        >
                          <option value="">Select Designation</option>
                          {lookups.designations.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Department" required>
                        <select
                          className="select"
                          value={form.department}
                          onChange={(e) => updateField("department", e.target.value)}
                        >
                          <option value="">Select Department</option>
                          {lookups.departments.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Station / Office" required>
                        <select
                          className="select"
                          value={form.station}
                          onChange={(e) => updateField("station", e.target.value)}
                        >
                          <option value="">Select Station</option>
                          {lookups.stations.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Status" required>
                        <select
                          className="select"
                          value={form.status}
                          onChange={(e) => updateField("status", e.target.value)}
                        >
                          <option value="">Select Status</option>
                          {lookups.statuses.length > 0 ? (
                            lookups.statuses.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))
                          ) : (
                            <>
                              <option value="Active">Active</option>
                              <option value="Probation">Probation</option>
                              <option value="Left">Left</option>
                              <option value="On Hold">On Hold</option>
                            </>
                          )}
                        </select>
                      </Field>

                      <Field label="Default Shift" required>
                        <select
                          className="select"
                          value={form.shiftId}
                          onChange={(e) => updateField("shiftId", e.target.value)}
                        >
                          <option value="">Select Shift</option>
                          {lookups.shifts.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.start_time} - {s.end_time})
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="mt-8 pb-8 flex md:hidden">
                      <button
                        type="button"
                        onClick={() => setActiveTab("personal")}
                        className="btn-outline w-full justify-between"
                      >
                        Proceed to Personal Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </section>
                )}

                {/* Personal Information */}
                {activeTab === "personal" && (
                  <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="section-divider">
                      <div className="section-indicator" />
                      <h3 className="section-title">Personal Information</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Field label="Date of Birth" required>
                        <input
                          type="date"
                          className="input"
                          value={form.dateOfBirth}
                          onChange={(e) => updateField("dateOfBirth", e.target.value)}
                        />
                      </Field>

                      <Field label="Gender" required>
                        <select
                          className="select"
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
                          className="input"
                          value={form.bloodGroup}
                          onChange={(e) => updateField("bloodGroup", e.target.value)}
                        />
                      </Field>

                      <Field label="Religion">
                        <input
                          type="text"
                          className="input"
                          value={form.religion}
                          onChange={(e) => updateField("religion", e.target.value)}
                        />
                      </Field>

                      <Field label="Marital Status">
                        <select
                          className="select"
                          value={form.maritalStatus}
                          onChange={(e) => updateField("maritalStatus", e.target.value)}
                        >
                          <option value="">Select</option>
                          {MARITAL_OPTIONS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="CNIC">
                        <input
                          type="text"
                          className="input"
                          value={form.cnic}
                          onChange={(e) => updateField("cnic", e.target.value)}
                        />
                      </Field>

                      <Field label="Profile Image">
                        <input
                          type="file"
                          accept="image/*"
                          className="input h-auto py-1"
                          onChange={(e) => updateField("profileImg", e.target.files[0])}
                        />
                      </Field>
                    </div>

                    <Field label="Address">
                      <textarea
                        className="w-full min-h-[70px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-customRed focus:outline-none shadow-sm"
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                      />
                    </Field>
                    <div className="mt-8 pb-8 flex flex-col sm:flex-row gap-3 md:hidden">
                      <button
                        type="button"
                        onClick={() => setActiveTab("employment")}
                        className="btn-ghost flex-1 justify-start px-0"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("contact")}
                        className="btn-outline flex-[2] justify-between"
                      >
                        Proceed to Contact Info
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </section>
                )}

                {/* Contact Information */}
                {activeTab === "contact" && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="section-divider">
                      <div className="section-indicator" />
                      <h3 className="section-title">Contact Information</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Field label="Date of Joining" required>
                        <input
                          type="date"
                          className="h-9 w-full rounded border border-slate-300 px-3 text-sm focus:border-customRed focus:outline-none"
                          value={form.dateOfJoining}
                          onChange={(e) => updateField("dateOfJoining", e.target.value)}
                        />
                      </Field>

                      <Field label="Personal Contact">
                        <input
                          type="text"
                          className="h-9 w-full rounded border border-slate-300 px-3 text-sm focus:border-customRed focus:outline-none"
                          value={form.personalContact}
                          onChange={(e) => updateField("personalContact", e.target.value)}
                        />
                      </Field>

                      <Field label="Official Contact">
                        <input
                          type="text"
                          className="h-9 w-full rounded border border-slate-300 px-3 text-sm focus:border-customRed focus:outline-none"
                          value={form.officialContact}
                          onChange={(e) => updateField("officialContact", e.target.value)}
                        />
                      </Field>

                      <Field label="Emergency Contact">
                        <input
                          type="text"
                          className="h-9 w-full rounded border border-slate-300 px-3 text-sm focus:border-customRed focus:outline-none"
                          value={form.emergencyContact}
                          onChange={(e) => updateField("emergencyContact", e.target.value)}
                        />
                      </Field>

                      <Field label="Emergency Relation">
                        <input
                          type="text"
                          className="h-9 w-full rounded border border-slate-300 px-3 text-sm focus:border-customRed focus:outline-none"
                          value={form.emergencyRelation}
                          onChange={(e) => updateField("emergencyRelation", e.target.value)}
                        />
                      </Field>

                      <Field label="Reporting To">
                        <input
                          type="text"
                          className="h-9 w-full rounded border border-slate-300 px-3 text-sm focus:border-customRed focus:outline-none"
                          value={form.reportingTo}
                          onChange={(e) => updateField("reportingTo", e.target.value)}
                        />
                      </Field>
                    </div>
                    <div className="mt-8 pb-8 flex flex-col sm:flex-row gap-3 md:hidden">
                      <button
                        type="button"
                        onClick={() => setActiveTab("personal")}
                        className="btn-ghost flex-1 justify-start px-0"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("emails")}
                        className="btn-outline flex-[2] justify-between"
                      >
                        Proceed to Email Addresses
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </section>
                )}

                {/* Email Tab */}
                {activeTab === "emails" && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="section-divider">
                      <div className="section-indicator" />
                      <h3 className="section-title">Email Addresses</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Field label="Personal Email Address" required>
                          <input
                            type="email"
                            className="h-10 w-full rounded-xl border border-slate-300 px-4 text-sm focus:border-customRed focus:outline-none shadow-sm"
                            value={form.personalEmail}
                            onChange={(e) => updateField("personalEmail", e.target.value)}
                            placeholder="e.g. user@gmail.com"
                          />
                          <p className="mt-2 text-[10px] text-slate-500 italic">Used for attendance alerts and personal notifications.</p>
                        </Field>
                      </div>

                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Field label="Official Email Address" required>
                          <input
                            type="email"
                            className="h-10 w-full rounded-xl border border-slate-300 px-4 text-sm focus:border-customRed focus:outline-none shadow-sm"
                            value={form.officialEmail}
                            onChange={(e) => updateField("officialEmail", e.target.value)}
                            placeholder="e.g. name@company.com"
                          />
                          <p className="mt-2 text-[10px] text-slate-500 italic">Used for system login and official communications.</p>
                        </Field>
                      </div>
                    </div>
                    <div className="mt-8 pb-8 flex flex-col sm:flex-row gap-3 md:hidden">
                      <button
                        type="button"
                        onClick={() => setActiveTab("contact")}
                        className="btn-ghost flex-1 justify-start px-0"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("account")}
                        className="btn-outline flex-[2] justify-between"
                      >
                        Proceed to Account & Portal
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </section>
                )}

                {/* Account & Portal */}
                {activeTab === "account" && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="section-divider">
                      <div className="section-indicator" />
                      <h3 className="section-title">Account & Portal Access</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Field label="Password" required={form.allowPortalLogin}>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="h-10 w-full rounded-xl border border-slate-300 px-4 text-sm pr-10 focus:border-customRed focus:outline-none"
                            value={form.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            disabled={!form.allowPortalLogin}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => setShowPassword((s) => !s)}
                            tabIndex={-1}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </Field>

                      <Field label="User Type / Permission Level">
                        <select
                          className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm focus:border-customRed focus:outline-none"
                          value={form.userType}
                          onChange={(e) => updateField("userType", e.target.value)}
                          disabled={!form.allowPortalLogin}
                        >
                          <option value="">Select user type</option>
                          {lookups.userTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="allowLogin"
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        checked={form.allowPortalLogin}
                        onChange={(e) => updateField("allowPortalLogin", e.target.checked)}
                      />
                      <label htmlFor="allowLogin" className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Enable Portal Login for this Employee
                      </label>
                    </div>
                    <div className="mt-8 pb-8 flex flex-col sm:flex-row gap-3 md:hidden">
                      <button
                        type="button"
                        onClick={() => setActiveTab("emails")}
                        className="btn-ghost flex-1 justify-start px-0"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("documents")}
                        className="btn-outline flex-[2] justify-between"
                      >
                        Proceed to Documents
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </section>
                )}

                {/* Documents Section */}
                {activeTab === "documents" && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between section-divider">
                      <div className="flex items-center gap-3">
                        <div className="section-indicator" />
                        <h3 className="section-title">Employee Documents</h3>
                      </div>
                      <button
                        type="button"
                        onClick={addDocumentRow}
                        disabled={!canAddMoreDocs}
                        className="btn-outline h-8 px-4 text-[10px] uppercase font-bold tracking-widest"
                      >
                        <FaPlus className="mr-2" />
                        Add Document
                      </button>
                    </div>

                    {documents.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No documents added yet. You can add up to 10 documents (CNIC,
                        Offer Letter, Contract, etc.).
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors shadow-sm"
                          >
                            <div className="grid md:grid-cols-[1.5fr,1fr,1.5fr,1fr,1fr,auto] gap-4 items-end">
                              <Field label="Document Title">
                                <input
                                  type="text"
                                  className="h-10 w-full rounded-xl border border-slate-300 px-4 text-xs focus:border-customRed focus:outline-none shadow-sm"
                                  value={doc.title}
                                  onChange={(e) => updateDocumentField(idx, "title", e.target.value)}
                                  placeholder="e.g. CNIC, Contract"
                                />
                              </Field>

                              <Field label="Doc Type">
                                <select
                                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none shadow-sm"
                                  value={doc.type}
                                  onChange={(e) => updateDocumentField(idx, "type", e.target.value)}
                                >
                                  <option value="">Select</option>
                                  {DOC_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </Field>

                              <Field label="File Upload">
                                <div className="relative group">
                                  <label className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-[11px] font-bold text-slate-600 hover:border-customRed hover:bg-slate-50 transition-all shadow-sm">
                                    <span className="truncate max-w-[120px]">
                                      {doc.file ? doc.file.name : "Choose File"}
                                    </span>
                                    <div className="h-6 w-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-customRed/10 group-hover:text-customRed">
                                      <FaPlus size={10} />
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        updateDocumentField(idx, "file", file);
                                        if (file && !doc.title.trim()) {
                                          updateDocumentField(idx, "title", file.name);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </Field>

                              <Field label="Issued Date">
                                <input
                                  type="date"
                                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none shadow-sm"
                                  value={doc.issuedAt || ""}
                                  onChange={(e) => updateDocumentField(idx, "issuedAt", e.target.value)}
                                />
                              </Field>

                              <Field label="Expiry Date">
                                <input
                                  type="date"
                                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none shadow-sm"
                                  value={doc.expiresAt || ""}
                                  onChange={(e) => updateDocumentField(idx, "expiresAt", e.target.value)}
                                />
                              </Field>

                              <div className="flex h-10 items-center">
                                <button
                                  type="button"
                                  onClick={() => removeDocumentRow(idx)}
                                  className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all border border-red-100"
                                  title="Remove document"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-8 pb-8 flex md:hidden">
                      <button
                        type="button"
                        onClick={() => setActiveTab("account")}
                        className="btn-ghost flex-1 justify-start px-0"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                    </div>
                  </section>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer flex-wrap justify-center sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-employee-form"
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-10"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Save Employee"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
