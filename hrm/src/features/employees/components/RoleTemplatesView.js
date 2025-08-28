// src/features/employees/components/RoleTemplatesView.js
import React, { useState } from "react";
import RoleTemplateModal from "./RoleTemplateModal";

const DEFAULT_TEMPLATES = [
  { id: "sysadmin", label: "System Administrator (Full Access)" },
  { id: "hr-standard", label: "HR Standard" },
  { id: "manager", label: "Manager (Limited)" },
];

export default function RoleTemplatesView() {
  const [items, setItems] = useState(DEFAULT_TEMPLATES);
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);

  const addTemplate = (name) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setItems((prev) => [...prev, { id, label: name }]);
    setSelected(id);
  };

  return (
    <section className="max-w-[980px]">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* title bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-semibold">Role Templates</h2>
        </div>

        {/* content */}
        <div className="p-4">
          {/* One row: Label | Select | Button; stacks nicely on small screens */}
          <div className="grid gap-3 md:grid-cols-[160px_minmax(260px,_1fr)_auto] items-center">
            <label className="text-sm text-slate-600">Roles Template</label>

            <select
              className="h-9 w-full max-w-[560px] rounded border border-slate-300 px-3
                         focus:ring-2 focus:ring-customRed focus:border-customRed"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Select One</option>
              {items.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-9 px-4 rounded bg-customRed text-white
                         hover:bg-customRed/90 active:bg-customRed/95
                         focus:outline-none focus:ring-2 focus:ring-customRed"
            >
              Create New Template
            </button>
          </div>
        </div>
      </div>

      {/* modal */}
      <RoleTemplateModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={(name) => {
          addTemplate(name);
          setOpen(false);
        }}
      />
    </section>
  );
}
