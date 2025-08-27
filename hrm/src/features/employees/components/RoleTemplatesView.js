// src/features/employees/components/RoleTemplatesView.js
import React from "react";

export default function RoleTemplatesView() {
  return (
    <div className="pt-6 pr-6 pb-6 w-full">
      <div className="bg-white rounded-lg overflow-hidden shadow border border-slate-200">
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Role Templates</h2>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Template</label>
            <select className="w-full h-9 rounded border border-slate-300 focus:border-customRed focus:ring-customRed">
              <option>Select One</option>
              <option>Standard HR</option>
              <option>Store Manager</option>
              <option>Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Employee</label>
            <select className="w-full h-9 rounded border border-slate-300 focus:border-customRed focus:ring-customRed">
              <option>Select One</option>
              <option>Abdul Mateen</option>
              <option>Sumitha Thomas</option>
              <option>John Doe</option>
            </select>
          </div>

          <div className="md:col-span-2">
           <button
            type="button"
            className="h-9 px-4 rounded bg-customRed text-white transition-colors duration-200
                        hover:bg-customRed/90 active:bg-customRed/95 focus:outline-none focus:ring-2 focus:ring-customRed/50"
            onClick={() => alert("Apply Template (demo)")}
            >
            Apply Template
            </button>


          </div>
        </div>
      </div>
    </div>
  );
}
