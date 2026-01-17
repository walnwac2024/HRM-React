// src/features/employees/components/NewEmployeeModal.jsx
import React, { useState, useMemo } from "react";
import SharedDropdown from "../../../components/common/SharedDropdown";

function NewEmployeeModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    // Header / core employment info
    employeeCode: "", // system generated, just displayed
    name: "",
    designation: "",
    department: "",
    station: "",
    status: "Active",

    // Personal information
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    cnic: "",
    religion: "",
    maritalStatus: "",
    address: "",

    // Job & contact
    dateOfJoining: "",
    emailOfficial: "",
    emailPersonal: "",
    contact: "",
    officialContact: "",
    emergencyContact: "",
    emergencyRelation: "",
    reporting: "",

    // Hidden HR fields (defaults)
    offerLetter: "Pending",
    probation: "",
    canLogin: false,
    isActive: true,
    password: "",
  });

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (name) => (e) => {
    const v =
      e && e.target
        ? e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value
        : e;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const markTouched = (name) => () =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  // ---- Validation ----
  const validate = (f) => {
    const errs = {};

    // Employee code is optional now – auto generated
    if (!f.name.trim()) errs.name = "Full Name is required.";
    if (!f.designation.trim())
      errs.designation = "Designation is required.";
    if (!f.department.trim())
      errs.department = "Department is required.";
    if (!f.station.trim()) errs.station = "Station / Office is required.";
    if (!f.status.trim()) errs.status = "Status is required.";

    if (!f.cnic.trim()) errs.cnic = "CNIC is required.";
    if (!f.gender.trim()) errs.gender = "Gender is required.";
    if (!f.dateOfBirth.trim())
      errs.dateOfBirth = "Date of birth is required.";

    if (!f.dateOfJoining.trim())
      errs.dateOfJoining = "Date of joining is required.";

    // Official email is required (used for login)
    if (!f.emailOfficial.trim()) {
      errs.emailOfficial = "Official email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.emailOfficial)) {
      errs.emailOfficial = "Enter a valid official email address.";
    }

    if (!f.contact.trim())
      errs.contact = "Personal contact number is required.";

    return errs;
  };

  const errors = useMemo(() => validate(form), [form]);
  const showError = (name) => (submitted || touched[name]) && !!errors[name];

  const handleSave = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      // core identity / job
      employeeCode: "", // always let backend generate
      name: form.name.trim(),
      department: form.department.trim(),
      designation: form.designation.trim(),
      station: form.station.trim(),
      status: form.status.trim(),

      // personal
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender.trim(),
      bloodGroup: form.bloodGroup.trim(),
      cnic: form.cnic.trim(),
      address: form.address.trim(),
      religion: form.religion.trim(),
      maritalStatus: form.maritalStatus.trim(),

      // job & contact
      dateOfJoining: form.dateOfJoining || null,
      emailOfficial: form.emailOfficial.trim(),
      emailPersonal: form.emailPersonal.trim(),
      contact: form.contact.trim(),
      emergencyContact: form.emergencyContact.trim(),
      emergencyRelation: form.emergencyRelation.trim(),
      reporting: form.reporting.trim(),
      officialContact: form.officialContact.trim(),

      offerLetter: form.offerLetter || "Pending",
      probation: form.probation || "",

      // login email is always official email
      loginEmail: form.emailOfficial.trim(),
      userType: "",
      canLogin: !!form.canLogin,
      isActive: !!form.isActive,
      password: form.password || "",

      profileImg: null,
    };

    onSave?.(payload);
  };

  if (!open) return null;

  const baseInput =
    "w-full h-9 border rounded px-3 text-sm focus:ring-customRed focus:border-customRed";
  const normalBorder = "border-slate-300";
  const errorBorder = "border-customRed";

  const borderClass = (name) =>
    showError(name) ? errorBorder : normalBorder;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-5xl">
        {/* Header */}
        <div className="modal-header">
          <h2 className="font-semibold text-slate-800">
            Add New Employee
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded hover:bg-slate-100 text-xs font-bold uppercase tracking-wider text-customRed transition-colors"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="modal-body overflow-y-auto space-y-8">
          {/* Core Employment Info */}
          <section>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Employment Details
            </h3>
            <div className="form-grid lg:grid-cols-3">
              <Field label="Employee ID / Code (auto)">
                <input
                  className={`${baseInput} ${normalBorder} bg-slate-100 text-slate-500`}
                  value={form.employeeCode}
                  disabled
                  placeholder="Will be generated on save"
                />
              </Field>
              <Field
                label="Full Name"
                required
                error={showError("name") && errors.name}
              >
                <input
                  className={`${baseInput} ${borderClass("name")}`}
                  value={form.name}
                  onChange={set("name")}
                  onBlur={markTouched("name")}
                />
              </Field>
              <Field
                label="Designation"
                required
                error={showError("designation") && errors.designation}
              >
                <input
                  className={`${baseInput} ${borderClass("designation")}`}
                  value={form.designation}
                  onChange={set("designation")}
                  onBlur={markTouched("designation")}
                />
              </Field>

              <Field
                label="Department"
                required
                error={showError("department") && errors.department}
              >
                <input
                  className={`${baseInput} ${borderClass("department")}`}
                  value={form.department}
                  onChange={set("department")}
                  onBlur={markTouched("department")}
                />
              </Field>
              <Field
                label="Station / Office"
                required
                error={showError("station") && errors.station}
              >
                <input
                  className={`${baseInput} ${borderClass("station")}`}
                  value={form.station}
                  onChange={set("station")}
                  onBlur={markTouched("station")}
                />
              </Field>
              <Field
                label="Status"
                required
                error={showError("status") && errors.status}
              >
                <SharedDropdown
                  value={form.status}
                  onChange={(val) => set("status")(val)}
                  options={["Active", "Probation", "Notice Period", "Left", "Inactive"]}
                />
              </Field>
            </div>
          </section>

          {/* Two-column layout like Bushra card */}
          <div className="form-grid lg:grid-cols-2">
            {/* Personal Information */}
            <section className="bg-slate-50/50 rounded-xl p-5 border border-slate-200 space-y-5">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Personal Information
              </h3>
              <Field
                label="Date of Birth"
                required
                error={showError("dateOfBirth") && errors.dateOfBirth}
              >
                <input
                  type="date"
                  className={`${baseInput} ${borderClass("dateOfBirth")}`}
                  value={form.dateOfBirth}
                  onChange={set("dateOfBirth")}
                  onBlur={markTouched("dateOfBirth")}
                />
              </Field>

              <Field
                label="CNIC"
                required
                error={showError("cnic") && errors.cnic}
              >
                <input
                  className={`${baseInput} ${borderClass("cnic")}`}
                  value={form.cnic}
                  onChange={set("cnic")}
                  onBlur={markTouched("cnic")}
                />
              </Field>

              <Field
                label="Gender"
                required
                error={showError("gender") && errors.gender}
              >
                <SharedDropdown
                  value={form.gender}
                  onChange={(val) => set("gender")(val)}
                  options={["Male", "Female", "Other"]}
                />
              </Field>

              <Field label="Blood Group">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={form.bloodGroup}
                  onChange={set("bloodGroup")}
                  onBlur={markTouched("bloodGroup")}
                />
              </Field>

              <Field label="Religion">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={form.religion}
                  onChange={set("religion")}
                  onBlur={markTouched("religion")}
                />
              </Field>

              <Field label="Marital Status">
                <SharedDropdown
                  value={form.maritalStatus}
                  onChange={(val) => set("maritalStatus")(val)}
                  options={["Single", "Married", "Divorced", "Widowed"]}
                />
              </Field>

              <Field label="Address">
                <textarea
                  rows={3}
                  className={`w-full border rounded px-3 py-2 text-sm resize-none focus:ring-customRed focus:border-customRed ${normalBorder}`}
                  value={form.address}
                  onChange={set("address")}
                  onBlur={markTouched("address")}
                />
              </Field>
            </section>

            {/* Job & Contact Information */}
            <section className="bg-slate-50/50 rounded-xl p-5 border border-slate-200 space-y-5">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Job & Contact Information
              </h3>
              <Field
                label="Date of Joining"
                required
                error={showError("dateOfJoining") && errors.dateOfJoining}
              >
                <input
                  type="date"
                  className={`${baseInput} ${borderClass("dateOfJoining")}`}
                  value={form.dateOfJoining}
                  onChange={set("dateOfJoining")}
                  onBlur={markTouched("dateOfJoining")}
                />
              </Field>

              <Field
                label="Official Email (used for login)"
                required
                error={showError("emailOfficial") && errors.emailOfficial}
              >
                <input
                  type="email"
                  className={`${baseInput} ${borderClass("emailOfficial")}`}
                  value={form.emailOfficial}
                  onChange={set("emailOfficial")}
                  onBlur={markTouched("emailOfficial")}
                />
              </Field>

              <Field label="Personal Email">
                <input
                  type="email"
                  className={`${baseInput} ${normalBorder}`}
                  value={form.emailPersonal}
                  onChange={set("emailPersonal")}
                  onBlur={markTouched("emailPersonal")}
                />
              </Field>

              <Field
                label="Personal Contact"
                required
                error={showError("contact") && errors.contact}
              >
                <input
                  className={`${baseInput} ${borderClass("contact")}`}
                  value={form.contact}
                  onChange={set("contact")}
                  onBlur={markTouched("contact")}
                />
              </Field>

              <Field label="Official Contact">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={form.officialContact}
                  onChange={set("officialContact")}
                  onBlur={markTouched("officialContact")}
                />
              </Field>

              <Field label="Emergency Contact">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={form.emergencyContact}
                  onChange={set("emergencyContact")}
                  onBlur={markTouched("emergencyContact")}
                />
              </Field>

              <Field label="Emergency Relation">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={form.emergencyRelation}
                  onChange={set("emergencyRelation")}
                  onBlur={markTouched("emergencyRelation")}
                />
              </Field>

              <Field label="Reporting To">
                <input
                  className={`${baseInput} ${normalBorder}`}
                  value={form.reporting}
                  onChange={set("reporting")}
                  onBlur={markTouched("reporting")}
                />
              </Field>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer flex-col sm:flex-row bg-slate-50">
          <div className="flex items-center gap-3 text-xs text-slate-500 w-full sm:w-auto">
            <label className="inline-flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.canLogin}
                onChange={set("canLogin")}
                className="w-4 h-4 rounded border-slate-300 text-customRed focus:ring-customRed"
              />
              <span className="group-hover:text-slate-700 transition-colors">Allow portal login</span>
            </label>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary flex-1 sm:flex-none"
            >
              Save Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}{" "}
        {required && (
          <span className="text-customRed align-middle">*</span>
        )}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] text-customRed">{error}</p>
      ) : null}
    </div>
  );
}

export default NewEmployeeModal;
