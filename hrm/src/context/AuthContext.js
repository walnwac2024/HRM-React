// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/apiService"; // baseURL=http://localhost:5000/api/v1, withCredentials=true

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null });
  console.log("the user at context:",state)
  // Initial load: fetch current session user
  useEffect(() => {
    let mounted = true;
    api
      .get("/me")
      .then(res => mounted && setState({ loading: false, user: res.data.user }))
      .catch(() => mounted && setState({ loading: false, user: null }));
    return () => { mounted = false; };
  }, []);

  // Immediately set user in context (use this right after successful /login)
 // src/context/AuthContext.jsx (only changed lines)
const setUser = (value) => {
  // allow setUser({ user: {...} }) or setUser({...})
  const user = value && value.user ? value.user : value;
  setState({ loading: false, user });
};


  // Re-fetch user from server (useful after login/logout if needed)
  const refresh = async () => {
    const { data } = await api.get("/me");
    setState(s => ({ ...s, user: data.user }));
    return data.user;
  };

  // Optional helpers if you want context to own auth calls:
  const login = async (email, password, remember) => {
    const { data } = await api.post("/login", { email, password, remember });
    setUser(data.user); // instant UI update
    return data.user;
  };

  const logout = async () => {
    await api.post("/logout");
    setUser(null);
  };

  const value = {
    user: state.user,                 // { id, email, role } | null
    loading: state.loading,
    isAuthenticated: !!state.user,
    // helpers
    setUser,                          // use after /login if you call API outside the context
    refresh,
    login,                            // optional: call directly from components
    logout,                           // optional
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
