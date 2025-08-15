// src/features/employees/components/AddEmployeeModal.jsx
import React, { useRef, useState } from "react";
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
  });

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

          {/* Tabs */}
          <div className="px-3 sm:px-4 bg-white">
            <nav className="flex gap-2 overflow-x-auto py-2">
              {TABS.map(({ key, label, Icon }) => {
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActive(key)}
                    className={`px-3 sm:px-4 py-2 rounded-md border text-[12px] flex items-center gap-2 whitespace-nowrap transition
                      ${
                        isActive
                          ? "bg-customRed text-white border-customRed shadow-sm"
                          : "bg-gray-50 text-slate-700 border-slate-200 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="text-[14px]" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="px-4 py-4 overflow-y-auto">
          {active === "general" ? (
            <GeneralInfoTab form={form} set={set} fileRef={fileRef} />
          ) : (
            <PlaceholderTab label={TABS.find((t) => t.key === active)?.label} />
          )}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white z-20 border-t">
          <div className="px-4 py-3 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.sendByEmail}
                onChange={set("sendByEmail")}
              />
              <span>Send Credentials by Email</span>
            </label>

            <div className="space-x-2">
              <button
                type="button"
                onClick={onSave}
                className="h-9 px-5 rounded bg-customRed text-white hover:bg-customRed/90 shadow-sm"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.key === active);
                  const next = TABS[(idx + 1) % TABS.length].key;
                  setActive(next);
                }}
                className="h-9 px-5 rounded border border-customRed text-customRed bg-white hover:bg-customRed/10"
              >
                Next »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tabs ---------------- */

function GeneralInfoTab({ form, set, fileRef }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left form */}
      <div className="lg:col-span-8 space-y-4">
        <Field label="Prefix">
          <select
            className="w-full h-9 border border-slate-300 rounded focus:ring-customRed focus:border-customRed"
            value={form.prefix}
            onChange={set("prefix")}
          >
            <option>None</option>
            <option>Mr</option>
            <option>Ms</option>
            <option>Mrs</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Employee Code" required>
            <input
              className="w-full h-9 border border-slate-300 rounded px-3 focus:ring-customRed focus:border-customRed"
              value={form.employeeCode}
              onChange={set("employeeCode")}
            />
          </Field>
          <Field label="Punch Code" required>
            <input
              className="w-full h-9 border border-slate-300 rounded px-3 focus:ring-customRed focus:border-customRed"
              value={form.punchCode}
              onChange={set("punchCode")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="First Name" required>
            <input
              className="w-full h-9 border border-slate-300 rounded px-3 focus:ring-customRed focus:border-customRed"
              value={form.firstName}
              onChange={set("firstName")}
            />
          </Field>
          <Field label="Last Name" required>
            <input
              className="w-full h-9 border border-slate-300 rounded px-3 focus:ring-customRed focus:border-customRed"
              value={form.lastName}
              onChange={set("lastName")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Mobile No">
            <input
              className="w-full h-9 border border-slate-300 rounded px-3 focus:ring-customRed focus:border-customRed"
              value={form.mobile}
              onChange={set("mobile")}
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              className="w-full h-9 border border-slate-300 rounded px-3 focus:ring-customRed focus:border-customRed"
              value={form.email}
              onChange={set("email")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Employee Reports To">
            <select
              className="w-full h-9 border border-slate-300 rounded focus:ring-customRed focus:border-customRed"
              value={form.reportsTo}
              onChange={set("reportsTo")}
            >
              <option value="">Select One</option>
              <option value="mgr1">Manager 1</option>
              <option value="mgr2">Manager 2</option>
            </select>
          </Field>
          <Field label="Allow Manual Attendance">
            <select
              className="w-full h-9 border border-slate-300 rounded focus:ring-customRed focus:border-customRed"
              value={form.manualAttendance}
              onChange={set("manualAttendance")}
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </Field>
        </div>

        <div className="space-y-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.allowLogin}
              onChange={set("allowLogin")}
            />
            <span className="text-sm text-slate-700">Allow Employee Login</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Roles Template">
              <select
                className="w-full h-9 border border-slate-300 rounded focus:ring-customRed focus:border-customRed"
                value={form.roleTemplate}
                onChange={set("roleTemplate")}
              >
                <option value="">Select One</option>
                <option value="HR">HR</option>
                <option value="Manager">Manager</option>
              </select>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="User Name">
                <input
                  className="w-full h-9 border border-slate-300 rounded px-3 focus:ring-customRed focus:border-customRed"
                  value={form.userName}
                  onChange={set("userName")}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  className="w-full h-9 border border-slate-300 rounded px-3 focus:ring-customRed focus:border-customRed"
                  value={form.password}
                  onChange={set("password")}
                />
              </Field>
            </div>
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
              <div className="text-slate-400 text-sm">Portrait</div>
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
  return (
    <div className="text-sm text-slate-500">{label} — UI coming next.</div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">
        {label} {required && <span className="text-customRed">*</span>}
      </label>
      {children}
    </div>
  );
}
