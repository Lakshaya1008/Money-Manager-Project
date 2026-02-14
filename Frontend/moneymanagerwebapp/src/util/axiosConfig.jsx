import axios from "axios";
import {BASE_URL} from "./apiEndpoints.js";

const axiosConfig = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

//list of endpoints that do not required authorization header
const excludeEndpoints = ["/login", "/register", "/status", "/activate", "/health"];

//request interceptor
axiosConfig.interceptors.request.use((config) => {
    const shouldSkipToken = excludeEndpoints.some((endpoint) => {
        return config.url?.includes(endpoint)
    });

    if (!shouldSkipToken) {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

//response interceptor - Enhanced per API contract error codes
axiosConfig.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if(error.response) {
        const { status, data } = error.response;
        const errorCode = data?.errorCode;

        // Handle token-related 401 errors (redirect to login)
        // But NOT login/authentication errors which should show error to user
        if (status === 401) {
            const tokenErrors = ['AUTH_TOKEN_MISSING', 'AUTH_TOKEN_INVALID', 'AUTH_TOKEN_EXPIRED'];
            if (tokenErrors.includes(errorCode)) {
                // Token issues - clear storage and redirect
                localStorage.removeItem('token');
                window.location.href = "/login";
            }
            // AUTHENTICATION_ERROR (wrong password, not activated) - let component handle it
        } else if (status === 500) {
            console.error("Server error. Please try again later");
        }
    } else if(error.code === "ECONNABORTED") {
        console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
})

export default axiosConfig;