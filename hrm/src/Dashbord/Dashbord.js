// src/Dashbord/Dashbord.js
import React from "react";

export default function Dashboard() {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      {/* LEFT COLUMN */}
      <section className="lg:col-span-3 space-y-3 sm:space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200" />
            <div>
              <div className="h-4 w-32 sm:w-36 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-20 sm:w-24 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="border-t">
            <div className="flex text-[11px] sm:text-xs">
              <button className="flex-1 py-2 hover:bg-gray-50">No Birthday Today</button>
              <button className="flex-1 py-2 border-l hover:bg-gray-50">New Message</button>
            </div>
          </div>
        </div>

        {/* Attendance alert */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-gray-700">
            ATTENDANCE
          </div>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-600 p-2.5 sm:p-3 text-[12px] sm:text-[13px]">
              You have not marked your Attendance Today!
            </div>
            <button className="mt-3 w-full bg-customRed hover:opacity-95 text-white rounded-lg py-2 text-sm">
              Sign In
            </button>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-gray-700">
            LEAVE SUMMARY
          </div>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-[10px] sm:text-[11px] uppercase text-gray-500 mb-2">Title</div>
            {[
              { label: "AL", value: "20.0" },
              { label: "Sick Leave", value: "8.0" },
              { label: "testLeavePermanent", value: "24.00" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between py-2 border-t first:border-t-0">
                <span className="text-[13px] text-gray-700">{r.label}</span>
                <span className="px-2 py-1 rounded bg-gray-100 text-[11px] sm:text-[12px]">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CENTER COLUMN */}
      <section className="lg:col-span-6 space-y-3 sm:space-y-4">
        {/* Missing Attendance + Attendance Summary */}
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
                        <td className="p-2">02/Oct/2018</td>
                        <td className="p-2">11:40:54 PM</td>
                        <td className="p-2">12:05:35 AM</td>
                        <td className="p-2 text-customRed">Break Error</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">—</td>
                        <td className="p-2">—</td>
                        <td className="p-2">—</td>
                        <td className="p-2">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
                        { title: "Present", val: "2.00" },
                        { title: "Absent", val: "5.00" },
                        { title: "Leave", val: "0.00" },
                        { title: "H/D Leave", val: "0.00" },
                      ].map((r) => (
                        <tr key={r.title} className="border-t">
                          <td className="p-2">{r.title}</td>
                          <td className="p-2 text-right">
                            <span className="px-2 py-0.5 rounded bg-gray-100">{r.val}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            <div className="text-[11px] sm:text-[12px] text-gray-500">Sumitha Thomas</div>
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

      {/* RIGHT COLUMN */}
      <section className="lg:col-span-3 space-y-3 sm:space-y-4">
        {/* My Team */}
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

        {/* My Requests */}
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
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px] sm:text-[12px]">0</span>
              </div>
            ))}
            <p className="text-xs text-gray-500 pt-2">No records found</p>
          </div>
        </div>

        {/* News */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold text-gray-700">
            News
          </div>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs text-gray-500">No record found</div>
        </div>
      </section>
    </div>
  );
}
