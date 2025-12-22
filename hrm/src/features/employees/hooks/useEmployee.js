import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function useEmployee(id) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [{ data: emp }, { data: docs }] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get(`/employees/${id}/documents`),
        ]);

        if (cancelled) return;

        setEmployee({
          ...emp,
          documents: Array.isArray(docs) ? docs : [],
        });
      } catch (err) {
        console.error("Failed to load employee", err);
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load employee"
          );
          setEmployee(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { employee, loading, error };
}
