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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 w-[98%] max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-slate-800">
            Add New Employee
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-customRed hover:opacity-80"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-6">
          {/* Core Employment Info */}
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Employment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <section className="border rounded-lg p-4 border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Personal Information
              </h3>
              <div className="space-y-3">
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
              </div>
            </section>

            {/* Job & Contact Information */}
            <section className="border rounded-lg p-4 border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Job & Contact Information
              </h3>
              <div className="space-y-3">
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
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.canLogin}
                onChange={set("canLogin")}
              />
              <span>Allow portal login (uses official email)</span>
            </label>
          </div>

          <div className="space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-5 rounded bg-customRed text-white hover:bg-customRed/90 shadow-sm text-sm"
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
