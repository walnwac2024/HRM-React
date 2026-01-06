import React, { useState, useEffect, useRef } from 'react';
import useEmployees from '../../employees/hooks/useEmployees';

export default function EmployeeAutocomplete({ onSelect, initialValue = '' }) {
    const { list: employees, loading } = useEmployees();
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (query.length > 0 && Array.isArray(employees)) {
            const filtered = employees.filter(emp =>
                emp.employee_name.toLowerCase().includes(query.toLowerCase()) ||
                emp.employee_code.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setIsOpen(true);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query, employees]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (emp) => {
        setQuery(`${emp.employee_name} (${emp.employee_code})`);
        onSelect(emp.id);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <label className="form-label">Search Employee</label>
            <div className="relative">
                <input
                    type="text"
                    className="input pr-10"
                    placeholder="Type name or code..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 border-2 border-customRed border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((emp) => (
                        <button
                            key={emp.id}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex flex-col transition-colors border-b last:border-0"
                            onClick={() => handleSelect(emp)}
                        >
                            <span className="font-semibold text-gray-900">{emp.employee_name}</span>
                            <span className="text-xs text-gray-500">{emp.employee_code} — {emp.department}</span>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query.length > 0 && suggestions.length === 0 && !loading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
                    No employees found.
                </div>
            )}
        </div>
    );
}
