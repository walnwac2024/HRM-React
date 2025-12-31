import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Calendar, User, Megaphone, RefreshCw } from "lucide-react";
import { listNews, createNews, updateNews, deleteNews, getWhatsAppStatus, initWhatsAppSession, updateWhatsAppSettings, syncWhatsAppGroups } from "./newsService";
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
    const [wsStatus, setWsStatus] = useState({ status: "DISCONNECTED", qr: null, groups: [], selectedGroupId: null });
    const [polling, setPolling] = useState(false);
    const [updatingSettings, setUpdatingSettings] = useState(false);

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
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let interval;
        if (canPublish) {
            checkStatus();
            interval = setInterval(checkStatus, 5000);
        }
        return () => clearInterval(interval);
    }, [canPublish]);

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
            await initWhatsAppSession();
            toast.info("WhatsApp initialization started...");
            checkStatus();
        } catch (err) {
            toast.error("Failed to start WhatsApp");
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

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Megaphone className="text-customRed" />
                        News & Notifications
                    </h1>
                    <p className="text-gray-500 text-sm">Stay updated with the latest company announcements.</p>
                </div>

                {canPublish && (
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-2 ${wsStatus.status === "CONNECTED" ? "bg-green-50 text-green-600 border-green-200" :
                            wsStatus.status === "QR_READY" ? "bg-yellow-50 text-yellow-600 border-yellow-200 animate-pulse" :
                                "bg-gray-50 text-gray-500 border-gray-200"
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${wsStatus.status === "CONNECTED" ? "bg-green-500" : wsStatus.status === "QR_READY" ? "bg-yellow-500" : "bg-gray-400"}`} />
                            WhatsApp: {wsStatus.status}
                        </div>

                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-customRed text-white font-bold rounded-lg shadow-lg hover:shadow-red-200 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            Post News
                        </button>
                    </div>
                )}
            </div>

            {canPublish && wsStatus.status === "QR_READY" && wsStatus.qr && (
                <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-dashed border-yellow-400 flex flex-col items-center animate-in slide-in-from-top duration-500">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Link WhatsApp Account</h2>
                    <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                        Scan this QR code with your phone's WhatsApp (Linked Devices) to enable automated messaging to your group.
                    </p>
                    <div className="p-4 bg-white rounded-xl shadow-inner border">
                        <QRCode value={wsStatus.qr} size={200} />
                    </div>
                    <p className="mt-4 text-xs text-yellow-600 font-medium text-center">
                        Auto-refreshing status... <br />
                        <span className="text-[10px] text-gray-400">If the code segment expires, refresh the page.</span>
                    </p>
                </div>
            )}

            {canPublish && wsStatus.status === "CONNECTED" && (
                <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-green-100 flex flex-col sm:flex-row items-center gap-6 animate-in slide-in-from-top duration-500">
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            WhatsApp Connected
                        </h2>
                        <p className="text-sm text-gray-500">Select the group where announcements will be sent.</p>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative group/select">
                            <select
                                value={wsStatus.selectedGroupId || ""}
                                onChange={(e) => handleGroupChange(e.target.value)}
                                disabled={updatingSettings}
                                className="w-full sm:w-64 px-4 py-2 pr-10 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-customRed focus:border-customRed outline-none disabled:opacity-50 transition-all font-medium appearance-none"
                            >
                                <option value="">-- Select Target Group --</option>
                                {wsStatus.groups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <Plus size={14} className="rotate-45" />
                            </div>
                        </div>

                        <button
                            disabled={updatingSettings}
                            onClick={handleSyncGroups}
                            className="p-2 text-customRed hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-30"
                            title="Refresh Groups"
                        >
                            <RefreshCw size={18} className={updatingSettings ? "animate-spin" : ""} />
                        </button>

                        {updatingSettings && (
                            <div className="w-5 h-5 border-2 border-customRed border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>
                </div>
            )}

            {canPublish && wsStatus.status === "DISCONNECTED" && (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-sm text-gray-600 font-medium">WhatsApp Offline</span>
                    </div>
                    <button
                        onClick={handleManualInit}
                        className="text-xs font-bold text-customRed hover:underline uppercase tracking-wider"
                    >
                        Try to Reconnect
                    </button>
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
                                            src={`http://localhost:5000${item.image_url}`}
                                            alt={item.title}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {item.content}
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
