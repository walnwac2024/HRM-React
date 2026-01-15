import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function SendCredentialsModal({ open, onClose }) {
  const [form, setForm] = useState({
    station: "",
    department: "",
    group: "",
    employee: "",
  });

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Lists
  const [stations, setStations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Fetch Lookups on open
  useEffect(() => {
    if (open) {
      api.get("/employees/lookups/stations").then(res => setStations(res.data)).catch(console.error);
      api.get("/employees/lookups/departments").then(res => setDepartments(res.data)).catch(console.error);
      api.get("/employees/lookups/groups").then(res => setGroups(res.data)).catch(console.error);
    }
  }, [open]);

  // Fetch Employees based on filters
  useEffect(() => {
    if (!open) return;

    const fetchEmps = async () => {
      setLoading(true);
      try {
        const params = {};
        if (form.station) params.station = form.station;
        if (form.department) params.department = form.department;
        if (form.group) params.employee_group = form.group;

        // Reusing efficient list endpoint, but we just need ID and Name
        const res = await api.get("/employees", { params });
        setEmployees(res.data || []);
      } catch (e) {
        console.error("Failed to fetch employees for creds", e);
      } finally {
        setLoading(false);
      }
    };

    // Debounce or just fetch? 
    // Since it's a modal, we can fetch immediately or on effect.
    fetchEmps();
  }, [open, form.station, form.department, form.group]);


  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const canSend = Boolean(form.employee) && !sending;

  const handleSend = async () => {
    if (!form.employee) return;
    setSending(true);
    try {
      await api.post("/employees/send-credentials", {
        employee_id: form.employee
      });
      alert("Credentials sent successfully!");
      onClose();
      setForm({ station: "", department: "", group: "", employee: "" }); // reset
    } catch (e) {
      alert("Failed to send credentials: " + (e?.response?.data?.message || e.message));
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-slate-800">
            Which Employees would you like to send login credentials?
          </h3>
          <button
            className="h-7 w-7 rounded-full grid place-items-center text-slate-600 hover:bg-slate-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Station */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Station</label>
              <select
                value={form.station}
                onChange={set("station")}
                className="w-full h-9 rounded border border-slate-300 text-sm focus:border-customRed focus:ring-customRed"
              >
                <option value="">--ALL--</option>
                {stations.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Department</label>
              <select
                value={form.department}
                onChange={set("department")}
                className="w-full h-9 rounded border border-slate-300 text-sm focus:border-customRed focus:ring-customRed"
              >
                <option value="">--ALL--</option>
                {departments.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Employee Group */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Employee Group</label>
              <select
                value={form.group}
                onChange={set("group")}
                className="w-full h-9 rounded border border-slate-300 text-sm focus:border-customRed focus:ring-customRed"
              >
                <option value="">--ALL--</option>
                {groups.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Employee (required) */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={form.employee}
                onChange={set("employee")}
                disabled={loading}
                className="w-full h-9 rounded border border-slate-300 text-sm focus:border-customRed focus:ring-customRed disabled:bg-slate-100"
              >
                <option value="">
                  {loading ? "Loading..." : "Select employee..."}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSend}
            onClick={handleSend}
            className={`h-9 px-6 rounded-md text-white text-sm transition-all
              ${canSend ? "bg-customRed hover:opacity-95" : "bg-slate-300 cursor-not-allowed"}`}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
