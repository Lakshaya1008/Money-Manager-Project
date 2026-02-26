export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1.0";

export const API_ENDPOINTS = {
    // ─── Auth (public) ──────────────────────────────────────────────
    REGISTER:           `${BASE_URL}/register`,
    LOGIN:              `${BASE_URL}/login`,
    ACTIVATE:           `${BASE_URL}/activate`,
    FORGOT_PASSWORD:    `${BASE_URL}/forgot-password`,
    RESET_PASSWORD:     `${BASE_URL}/reset-password`,

    // ─── Profile (protected) ────────────────────────────────────────
    GET_PROFILE:        `${BASE_URL}/profile`,
    UPDATE_PROFILE:     `${BASE_URL}/profile`,
    GET_USER_INFO:      `${BASE_URL}/profile`,
    UPDATE_NAME:        `${BASE_URL}/profile/update-name`,
    CHANGE_PASSWORD:    `${BASE_URL}/profile/change-password`,

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
    DASHBOARD_DATA:     `${BASE_URL}/dashboard`,

    // ─── Filter ─────────────────────────────────────────────────────
    FILTER_TRANSACTIONS: `${BASE_URL}/filter`,
    APPLY_FILTERS:       `${BASE_URL}/filter`,

    // ─── Excel download ─────────────────────────────────────────────
    DOWNLOAD_INCOME_EXCEL:  `${BASE_URL}/excel/download/income`,
    DOWNLOAD_EXPENSE_EXCEL: `${BASE_URL}/excel/download/expense`,
    // Full report: accepts optional query params startDate, endDate, keyword
    DOWNLOAD_FULL_REPORT:   `${BASE_URL}/excel/download/full`,

    // ─── Email reports ──────────────────────────────────────────────
    EMAIL_INCOME_EXCEL:  `${BASE_URL}/email/income-excel`,
    EMAIL_EXPENSE_EXCEL: `${BASE_URL}/email/expense-excel`,
    EMAIL_TEST:          `${BASE_URL}/email/test`,

    // ─── Health ─────────────────────────────────────────────────────
    HEALTH: `${BASE_URL}/health`,

    // ─── Cloudinary ─────────────────────────────────────────────────
    UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
};