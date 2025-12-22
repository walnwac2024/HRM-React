// src/Dashbord/Dashbord.js
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAttendanceOffices,
  getTodayAttendance,
  punchAttendance,
} from "../features/attendance/services/attendanceService";

function formatTime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function badge(status) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold";
  switch (status) {
    case "PRESENT":
      return (
        <span className={`${base} bg-green-50 text-green-700 border border-green-200`}>
          Present
        </span>
      );
    case "LATE":
      return (
        <span className={`${base} bg-yellow-50 text-yellow-800 border border-yellow-200`}>
          Late
        </span>
      );
    case "ABSENT":
      return (
        <span className={`${base} bg-red-50 text-red-700 border border-red-200`}>
          Absent
        </span>
      );
    case "LEAVE":
      return (
        <span className={`${base} bg-blue-50 text-blue-700 border border-blue-200`}>
          On Leave
        </span>
      );
    case "NOT_MARKED":
    default:
      return (
        <span className={`${base} bg-gray-50 text-gray-700 border border-gray-200`}>
          Not Marked
        </span>
      );
  }
}

export default function Dashboard() {
  const { user } = useAuth();

  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [offices, setOffices] = useState([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [todayData, setTodayData] = useState(null);
  const [punching, setPunching] = useState(false);
  const [error, setError] = useState("");

  const kpiRows = [
    "Working Hour",
    "Average Working Hours",
    "Min Working Hour",
    "Max Working Hour",
    "Sign In",
    "Average Sign In Time",
    "Min Sign In Time",
    "Max Sign In Time",
    "Sign Out",
    "Average Sign Out Time",
    "Min Sign Out Time",
    "Max Sign Out Time",
  ];

  const attendance = todayData?.attendance || null;
  const shift = todayData?.shift || null;
  const grace = todayData?.grace_minutes ?? 15;

  const canCheckIn = useMemo(() => {
    if (!attendance) return true;
    return !attendance.first_in;
  }, [attendance]);

  const canCheckOut = useMemo(() => {
    if (!attendance) return false;
    return !!attendance.first_in && !attendance.last_out;
  }, [attendance]);

  const statusText = useMemo(() => {
    if (!attendance) return "You have not marked your Attendance Today!";
    if (!attendance.first_in) return "You have not checked in yet today!";
    if (attendance.first_in && !attendance.last_out)
      return "You are checked in. Don’t forget to check out.";
    if (attendance.first_in && attendance.last_out)
      return "Attendance completed for today.";
    return "You have not marked your Attendance Today!";
  }, [attendance]);

  async function loadAttendance() {
    try {
      setLoadingAttendance(true);
      setError("");

      const [officeList, today] = await Promise.all([
        getAttendanceOffices(),
        getTodayAttendance(),
      ]);

      setOffices(officeList);
      setTodayData(today);

      const inOfficeId = today?.attendance?.office_id_first_in;
      if (inOfficeId) setSelectedOfficeId(String(inOfficeId));
      else if (officeList?.length) setSelectedOfficeId(String(officeList[0].id));
    } catch (e) {
      console.error(e);
      setError("Failed to load attendance. Please refresh.");
    } finally {
      setLoadingAttendance(false);
    }
  }

  useEffect(() => {
    if (!user?.id) return;
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handlePunch = async (type) => {
    try {
      setPunching(true);
      setError("");

      if (!selectedOfficeId) {
        setError("Please select an office first.");
        return;
      }

      const res = await punchAttendance({
        office_id: Number(selectedOfficeId),
        punch_type: type,
        clientTime: new Date().toISOString(),
      });

      setTodayData((prev) => ({
        ...(prev || {}),
        date: res.date,
        shift: res.shift,
        grace_minutes: res.grace_minutes,
        attendance: res.attendance,
      }));
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to mark attendance.";
      setError(msg);
    } finally {
      setPunching(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      {/* LEFT COLUMN */}
      <section className="lg:col-span-3 space-y-3 sm:space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">
                {user?.Employee_Name || user?.name || "—"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.Official_Email || user?.email || "—"}
              </div>
            </div>
          </div>
          <div className="border-t">
            <div className="flex text-[11px] sm:text-xs">
              <button className="flex-1 py-2 hover:bg-gray-50">
                No Birthday Today
              </button>
              <button className="flex-1 py-2 border-l hover:bg-gray-50">
                New Message
              </button>
            </div>
          </div>
        </div>

        {/* Attendance card (UPDATED) */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="text-[12px] sm:text-[13px] font-semibold text-gray-700">
              ATTENDANCE (TODAY)
            </div>
            {badge(attendance?.status || "NOT_MARKED")}
          </div>

          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
            {/* Shift row */}
            <div className="rounded-lg border bg-gray-50 p-2.5 sm:p-3 text-[12px] sm:text-[13px] text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Shift</span>
                <span className="text-gray-600">{shift?.name || "—"}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold">Timing</span>
                <span className="text-gray-600">
                  {shift?.start_time || "—"} - {shift?.end_time || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold">Grace</span>
                <span className="text-gray-600">{grace} min</span>
              </div>
            </div>

            {/* Status message */}
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-600 p-2.5 sm:p-3 text-[12px] sm:text-[13px]">
              {loadingAttendance ? "Loading attendance..." : statusText}
              {attendance?.status === "LATE" && (
                <div className="mt-1 text-[12px] text-red-700">
                  Late by {attendance?.late_minutes || 0} minutes
                </div>
              )}
            </div>

            {/* Office select */}
            <div>
              <label className="text-[12px] text-gray-600 font-semibold">
                Office
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                disabled={loadingAttendance || punching}
              >
                {offices.map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Punch buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePunch("IN")}
                disabled={loadingAttendance || punching || !canCheckIn}
                className={`w-full rounded-lg py-2 text-sm text-white ${loadingAttendance || punching || !canCheckIn
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-customRed hover:opacity-95"
                  }`}
              >
                {punching ? "..." : "Check In"}
              </button>

              <button
                onClick={() => handlePunch("OUT")}
                disabled={loadingAttendance || punching || !canCheckOut}
                className={`w-full rounded-lg py-2 text-sm text-white ${loadingAttendance || punching || !canCheckOut
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-customRed hover:opacity-95"
                  }`}
              >
                {punching ? "..." : "Check Out"}
              </button>
            </div>

            {/* Today summary */}
            <div className="rounded-lg border p-2.5 sm:p-3 text-[12px] sm:text-[13px] text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold">In</span>
                <span>{formatTime(attendance?.first_in)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold">Out</span>
                <span>{formatTime(attendance?.last_out)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold">Worked</span>
                <span>
                  {attendance?.worked_minutes
                    ? `${Math.floor(attendance.worked_minutes / 60)}h ${attendance.worked_minutes % 60
                    }m`
                    : "—"}
                </span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 border border-red-200 bg-red-50 rounded-lg p-2">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Leave Summary (unchanged) */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-gray-700">
            LEAVE SUMMARY
          </div>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-[10px] sm:text-[11px] uppercase text-gray-500 mb-2">
              Title
            </div>
            {[
              { label: "AL", value: "20.0" },
              { label: "Sick Leave", value: "8.0" },
              { label: "testLeavePermanent", value: "24.00" },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between py-2 border-t first:border-t-0"
              >
                <span className="text-[13px] text-gray-700">{r.label}</span>
                <span className="px-2 py-1 rounded bg-gray-100 text-[11px] sm:text-[12px]">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CENTER COLUMN (we will connect HR widget next) */}
      <section className="lg:col-span-6 space-y-3 sm:space-y-4">
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            <div className="p-0">
              <div className="flex items-center justify-between bg-gray-100 px-3 sm:px-4 py-2">
                <div className="text-[11px] sm:text-[12px] uppercase font-semibold text-gray-600">
                  Missing Attendance
                </div>
              </div>
              <div className="p-2.5 sm:p-3">
                <div className="overflow-x-auto rounded border">
                  <table className="min-w-[520px] w-full text-[11px] sm:text-[12px]">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">In</th>
                        <th className="p-2 text-left">Out</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2">—</td>
                        <td className="p-2">—</td>
                        <td className="p-2">—</td>
                        <td className="p-2 text-gray-500">
                          Next: connect HR missing widget
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Next step: wire HR/Admin missing list + email reminders.
                </p>
              </div>
            </div>

            <div className="p-0">
              <div className="flex items-center justify-between bg-gray-100 px-3 sm:px-4 py-2">
                <div className="text-[11px] sm:text-[12px] uppercase font-semibold text-gray-600">
                  Attendance Summary
                </div>
              </div>
              <div className="p-2.5 sm:p-3">
                <div className="overflow-x-auto rounded border">
                  <table className="min-w-[420px] w-full text-[11px] sm:text-[12px]">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { title: "Present", val: "—" },
                        { title: "Absent", val: "—" },
                        { title: "Leave", val: "—" },
                        { title: "H/D Leave", val: "—" },
                      ].map((r) => (
                        <tr key={r.title} className="border-t">
                          <td className="p-2">{r.title}</td>
                          <td className="p-2 text-right">
                            <span className="px-2 py-0.5 rounded bg-gray-100">
                              {r.val}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Next step: connect summary from attendance_daily.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee KPI */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="flex items-center justify-between bg-gray-100 px-3 sm:px-4 py-2">
            <div className="text-[11px] sm:text-[12px] uppercase font-semibold text-gray-600">
              Employee KPI
            </div>
            <div className="text-[11px] sm:text-[12px] text-gray-500">—</div>
          </div>
          <div className="p-2.5 sm:p-3">
            <div className="overflow-x-auto rounded border">
              <table className="min-w-[520px] w-full text-[11px] sm:text-[12px]">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiRows.map((row) => (
                    <tr key={row} className="border-t">
                      <td className="p-2">{row}</td>
                      <td className="p-2">
                        <span className="inline-block h-3 w-24 sm:w-28 bg-gray-100 rounded" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN (unchanged) */}
      <section className="lg:col-span-3 space-y-3 sm:space-y-4">
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-3 sm:px-4 pt-2 border-b">
            <nav className="flex text-[11px] sm:text-[12px]">
              <button className="px-3 py-2 font-semibold text-customRed border-b-2 border-customRed">
                My Team
              </button>
              <button className="px-3 py-2 text-gray-600">My Managers</button>
            </nav>
          </div>
          <div className="p-3 sm:p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200" />
                  <div>
                    <div className="h-3 w-24 sm:w-28 bg-gray-100 rounded mb-1" />
                    <div className="h-3 w-14 sm:w-16 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border" />
              </div>
            ))}
            <p className="text-xs text-gray-500">No team data yet.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-3 sm:px-4 pt-2 border-b">
            <nav className="flex text-[11px] sm:text-[12px]">
              <button className="px-3 py-2 font-semibold text-customRed border-b-2 border-customRed">
                My Requests
              </button>
              <button className="px-3 py-2 text-gray-600">My Approvals</button>
            </nav>
          </div>
          <div className="p-3 sm:p-4 space-y-2 text-[13px] text-gray-700">
            {[
              "List of Leave Approvals",
              "List of Attendance Approvals",
              "List of Exemption Approvals",
              "List of Payroll Approvals",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between">
                <span>{label}</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px] sm:text-[12px]">
                  0
                </span>
              </div>
            ))}
            <p className="text-xs text-gray-500 pt-2">No records found</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-gray-700">
            News
          </div>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs text-gray-500">
            No record found
          </div>
        </div>
      </section>
    </div>
  );
}
