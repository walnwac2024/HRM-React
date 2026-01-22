import React from "react";
import { AlertTriangle, RefreshCw, Clock } from "lucide-react";

export default function TimeSyncModal({ show, drift, onClose }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scale-up border border-slate-100">
                <div className="relative p-6 sm:p-8 text-center">
                    {/* Decorative Background Icon */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-50 rounded-full flex items-center justify-center opacity-50 blur-2xl"></div>

                    <div className="relative">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-customRed shadow-inner">
                            <Clock className="w-10 h-10 animate-pulse" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-2">Time Out of Sync</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Your device clock is off by approximately <span className="font-bold text-customRed">{drift} minutes</span>.
                            Attendance marking is restricted to ensure accurate records.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 mb-8">
                            <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                <AlertTriangle size={14} className="text-amber-500" />
                                How to fix this:
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm text-slate-700">
                                    <span className="flex-shrink-0 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">1</span>
                                    Go to your device <b>Settings</b>
                                </li>
                                <li className="flex gap-3 text-sm text-slate-700">
                                    <span className="flex-shrink-0 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">2</span>
                                    Search for <b>Date & Time</b>
                                </li>
                                <li className="flex gap-3 text-sm text-slate-700">
                                    <span className="flex-shrink-0 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">3</span>
                                    Enable <b>"Set time automatically"</b>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-sm font-bold shadow-xl shadow-customRed/20 group"
                            >
                                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                I've fixed it, Refresh Page
                            </button>
                            <button
                                onClick={onClose}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-2"
                            >
                                Remind me later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
