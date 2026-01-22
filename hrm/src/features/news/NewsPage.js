import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Calendar, User, Megaphone, RefreshCw, LogOut } from "lucide-react";
import { listNews, createNews, updateNews, deleteNews, getWhatsAppStatus, initWhatsAppSession, updateWhatsAppSettings, syncWhatsAppGroups, logoutWhatsAppSession, toggleReaction, listReactions } from "./newsService";
import { BASE_URL } from "../../utils/api";
import socket from "../../utils/socket";
import NewsModal from "./components/NewsModal";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";

export default function NewsPage() {
    const { user } = useAuth();
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [wsStatus, setWsStatus] = useState({ status: "DISCONNECTED", stage: null, qr: null, groups: [], selectedGroupId: null });
    const [statusLoading, setStatusLoading] = useState(true);
    const [polling, setPolling] = useState(false);
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const roleList = user?.roles || [];
    if (user?.role) roleList.push(user.role);
    const canPublish = roleList.some(r => ["admin", "super_admin", "hr", "developer"].includes(String(r).toLowerCase()));

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await listNews();
            setNewsList(data);
        } catch (err) {
            toast.error("Failed to load news");
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async () => {
        try {
            const data = await getWhatsAppStatus();
            setWsStatus(data);
            if (data.status === "CONNECTED") {
                setPolling(false);
            }
        } catch (err) {
            console.error("Failed to check status", err);
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let interval;
        if (canPublish) {
            checkStatus();
            interval = setInterval(checkStatus, 2000);
        }
        return () => clearInterval(interval);
    }, [canPublish]);

    // Reactions Real-time Sync via WebSockets
    useEffect(() => {
        const fetchLatestReactions = async () => {
            try {
                const reactionsMap = await listReactions();
                setNewsList(prev => prev.map(item => ({
                    ...item,
                    reactions: reactionsMap[item.id] || []
                })));
            } catch (err) {
                console.error("Failed to sync reactions", err);
            }
        };

        socket.on("news_reaction_updated", (data) => {
            console.log("Reaction update received via socket:", data);
            fetchLatestReactions();
        });

        // Initial sync
        fetchLatestReactions();

        return () => {
            socket.off("news_reaction_updated");
        };
    }, []);

    const handleSave = async (formData) => {
        try {
            if (editingItem) {
                await updateNews(editingItem.id, formData);
                toast.success("News updated");
            } else {
                await createNews(formData);
                toast.success("News published successfully!");
            }
            loadData();
        } catch (err) {
            toast.error("Failed to save news");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this news?")) return;
        try {
            await deleteNews(id);
            toast.success("News deleted");
            loadData();
        } catch (err) {
            toast.error("Failed to delete news");
        }
    };

    const handleGroupChange = async (groupId) => {
        try {
            setUpdatingSettings(true);
            await updateWhatsAppSettings(groupId);
            toast.success("WhatsApp target group updated");
            checkStatus();
        } catch (err) {
            toast.error("Failed to update group setting");
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleManualInit = async () => {
        try {
            setActionLoading(true);
            await initWhatsAppSession();
            toast.info("WhatsApp initialization started...");
            // Immediately check after triggering
            setTimeout(checkStatus, 500);
        } catch (err) {
            toast.error("Failed to start WhatsApp");
            checkStatus(); // Refresh status on error
        } finally {
            setActionLoading(false);
        }
    };

    const handleSyncGroups = async () => {
        try {
            setUpdatingSettings(true);
            await syncWhatsAppGroups();
            toast.success("Groups refreshed successfully");
            checkStatus();
        } catch (err) {
            toast.error("Failed to refresh groups");
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleLogoutWhatsApp = async () => {
        if (!window.confirm("Are you sure you want to log out of WhatsApp? This will clear the session.")) return;
        try {
            // Optimistic UI update
            setWsStatus(prev => ({ ...prev, status: "DISCONNECTED" }));
            setUpdatingSettings(true);

            await logoutWhatsAppSession(false);
            toast.success("Logout initiated...");

            // Fast poll to confirm state
            setTimeout(checkStatus, 1500);
        } catch (err) {
            toast.error("Failed to logout from WhatsApp");
            checkStatus();
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleHardResetWhatsApp = async () => {
        if (!window.confirm("CRITICAL: This will delete all local WhatsApp session files. Use this ONLY if you cannot link your device. Are you sure?")) return;
        try {
            setActionLoading(true);
            setUpdatingSettings(true);
            // Optimistic UI
            setWsStatus(prev => ({ ...prev, status: "DISCONNECTED", qr: null }));

            await logoutWhatsAppSession(true);
            toast.success("Hard reset initiated. Please wait.");

            // Fast poll to confirm state
            setTimeout(checkStatus, 2000);
        } catch (err) {
            toast.error("Failed to reset WhatsApp session");
            checkStatus();
        } finally {
            setActionLoading(false);
            setUpdatingSettings(false);
        }
    };

    const handleToggleReaction = async (newsId, emoji) => {
        try {
            // Optimistic update
            setNewsList(prev => prev.map(item => {
                if (item.id === newsId) {
                    const reactions = [...(item.reactions || [])];
                    const existingIdx = reactions.findIndex(r => r.emoji === emoji);

                    if (existingIdx !== -1) {
                        const r = reactions[existingIdx];
                        if (r.me) {
                            // Removing my reaction
                            r.count--;
                            r.me = false;
                            if (r.count <= 0) reactions.splice(existingIdx, 1);
                        } else {
                            // Adding my reaction
                            r.count++;
                            r.me = true;
                        }
                    } else {
                        // Brand new emoji
                        reactions.push({ emoji, count: 1, me: true });
                    }
                    return { ...item, reactions };
                }
                return item;
            }));

            await toggleReaction(newsId, emoji);
        } catch (err) {
            toast.error("Failed to react to news");
            loadData(); // Revert on error
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Megaphone className="text-customRed" />
                        News & Notifications
                    </h1>
                    <p className="text-gray-500 text-sm">Stay updated with the latest company announcements.</p>
                </div>

                {canPublish && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <div className={`px-4 h-11 rounded-2xl text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center gap-2 transition-all ${statusLoading ? "bg-slate-50 text-slate-400 border-slate-200" :
                            wsStatus.status === "CONNECTED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                wsStatus.status === "QR_READY" ? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse" :
                                    (wsStatus.status === "CONNECTING" || wsStatus.status === "AUTHENTICATED") ? "bg-blue-50 text-blue-600 border-blue-200 animate-pulse" :
                                        "bg-slate-50 text-slate-500 border-slate-200"
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${statusLoading ? "bg-slate-300 animate-pulse" : wsStatus.status === "CONNECTED" ? "bg-emerald-500" : wsStatus.status === "QR_READY" ? "bg-amber-500" : (wsStatus.status === "CONNECTING" || wsStatus.status === "AUTHENTICATED") ? "bg-blue-500" : "bg-slate-400"}`} />
                            <span className="truncate">WA: {statusLoading ? "SYNCING..." : (wsStatus.status === "CONNECTING" && wsStatus.stage === "LAUNCHING_BROWSER") ? "BOOTING..." : wsStatus.status}</span>
                        </div>

                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setModalOpen(true);
                            }}
                            className="btn-primary h-11 px-8 shadow-red-500/20"
                        >
                            <Plus size={18} className="mr-2" />
                            Post News
                        </button>
                    </div>
                )}
            </div>

            {(canPublish && wsStatus.status === "AUTHENTICATED") && (
                <div className="mb-8 p-6 sm:p-10 bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 flex flex-col items-center animate-in zoom-in-95 duration-500">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Authenticated!</h2>
                    <p className="text-sm text-slate-500 text-center max-w-sm font-medium">
                        QR scan was successful. Please <span className="text-blue-600 font-bold">WAIT</span> while we initialize your secure session and load your groups.
                    </p>
                </div>
            )}

            {canPublish && (wsStatus.status === "CONNECTING" || actionLoading) && (
                <div className="mb-8 p-8 bg-blue-50 bg-opacity-50 rounded-2xl border-2 border-blue-200 flex flex-col items-center justify-center animate-pulse transition-all">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <Megaphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-blue-800 mb-2 text-center">Contacting WhatsApp Service...</h2>
                    <p className="text-sm text-blue-600 text-center max-w-md font-medium">
                        The engine is warming up! This typically takes a few seconds thanks to our latest speed optimizations.
                        Please stay on this page.
                    </p>
                    {!actionLoading && (
                        <button
                            onClick={handleHardResetWhatsApp}
                            className="mt-4 text-xs text-blue-400 hover:text-red-500 underline transition-colors"
                        >
                            Stuck? Force Reset Session
                        </button>
                    )}
                </div>
            )}

            {canPublish && wsStatus.status === "QR_READY" && wsStatus.qr && (
                <div className="mb-8 p-5 sm:p-8 bg-white rounded-2xl sm:rounded-[32px] border-2 border-dashed border-yellow-200 shadow-xl shadow-yellow-500/5 flex flex-col items-center animate-in zoom-in-95 duration-500">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-black text-slate-800 mb-1">Link WhatsApp Account</h2>
                        <p className="text-[13px] text-slate-500 max-w-sm">
                            Scan this QR code with your phone's WhatsApp <span className="text-customRed font-bold">(Linked Devices)</span> to enable automated messaging.
                        </p>
                    </div>

                    <div className="p-6 bg-white rounded-[24px] shadow-2xl border-4 border-slate-50 relative group">
                        <QRCode value={wsStatus.qr} size={220} />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[20px] pointer-events-none" />
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-yellow-100 animate-pulse">
                            Waiting for Scan...
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">QR expires in 60 seconds. Refresh if it stops working.</p>

                        <div className="mt-4 pt-4 border-t border-slate-100 w-full flex flex-col items-center">
                            <button
                                onClick={handleHardResetWhatsApp}
                                className="text-[11px] font-bold text-slate-400 hover:text-customRed transition-colors flex items-center gap-1.5"
                            >
                                <RefreshCw size={12} />
                                Device could not be linked? Reset Service
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {canPublish && wsStatus.status === "CONNECTED" && (
                <div className="mb-8 p-5 sm:p-6 bg-white rounded-2xl sm:rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                            <div className="relative">
                                <Megaphone size={24} />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="text-lg font-black text-slate-900 leading-tight">WhatsApp Connected</h2>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-md">Live</span>
                            </div>
                            <p className="text-[13px] text-slate-500 truncate">Select a target group for your announcements</p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-3">
                        <div className="relative w-full md:w-64">
                            <select
                                value={wsStatus.selectedGroupId || ""}
                                onChange={(e) => handleGroupChange(e.target.value)}
                                disabled={updatingSettings}
                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl px-4 pr-10 text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-customRed/10 focus:border-customRed focus:bg-white outline-none appearance-none transition-all disabled:opacity-50 shadow-sm"
                            >
                                <option value="">Select Target Group</option>
                                {wsStatus.groups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={updatingSettings}
                                onClick={handleSyncGroups}
                                className="h-11 w-11 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-customRed hover:border-customRed/30 hover:bg-red-50/30 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                title="Refresh Groups"
                            >
                                <RefreshCw size={18} className={updatingSettings ? "animate-spin" : ""} />
                            </button>

                            <button
                                disabled={updatingSettings}
                                onClick={handleLogoutWhatsApp}
                                className="h-11 w-11 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                title="Logout Session"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>

                        {updatingSettings && (
                            <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
                                <div className="w-3 h-3 border-2 border-customRed border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Syncing Groups...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {canPublish && (statusLoading || wsStatus.status === "DISCONNECTED") && (
                <div className="mb-8 p-5 bg-slate-50/50 rounded-[24px] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm ${statusLoading ? "animate-pulse" : ""}`}>
                            {statusLoading ? (
                                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                            ) : (
                                <Megaphone size={20} />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`w-2 h-2 rounded-full ${statusLoading ? "bg-blue-400 animate-pulse" : "bg-slate-300"}`} />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                    {statusLoading ? "Syncing Service..." : "WhatsApp Offline"}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                                {statusLoading ? "Please wait while we check connection status" : "Ready to connect for automated announcements"}
                            </p>
                        </div>
                    </div>
                    {!statusLoading && (
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                            <button
                                onClick={handleHardResetWhatsApp}
                                className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-[0.1em] transition-colors"
                            >
                                Reset Files
                            </button>
                            <button
                                onClick={handleManualInit}
                                className="btn-primary h-11 px-8 shadow-red-500/10"
                            >
                                Connect Now
                            </button>
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-customRed border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading announcements...</p>
                </div>
            ) : newsList.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                    <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No news found.</p>
                    <p className="text-gray-400 text-sm">Check back later for updates.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {newsList.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-customRed transition-colors mb-2">
                                            {item.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-gray-500 uppercase tracking-widest font-semibold">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(item.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <User size={14} className="text-gray-400" />
                                                {item.author_name}
                                            </span>
                                            {!item.is_published && (
                                                <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                    Draft
                                                </span>
                                            )}
                                            {item.post_type === 'image' && (
                                                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                                                    Image Post
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {canPublish && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setModalOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {item.image_url && (
                                    <div className="mb-4">
                                        <img
                                            src={`${BASE_URL}${item.image_url}`}
                                            alt={item.title}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">
                                    {item.content}
                                </div>

                                {/* Reaction Bar */}
                                <div className="pt-4 border-t border-slate-50 flex flex-wrap items-center gap-2">
                                    {['❤️', '👍', '😂', '🎉', '😮'].map(emoji => {
                                        const reaction = (item.reactions || []).find(r => r.emoji === emoji);
                                        const hasReacted = reaction?.me;
                                        const count = reaction?.count || 0;

                                        return (
                                            <button
                                                key={emoji}
                                                onClick={() => handleToggleReaction(item.id, emoji)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300
                                                    ${hasReacted
                                                        ? 'bg-customRed/10 text-customRed border-customRed/20 shadow-sm'
                                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border-transparent'} border`}
                                            >
                                                <span className={`${hasReacted ? 'scale-110' : 'grayscale group-hover:grayscale-0'} transition-all`}>{emoji}</span>
                                                {count > 0 && <span>{count}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
            />
        </div>
    );
}
