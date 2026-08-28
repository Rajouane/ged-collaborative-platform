
import axios from "axios";

const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const API_URL = isLocal
    ? "http://127.0.0.1:8000/api"
    : "https://otmane-ged.infinityfreeapp.com/api";

console.log("Frontend:", window.location.origin);
console.log("API:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

