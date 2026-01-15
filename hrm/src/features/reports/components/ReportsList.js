import React, { useState } from 'react';
import useEmployees from '../../employees/hooks/useEmployees';
import SharedDropdown from '../../../components/common/SharedDropdown';
import { WORKSHEET_YEARS, WORKSHEET_MONTHS } from '../../attendance/constants';
import { FaEye, FaFileDownload, FaPrint } from 'react-icons/fa';
import api from '../../../utils/api';

const monthsMap = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
};

export default function ReportsList({ onView }) {
    // We can reuse useEmployees for the list, or just fetch lightweight list
    const {
        list,
        // filters,
        // setFilter,
        loading,
        // page, setPage, totalPages
    } = useEmployees();

    // Local state for Month/Year selection which applies to the ACTIONS (Export/Print)
    // defaulting to current
    const currentYear = new Date().getFullYear().toString();
    const currentMonthIdx = new Date().getMonth() + 1;
    const currentMonth = WORKSHEET_MONTHS[currentMonthIdx];

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // Filter list locally for now or add search? 
    // useEmployees already handles some state but it's bound to its own local state. 
    // Let's just use the `list` from it. Ideally we should pass search to it.
    // For simplicity, let's implement a simple client-side search here if useEmployees doesn't expose it easily 
    // (Actually useEmployees exposes `setFilter`, so let's use that if we want server search, or just filter `list` if it loads all)
    // Checked useEmployees: it loads based on `appliedFilters`. 
    // Let's rely on the fact that `useEmployees` loads data on mount. 
    // We might need to add a search input.

    const [search, setSearch] = useState("");

    const filteredList = list.filter(emp =>
        emp.employee_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(search.toLowerCase())
    );

    const handleExport = async (empId, empName) => {
        // We need to implement the export logic here similar to MonthlyReport.js
        // Or reuse a service. 
        // For now, let's replicate the CSV download logic since it's client-side in MonthlyReport.js? 
        // NO, MonthlyReport.js fetches specific report data then downloads it.
        // We need to fetch report data for that user, THEN download.

        try {
            const m = monthsMap[selectedMonth];
            const res = await api.get(`/attendance/report/monthly`, {
                params: {
                    employee_id: empId,
                    year: selectedYear,
                    month: m
                }
            });
            const report = res.data.report || [];

            // CSV Generation
            const headers = ["Date", "Shift", "Check In", "Check Out", "Work Duration", "Late Arrivals", "Status"];
            const csvRows = [headers.join(",")];

            report.forEach(row => {
                const values = [
                    new Date(row.attendance_date).toLocaleDateString('en-GB'),
                    row.shift_name || "",
                    row.first_in ? new Date(row.first_in).toLocaleTimeString() : "",
                    row.last_out ? new Date(row.last_out).toLocaleTimeString() : "",
                    row.worked_minutes || "0",
                    row.late_minutes || "0",
                    row.status
                ];
                csvRows.push(values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${empName}_Report_${selectedYear}_${selectedMonth}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            alert("Failed to export report");
        }
    };

    const handlePrint = (empId) => {
        // To print, we usually need to render the view. 
        // A simple "Quick Print" might be hard without rendering. 
        // The user can just click "View" then "Print". 
        // For "Print" button here, maybe we just open the view safely?
        // Let's just forward to View for now, or just show Alert "Please view to print".
        // Actually, let's make "Print" just open the view (same as View) but maybe passes a "autoPrint" flag?
        onView(empId, selectedYear, selectedMonth);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-wrap items-end gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <label className="form-label">Search Employee</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Search by name or code..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <SharedDropdown
                        className="w-40"
                        label="Year"
                        value={selectedYear}
                        onChange={setSelectedYear}
                        options={WORKSHEET_YEARS.filter(y => y !== '--ALL--')}
                    />
                    <SharedDropdown
                        className="w-40"
                        label="Month"
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        options={WORKSHEET_MONTHS.filter(m => m !== '--ALL--')}
                    />
                    <button
                        onClick={async () => {
                            if (!window.confirm(`Download full report for ${selectedMonth} ${selectedYear}?`)) return;
                            try {
                                const m = monthsMap[selectedMonth];
                                const res = await api.get("/attendance/report/monthly/all", {
                                    params: { year: selectedYear, month: m },
                                    responseType: 'blob'
                                });
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Monthly_Report_ALL_${selectedYear}_${selectedMonth}.xlsx`);
                                document.body.appendChild(link);
                                link.click();
                                link.parentNode.removeChild(link);
                            } catch (e) {
                                console.error(e);
                                alert("Failed to download bulk report.");
                            }
                        }}
                        className="btn-primary flex items-center gap-2 mb-1"
                    >
                        <FaFileDownload /> Export All
                    </button>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="3" className="p-4 text-center">Loading...</td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan="3" className="p-4 text-center text-slate-500">No employees found.</td></tr>
                            ) : (
                                filteredList.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900">{emp.employee_name}</div>
                                            <div className="text-sm text-slate-500">{emp.employee_code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {emp.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onView(emp.id, selectedYear, selectedMonth)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                                    title="View Report"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleExport(emp.id, emp.employee_name)}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
                                                    title="Export CSV"
                                                >
                                                    <FaFileDownload />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
