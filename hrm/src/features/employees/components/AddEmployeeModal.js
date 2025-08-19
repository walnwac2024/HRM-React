// src/features/employees/components/AddEmployeeModal.jsx
import React, { useRef, useState, useMemo } from "react";
import {
  FaUser,
  FaInfoCircle,
  FaBuilding,
  FaFileAlt,
  FaMoneyBillWave,
  FaChevronLeft,
  FaUpload,
  FaTimes,
} from "react-icons/fa";
import AdditionalInformation from "./AdditionalInformation";
import CompanyInformation from "./CompanyInformation";
import EmployeeDocuments from "./EmployeeDocuments"; // NEW

const TABS = [
  { key: "general", label: "General Information", Icon: FaUser },
  { key: "additional", label: "Additional Information", Icon: FaInfoCircle },
  { key: "company", label: "Company Information", Icon: FaBuilding },
  { key: "documents", label: "Employee Documents", Icon: FaFileAlt },
  { key: "salary", label: "Salary Information", Icon: FaMoneyBillWave },
];

export default function AddEmployeeModal({ open, onClose, onSave }) {
  const [active, setActive] = useState("general");

  const [form, setForm] = useState({
    // General
    prefix: "None",
    employeeCode: "",
    punchCode: "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    reportsTo: "",
    manualAttendance: "No",
    allowLogin: false,
    roleTemplate: "",
    userName: "",
    password: "",
    sendByEmail: false,
    photo: null,

    // Additional
    gender: "",

    // Company
    station: "",
    department: "",
    designation: "", // required
    employeeStatus: "",
    employeeGroup: "",
    joiningDate: "",
    confirmationDueDate: "",
    confirmationDate: "",
    resignDate: "",

    // Documents
    documents: [], // NEW
  });

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const fileRef = useRef(null);
  const set = (name) => (e) => {
    const v =
      e && e.target
        ? e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value
        : e;
    setForm((f) => ({ ...f, [name]: v }));
  };

  const markTouched = (name) => () =>
    setTouched((t) => ({ ...t, [name]: true }));

  // ---- Validation ----
  const validate = (f) => {
    const errs = {};
    // General
    if (!f.employeeCode.trim()) errs.employeeCode = "Employee Code is required.";
    if (!f.punchCode.trim()) errs.punchCode = "Punch Code is required.";
    if (!f.firstName.trim()) errs.firstName = "First Name is required.";
    if (!f.lastName.trim()) errs.lastName = "Last Name is required.";
    if (!f.mobile.trim()) errs.mobile = "Mobile No is required.";
    if (!f.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      errs.email = "Enter a valid email address.";
    }

    // Additional
    if (!f.gender?.trim()) errs.gender = "Gender is required.";

    // Company
    if (!f.department?.trim()) errs.department = "Department is required.";
    if (!f.designation?.trim()) errs.designation = "Designation is required.";
    if (!f.employeeStatus?.trim())
      errs.employeeStatus = "Employee Status is required.";
    if (!f.employeeGroup?.trim())
      errs.employeeGroup = "Employee Group is required.";

    return errs;
  };

  const errors = useMemo(() => validate(form), [form]);
  const showError = (name) => (submitted || touched[name]) && !!errors[name];

  const handleSave = () => {
    setSubmitted(true);
    if (Object.keys(errors).length === 0) onSave?.(form);
  };

  // Wizard footer state
  const idx = TABS.findIndex((t) => t.key === active);
  const isFirst = idx === 0;
  const isLast = idx === TABS.length - 1;
  const prevKey = !isFirst ? TABS[idx - 1].key : null;
  const nextKey = !isLast ? TABS[idx + 1].key : null;
  const showUpdate = isFirst || isLast; // only first & last

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "flex" : "hidden"} items-center justify-center`}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 w-[98%] max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white z-20 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-semibold">Add Employee</h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm text-customRed hover:opacity-90"
            >
              <FaChevronLeft /> Back
            </button>
          </div>

          {/* Tabs – icon above label */}
          <div className="px-3 sm:px-4 bg-white">
            <nav className="flex gap-4 overflow-x-auto py-3">
              {TABS.map(({ key, label, Icon }) => {
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActive(key)}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex flex-col items-center justify-center shrink-0
                      min-w-[120px] px-3 py-2 rounded-md transition
                      ${isActive ? "bg-white" : "hover:bg-slate-50"}`}
                  >
                    <span
                      className={`h-11 w-11 rounded-full grid place-items-center border
                        ${
                          isActive
                            ? "bg-customRed text-white border-customRed shadow-sm"
                            : "bg-gray-100 text-slate-600 border-slate-200"
                        }`}
                    >
                      <Icon className="text-[18px]" />
                    </span>
                    <span
                      className={`mt-2 text-[12px] font-medium text-center whitespace-nowrap
                        ${isActive ? "text-customRed" : "text-slate-700"}`}
                    >
                      {label}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-customRed" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="px-4 py-4 overflow-y-auto">
          {active === "general" ? (
            <GeneralInfoTab
              form={form}
              set={set}
              fileRef={fileRef}
              errors={errors}
              showError={showError}
              markTouched={markTouched}
            />
          ) : active === "additional" ? (
            <AdditionalInformation
              form={form}
              set={set}
              errors={errors}
              showError={showError}
              markTouched={markTouched}
            />
          ) : active === "company" ? (
            <CompanyInformation
              form={form}
              set={set}
              errors={errors}
              showError={showError}
              markTouched={markTouched}
            />
          ) : active === "documents" ? (
            <EmployeeDocuments form={form} set={set} />
          ) : (
            <PlaceholderTab label={TABS.find((t) => t.key === active)?.label} />
          )}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white z-20 border-t">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Checkbox ONLY on General tab */}
            {active === "general" ? (
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.sendByEmail}
                  onChange={set("sendByEmail")}
                />
                <span>Send Credentials by Email</span>
              </label>
            ) : (
              <span /> // spacer
            )}

            <div className="space-x-2 flex items-center">
              {/* PREVIOUS */}
              {prevKey && (
                <button
                  type="button"
                  onClick={() => setActive(prevKey)}
                  className="h-9 px-5 rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                >
                  « Previous
                </button>
              )}

              {/* UPDATE — only first & last */}
              {showUpdate && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-9 px-5 rounded bg-customRed text-white hover:bg-customRed/90 shadow-sm"
                >
                  Update
                </button>
              )}

              {/* NEXT */}
              {nextKey && (
                <button
                  type="button"
                  onClick={() => setActive(nextKey)}
                  className="h-9 px-5 rounded border border-customRed text-customRed bg-white hover:bg-customRed/10"
                >
                  Next »
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tabs ---------------- */

function GeneralInfoTab({ form, set, fileRef, errors, showError, markTouched }) {
  const disabledCreds = !form.allowLogin;

  const baseInput =
    "w-full h-9 border rounded px-3 focus:ring-customRed focus:border-customRed";
  const normalBorder = "border-slate-300";
  const errorBorder = "border-customRed";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left form */}
      <div className="lg:col-span-8 space-y-4">
        <Field label="Prefix:">
          <select
            className={`${baseInput} ${normalBorder} px-2`}
            value={form.prefix}
            onChange={set("prefix")}
            onBlur={markTouched("prefix")}
          >
            <option>None</option>
            <option>Mr</option>
            <option>Ms</option>
            <option>Mrs</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Employee Code:"
            required
            error={showError("employeeCode") && errors.employeeCode}
          >
            <input
              className={`${baseInput} ${
                showError("employeeCode") ? errorBorder : normalBorder
              }`}
              value={form.employeeCode}
              onChange={set("employeeCode")}
              onBlur={markTouched("employeeCode")}
              aria-invalid={showError("employeeCode")}
            />
          </Field>
          <Field
            label="Punch Code:"
            required
            error={showError("punchCode") && errors.punchCode}
          >
            <input
              className={`${baseInput} ${
                showError("punchCode") ? errorBorder : normalBorder
              }`}
              value={form.punchCode}
              onChange={set("punchCode")}
              onBlur={markTouched("punchCode")}
              aria-invalid={showError("punchCode")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="First Name:"
            required
            error={showError("firstName") && errors.firstName}
          >
            <input
              className={`${baseInput} ${
                showError("firstName") ? errorBorder : normalBorder
              }`}
              value={form.firstName}
              onChange={set("firstName")}
              onBlur={markTouched("firstName")}
              aria-invalid={showError("firstName")}
            />
          </Field>
          <Field
            label="Last Name:"
            required
            error={showError("lastName") && errors.lastName}
          >
            <input
              className={`${baseInput} ${
                showError("lastName") ? errorBorder : normalBorder
              }`}
              value={form.lastName}
              onChange={set("lastName")}
              onBlur={markTouched("lastName")}
              aria-invalid={showError("lastName")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Mobile No:" required error={showError("mobile") && errors.mobile}>
            <input
              type="tel"
              className={`${baseInput} ${showError("mobile") ? errorBorder : normalBorder}`}
              value={form.mobile}
              onChange={set("mobile")}
              onBlur={markTouched("mobile")}
              aria-invalid={showError("mobile")}
            />
          </Field>
          <Field label="Email:" required error={showError("email") && errors.email}>
            <input
              type="email"
              className={`${baseInput} ${showError("email") ? errorBorder : normalBorder}`}
              value={form.email}
              onChange={set("email")}
              onBlur={markTouched("email")}
              aria-invalid={showError("email")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Employee Reports To:">
            <select
              className={`${baseInput} ${normalBorder} px-2`}
              value={form.reportsTo}
              onChange={set("reportsTo")}
              onBlur={markTouched("reportsTo")}
            >
              <option value="">Select One</option>
              <option value="mgr1">Manager 1</option>
              <option value="mgr2">Manager 2</option>
            </select>
          </Field>
          <Field label="Allow Manual Attendance:">
            <select
              className={`${baseInput} ${normalBorder} px-2`}
              value={form.manualAttendance}
              onChange={set("manualAttendance")}
              onBlur={markTouched("manualAttendance")}
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </Field>
        </div>

        <div className="space-y-3 pt-1">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.allowLogin}
              onChange={set("allowLogin")}
              onBlur={markTouched("allowLogin")}
            />
            <span className="text-sm text-slate-700">Allow Employee Login</span>
          </label>

          <Field label="Roles Template:">
            <select
              className={`${baseInput} ${normalBorder} px-2`}
              value={form.roleTemplate}
              onChange={set("roleTemplate")}
              onBlur={markTouched("roleTemplate")}
            >
              <option value="">Select One</option>
              <option value="HR">HR</option>
              <option value="Manager">Manager</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="User Name:">
              <input
                disabled={disabledCreds}
                className={`${baseInput} ${
                  disabledCreds
                    ? "border-slate-200 bg-slate-100 text-slate-500"
                    : normalBorder
                }`}
                value={form.userName}
                onChange={set("userName")}
                onBlur={markTouched("userName")}
              />
            </Field>
            <Field label="Password:">
              <input
                type="password"
                disabled={disabledCreds}
                className={`${baseInput} ${
                  disabledCreds
                    ? "border-slate-200 bg-slate-100 text-slate-500"
                    : normalBorder
                }`}
                value={form.password}
                onChange={set("password")}
                onBlur={markTouched("password")}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Right photo panel */}
      <div className="lg:col-span-4">
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 rounded border border-slate-200 bg-gray-50 grid place-items-center mb-3 overflow-hidden">
            {form.photo ? (
              <img
                src={URL.createObjectURL(form.photo)}
                alt="portrait"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 text-sm flex flex-col items-center">
                <FaUser className="text-3xl mb-1" />
                Portrait
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f) set("photo")(f);
            }}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <FaUpload /> Upload Photo
            </button>
            <button
              type="button"
              onClick={() => set("photo")(null)}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <FaTimes /> Clear Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ label }) {
  return <div className="text-sm text-slate-500">{label} — UI coming next.</div>;
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">
        {label} {required && <span className="text-customRed align-middle">*</span>}
      </label>
      {children}
      {error ? <p className="mt-1 text-[12px] text-customRed">{error}</p> : null}
    </div>
  );
}
