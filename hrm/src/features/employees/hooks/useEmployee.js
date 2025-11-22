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

        const { data } = await api.get(`/employees/${id}`);
        if (!cancelled) setEmployee(data);
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
