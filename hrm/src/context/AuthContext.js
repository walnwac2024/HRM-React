// // src/context/AuthContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../utils/apiService"; // baseURL=http://localhost:5000/api/v1, withCredentials=true

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [state, setState] = useState({ loading: true, user: null });


//   useEffect(() => {
//     let mounted = true;
//     api
//       .get("/me")
//       .then(res => mounted && setState({ loading: false, user: res.data.user }))
//       .catch(() => mounted && setState({ loading: false, user: null }));
//     return () => { mounted = false; };
//   }, []);

//   // Immediately set user in context (use this right after successful /login)
//  // src/context/AuthContext.jsx (only changed lines)
// const setUser = (value) => {
//   // allow setUser({ user: {...} }) or setUser({...})
//   const user = value && value.user ? value.user : value;
//   setState({ loading: false, user });
// };


//   // Re-fetch user from server (useful after login/logout if needed)
//   const refresh = async () => {
//     const { data } = await api.get("/me");
//     setState(s => ({ ...s, user: data.user }));
//     return data.user;
//   };

//   // Optional helpers if you want context to own auth calls:
//   const login = async (email, password, remember) => {
//     const { data } = await api.post("/login", { email, password, remember });

//     setUser(data.user); // instant UI update
//     return data.user;
//   };

//   const logout = async () => {
//     await api.post("/logout");
//     setUser(null);
//   };

//   const value = {
//     user: state.user,                 // { id, email, role } | null
//     loading: state.loading,
//     isAuthenticated: !!state.user,
//     // helpers
//     setUser,                          // use after /login if you call API outside the context
//     refresh,
//     login,                            // optional: call directly from components
//     logout,                           // optional
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }


// // src/context/AuthContext.jsx
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import api, { initCsrf } from "../utils/api"; // if you use apiService.js, change this import accordingly

// const AuthContext = createContext(null);

// // --- Inactivity config (tweak if you like) ---
// const IDLE_LIMIT_MS = 15 * 60 * 1000; // auto-logout after 15 minutes of no activity
// const WARNING_MS = 60 * 1000;         // show warning 1 minute before logout

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null); // { id, name, email, role, features, flags }
//   const [tabs, setTabs] = useState([]);   // [{ key, label }]
//   const [loading, setLoading] = useState(true);

//   // idle tracking state/refs
//   const [showIdleWarning, setShowIdleWarning] = useState(false);
//   const idleTimerRef = useRef(null);
//   const warnTimerRef = useRef(null);
//   const bcRef = useRef(null); // BroadcastChannel

//   // ---------- bootstrap current session ----------
//   const loadSession = async () => {
//     try {
//       await initCsrf();
//       const meRes = await api.get("/me"); // { user: {...} } or { user: null }
//       const meUser = meRes.data?.user || null;
//       setUser(meUser);

//       if (meUser) {
//         const menuRes = await api.get("/me/menu"); // { role, tabs: [...] }
//         setTabs(menuRes.data?.tabs || []);
//       } else {
//         setTabs([]);
//       }
//     } catch {
//       setUser(null);
//       setTabs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSession();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- auth helpers ----------
//   const login = async (email, password, remember) => {
//     await initCsrf();
//     const { data } = await api.post("/login", { email, password, remember });
//     const loggedInUser = data?.user || null;
//     setUser(loggedInUser);

//     if (loggedInUser) {
//       const menuRes = await api.get("/me/menu");
//       setTabs(menuRes.data?.tabs || []);
//       startIdleWatch(); // begin inactivity tracking after login
//     } else {
//       stopIdleWatch();
//       setTabs([]);
//     }
//     return loggedInUser;
//   };

//   const logout = async () => {
//     try {
//       await initCsrf();
//       await api.post("/logout");
//     } catch {
//       // even if /logout fails, clear client state
//     }
//     stopIdleWatch();
//     setUser(null);
//     setTabs([]);

//     // tell other tabs to logout
//     localStorage.setItem("idle:forceLogout", String(Date.now()));
//     try {
//       bcRef.current?.postMessage({ type: "forceLogout" });
//     } catch {}
//   };

//   const refresh = async () => {
//     const meRes = await api.get("/me");
//     const meUser = meRes.data?.user || null;
//     setUser(meUser);
//     if (meUser) {
//       const menuRes = await api.get("/me/menu");
//       setTabs(menuRes.data?.tabs || []);
//     } else {
//       setTabs([]);
//     }
//     return meUser;
//   };

//   // allow setUser to accept either {user: {...}} or {...}
//   const setUserFlexible = (value) => {
//     const u = value && value.user ? value.user : value;
//     setUser(u);
//   };

//   // ---------- inactivity handling ----------
//   const resetIdleTimers = () => {
//     // broadcast activity to other tabs
//     localStorage.setItem("idle:lastActivity", String(Date.now()));
//     try {
//       bcRef.current?.postMessage({ type: "activity", ts: Date.now() });
//     } catch {}

//     clearTimeout(idleTimerRef.current);
//     clearTimeout(warnTimerRef.current);
//     setShowIdleWarning(false);

//     // schedule warning
//     warnTimerRef.current = setTimeout(() => {
//       setShowIdleWarning(true);
//     }, Math.max(0, IDLE_LIMIT_MS - WARNING_MS));

//     // schedule auto-logout
//     idleTimerRef.current = setTimeout(() => {
//       logout();
//     }, IDLE_LIMIT_MS);
//   };

//   const onUserActivity = () => {
//     if (!user) return;
//     resetIdleTimers();
//   };

//   const addActivityListeners = () => {
//     const events = [
//       "mousemove",
//       "mousedown",
//       "keydown",
//       "scroll",
//       "touchstart",
//       "visibilitychange",
//       "click",
//     ];
//     events.forEach((ev) =>
//       window.addEventListener(ev, onUserActivity, { passive: true })
//     );
//   };

//   const removeActivityListeners = () => {
//     const events = [
//       "mousemove",
//       "mousedown",
//       "keydown",
//       "scroll",
//       "touchstart",
//       "visibilitychange",
//       "click",
//     ];
//     events.forEach((ev) => window.removeEventListener(ev, onUserActivity));
//   };

//   const startIdleWatch = () => {
//     if (!user) return;
//     addActivityListeners();
//     resetIdleTimers();

//     // cross-tab sync: BroadcastChannel (best) + storage fallback
//     try {
//       bcRef.current = new BroadcastChannel("idle-channel");
//       bcRef.current.onmessage = (e) => {
//         if (e?.data?.type === "activity") resetIdleTimers();
//         if (e?.data?.type === "forceLogout") logout();
//       };
//     } catch {
//       // older browsers without BroadcastChannel
//     }

//     const onStorage = (e) => {
//       if (e.key === "idle:lastActivity") resetIdleTimers();
//       if (e.key === "idle:forceLogout") logout();
//     };
//     window.addEventListener("storage", onStorage);

//     startIdleWatch._cleanup = () =>
//       window.removeEventListener("storage", onStorage);
//   };

//   const stopIdleWatch = () => {
//     clearTimeout(idleTimerRef.current);
//     clearTimeout(warnTimerRef.current);
//     removeActivityListeners();
//     setShowIdleWarning(false);

//     try {
//       bcRef.current?.close();
//     } catch {}
//     bcRef.current = null;

//     startIdleWatch._cleanup?.();
//   };

//   // start/stop watchers when auth state changes
//   useEffect(() => {
//     if (user) startIdleWatch();
//     else stopIdleWatch();
//     return () => stopIdleWatch();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   const value = useMemo(
//     () => ({
//       user,
//       tabs,
//       loading,
//       isAuthenticated: !!user,
//       // actions
//       login,
//       logout,
//       refresh,
//       setUser: setUserFlexible,

//       // idle modal controls for consumers (optional)
//       showIdleWarning,
//       staySignedIn: resetIdleTimers,
//     }),
//     [user, tabs, loading, showIdleWarning]
//   );

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//       {showIdleWarning && (
//         <IdleWarningModal onStay={resetIdleTimers} onLogout={logout} />
//       )}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

// // Simple inline modal. Style as needed or move to its own file.
// function IdleWarningModal({ onStay, onLogout }) {
//   return (
//     <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
//       <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
//         <h3 className="text-lg font-semibold mb-2">You’ve been inactive</h3>
//         <p className="text-sm text-gray-600 mb-4">
//           You’ll be signed out for security in about a minute. Stay signed in?
//         </p>
//         <div className="flex gap-2 justify-end">
//           <button onClick={onLogout} className="px-3 py-2 rounded-md border">
//             Sign out now
//           </button>
//           <button
//             onClick={onStay}
//             className="px-3 py-2 rounded-md bg-red-600 text-white"
//           >
//             Stay signed in
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api, { initCsrf } from "../utils/api";

const AuthContext = createContext(null);

// --- Inactivity config ---
const IDLE_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_MS = 60 * 1000;         // 1 minute warning

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, name, email, role, roles, features, flags }
  const [tabs, setTabs] = useState([]);     // [{ key, label }]
  const [loading, setLoading] = useState(true);

  // idle tracking state/refs
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const idleTimerRef = useRef(null);
  const warnTimerRef = useRef(null);
  const bcRef = useRef(null); // BroadcastChannel

  // ---------- bootstrap current session ----------
  const loadSession = async () => {
    try {
      await initCsrf();
      // NEW: use /auth/me instead of /me
      const meRes = await api.get("/auth/me"); // { user: {...} } or { user: null }
      const meUser = meRes.data?.user || null;
      setUser(meUser);

      if (meUser) {
        const menuRes = await api.get("/me/menu"); // { role, tabs: [...] }
        setTabs(menuRes.data?.tabs || []);
      } else {
        setTabs([]);
      }
    } catch (e) {
      console.error("loadSession error", e);
      setUser(null);
      setTabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- auth helpers ----------
  const login = async (email, password, remember) => {
    await initCsrf();

    // NEW: use /auth/login
    const { data } = await api.post("/auth/login", { email, password, remember });
    const loggedInUser = data?.user || null;
    setUser(loggedInUser);

    if (loggedInUser) {
      const menuRes = await api.get("/me/menu");
      setTabs(menuRes.data?.tabs || []);
      startIdleWatch(); // begin inactivity tracking after login
    } else {
      stopIdleWatch();
      setTabs([]);
    }

    return loggedInUser;
  };

  const logout = async () => {
    try {
      await initCsrf();
      // NEW: use /auth/logout
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("logout error (ignored):", e);
    }
    stopIdleWatch();
    setUser(null);
    setTabs([]);

    // tell other tabs to logout
    localStorage.setItem("idle:forceLogout", String(Date.now()));
    try {
      bcRef.current?.postMessage({ type: "forceLogout" });
    } catch {}
  };

  const refresh = async () => {
    const meRes = await api.get("/auth/me");
    const meUser = meRes.data?.user || null;
    setUser(meUser);
    if (meUser) {
      const menuRes = await api.get("/me/menu");
      setTabs(menuRes.data?.tabs || []);
    } else {
      setTabs([]);
    }
    return meUser;
  };

  // allow setUser to accept either {user: {...}} or {...}
  const setUserFlexible = (value) => {
    const u = value && value.user ? value.user : value;
    setUser(u);
  };

  // ---------- inactivity handling ----------
  const resetIdleTimers = () => {
    // broadcast activity to other tabs
    localStorage.setItem("idle:lastActivity", String(Date.now()));
    try {
      bcRef.current?.postMessage({ type: "activity", ts: Date.now() });
    } catch {}

    clearTimeout(idleTimerRef.current);
    clearTimeout(warnTimerRef.current);
    setShowIdleWarning(false);

    // schedule warning
    warnTimerRef.current = setTimeout(() => {
      setShowIdleWarning(true);
    }, Math.max(0, IDLE_LIMIT_MS - WARNING_MS));

    // schedule auto-logout
    idleTimerRef.current = setTimeout(() => {
      logout();
    }, IDLE_LIMIT_MS);
  };

  const onUserActivity = () => {
    if (!user) return;
    resetIdleTimers();
  };

  const addActivityListeners = () => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "visibilitychange",
      "click",
    ];
    events.forEach((ev) =>
      window.addEventListener(ev, onUserActivity, { passive: true })
    );
  };

  const removeActivityListeners = () => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "visibilitychange",
      "click",
    ];
    events.forEach((ev) => window.removeEventListener(ev, onUserActivity));
  };

  const startIdleWatch = () => {
    if (!user) return;
    addActivityListeners();
    resetIdleTimers();

    // cross-tab sync: BroadcastChannel (best) + storage fallback
    try {
      bcRef.current = new BroadcastChannel("idle-channel");
      bcRef.current.onmessage = (e) => {
        if (e?.data?.type === "activity") resetIdleTimers();
        if (e?.data?.type === "forceLogout") logout();
      };
    } catch {
      // older browsers without BroadcastChannel
    }

    const onStorage = (e) => {
      if (e.key === "idle:lastActivity") resetIdleTimers();
      if (e.key === "idle:forceLogout") logout();
    };
    window.addEventListener("storage", onStorage);

    startIdleWatch._cleanup = () =>
      window.removeEventListener("storage", onStorage);
  };

  const stopIdleWatch = () => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(warnTimerRef.current);
    removeActivityListeners();
    setShowIdleWarning(false);

    try {
      bcRef.current?.close();
    } catch {}
    bcRef.current = null;

    startIdleWatch._cleanup?.();
  };

  // start/stop watchers when auth state changes
  useEffect(() => {
    if (user) startIdleWatch();
    else stopIdleWatch();
    return () => stopIdleWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      tabs,
      loading,
      isAuthenticated: !!user,
      // actions
      login,
      logout,
      refresh,
      setUser: setUserFlexible,

      // idle modal controls for consumers (optional)
      showIdleWarning,
      staySignedIn: resetIdleTimers,
    }),
    [user, tabs, loading, showIdleWarning]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showIdleWarning && (
        <IdleWarningModal onStay={resetIdleTimers} onLogout={logout} />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Simple inline modal. Style as needed or move to its own file.
function IdleWarningModal({ onStay, onLogout }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-2">You’ve been inactive</h3>
        <p className="text-sm text-gray-600 mb-4">
          You’ll be signed out for security in about a minute. Stay signed in?
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onLogout} className="px-3 py-2 rounded-md border">
            Sign out now
          </button>
          <button
            onClick={onStay}
            className="px-3 py-2 rounded-md bg-red-600 text-white"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
