import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1.0";

const axiosConfig = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request interceptor — attach JWT ───────────────────────────────────────
axiosConfig.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor — handle auth errors ──────────────────────────────
axiosConfig.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorCode = error.response?.data?.errorCode;

        // Any auth token error → clear storage and redirect to login
        if (
            errorCode === "AUTH_TOKEN_MISSING" ||
            errorCode === "AUTH_TOKEN_INVALID" ||
            errorCode === "AUTH_TOKEN_EXPIRED"
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Redirect to login (avoid import cycle with navigate)
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosConfig;