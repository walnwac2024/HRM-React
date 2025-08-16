// src/utils/api.js
import axios from "axios";

let csrfToken = null;

export async function initCsrf() {
  const { data } = await axios.get("http://localhost:5000/api/v1/csrf", {
    withCredentials: true,
  });
  csrfToken = data.csrfToken;

  axios.defaults.withCredentials = true; // always send cookies

  // Attach token to unsafe methods
  axios.interceptors.request.use((config) => {
    const method = (config.method || "get").toLowerCase();
    const needsToken = ["post", "put", "patch", "delete"].includes(method);
    if (needsToken && csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
    return config;
  });
}
