// src/features/employees/components/Sidebar.jsx
import React from 'react';

/* Inline SVG icons (same approach as Attendance) */
const icons = {
  'employee-list': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.6" d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  ),
  'employee-profile': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="1.6" />
      <circle cx="12" cy="9" r="3" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M7 18c1.5-2 3.5-3 5-3s3.5 1 5 3" />
    </svg>
  ),
  'employee-transfer': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.6" d="M7 7h10m0 0-3-3m3 3-3 3" />
      <path strokeWidth="1.6" d="M17 17H7m0 0 3 3m-3-3 3-3" />
    </svg>
  ),
  'employee-role': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.6" d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" />
      <path strokeWidth="1.6" d="M9.5 12.5l1.8 1.8 3.2-3.6" />
    </svg>
  ),
  'employee-info': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  'employee-approvals': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="4" width="14" height="16" rx="2" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M9 12l2 2 5-5" />
    </svg>
  ),
  'employee-settings': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="3" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.4 2.42-.09-.02a1.65 1.65 0 0 0-1.54.45l-.06.06-2.42-1.4-.02-.09a1.65 1.65 0 0 0-1.82-.33h-.12a1.65 1.65 0 0 0-1.82.33l-.02.09-2.42 1.4-.06-.06a1.65 1.65 0 0 0-1.54-.45l-.09.02L4.2 16.9l.06-.06A1.65 1.65 0 0 0 4.6 15v-.12a1.65 1.65 0 0 0-.33-1.82l-.06-.06L5.6 9.58l.09.02c.55.14 1.13 0 1.54-.45l.06-.06 2.42 1.4.02.09c.14.55.54.99 1.09 1.13h.12c.55-.14.95-.58 1.09-1.13l.02-.09 2.42-1.4.06.06c.41.45.99.59 1.54.45l.09-.02 1.39 2.42-.06.06c-.26.51-.26 1.11 0 1.62V15z" />
    </svg>
  ),
};

export default function Sidebar({ items, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-card">
        {/* Title EXACTLY like Attendance */}
        <div className="sidebar-heading">ATTENDANCE</div>

        <div className="sidebar-list">
          {items.map((it) => {
            const active = !!it.active;
            return (
              <button
                key={it.id}
                onClick={() => onNavigate(it.id)}
                className={`sidebar-item ${active ? 'sidebar-active' : ''}`}
              >
                {/* Left pink strip when active */}
                {active && <span className="sidebar-strip" />}

                {/* Icon (muted by default, brand on active) */}
                <span className="shrink-0">
                  {React.cloneElement(icons[it.id] || icons['employee-list'], {
                    className: `sidebar-icon ${active ? 'text-customRed' : 'text-gray-400'}`
                  })}
                </span>

                {/* Label */}
                <span className="truncate">{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
