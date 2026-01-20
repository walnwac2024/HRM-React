import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { Users, Building2, Gift, PartyPopper, ChevronDown, ChevronRight, Search } from "lucide-react";
import { BASE_URL } from "../../utils/api";
import BirthdayCelebration from "../../components/common/BirthdayCelebration";

const BACKEND_URL = BASE_URL;

export default function OrganizationPage() {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDepts, setExpandedDepts] = useState(new Set());
    const [search, setSearch] = useState("");

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [deptRes, empRes] = await Promise.all([
                api.get("/employees/departments"),
                api.get("/employees?limit=1000") // Get all active employees
            ]);
            setDepartments(deptRes.data);
            setEmployees(empRes.data.employees || []);
        } catch (e) {
            console.error("Failed to fetch organization data", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleDept = (dept) => {
        const next = new Set(expandedDepts);
        if (next.has(dept)) next.delete(dept);
        else next.add(dept);
        setExpandedDepts(next);
    };

    // Helper: Birthday check (robust)
    const isBirthdayToday = (dob) => {
        if (!dob) return false;
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonthIndex = now.getMonth();

        if (dob instanceof Date) {
            return dob.getDate() === currentDay && dob.getMonth() === currentMonthIndex;
        }

        const dobStr = String(dob);
        if (dobStr.includes('-') && dobStr.length > 7 && !isNaN(Date.parse(dobStr))) {
            const d = new Date(dobStr);
            return d.getDate() === currentDay && d.getMonth() === currentMonthIndex;
        }

        const parts = dobStr.split('-');
        if (parts.length < 2) return false;
        const day = parseInt(parts[0], 10);
        const monthStr = parts[1].toLowerCase();
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const birthMonthIndex = months.indexOf(monthStr);
        return day === currentDay && birthMonthIndex === currentMonthIndex;
    };

    const getAvatarUrl = (imgPath) => {
        if (!imgPath) return null;
        if (imgPath.startsWith("http")) return imgPath;
        return `${BACKEND_URL}${imgPath.startsWith("/") ? imgPath : `/${imgPath}`}`;
    };

    const groupedData = departments.map(dept => {
        const members = employees.filter(e => e.department === dept);
        const birthdaysToday = members.filter(m => isBirthdayToday(m.dateOfBirth));
        return { name: dept, members, birthdaysToday };
    }).filter(d => d.members.length > 0);

    const filteredData = groupedData.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.members.some(m => m.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <Building2 className="text-customRed" size={28} />
                        Organization Directory
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and view all departments and team members.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search department or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-customRed/5 focus:border-customRed outline-none transition-all text-sm font-medium shadow-sm bg-white"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-customRed border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredData.length === 0 ? (
                        <div className="card text-center py-20">
                            <Users size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No departments found</p>
                        </div>
                    ) : (
                        filteredData.map((dept) => (
                            <div key={dept.name} className="card overflow-hidden transition-all duration-300">
                                {/* Department Header */}
                                <div
                                    onClick={() => toggleDept(dept.name)}
                                    className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors
                                        ${expandedDepts.has(dept.name) ? 'bg-slate-50/50 border-b border-slate-100' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-customRed/5 flex items-center justify-center text-customRed border border-customRed/10">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{dept.name}</h2>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                {dept.members.length} Members • {dept.birthdaysToday.length > 0 ? `${dept.birthdaysToday.length} Birthday Today` : 'No Birthdays Today'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {dept.birthdaysToday.length > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 animate-pulse">
                                                <Gift size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Celebration!</span>
                                            </div>
                                        )}
                                        {expandedDepts.has(dept.name) ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                                    </div>
                                </div>

                                {/* Department Content */}
                                {expandedDepts.has(dept.name) && (
                                    <div className="p-6">
                                        {dept.birthdaysToday.length > 0 && (
                                            <div className="mb-6 space-y-4">
                                                {dept.birthdaysToday.map(m => (
                                                    <BirthdayCelebration key={m.id} isBirthday={true} name={m.name} />
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {dept.members.map((m) => (
                                                <div key={m.id} className="relative group p-3 rounded-2xl border border-slate-100 hover:border-customRed/20 hover:bg-red-50/5 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                                                                {m.profile_picture ? (
                                                                    <img src={getAvatarUrl(m.profile_picture)} alt={m.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                                                        {m.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isBirthdayToday(m.dateOfBirth) && (
                                                                <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm p-0.5">
                                                                    <span className="text-[14px]">🎂</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-[13px] font-bold text-slate-800 truncate leading-none mb-1.5 group-hover:text-customRed transition-colors">{m.name}</h3>
                                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate leading-none mb-1">{m.designation || 'Teammate'}</p>
                                                            {isBirthdayToday(m.dateOfBirth) && (
                                                                <div className="flex items-center gap-1 text-red-500">
                                                                    <PartyPopper size={10} />
                                                                    <span className="text-[9px] font-black uppercase tracking-tighter animate-pulse">Happy Birthday!</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
