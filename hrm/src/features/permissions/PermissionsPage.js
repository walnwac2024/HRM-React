import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function PermissionsPage() {
    const [userTypes, setUserTypes] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [typePermissions, setTypePermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const [uRes, pRes] = await Promise.all([
                api.get("/permissions/user-types"),
                api.get("/permissions/all"),
            ]);
            setUserTypes(uRes.data);
            setPermissions(pRes.data);
            if (uRes.data.length > 0) {
                handleSelectType(uRes.data[0]);
            }
        } catch (err) {
            console.error("fetchInitialData error", err);
            toast.error("Failed to load permissions data");
        } finally {
            setLoading(false);
        }
    }

    async function handleSelectType(type) {
        setSelectedType(type);
        try {
            const { data } = await api.get(`/permissions/type/${type.id}`);
            setTypePermissions(data);
        } catch (err) {
            console.error("handleSelectType error", err);
            toast.error("Failed to load type permissions");
        }
    }

    function handleTogglePermission(permId) {
        setTypePermissions((prev) =>
            prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
        );
    }

    async function handleSave() {
        if (!selectedType) return;
        setSaving(true);
        try {
            await api.post(`/permissions/type/${selectedType.id}`, {
                permissionIds: typePermissions,
            });
            toast.success("Permissions updated successfully");
        } catch (err) {
            console.error("handleSave error", err);
            toast.error("Failed to update permissions");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-6">Loading permissions...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Permissions Management</h1>
                <button
                    onClick={handleSave}
                    disabled={saving || !selectedType}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-black disabled:opacity-50 transition-all font-semibold"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* User Types Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">User Types</h2>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {userTypes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleSelectType(t)}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${selectedType?.id === t.id
                                    ? "bg-customRed/5 text-customRed font-bold border-r-4 border-customRed"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {t.type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permissions Grid */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    {!selectedType ? (
                        <div className="text-center text-slate-400 py-20">Select a user type to manage permissions</div>
                    ) : (
                        <div>
                            <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-end">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{selectedType.type} Permissions</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Permission Level: <span className="font-semibold text-slate-700">{selectedType.permission_level}</span>
                                    </p>
                                </div>
                                <div className="text-xs text-slate-400">
                                    {typePermissions.length} of {permissions.length} active
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {permissions.map((p) => {
                                    const isActive = typePermissions.includes(p.id);
                                    return (
                                        <label
                                            key={p.id}
                                            className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${isActive
                                                ? "border-emerald-200 bg-emerald-50/30"
                                                : "border-slate-100 bg-white hover:border-slate-200"
                                                }`}
                                        >
                                            <div className="pt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isActive}
                                                    onChange={() => handleTogglePermission(p.id)}
                                                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <div className={`text-sm font-semibold ${isActive ? "text-emerald-800" : "text-slate-700"}`}>
                                                    {p.name || `${p.module}: ${p.action}`}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.code}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
