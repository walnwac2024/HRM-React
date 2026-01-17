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
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl">
        <div className="modal-header">
          <h3 className="font-semibold text-gray-800 leading-tight">
            Which Employees would you like to send login credentials?
          </h3>
          <button
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-grid">
            {/* Station */}
            <div>
              <label className="form-label">Station</label>
              <select
                value={form.station}
                onChange={set("station")}
                className="input"
              >
                <option value="">--ALL--</option>
                {stations.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="form-label">Department</label>
              <select
                value={form.department}
                onChange={set("department")}
                className="input"
              >
                <option value="">--ALL--</option>
                {departments.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Employee Group */}
            <div>
              <label className="form-label">Employee Group</label>
              <select
                value={form.group}
                onChange={set("group")}
                className="input"
              >
                <option value="">--ALL--</option>
                {groups.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Employee (required) */}
            <div>
              <label className="form-label">
                Employee <span className="text-customRed">*</span>
              </label>
              <select
                value={form.employee}
                onChange={set("employee")}
                disabled={loading}
                className={`input ${loading ? "bg-slate-100" : ""}`}
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
        <div className="modal-footer flex-col sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline flex-1 sm:flex-none"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSend}
            onClick={handleSend}
            className={`btn-primary flex-1 sm:flex-none ${!canSend ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {sending ? "Sending..." : "Send Credentials"}
          </button>
        </div>
      </div>
    </div>
  );
}
