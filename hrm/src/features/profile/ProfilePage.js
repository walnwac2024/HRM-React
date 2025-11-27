// src/features/profile/ProfilePage.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function Field({ label, value, readOnly = false, onChange, type = "text" }) {
  if (readOnly) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </span>
        <span className="text-sm text-slate-900">{value || "—"}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          className="text-sm rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-customRed/50 focus:border-customRed resize-none min-h-[70px]"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className="text-sm rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-customRed/50 focus:border-customRed"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // editable basic profile fields
  const [personalEmail, setPersonalEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // password fields
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  const initials = useMemo(() => {
    const name = employee?.name || user?.name || "User";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [employee, user]);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/v1";
  const FILE_BASE = API_BASE.replace(/\/api\/v1\/?$/, "");

  // ✅ support img from both user + employee and both keys
  const rawAvatarPath =
    user?.profile_img ||
    user?.profile_picture ||
    employee?.profile_img ||
    employee?.profile_picture ||
    null;

  const avatarUrl = rawAvatarPath
    ? rawAvatarPath.startsWith("http")
      ? rawAvatarPath
      : `${FILE_BASE}${
          rawAvatarPath.startsWith("/") ? rawAvatarPath : `/${rawAvatarPath}`
        }`
    : null;

  // Load profile info
  useEffect(() => {
    const loadProfile = async () => {
      try {
        let sessionUser = user;

        if (!sessionUser) {
          const { data } = await api.get("/auth/me");
          sessionUser = data.user;
          if (setUser && data.user) setUser(data.user);
        }

        if (!sessionUser?.id) {
          setLoading(false);
          return;
        }

        const { data: emp } = await api.get(`/employees/${sessionUser.id}`);
        setEmployee(emp);

        setPersonalEmail(emp.emailPersonal || "");
        setContact(emp.contact || "");
        setAddress(emp.address || "");
        setEmergencyContact(emp.emergencyContact || "");
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, setUser]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMsg("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/auth/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // backend might return profile_img or profile_picture
      const newPath = data.profile_img || data.profile_picture;

      const updatedUser = {
        ...(user || {}),
        profile_img: newPath,
        profile_picture: newPath,
      };
      setUser && setUser(updatedUser);

      setEmployee((prev) =>
        prev
          ? {
              ...prev,
              profile_img: newPath,
              profile_picture: newPath,
            }
          : prev
      );

      setMsg("Profile picture updated.");
    } catch (err) {
      console.error("Avatar upload error:", err);
      setMsg("Failed to upload picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!employee?.id) return;
    setSaving(true);
    setMsg("");

    try {
      await api.patch(`/employees/${employee.id}`, {
        emailPersonal: personalEmail,
        contact,
        address,
        emergencyContact,
      });

      const { data: emp } = await api.get(`/employees/${employee.id}`);
      setEmployee(emp);

      setMsg("Profile updated successfully.");
    } catch (err) {
      console.error("Profile save error:", err);
      setMsg("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPwError("");
    setPwMsg("");

    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError("All fields are required.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    if (pwNew.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    setPwSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: pwCurrent,
        newPassword: pwNew,
      });
      setPwMsg("Password updated successfully.");
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to change password.";
      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading || !employee) {
    return (
      <div className="p-6 text-sm text-slate-600">Loading profile…</div>
    );
  }

  const statusText = employee.status || "—";
  const statusLower = statusText.toLowerCase();
  let statusDotClass = "bg-amber-500";
  if (statusLower === "active") statusDotClass = "bg-emerald-500";
  else if (statusLower === "left" || statusLower === "inactive")
    statusDotClass = "bg-red-500";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-10">
        <h1 className="text-xl font-bold text-slate-900 mb-6">
          My Profile
        </h1>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="relative px-6 pt-6 pb-5 border-b border-slate-200 bg-gradient-to-r from-customRed/10 via-rose-50 to-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={employee.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md text-base font-semibold text-slate-700 border border-slate-200">
                      {initials}
                    </div>
                  )}

                  <label className="absolute -bottom-1 -right-1 cursor-pointer">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-customRed text-white text-[10px] shadow-md">
                      ✎
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleUpload}
                    />
                  </label>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {employee.name}
                    </h2>
                    {employee.employeeCode && (
                      <span className="text-xs font-medium text-slate-500">
                        ({employee.employeeCode})
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs md:text-sm text-slate-600">
                    {employee.designation || "—"}
                    <span className="mx-1 text-slate-400">·</span>
                    {employee.department || "—"}
                    <span className="mx-1 text-slate-400">·</span>
                    {employee.station || "—"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    edit only your basic contact details here
                  </p>
                </div>
              </div>

              {/* Status + official info */}
              <div className="flex flex-col items-start md:items-end gap-2 text-xs">
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 text-[11px] font-medium">
                  <span
                    className={`mr-2 h-2 w-2 rounded-full ${statusDotClass}`}
                  />
                  Status:
                  <span className="ml-1 text-slate-900">{statusText}</span>
                </span>

                <div className="text-right space-y-0.5">
                  <div className="text-[11px] text-slate-500">
                    Official Email
                  </div>
                  <div className="text-xs font-medium text-slate-800">
                    {employee.emailOfficial || user?.email || "—"}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Joined on{" "}
                    <span className="font-medium text-slate-800">
                      {employee.dateOfJoining || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-6 space-y-6">
            {/* READ-ONLY QUICK INFO */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section>
                <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  Personal (read only)
                </h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm grid gap-3">
                  <Field
                    label="Date of Birth"
                    value={employee.dateOfBirth}
                    readOnly
                  />
                  <Field label="Gender" value={employee.gender} readOnly />
                  <Field
                    label="Blood Group"
                    value={employee.bloodGroup}
                    readOnly
                  />
                  <Field label="CNIC" value={employee.cnic} readOnly />
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  Job (read only)
                </h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm grid gap-3">
                  <Field
                    label="Designation"
                    value={employee.designation}
                    readOnly
                  />
                  <Field
                    label="Department"
                    value={employee.department}
                    readOnly
                  />
                  <Field
                    label="Station"
                    value={employee.station}
                    readOnly
                  />
                  <Field
                    label="Employment Status"
                    value={statusText}
                    readOnly
                  />
                </div>
              </section>
            </div>

            {/* BASIC PROFILE (EDITABLE) */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  Basic Profile (you can edit)
                </h2>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Personal Email"
                    value={personalEmail}
                    onChange={setPersonalEmail}
                  />
                  <Field
                    label="Contact Number"
                    value={contact}
                    onChange={setContact}
                  />
                  <Field
                    label="Emergency Contact"
                    value={emergencyContact}
                    onChange={setEmergencyContact}
                  />
                  <Field
                    label="Address"
                    value={address}
                    onChange={setAddress}
                    type="textarea"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setPersonalEmail(employee.emailPersonal || "");
                      setContact(employee.contact || "");
                      setAddress(employee.address || "");
                      setEmergencyContact(employee.emergencyContact || "");
                      setMsg("");
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-1.5 text-xs rounded-md bg-customRed text-white font-semibold hover:bg-customRed/90 disabled:opacity-60"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>

                {msg && (
                  <div className="mt-3 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded">
                    {uploading ? "Uploading picture…" : msg}
                  </div>
                )}
              </div>
            </section>

            {/* CHANGE PASSWORD */}
            <section>
              <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
                Change Password
              </h2>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field
                    label="Current Password"
                    value={pwCurrent}
                    onChange={setPwCurrent}
                    type="password"
                  />
                  <Field
                    label="New Password"
                    value={pwNew}
                    onChange={setPwNew}
                    type="password"
                  />
                  <Field
                    label="Confirm New Password"
                    value={pwConfirm}
                    onChange={setPwConfirm}
                    type="password"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-1.5 text-xs rounded-md bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
                    onClick={handlePasswordSave}
                    disabled={pwSaving}
                  >
                    {pwSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>

                {pwError && (
                  <div className="mt-3 text-[11px] text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">
                    {pwError}
                  </div>
                )}
                {pwMsg && (
                  <div className="mt-3 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded">
                    {pwMsg}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
