import axios from "axios";
import logout from "../utils/logout";

const instance = axios.create({
  baseURL: "http://localhost:9090/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 403 &&
      err.response.data.message === "Invalid token"
    ) {
      console.warn("⛔ Token expired or invalid. Logging out.");
      logout();
    }
    return Promise.reject(err);
  }
);

export default instance;
