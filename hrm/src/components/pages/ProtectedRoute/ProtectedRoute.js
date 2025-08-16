import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import apiService from "../../../utils/apiService";

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    apiService.get("/me", { withCredentials: true })
      .then(r => setState({ loading: false, user: r.data.user }))
      .catch(() => setState({ loading: false, user: null }));
  }, []);

  if (state.loading) return <div className="p-6 text-gray-600">Loading…</div>;
  return state.user ? children : <Navigate to="/login" replace />;
}
