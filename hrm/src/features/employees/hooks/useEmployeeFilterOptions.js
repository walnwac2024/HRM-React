import { useEffect, useState } from "react";
import api from "../../../utils/api";

const empty = {
  stations: [],
  departments: [],
  groups: [],
  designations: [],
  statuses: [],
  roleTemplates: [],
};

export default function useEmployeeFilterOptions() {
  const [options, setOptions] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          stationsRes,
          departmentsRes,
          groupsRes,
          designationsRes,
          statusesRes,
          roleTemplatesRes,
        ] = await Promise.all([
          api.get("/employees/lookups/stations"),
          api.get("/employees/lookups/departments"),
          api.get("/employees/lookups/groups"),
          api.get("/employees/lookups/designations"),
          api.get("/employees/lookups/statuses"),
          api.get("/employees/lookups/role-templates"),
        ]);

        if (cancelled) return;

        setOptions({
          stations: stationsRes.data || [],
          departments: departmentsRes.data || [],
          groups: groupsRes.data || [],
          designations: designationsRes.data || [],
          statuses: statusesRes.data || [],
          roleTemplates: roleTemplatesRes.data || [],
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load employee filter options", err);
          setError("Failed to load employee filter options");
          setOptions(empty);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading, error };
}
