import React from "react";

/**
 * SharedSidebar component to ensure consistency across modules.
 * @param {Array} items - Array of { id, label, icon, status, isAdmin, subItems }
 * @param {string} activeKey - Current active key
 * @param {string} title - Heading title for the sidebar
 * @param {function} onNavigate - navigation handler
 * @param {boolean} isAdminUser - flag to show admin-only items
 */
export default function SharedSidebar({
    items = [],
    activeKey = "",
    title = "MENU",
    onNavigate,
    isAdminUser = false,
    userPermissions = [],
}) {
    const badgeSuffix = (
        <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-50 text-[9px] text-amber-600 font-bold uppercase border border-amber-200 shrink-0">
            Working
        </span>
    );

    const filteredItems = items.filter((it) => {
        // 1. If item has a specific permission code, check it
        if (it.permission) {
            return userPermissions.includes(it.permission);
        }
        // 2. Fallback to isAdmin check for backward compatibility
        if (it.isAdmin) {
            return isAdminUser;
        }
        // 3. Public item
        return true;
    });

    return (
        <aside className="sidebar">
            <div className="sidebar-card">
                <div className="sidebar-heading">{title}</div>
                <nav className="sidebar-list">
                    {filteredItems.map((item) => {
                        const isActive = activeKey === item.id || (item.subItems && activeKey.startsWith(item.id));
                        const isWorking = item.status === "working";
                        const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;

                        return (
                            <div key={item.id}>
                                <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => !isWorking && onNavigate?.(item.id)}
                                    className={`sidebar-item ${isActive ? "sidebar-active" : ""} ${isWorking ? "opacity-60 cursor-not-allowed text-slate-400" : ""
                                        }`}
                                >
                                    {isActive && <span className="sidebar-strip" />}

                                    {item.icon && (
                                        <span className="shrink-0">
                                            {React.cloneElement(item.icon, {
                                                className: `sidebar-icon ${isActive ? "text-customRed" : isWorking ? "text-slate-300" : "text-slate-400"}`,
                                            })}
                                        </span>
                                    )}

                                    <span className="truncate flex-1">{item.label}</span>
                                    {isWorking && badgeSuffix}
                                </button>

                                {hasSubItems && isActive && (
                                    <div className="sidebar-submenu">
                                        {item.subItems.map((sub) => {
                                            const isSubActive = activeKey === sub.id;
                                            return (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => onNavigate?.(sub.id)}
                                                    className={`sidebar-subitem ${isSubActive ? "sidebar-subitem-active" : ""}`}
                                                >
                                                    {sub.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
