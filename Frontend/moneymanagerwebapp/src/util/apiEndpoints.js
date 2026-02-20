// FIX: export BASE_URL so backendWakeUp.js can import it
// Without this export, `npm run build` fails with:
// "BASE_URL is not exported by src/util/apiEndpoints.js"
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1.0";

export const API_ENDPOINTS = {
    // ─── Auth (public) ──────────────────────────────────────────────
    REGISTER:       `${BASE_URL}/register`,
    LOGIN:          `${BASE_URL}/login`,
    ACTIVATE:       `${BASE_URL}/activate`,      // GET ?token=

    // ─── Profile (protected) ────────────────────────────────────────
    GET_PROFILE:    `${BASE_URL}/profile`,        // GET
    UPDATE_PROFILE: `${BASE_URL}/profile`,        // PUT
    // FIX: useUser.jsx calls API_ENDPOINTS.GET_USER_INFO — add alias
    GET_USER_INFO:  `${BASE_URL}/profile`,        // alias used by useUser hook

    // ─── Categories ─────────────────────────────────────────────────
    GET_ALL_CATEGORIES:   `${BASE_URL}/categories`,
    GET_CATEGORY_BY_TYPE: (type) => `${BASE_URL}/categories/${type}`,
    ADD_CATEGORY:         `${BASE_URL}/categories`,
    UPDATE_CATEGORY:      (id) => `${BASE_URL}/categories/${id}`,
    DELETE_CATEGORY:      (id) => `${BASE_URL}/categories/${id}`,

    // ─── Income ─────────────────────────────────────────────────────
    GET_ALL_INCOME:  `${BASE_URL}/incomes`,
    ADD_INCOME:      `${BASE_URL}/incomes`,
    DELETE_INCOME:   (id) => `${BASE_URL}/incomes/${id}`,

    // ─── Expense ────────────────────────────────────────────────────
    GET_ALL_EXPENSE: `${BASE_URL}/expenses`,
    ADD_EXPENSE:     `${BASE_URL}/expenses`,
    DELETE_EXPENSE:  (id) => `${BASE_URL}/expenses/${id}`,

    // ─── Dashboard ──────────────────────────────────────────────────
    GET_DASHBOARD_DATA: `${BASE_URL}/dashboard`,
    // FIX: Home.jsx calls API_ENDPOINTS.DASHBOARD_DATA — add alias
    DASHBOARD_DATA:     `${BASE_URL}/dashboard`,

    // ─── Filter ─────────────────────────────────────────────────────
    FILTER_TRANSACTIONS: `${BASE_URL}/filter`,
    // FIX: Filter.jsx calls API_ENDPOINTS.APPLY_FILTERS — add alias
    APPLY_FILTERS:       `${BASE_URL}/filter`,

    // ─── Excel download ─────────────────────────────────────────────
    DOWNLOAD_INCOME_EXCEL:  `${BASE_URL}/excel/download/income`,
    DOWNLOAD_EXPENSE_EXCEL: `${BASE_URL}/excel/download/expense`,

    // ─── Email reports ──────────────────────────────────────────────
    EMAIL_INCOME_EXCEL:  `${BASE_URL}/email/income-excel`,
    EMAIL_EXPENSE_EXCEL: `${BASE_URL}/email/expense-excel`,
    EMAIL_TEST:          `${BASE_URL}/email/test`,

    // ─── Health ─────────────────────────────────────────────────────
    HEALTH: `${BASE_URL}/health`,

    // ─── Cloudinary image upload (direct browser → Cloudinary) ──────
    // Set VITE_CLOUDINARY_CLOUD_NAME in your .env.local
    // e.g. VITE_CLOUDINARY_CLOUD_NAME=dhswip9q0
    UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
};