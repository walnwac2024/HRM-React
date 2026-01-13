
import axios from 'axios';

const isLocal = window.location.hostname === "localhost";
const baseURL = isLocal
  ? "http://localhost:5000/api/v1"
  : "https://api.propeople.cloud/api/v1";
const apiService = axios.create({
  baseURL,
  withCredentials: true
});

export default apiService;