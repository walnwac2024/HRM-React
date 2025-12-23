// src/features/attendance/components/AttendanceSettings.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getAttendanceRules,
  getAttendanceShifts,
  updateActiveAttendanceRule,
  updateAttendanceShift,
} from "../services/attendanceService";
import { useAuth } from "../../../context/AuthContext";

function toInputDate(v) {
  if (!v) return "";
  return String(v).slice(0, 10);
}

export default function AttendanceSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingShiftId, setSavingShiftId] = useState(null);
  const [savingRule, setSavingRule] = useState(false);
  const [error, setError] = useState("");

  const [shifts, setShifts] = useState([]);
  const [rules, setRules] = useState([]);

  // active rule = is_active=1 (fallback first)
  const activeRule = useMemo(
    () => rules?.find((r) => Number(r.is_active) === 1) || rules?.[0] || null,
    [rules]
  );

  const [ruleForm, setRuleForm] = useState({
    grace_minutes: 15,
    notify_employee: 1,
    notify_hr_admin: 1,
  });

  useEffect(() => {
    if (!activeRule) return;
    setRuleForm({
      grace_minutes: Number(activeRule.grace_minutes ?? 15),
      notify_employee: Number(activeRule.notify_employee ?? 1),
      notify_hr_admin: Number(activeRule.notify_hr_admin ?? 1),
    });
  }, [activeRule]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [s, r] = await Promise.all([getAttendanceShifts(), getAttendanceRules()]);
      setShifts(s);
      setRules(r);
    } catch (e) {
      console.error(e);
      setError("Failed to load attendance settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateShiftLocal = (id, patch) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const saveShift = async (shift) => {
    try {
      setSavingShiftId(shift.id);
      setError("");

      await updateAttendanceShift(shift.id, {
        start_time: shift.start_time,
        end_time: shift.end_time,
        effective_from: toInputDate(shift.effective_from),
        effective_to: toInputDate(shift.effective_to),
        is_active: shift.is_active ? 1 : 0,
      });

      await load();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to update shift");
    } finally {
      setSavingShiftId(null);
    }
  };

  const saveRule = async () => {
    try {
      setSavingRule(true);
      setError("");

      await updateActiveAttendanceRule({
        grace_minutes: Number(ruleForm.grace_minutes),
        notify_employee: Number(ruleForm.notify_employee) ? 1 : 0,
        notify_hr_admin: Number(ruleForm.notify_hr_admin) ? 1 : 0,
      });

      await load();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to update rule");
    } finally {
      setSavingRule(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            Attendance Settings
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {user?.role?.replace("_", " ") || "User"}
          </span>
        </div>

        <div className="card-body space-y-8">
          {/* RULES */}
          <div className="rounded-2xl border border-slate-100 p-6 bg-slate-50/30">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Global Rule</div>

              <button
                onClick={saveRule}
                disabled={savingRule || loading}
                className="btn-primary h-9 px-6 text-[11px] uppercase tracking-widest"
              >
                {savingRule ? "Saving..." : "Save Rule"}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Grace Minutes
                </label>
                <input
                  type="number"
                  min={0}
                  max={240}
                  value={ruleForm.grace_minutes}
                  onChange={(e) =>
                    setRuleForm((p) => ({ ...p, grace_minutes: e.target.value }))
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div className="flex items-end gap-2">
                <input
                  id="notifyEmp"
                  type="checkbox"
                  checked={!!Number(ruleForm.notify_employee)}
                  onChange={(e) =>
                    setRuleForm((p) => ({
                      ...p,
                      notify_employee: e.target.checked ? 1 : 0,
                    }))
                  }
                />
                <label htmlFor="notifyEmp" className="text-sm text-gray-700">
                  Email employee
                </label>
              </div>

              <div className="flex items-end gap-2">
                <input
                  id="notifyAdmins"
                  type="checkbox"
                  checked={!!Number(ruleForm.notify_hr_admin)}
                  onChange={(e) =>
                    setRuleForm((p) => ({
                      ...p,
                      notify_hr_admin: e.target.checked ? 1 : 0,
                    }))
                  }
                />
                <label htmlFor="notifyAdmins" className="text-sm text-gray-700">
                  Email HR/Admin/Super Admin
                </label>
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Grace is used for late detection + missing attendance alerts.
            </p>
          </div>

          {/* SHIFTS */}
          <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
            <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
              <div className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Shifts</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Auto-detected by date range (RAMADAN &gt; SUMMER &gt; WINTER)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Start</th>
                    <th className="p-3 text-left">End</th>
                    <th className="p-3 text-left">Effective From</th>
                    <th className="p-3 text-left">Effective To</th>
                    <th className="p-3 text-left">Active</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : shifts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-gray-500">
                        No shifts found.
                      </td>
                    </tr>
                  ) : (
                    shifts.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-3 font-semibold text-gray-800">{s.name}</td>

                        <td className="p-3">
                          <input
                            type="time"
                            value={String(s.start_time).slice(0, 5)}
                            onChange={(e) =>
                              updateShiftLocal(s.id, {
                                start_time: e.target.value + ":00",
                              })
                            }
                            className="border rounded-lg px-3 py-2 text-sm w-[140px]"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="time"
                            value={String(s.end_time).slice(0, 5)}
                            onChange={(e) =>
                              updateShiftLocal(s.id, {
                                end_time: e.target.value + ":00",
                              })
                            }
                            className="border rounded-lg px-3 py-2 text-sm w-[140px]"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="date"
                            value={toInputDate(s.effective_from)}
                            onChange={(e) =>
                              updateShiftLocal(s.id, {
                                effective_from: e.target.value,
                              })
                            }
                            className="border rounded-lg px-3 py-2 text-sm"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="date"
                            value={toInputDate(s.effective_to)}
                            onChange={(e) =>
                              updateShiftLocal(s.id, { effective_to: e.target.value })
                            }
                            className="border rounded-lg px-3 py-2 text-sm"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={!!Number(s.is_active)}
                            onChange={(e) =>
                              updateShiftLocal(s.id, {
                                is_active: e.target.checked ? 1 : 0,
                              })
                            }
                          />
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => saveShift(s)}
                            disabled={savingShiftId === s.id}
                            className={`px-4 py-2 rounded-lg text-sm text-white ${savingShiftId === s.id
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-customRed hover:opacity-95"
                              }`}
                          >
                            {savingShiftId === s.id ? "Saving..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 text-xs text-gray-500">
              Ramadan dates change yearly — update effective range here once per year.
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
