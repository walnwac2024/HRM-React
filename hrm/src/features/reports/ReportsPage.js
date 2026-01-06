import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import ReportsSidebar from './components/ReportsSidebar';
import MonthlyReport from '../attendance/components/MonthlyReport';
import { REPORTS_NAV } from './constants';

export default function ReportsPage() {
    const { user } = useAuth();

    const safeNav = useMemo(() => {
        const base = Array.isArray(REPORTS_NAV) ? REPORTS_NAV : [];
        const features = user?.features || [];

        return base.filter(item => {
            if (item.id === 'attendance-report') return features.includes('attendance_report');
            return true;
        });
    }, [user]);

    const [nav, setNav] = useState(safeNav);
    const activeId = nav.find(n => n.active)?.id || (nav[0]?.id || '');

    const handleNavigate = (id) => {
        setNav(prev => prev.map(n => ({ ...n, active: n.id === id })));
    };

    if (nav.length === 0) {
        return (
            <div className="p-6 text-slate-500 italic">
                You do not have permission to view any reports.
            </div>
        );
    }

    return (
        <main className="page grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
            <ReportsSidebar items={nav} onNavigate={handleNavigate} />

            <section className="flex-1 min-w-0">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Reports Center</h2>
                            <p className="text-sm text-gray-500 mt-1">Select and view comprehensive organizational reports.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1">
                        {activeId === 'attendance-report' && <MonthlyReport />}
                    </div>
                </div>
            </section>
        </main>
    );
}
