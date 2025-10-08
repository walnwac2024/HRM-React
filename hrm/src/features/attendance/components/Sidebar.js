// src/features/attendance/components/Sidebar.jsx
import React from 'react';

/* Tiny inline icons to avoid extra deps */
const icons = {
  'attendance-request': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.6" d="M14 3h7v7" />
      <path strokeWidth="1.6" d="M10 14L21 3" />
      <rect strokeWidth="1.6" x="3" y="5" width="11" height="14" rx="2" />
    </svg>
  ),
  'exemption-request': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M12 7v6m0 4h.01" />
    </svg>
  ),
  worksheet: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M8 7h8M8 11h8M8 15h8" />
    </svg>
  ),
  'remote-work': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="5" width="18" height="12" rx="2" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M8 19h8" />
    </svg>
  ),
  'shift-request': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.6" d="M3 12a9 9 0 1 0 3-6.708" />
      <path strokeWidth="1.6" d="M3 4v5h5" />
    </svg>
  ),
  'amend-attendance': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.6" d="M4 20h4l10-10a2.5 2.5 0 1 0-3.5-3.5L4.5 16.5 4 20z" />
    </svg>
  ),
  'amend-employee-shift': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="8" cy="8" r="3" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="3" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M14 6l4-2m-8 12l-4 2" />
    </svg>
  ),
  'attendance-approval': (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="4" width="14" height="16" rx="2" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M9 12l2 2 5-5" />
    </svg>
  ),
  schedule: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.6" />
      <path strokeWidth="1.6" d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ),
  'attendance-settings': (
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
        {/* Title matches Employee style */}
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
                {/* left red strip when active */}
                {active && <span className="sidebar-strip" />}
                {/* icon */}
                <span className="shrink-0">
                  {React.cloneElement(icons[it.id] || icons.worksheet, {
                    className: `sidebar-icon ${active ? 'text-customRed' : 'text-gray-400'}`
                  })}
                </span>
                {/* label */}
                <span className="truncate">{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
