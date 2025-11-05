// // src/utils/api.js
// import axios from "axios";

// let csrfToken = null;

// export async function initCsrf() {
//   const { data } = await axios.get("http://localhost:5000/api/v1/csrf", {
//     withCredentials: true,
//   });
//   csrfToken = data.csrfToken;

//   axios.defaults.withCredentials = true; // always send cookies

//   // Attach token to unsafe methods
//   axios.interceptors.request.use((config) => {
//     const method = (config.method || "get").toLowerCase();
//     const needsToken = ["post", "put", "patch", "delete"].includes(method);
//     if (needsToken && csrfToken) {
//       config.headers["x-csrf-token"] = csrfToken;
//     }
//     return config;
//   });
// }

// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true, // always send cookies to the API
});

let csrfToken = null;
let interceptorId = null;

export async function initCsrf() {
  // get token using the same instance so cookies persist
  const { data } = await api.get("/csrf");
  csrfToken = data?.csrfToken || null;

  // attach token to unsafe methods; ensure we don't add interceptors twice
  if (interceptorId !== null) {
    api.interceptors.request.eject(interceptorId);
    interceptorId = null;
  }

  interceptorId = api.interceptors.request.use((config) => {
    const method = (config.method || "get").toLowerCase();
    const needsToken = ["post", "put", "patch", "delete"].includes(method);
    if (needsToken && csrfToken) {
      config.headers = config.headers ?? {};
      config.headers["x-csrf-token"] = csrfToken;
    }
    return config;
  });
}

export default api;
