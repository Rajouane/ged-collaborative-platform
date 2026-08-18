import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",

    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },

    timeout: 30000,
});

api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("token");

        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
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

        /*
        |--------------------------------------------------------------------------
        | Ne pas rediriger automatiquement vers /login
        |--------------------------------------------------------------------------
        |
        | Cela évite les problèmes avec les réponses 401/404
        | pendant le développement.
        |
        */

        if (error.response?.status === 401) {

            console.warn(
                "Session API non authentifiée."
            );
        }

        return Promise.reject(error);
    }
);

export default api;