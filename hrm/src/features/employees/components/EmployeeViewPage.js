// src/features/employees/components/EmployeeViewPage.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEmployee from "../hooks/useEmployee";

function InfoRow({ label, value, right }) {
  return (
    <div className="flex justify-between gap-4 text-[13px]">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`text-slate-900 ${right ? "text-right min-w-[130px]" : ""}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

export default function EmployeeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employee, loading, error } = useEmployee(id);

  if (loading) {
    return (
      <div className="p-8 text-sm text-slate-600">Loading employee…</div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center px-3 py-1.5 rounded border border-slate-300 text-xs font-medium bg-white hover:bg-slate-50"
        >
          ← Back
        </button>

        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-sm text-slate-600">Employee not found.</div>
    );
  }

  const initials = employee.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();

  const statusText = employee.status || "—";
  const statusLower = statusText.toLowerCase();

  let statusDotClass = "bg-amber-500"; // default
  if (statusLower === "active") statusDotClass = "bg-emerald-500";
  else if (statusLower === "left" || statusLower === "inactive")
    statusDotClass = "bg-red-500";

  // 🔑 Build avatar URL from profile_picture
  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/v1";
  const FILE_BASE = API_BASE.replace(/\/api\/v1\/?$/, "");

  const avatarUrl = employee.profile_picture
    ? `${FILE_BASE}${employee.profile_picture}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-10">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center px-3 py-1.5 rounded-md border border-slate-300 text-xs font-medium bg-white hover:bg-slate-50 shadow-sm"
        >
          ← Back
        </button>

        {/* CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* TOP SECTION WITH RED-THEME BACKDROP */}
          <div className="relative px-6 pt-6 pb-5 border-b border-slate-200 bg-gradient-to-r from-customRed/10 via-rose-50 to-white">
            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={employee.name}
                    className="h-14 w-14 rounded-full object-cover border border-slate-200 shadow-md bg-white"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md text-sm font-semibold text-slate-700 border border-slate-200">
                    {initials || "—"}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-1">
                    <h1 className="text-lg font-semibold text-slate-900">
                      {employee.name}
                    </h1>
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
                </div>
              </div>

              {/* STATUS */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 text-[11px] font-medium">
                  <span
                    className={`mr-2 h-2 w-2 rounded-full ${statusDotClass}`}
                  />
                  Status:
                  <span className="ml-1 text-slate-900">{statusText}</span>
                </span>

                {employee.cnic && (
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 text-[11px] font-medium">
                    CNIC:
                    <span className="ml-1 text-slate-900">
                      {employee.cnic}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* PERSONAL INFO */}
              <section>
                <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  PERSONAL INFORMATION
                </h2>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
                  <div className="grid gap-2">
                    <InfoRow
                      label="Date of Birth"
                      value={employee.dateOfBirth}
                    />
                    <InfoRow label="Gender" value={employee.gender} />
                    <InfoRow
                      label="Blood Group"
                      value={employee.bloodGroup}
                    />
                    <InfoRow label="CNIC" value={employee.cnic} />
                    <InfoRow label="Address" value={employee.address} />
                  </div>
                </div>
              </section>

              {/* JOB & CONTACT */}
              <section>
                <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
                  JOB & CONTACT
                </h2>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
                  <div className="grid gap-2">
                    <InfoRow
                      label="Date of Joining"
                      value={employee.dateOfJoining}
                      right
                    />
                    <InfoRow
                      label="Official Email"
                      value={employee.emailOfficial}
                      right
                    />
                    <InfoRow
                      label="Personal Email"
                      value={employee.emailPersonal}
                      right
                    />
                    <InfoRow
                      label="Contact"
                      value={employee.contact}
                      right
                    />
                    <InfoRow
                      label="Emergency Contact"
                      value={employee.emergencyContact}
                      right
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* FOOTER META */}
            <div className="mt-6 border-t border-slate-200 pt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
              <div>
                Employee ID:{" "}
                <span className="font-medium text-slate-900">
                  {employee.employeeCode}
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                {employee.department && (
                  <span>
                    Department:{" "}
                    <span className="font-medium text-slate-900">
                      {employee.department}
                    </span>
                  </span>
                )}

                {employee.station && (
                  <span>
                    Station:{" "}
                    <span className="font-medium text-slate-900">
                      {employee.station}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
