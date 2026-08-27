
import axios from "axios";

const API_URL = import.meta.env.DEV
    ? "http://127.0.0.1:8000/api"
    : "https://otmane-ged.infinityfreeapp.com/api";

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
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Session API non authentifiée.");
        }

        return Promise.reject(error);
    }
);

export default api;

