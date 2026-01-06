import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMonthlyAttendanceReport } from '../services/attendanceService';
import { WORKSHEET_YEARS, WORKSHEET_MONTHS } from '../constants';
import SharedDropdown from '../../../components/common/SharedDropdown';
import StatusBadge from './StatusBadge';
import EmployeeAutocomplete from '../../reports/components/EmployeeAutocomplete';
import { FaFileDownload, FaPrint } from 'react-icons/fa';

export default function MonthlyReport() {
    const { user } = useAuth();
    const isAdmin = useMemo(() => {
        const roles = (user?.roles || []).map(r => String(r).toLowerCase());
        return roles.includes('admin') || roles.includes('super_admin') || roles.includes('hr');
    }, [user]);

    const currentYear = new Date().getFullYear().toString();
    const currentMonthIdx = new Date().getMonth() + 1; // 1-based
    const currentMonth = WORKSHEET_MONTHS[currentMonthIdx];

    const [filters, setFilters] = useState({
        employee_id: user?.id || '',
        year: currentYear,
        month: currentMonth === '--ALL--' ? 'January' : currentMonth
    });

    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const monthsMap = {
        'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
        'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    };

    const fetchReport = async () => {
        if (!filters.employee_id) return;
        setLoading(true);
        setError('');
        try {
            const monthNum = monthsMap[filters.month];
            const data = await getMonthlyAttendanceReport({
                employee_id: filters.employee_id,
                year: filters.year,
                month: monthNum
            });
            setReport(data.report || []);
        } catch (err) {
            console.error('Failed to fetch report', err);
            setError('Failed to load report data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.year, filters.month, filters.employee_id]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Attendance Parameters</h3>
                        <p className="text-xs text-slate-500">Configure your report criteria below</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(user?.features || []).includes('reports_print') && (
                            <button className="btn-outline !py-1.5 !text-xs flex items-center gap-2">
                                <FaPrint className="opacity-70" /> Print
                            </button>
                        )}
                        {(user?.features || []).includes('reports_export') && (
                            <button className="btn-primary !py-1.5 !text-xs flex items-center gap-2">
                                <FaFileDownload className="opacity-70" /> Export
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-end">
                        {isAdmin ? (
                            <div className="md:col-span-6">
                                <EmployeeAutocomplete
                                    onSelect={(id) => setFilters(prev => ({ ...prev, employee_id: id }))}
                                />
                            </div>
                        ) : (
                            <div className="md:col-span-6">
                                <label className="form-label">Employee</label>
                                <input className="input bg-slate-50" value={user?.name || ''} readOnly />
                            </div>
                        )}

                        <SharedDropdown
                            className="md:col-span-3"
                            label="Year Selection"
                            value={filters.year}
                            onChange={(val) => setFilters(prev => ({ ...prev, year: val }))}
                            options={WORKSHEET_YEARS.filter(y => y !== '--ALL--')}
                        />

                        <SharedDropdown
                            className="md:col-span-3"
                            label="Month Selection"
                            value={filters.month}
                            onChange={(val) => setFilters(prev => ({ ...prev, month: val }))}
                            options={WORKSHEET_MONTHS.filter(m => m !== '--ALL--')}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shift</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Work Duration</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Late Arrivals</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 border-4 border-customRed border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm text-slate-500 font-medium">Generating report...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-rose-500 font-medium">{error}</td>
                                </tr>
                            ) : report.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                        No records found for the selected period.
                                    </td>
                                </tr>
                            ) : (
                                report.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                                            {new Date(row.attendance_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                                                {row.shift_name || 'NO SHIFT'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {row.first_in ? new Date(row.first_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {row.last_out ? new Date(row.last_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {row.worked_minutes ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-slate-700">{Math.floor(row.worked_minutes / 60)}h</span>
                                                    <span className="text-slate-400">{row.worked_minutes % 60}m</span>
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {row.late_minutes ? (
                                                <span className="text-rose-600 font-bold text-sm bg-rose-50 px-2 py-0.5 rounded">
                                                    {row.late_minutes}m
                                                </span>
                                            ) : (
                                                <span className="text-emerald-500 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge status={row.status} />
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
