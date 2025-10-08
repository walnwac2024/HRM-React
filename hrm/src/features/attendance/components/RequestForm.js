import React from 'react';

export default function RequestForm() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <input className="input" placeholder="Employee Code" />
      <input className="input" placeholder="Employee Name" />
      <input className="input" type="date" placeholder="Attendance Date" />
      <select className="select">
        {['In/Out Adjust', 'Missed Punch', 'Work From Home', 'Other'].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
      <input className="input" placeholder="Reason" />
      <input className="input" type="file" />
      <textarea className="textarea md:col-span-2" rows={4} placeholder="Notes (optional)" />
    </div>
  );
}
