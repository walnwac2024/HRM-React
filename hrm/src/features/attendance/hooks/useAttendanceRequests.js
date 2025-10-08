// attendance/hooks/useAttendanceRequests.js
import { useEffect, useState, useCallback } from 'react';
import { fetchAttendanceRequests } from '../services/attendanceService';

export default function useAttendanceRequests(initial = {}) {
  const [filters, setFilters] = useState(initial);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const applyFilters = useCallback(async (next) => {
    setLoading(true);
    const data = await fetchAttendanceRequests(next);
    setRows(data);
    setFilters(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    applyFilters(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { rows, loading, filters, setFilters, applyFilters };
}
