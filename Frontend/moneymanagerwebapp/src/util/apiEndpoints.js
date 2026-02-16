const missingEnv = (name) => { throw new Error(`Missing required environment variable: ${name}`); };

export const BASE_URL = (typeof import.meta.env.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL !== '')
    ? import.meta.env.VITE_API_BASE_URL
    : missingEnv('VITE_API_BASE_URL');

const CLOUDINARY_CLOUD_NAME = (typeof import.meta.env.VITE_CLOUDINARY_CLOUD_NAME === 'string' && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME !== '')
    ? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    : missingEnv('VITE_CLOUDINARY_CLOUD_NAME');

export const API_ENDPOINTS = {
    LOGIN: "/login",
    REGISTER: "/register",
    GET_USER_INFO: "/profile",
    GET_ALL_CATEGORIES: "/categories",
    ADD_CATEGORY: "/categories",
    UPDATE_CATEGORY: (categoryId) => `/categories/${categoryId}`,
    GET_ALL_INCOMES: "/incomes",
    CATEGORY_BY_TYPE: (type) => `/categories/${type}`,
    ADD_INCOME: "/incomes",
    DELETE_INCOME: (incomeId) => `/incomes/${incomeId}`,
    INCOME_EXCEL_DOWNLOAD: "/excel/download/income", // Fixed: Added leading slash to match API contract
    EMAIL_INCOME: "/email/income-excel",
    GET_ALL_EXPENSE: "/expenses",
    ADD_EXPENSE: "/expenses",
    DELETE_EXPENSE: (expenseId) => `/expenses/${expenseId}`,
    EXPENSE_EXCEL_DOWNLOAD: "/excel/download/expense", // Fixed: Added leading slash to match API contract
    DELETE_CATEGORY: (categoryId) => `/categories/${categoryId}`, // Added: Missing endpoint per API contract
    EMAIL_EXPENSE: "/email/expense-excel",
    APPLY_FILTERS: "/filter",
    DASHBOARD_DATA: "/dashboard",
    UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
}