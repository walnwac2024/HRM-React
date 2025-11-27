// src/features/employees/components/EditEmployeeModal.jsx
import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import useEmployee from "../hooks/useEmployee";
import { useAuth } from "../../../context/AuthContext";

function Field({ label, children, required, error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-customRed">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-customRed">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EditEmployeeModal({ employeeId, onClose }) {
  const { employee, loading, error } = useEmployee(employeeId);
  const { user } = useAuth();
  const role = user?.role;
  const canEditVault = role === "super_admin" || role === "admin";

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingVault, setSavingVault] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    employeeCode: "",
    department: "",
    designation: "",
    station: "",
    status: "",
    dateOfBirth: "",
    dateOfJoining: "",
    cnic: "",
    gender: "",
    bloodGroup: "",
    emailPersonal: "",
    emailOfficial: "",
    contact: "",
    emergencyContact: "",
    address: "",
  });

  const [vaultForm, setVaultForm] = useState({
    officialEmail: "",
    canLogin: false,
    password: "",
    userType: "",
  });

  const [userTypes, setUserTypes] = useState([]);

  useEffect(() => {
    // Fetch user types for dropdown
    api.get("/employees/lookups/user-types").then(res => {
      setUserTypes(res.data || []);
    }).catch(() => setUserTypes([]));
  }, []);

  useEffect(() => {
    if (!employee) return;
    setProfileForm({
      name: employee.name || "",
      employeeCode: employee.employeeCode || "",
      department: employee.department || "",
      designation: employee.designation || "",
      station: employee.station || "",
      status: employee.status || "",
      dateOfBirth: employee.dateOfBirth || "",
      dateOfJoining: employee.dateOfJoining || "",
      cnic: employee.cnic || "",
      gender: employee.gender || "",
      bloodGroup: employee.bloodGroup || "",
      emailPersonal: employee.emailPersonal || "",
      emailOfficial: employee.emailOfficial || "",
      contact: employee.contact || "",
      emergencyContact: employee.emergencyContact || "",
      address: employee.address || "",
    });

    setVaultForm({
      officialEmail: employee.emailOfficial || "",
      canLogin: employee.canLogin ?? true,
      password: "",
      userType: employee.userType || "",
    });
  }, [employee]);

  const onProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const onVaultChange = (e) => {
    const { name, type, checked, value } = e.target;
    setVaultForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch(`/employees/${employeeId}`, profileForm);
      onClose(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveVault = async (e) => {
    e.preventDefault();
    if (!canEditVault) return;
    setSavingVault(true);
    try {
      const payload = {
        officialEmail: vaultForm.officialEmail,
        canLogin: vaultForm.canLogin,
        userType: vaultForm.userType,
      };
      if (vaultForm.password.trim()) {
        payload.password = vaultForm.password.trim();
      }
      await api.put(`/employees/${employeeId}/login`, payload);
      setVaultForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingVault(false);
    }
  };

  const handleGeneratePassword = () => {
    const random = Math.random().toString(36).slice(-10);
    setVaultForm((prev) => ({ ...prev, password: random }));
    setShowPassword(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-slate-600 shadow-lg">
          Loading employee…
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-red-600 shadow-lg">
          {error || "Employee not found."}
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="inline-flex h-8 px-4 items-center justify-center rounded border border-slate-300 text-xs text-slate-700 bg-white hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusText = profileForm.status || "—";
  const lower = statusText.toLowerCase();
  let statusDot = "bg-amber-500";
  if (lower === "active") statusDot = "bg-emerald-500";
  else if (lower === "left" || lower === "inactive") statusDot = "bg-red-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[90vh] w-[1200px] flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Edit Employee
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {profileForm.name || "—"} ·{" "}
              <span className="font-medium">{profileForm.employeeCode}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 border border-slate-200 text-[11px] font-medium">
              <span className={`mr-2 h-2 w-2 rounded-full ${statusDot}`} />
              {statusText}
            </span>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          {/* LEFT: Profile / general */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <h3 className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
              Employee Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Employee Name:" required>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Employee Code:">
                <input
                  type="text"
                  name="employeeCode"
                  value={profileForm.employeeCode}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Department:">
                <input
                  type="text"
                  name="department"
                  value={profileForm.department}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Designation:">
                <input
                  type="text"
                  name="designation"
                  value={profileForm.designation}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Station:">
                <input
                  type="text"
                  name="station"
                  value={profileForm.station}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Status:">
                <input
                  type="text"
                  name="status"
                  value={profileForm.status}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Date of Birth:">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profileForm.dateOfBirth || ""}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Date of Joining:">
                <input
                  type="date"
                  name="dateOfJoining"
                  value={profileForm.dateOfJoining || ""}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="CNIC:">
                <input
                  type="text"
                  name="cnic"
                  value={profileForm.cnic}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Gender:">
                <input
                  type="text"
                  name="gender"
                  value={profileForm.gender}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Blood Group:">
                <input
                  type="text"
                  name="bloodGroup"
                  value={profileForm.bloodGroup}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Official Email:">
                <input
                  type="email"
                  name="emailOfficial"
                  value={profileForm.emailOfficial}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Personal Email:">
                <input
                  type="email"
                  name="emailPersonal"
                  value={profileForm.emailPersonal}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Contact:">
                <input
                  type="text"
                  name="contact"
                  value={profileForm.contact}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>

              <Field label="Emergency Contact:">
                <input
                  type="text"
                  name="emergencyContact"
                  value={profileForm.emergencyContact}
                  onChange={onProfileChange}
                  className="w-full h-9 rounded border border-slate-300 px-3 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                />
              </Field>
            </div>

            <Field label="Address:">
              <textarea
                name="address"
                value={profileForm.address}
                onChange={onProfileChange}
                className="w-full rounded border border-slate-300 px-3 py-2 text-xs resize-none focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                rows={3}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="h-9 px-4 rounded border border-slate-300 text-xs text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="h-9 px-4 rounded bg-customRed text-xs font-semibold text-white hover:bg-customRed/90 disabled:opacity-60"
              >
                {savingProfile ? "Saving…" : "Update Employee Info"}
              </button>
            </div>
          </form>

          {/* RIGHT: Vault / Login */}
          <form onSubmit={handleSaveVault} className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
                Vault / Login Info
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Only admins can change login access and reset password.
              </p>
            </div>

            <div className="space-y-4">
              <Field label="Login / Official Email:">
                <input
                  type="email"
                  name="officialEmail"
                  value={vaultForm.officialEmail}
                  onChange={onVaultChange}
                  disabled={!canEditVault}
                  className={`w-full h-9 rounded border px-3 text-xs focus:outline-none focus:ring-1 ${
                    canEditVault
                      ? "border-slate-300 focus:border-customRed focus:ring-customRed"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                />
              </Field>

              <Field label="User Type:">
                <select
                  name="userType"
                  value={vaultForm.userType}
                  onChange={onVaultChange}
                  disabled={!canEditVault}
                  className={`w-full h-9 rounded border px-3 text-xs focus:outline-none focus:ring-1 ${
                    canEditVault
                      ? "border-slate-300 focus:border-customRed focus:ring-customRed"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <option value="">Select user type</option>
                  {userTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </Field>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    name="canLogin"
                    checked={vaultForm.canLogin}
                    onChange={onVaultChange}
                    disabled={!canEditVault}
                  />
                  <span>Allow this employee to log in</span>
                </label>
              </div>

              {canEditVault && (
                <Field label="Reset Password:">
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={vaultForm.password}
                        onChange={onVaultChange}
                        placeholder="Leave blank to keep current password"
                        className="w-full h-9 rounded border border-slate-300 px-3 pr-10 text-xs focus:border-customRed focus:outline-none focus:ring-1 focus:ring-customRed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-[11px] text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-medium text-customRed hover:text-customRed/80"
                    >
                      Generate random password
                    </button>
                  </div>
                </Field>
              )}

              {!canEditVault && (
                <p className="text-[11px] text-slate-400">
                  You don't have permission to modify login credentials.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="h-9 px-4 rounded border border-slate-300 text-xs text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingVault || !canEditVault}
                className="h-9 px-4 rounded bg-slate-900 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {savingVault ? "Updating…" : "Update Vault Info"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
