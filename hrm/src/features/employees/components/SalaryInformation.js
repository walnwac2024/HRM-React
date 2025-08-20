// src/features/employees/components/SalaryInformation.js
import React, { useEffect, useMemo } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const CURRENCIES = ["PKR", "USD", "AED", "SAR", "GBP"];
const PAYROLL_SETUPS = ["General"];
const SALARY_TYPES = ["Monthly Salary", "Hourly Salary", "Daily Salary"];

const money = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export default function SalaryInformation({ form, set }) {
  const salary = form.salary || {};
  const put = (patch) => set("salary")({ ...salary, ...patch });

  useEffect(() => {
    if (!salary.items || !salary.items.length) {
      put({
        items: [
          { id: 1, name: "Basic Salary", pct: 60.6667, amount: 0, kind: "allowance", auto: true },
          { id: 2, name: "House Allowance", pct: 25.6667, amount: 0, kind: "allowance", auto: true },
          { id: 3, name: "Utilities", pct: 8.6667, amount: 0, kind: "allowance", auto: true },
          { id: 4, name: "EOBI", amount: -1300, kind: "deduction", auto: false },
        ],
        payrollSetup: "General",
        salaryType: "Monthly Salary",
        currency: "PKR",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const gross = Number(salary.monthlyGross) || 0;
    if (!salary.items) return;
    const next = salary.items.map((r) =>
      r.auto && r.pct ? { ...r, amount: +(gross * (r.pct / 100)).toFixed(0) } : r
    );
    put({ items: next, annualGross: gross * 12 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salary.monthlyGross]);

  const setItem = (idx, key) => (e) => {
    const value =
      e && e.target ? (e.target.type === "number" ? +e.target.value : e.target.value) : e;
    const list = [...(salary.items || [])];
    list[idx] = { ...list[idx], [key]: value };
    if (key === "pct" && list[idx].auto) {
      const gross = Number(salary.monthlyGross) || 0;
      const pct = Number(value) || 0;
      list[idx].amount = +(gross * (pct / 100)).toFixed(0);
    }
    put({ items: list });
  };

  const addRow = (kind) => {
    const list = [...(salary.items || [])];
    list.push({
      id: Date.now(),
      name: kind === "deduction" ? "New Deduction" : "New Allowance",
      amount: 0,
      kind,
      auto: false,
    });
    put({ items: list });
  };

  const removeRow = (idx) => {
    const list = (salary.items || []).filter((_, i) => i !== idx);
    put({ items: list });
  };

  const totals = useMemo(() => {
    const items = salary.items || [];
    const sum = items.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    return { monthly: sum, annual: sum * 12 };
  }, [salary.items]);

  const baseInput =
    "h-9 w-full border border-slate-300 rounded px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-customRed/40 focus:border-customRed";

  const Tab = ({ label }) => {
    const active = (salary.salaryType || "Monthly Salary") === label;
    return (
      <button
        type="button"
        onClick={() => put({ salaryType: label })}
        className={`h-8 px-3 text-[12px] rounded-t border-x border-t ${
          active
            ? "bg-white text-slate-800 border-slate-300"
            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
        }`}
      >
        {label.replace(" Salary", "")}
      </button>
    );
  };

  const Switch = ({ checked, onChange, label }) => (
    <label className="inline-flex items-center gap-2 text-[12px] text-slate-700">
      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="w-[34px] h-[18px] rounded-full bg-slate-300 peer-checked:bg-customRed transition-colors"></span>
        <span className="absolute left-[2px] top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow peer-checked:left-[18px] transition-all"></span>
      </span>
      <span>{label}</span>
    </label>
  );

  /* --- New: smooth shared input styles for the breakup rows --- */
  const inputSmooth =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-customRed/30 focus:border-customRed";
  const numSmooth = inputSmooth + " text-right";
  const btnIcon =
    "h-10 w-10 grid place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50";

  return (
    <div className="space-y-4">
      {/* Top meta row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div className="text-[11px] text-slate-500 mb-1">Payroll Setup</div>
          <select
            className={`${baseInput} pr-8`}
            value={salary.payrollSetup || "General"}
            onChange={(e) => put({ payrollSetup: e.target.value })}
          >
            {PAYROLL_SETUPS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 mb-1">Salary type</div>
          <select
            className={`${baseInput} pr-8`}
            value={salary.salaryType || "Monthly Salary"}
            onChange={(e) => put({ salaryType: e.target.value })}
          >
            {SALARY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 border-b border-slate-200 mt-1">
          <div className="flex gap-1 -mb-[1px]">
            <Tab label="Monthly Salary" />
            <Tab label="Hourly Salary" />
            <Tab label="Daily Salary" />
          </div>
        </div>
      </div>

      {/* Currency */}
      <div>
        <div className="text-[11px] text-slate-500 mb-1">Currency:</div>
        <div className="max-w-sm">
          <select
            className={`${baseInput} pr-8`}
            value={salary.currency || "PKR"}
            onChange={(e) => put({ currency: e.target.value })}
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Switches */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-1">
        <Switch
          checked={salary.overtime}
          onChange={(v) => put({ overtime: v })}
          label="Overtime rates of this employee?"
        />
        <Switch
          checked={salary.shortTime}
          onChange={(v) => put({ shortTime: v })}
          label="Short time rates of this employee?"
        />
        <Switch
          checked={salary.paymentDetails}
          onChange={(v) => put({ paymentDetails: v })}
          label="Payment Details?"
        />
      </div>

      {/* Gross inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div>
          <div className="text-[11px] text-slate-500 mb-1">Monthly Gross Salary:</div>
          <input
            type="number"
            className={baseInput}
            value={salary.monthlyGross ?? ""}
            onChange={(e) => put({ monthlyGross: e.target.value })}
            placeholder="0"
          />
        </div>
        <div>
          <div className="text-[11px] text-slate-500 mb-1">Annual Gross Salary:</div>
          <input
            className={`${baseInput} bg-slate-100`}
            value={salary.annualGross ? money(salary.annualGross) : "0"}
            readOnly
          />
        </div>
      </div>

      {/* Salary breakup (smoother + aligned) */}
      <div>
        <div className="text-[12px] font-semibold text-slate-700 bg-gray-100 border border-slate-200 rounded px-3 py-2">
          Salary Breakup (Monthly)
        </div>

        {/* Header uses the same widths as rows */}
        <div className="mt-2 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center px-3 py-2 bg-slate-50 text-[12px] text-slate-600 border-b border-slate-200">
            <div className="w-10">S#</div>
            <div className="flex-1">Salary Item</div>
            <div className="w-28 text-right pr-1">%</div>
            <div className="w-44 text-right pr-1">Amount</div>
            <div className="w-12" />
          </div>

          {(salary.items || []).map((row, idx) => (
            <div key={row.id ?? idx} className="flex items-center gap-3 px-3 py-2 border-b border-slate-100">
              <div className="w-10 text-[12px] text-slate-700">{idx + 1}</div>

              <div className="flex-1">
                <input
                  className={inputSmooth}
                  value={row.name ?? ""}
                  onChange={setItem(idx, "name")}
                />
              </div>

              <div className="w-28">
                <div className="relative">
                  <input
                    type="number"
                    placeholder=""
                    className={numSmooth + " pr-6"}
                    value={row.pct ?? ""}
                    onChange={setItem(idx, "pct")}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]">
                    %
                  </span>
                </div>
              </div>

              <div className="w-44">
                <input
                  type="number"
                  className={numSmooth}
                  value={row.amount ?? 0}
                  onChange={setItem(idx, "amount")}
                />
              </div>

              <div className="w-12 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className={btnIcon}
                  title="Remove row"
                >
                  <FaMinus />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => addRow("allowance")}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-[12px]"
          >
            <FaPlus className="text-[10px] text-customRed" /> Add Recurring Allowance?
          </button>
          <button
            type="button"
            onClick={() => addRow("deduction")}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-[12px]"
          >
            <FaPlus className="text-[10px] text-customRed" /> Add Recurring Deduction?
          </button>
        </div>
      </div>

      {/* Estimated */}
      <div className="pt-2">
        <div className="text-[11px] text-slate-600">Estimated Monthly Salary:</div>
        <div className="text-3xl font-semibold text-customRed">
          {(salary.currency || "PKR") + " " + money(totals.monthly)}
        </div>
        <div className="text-[12px] text-slate-500">
          Annual: {(salary.currency || "PKR") + " " + money(totals.annual)}
        </div>
      </div>
    </div>
  );
}
