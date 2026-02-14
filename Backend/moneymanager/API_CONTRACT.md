# 📘 Money Manager - Frontend API Contract Report

**Version:** 2.0  
**Last Updated:** February 14, 2026  
**Base URL (Local):** `http://localhost:8081/api/v1.0`  
**Base URL (Production):** `https://money-manager-project-1-6m2s.onrender.com/api/v1.0`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## 📑 Table of Contents

1. [Authentication](#1-authentication)
2. [Profile Management](#2-profile-management)
3. [Categories](#3-categories)
4. [Income](#4-income)
5. [Expenses](#5-expenses)
6. [Dashboard](#6-dashboard)
7. [Filter & Search](#7-filter--search)
8. [Email Reports](#8-email-reports)
9. [Excel Export](#9-excel-export)
10. [Error Handling](#10-error-handling)
11. [TypeScript Interfaces](#11-typescript-interfaces)
12. [API Client Setup](#12-api-client-setup)

---

## 🔑 Common Headers

### Public Endpoints (No Auth Required)
```http
Content-Type: application/json
Accept: application/json
```

### Protected Endpoints (Auth Required)
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>
```

---

## 📌 Public vs Protected Endpoints

| Endpoint | Auth Required |
|----------|---------------|
| `GET /status` | ❌ No |
| `GET /health` | ❌ No |
| `POST /register` | ❌ No |
| `GET /activate` | ❌ No |
| `POST /login` | ❌ No |
| All other endpoints | ✅ Yes |

---

## 1. Authentication

### 1.1 Health Check

Check if the API is running.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/status` or `/health` |
| **Auth Required** | ❌ No |

**Response (200 OK):**
```
Application is running
```

**Frontend Example:**
```javascript
const checkHealth = async () => {
  const response = await axios.get(`${BASE_URL}/health`);
  return response.data; // "Application is running"
};
```

---

### 1.2 Register User

Create a new user account. An activation email will be sent automatically.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/register` |
| **Auth Required** | ❌ No |

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `fullName` | Required, non-empty string |
| `email` | Required, valid email format (regex: `^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`), must be unique |
| `password` | Required, minimum 6 characters |

**Success Response (201 Created):**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "profileImageUrl": null,
  "createdAt": "2026-02-14T10:30:00",
  "updatedAt": "2026-02-14T10:30:00"
}
```

> ⚠️ **Note:** The `password` field is NOT returned in the response for security.

**Error Responses:**

*Validation Error - Missing Email (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'email': Email is required"
}
```

*Validation Error - Invalid Email (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'email': Invalid email format. Please provide a valid email address."
}
```

*Validation Error - Missing Full Name (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'fullName': Full name is required"
}
```

*Validation Error - Password Too Short (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'password': Password must be at least 6 characters long"
}
```

*Duplicate Email (409 Conflict):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "DUPLICATE_RESOURCE",
  "message": "An account with email 'john.doe@example.com' already exists. Please login instead or use a different email."
}
```

*Email Service Error (503 Service Unavailable):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 503,
  "error": "Service Unavailable",
  "errorCode": "EMAIL_ERROR",
  "message": "Failed to send email to 'john.doe@example.com'. Please try again later. Error: ..."
}
```

**Frontend Example:**
```javascript
const register = async (fullName, email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      fullName,
      email,
      password
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Registration failed'
    };
  }
};
```

---

### 1.3 Activate Account

Activate user account via email token. User clicks the link in their email.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/activate?token={activation_token}` |
| **Auth Required** | ❌ No |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | UUID activation token from email |

**Success Response (200 OK):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 200,
  "message": "Profile activated successfully. You can now login to your account."
}
```

**Error Response (404 Not Found):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Activation token not found or already used. Please request a new activation email."
}
```

**Frontend Example:**
```javascript
// Typically called when user lands on activation page from email link
const activateAccount = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/activate`, {
      params: { token }
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Activation failed'
    };
  }
};

// In React Router, extract token from URL:
// const { token } = useParams(); // if route is /activate/:token
// OR
// const searchParams = new URLSearchParams(window.location.search);
// const token = searchParams.get('token');
```

---

### 1.4 Login

Authenticate user and receive JWT token.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/login` |
| **Auth Required** | ❌ No |

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "profileImageUrl": null,
    "createdAt": "2026-02-14T10:30:00",
    "updatedAt": "2026-02-14T10:30:00"
  }
}
```

**Error Responses:**

*Missing Email (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'email': Email is required"
}
```

*Missing Password (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'password': Password is required"
}
```

*User Not Found (404 Not Found):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "No account found with email 'john.doe@example.com'. Please register first."
}
```

*Account Not Activated (401 Unauthorized):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTHENTICATION_ERROR",
  "message": "Account is not activated. Please check your email for the activation link and activate your account before logging in."
}
```

*Invalid Password (401 Unauthorized):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTHENTICATION_ERROR",
  "message": "Invalid password. Please check your password and try again."
}
```

*Account Locked (401 Unauthorized):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTHENTICATION_ERROR",
  "message": "Account is locked. Please contact support for assistance."
}
```

**Frontend Example:**
```javascript
const login = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email,
      password
    });
    
    // Store token and user info
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Set default header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed'
    };
  }
};
```

---

## 2. Profile Management

### 2.1 Get Current User Profile

Get the authenticated user's profile.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/profile` |
| **Auth Required** | ✅ Yes |

**Success Response (200 OK):**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "profileImageUrl": null,
  "createdAt": "2026-02-14T10:30:00",
  "updatedAt": "2026-02-14T10:30:00"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTH_TOKEN_MISSING",
  "message": "Authentication token is missing. Please provide a valid JWT token in the Authorization header."
}
```

**Frontend Example:**
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

---

## 3. Categories

### 3.1 Create Category

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/categories` |
| **Auth Required** | ✅ Yes |

**Request Body:**
```json
{
  "name": "Groceries",
  "type": "EXPENSE",
  "icon": "🛒"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `name` | Required, non-empty, unique per user |
| `type` | Required, must be `"INCOME"` or `"EXPENSE"` (case-insensitive) |
| `icon` | Optional, emoji or icon identifier |

**Success Response (201 Created):**
```json
{
  "id": 1,
  "profileId": 1,
  "name": "Groceries",
  "icon": "🛒",
  "type": "EXPENSE",
  "createdAt": "2026-02-14T10:30:00",
  "updatedAt": "2026-02-14T10:30:00"
}
```

**Error Responses:**

*Missing Name (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'name': Category name is required"
}
```

*Missing Type (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Category type is required. Valid types are: INCOME, EXPENSE"
}
```

*Invalid Type (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Invalid category type 'OTHER'. Valid types are: INCOME, EXPENSE"
}
```

*Duplicate Name (409 Conflict):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "DUPLICATE_RESOURCE",
  "message": "Category with name 'Groceries' already exists"
}
```

**Frontend Example:**
```javascript
const createCategory = async (name, type, icon = null) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${BASE_URL}/categories`, 
    { name, type: type.toUpperCase(), icon },
    { headers: { Authorization: `Bearer ${token}` }}
  );
  return response.data;
};
```

---

### 3.2 Get All Categories

Get all categories for the current user.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/categories` |
| **Auth Required** | ✅ Yes |

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "profileId": 1,
    "name": "Groceries",
    "icon": "🛒",
    "type": "EXPENSE",
    "createdAt": "2026-02-14T10:30:00",
    "updatedAt": "2026-02-14T10:30:00"
  },
  {
    "id": 2,
    "profileId": 1,
    "name": "Salary",
    "icon": "💰",
    "type": "INCOME",
    "createdAt": "2026-02-14T10:30:00",
    "updatedAt": "2026-02-14T10:30:00"
  }
]
```

> **Note:** Returns empty array `[]` if user has no categories.

---

### 3.3 Get Categories by Type

Get categories filtered by type (INCOME or EXPENSE).

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/categories/{type}` |
| **Auth Required** | ✅ Yes |

**Path Parameters:**
| Parameter | Type | Valid Values | Description |
|-----------|------|--------------|-------------|
| `type` | string | `INCOME`, `EXPENSE` | Category type (case-insensitive) |

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "profileId": 1,
    "name": "Groceries",
    "icon": "🛒",
    "type": "EXPENSE",
    "createdAt": "2026-02-14T10:30:00",
    "updatedAt": "2026-02-14T10:30:00"
  }
]
```

**Error Response - Invalid Type (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Invalid category type 'OTHER'. Valid types are: INCOME, EXPENSE"
}
```

**Frontend Example:**
```javascript
const getCategoriesByType = async (type) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${BASE_URL}/categories/${type.toUpperCase()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Usage
const expenseCategories = await getCategoriesByType('EXPENSE');
const incomeCategories = await getCategoriesByType('INCOME');
```

---

### 3.4 Update Category

Update an existing category. Only `name` and `icon` can be updated. Type cannot be changed.

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **URL** | `/categories/{categoryId}` |
| **Auth Required** | ✅ Yes |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | number | Category ID to update |

**Request Body (all fields optional):**
```json
{
  "name": "Food & Groceries",
  "icon": "🍔"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "profileId": 1,
  "name": "Food & Groceries",
  "icon": "🍔",
  "type": "EXPENSE",
  "createdAt": "2026-02-14T10:30:00",
  "updatedAt": "2026-02-14T11:00:00"
}
```

**Error Responses:**

*Category Not Found (404 Not Found):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Category with ID 999 not found"
}
```

*Empty Name (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'name': Category name cannot be empty"
}
```

*Duplicate Name (409 Conflict):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "DUPLICATE_RESOURCE",
  "message": "Category with name 'Food' already exists"
}
```

---

### 3.5 Delete Category

Delete a category. 

> ⚠️ **Warning:** Deleting a category may affect related income/expense records.

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **URL** | `/categories/{categoryId}` |
| **Auth Required** | ✅ Yes |

**Success Response:** `204 No Content` (empty body)

**Error Response (404 Not Found):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Category with ID 999 not found"
}
```

**Frontend Example:**
```javascript
const deleteCategory = async (categoryId) => {
  const token = localStorage.getItem('token');
  await axios.delete(`${BASE_URL}/categories/${categoryId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

---

## 4. Income

### 4.1 Add Income

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/incomes` |
| **Auth Required** | ✅ Yes |

**Request Body:**
```json
{
  "name": "Monthly Salary",
  "amount": 5000.00,
  "categoryId": 2,
  "date": "2026-02-14",
  "icon": "💰"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `name` | Required, non-empty string |
| `amount` | Required, must be > 0 |
| `categoryId` | Required, must exist and belong to user, must be INCOME type category |
| `date` | Optional, defaults to current datetime. Accepts: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss` |
| `icon` | Optional |

**Success Response (201 Created):**
```json
{
  "id": 1,
  "name": "Monthly Salary",
  "icon": "💰",
  "categoryName": "Salary",
  "categoryId": 2,
  "amount": 5000.00,
  "date": "2026-02-14T00:00:00",
  "createdAt": "2026-02-14T10:30:00",
  "updatedAt": "2026-02-14T10:30:00"
}
```

**Error Responses:**

*Missing Name (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'name': Income name is required"
}
```

*Invalid Amount (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'amount': Amount must be greater than zero"
}
```

*Missing Category ID (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'categoryId': Category ID is required. Please select a category for this income."
}
```

*Category Not Found (404 Not Found):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Category with ID 999 not found. Please create this category first or use a valid category ID from your categories list."
}
```

*Wrong Category Type (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'categoryId': Category 'Groceries' is not an income category. Please select a category with type 'INCOME'."
}
```

**Frontend Example:**
```javascript
const addIncome = async (name, amount, categoryId, date = null, icon = null) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${BASE_URL}/incomes`, 
    { name, amount, categoryId, date, icon },
    { headers: { Authorization: `Bearer ${token}` }}
  );
  return response.data;
};
```

---

### 4.2 Get Current Month Incomes

Get all incomes for the current month.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/incomes` |
| **Auth Required** | ✅ Yes |

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Monthly Salary",
    "icon": "💰",
    "categoryName": "Salary",
    "categoryId": 2,
    "amount": 5000.00,
    "date": "2026-02-14T00:00:00",
    "createdAt": "2026-02-14T10:30:00",
    "updatedAt": "2026-02-14T10:30:00"
  }
]
```

> **Note:** Returns incomes from the 1st to last day of the current month.

---

### 4.3 Delete Income

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **URL** | `/incomes/{id}` |
| **Auth Required** | ✅ Yes |

**Success Response:** `204 No Content`

**Error Responses:**

*Income Not Found (404 Not Found):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Income with ID 999 not found"
}
```

*Not Authorized (403 Forbidden):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "errorCode": "UNAUTHORIZED_ACTION",
  "message": "You are not authorized to delete this income"
}
```

---

## 5. Expenses

### 5.1 Add Expense

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/expenses` |
| **Auth Required** | ✅ Yes |

**Request Body:**
```json
{
  "name": "Weekly Groceries",
  "amount": 150.00,
  "categoryId": 1,
  "date": "2026-02-14",
  "icon": "🛒"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `name` | Required, non-empty string |
| `amount` | Required, must be > 0 |
| `categoryId` | Required, must exist and belong to user, must be EXPENSE type category |
| `date` | Optional, defaults to current datetime. Accepts: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss` |
| `icon` | Optional |

**Success Response (201 Created):**
```json
{
  "id": 1,
  "name": "Weekly Groceries",
  "icon": "🛒",
  "categoryName": "Groceries",
  "categoryId": 1,
  "amount": 150.00,
  "date": "2026-02-14T00:00:00",
  "createdAt": "2026-02-14T10:30:00",
  "updatedAt": "2026-02-14T10:30:00"
}
```

**Error Responses:** Same as Income (4.1), but with "expense" instead of "income" in messages.

---

### 5.2 Get Current Month Expenses

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/expenses` |
| **Auth Required** | ✅ Yes |

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Weekly Groceries",
    "icon": "🛒",
    "categoryName": "Groceries",
    "categoryId": 1,
    "amount": 150.00,
    "date": "2026-02-14T00:00:00",
    "createdAt": "2026-02-14T10:30:00",
    "updatedAt": "2026-02-14T10:30:00"
  }
]
```

---

### 5.3 Delete Expense

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **URL** | `/expenses/{id}` |
| **Auth Required** | ✅ Yes |

**Success Response:** `204 No Content`

**Error Responses:** Same as Income (4.3)

---

## 6. Dashboard

### 6.1 Get Dashboard Data

Get comprehensive financial overview including totals and recent transactions.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/dashboard` |
| **Auth Required** | ✅ Yes |

**Success Response (200 OK):**
```json
{
  "totalBalance": 4850.00,
  "totalIncome": 5000.00,
  "totalExpense": 150.00,
  "recent5Expenses": [
    {
      "id": 1,
      "name": "Weekly Groceries",
      "icon": "🛒",
      "categoryName": "Groceries",
      "categoryId": 1,
      "amount": 150.00,
      "date": "2026-02-14T00:00:00",
      "createdAt": "2026-02-14T10:30:00",
      "updatedAt": "2026-02-14T10:30:00"
    }
  ],
  "recent5Incomes": [
    {
      "id": 1,
      "name": "Monthly Salary",
      "icon": "💰",
      "categoryName": "Salary",
      "categoryId": 2,
      "amount": 5000.00,
      "date": "2026-02-14T00:00:00",
      "createdAt": "2026-02-14T10:30:00",
      "updatedAt": "2026-02-14T10:30:00"
    }
  ],
  "recentTransactions": [
    {
      "id": 1,
      "profileId": 1,
      "icon": "💰",
      "name": "Monthly Salary",
      "amount": 5000.00,
      "date": "2026-02-14T00:00:00",
      "createdAt": "2026-02-14T10:30:00",
      "updatedAt": "2026-02-14T10:30:00",
      "type": "income"
    },
    {
      "id": 1,
      "profileId": 1,
      "icon": "🛒",
      "name": "Weekly Groceries",
      "amount": 150.00,
      "date": "2026-02-14T00:00:00",
      "createdAt": "2026-02-14T10:30:00",
      "updatedAt": "2026-02-14T10:30:00",
      "type": "expense"
    }
  ]
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `totalBalance` | number | `totalIncome - totalExpense` (all time) |
| `totalIncome` | number | Sum of all incomes (all time) |
| `totalExpense` | number | Sum of all expenses (all time) |
| `recent5Expenses` | array | Latest 5 expenses (sorted by date desc) |
| `recent5Incomes` | array | Latest 5 incomes (sorted by date desc) |
| `recentTransactions` | array | Combined & sorted (by date desc, then createdAt desc) |

> **Note:** `recentTransactions` contains both incomes and expenses with a `type` field to distinguish them.

**Frontend Example:**
```javascript
const getDashboard = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Usage in React component
const Dashboard = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    getDashboard().then(setData);
  }, []);
  
  if (!data) return <Loading />;
  
  return (
    <div>
      <Card title="Balance" value={data.totalBalance} />
      <Card title="Income" value={data.totalIncome} />
      <Card title="Expenses" value={data.totalExpense} />
      <TransactionList 
        transactions={data.recentTransactions} 
        // Each transaction has .type = 'income' | 'expense'
      />
    </div>
  );
};
```

---

## 7. Filter & Search

### 7.1 Filter Transactions

Filter income or expenses with advanced options.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/filter` |
| **Auth Required** | ✅ Yes |

**Request Body:**
```json
{
  "type": "expense",
  "startDate": "2026-01-01",
  "endDate": "2026-02-14",
  "keyword": "groceries",
  "sortField": "date",
  "sortOrder": "desc"
}
```

**Filter Parameters:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | ✅ Yes | - | `"income"` or `"expense"` (case-insensitive) |
| `startDate` | string | No | Jan 1 of current year | Format: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss` |
| `endDate` | string | No | Current datetime | Format: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss` |
| `keyword` | string | No | `""` (empty) | Search in `name` field (case-insensitive) |
| `sortField` | string | No | `"date"` | Valid: `"date"`, `"amount"`, `"name"` |
| `sortOrder` | string | No | `"asc"` | `"asc"` or `"desc"` |

**Success Response (200 OK) - Expense Filter:**
```json
[
  {
    "id": 1,
    "name": "Weekly Groceries",
    "icon": "🛒",
    "categoryName": "Groceries",
    "categoryId": 1,
    "amount": 150.00,
    "date": "2026-02-14T00:00:00",
    "createdAt": "2026-02-14T10:30:00",
    "updatedAt": "2026-02-14T10:30:00"
  }
]
```

**Success Response (200 OK) - Income Filter:**
```json
[
  {
    "id": 1,
    "name": "Monthly Salary",
    "icon": "💰",
    "categoryName": "Salary",
    "categoryId": 2,
    "amount": 5000.00,
    "date": "2026-02-14T00:00:00",
    "createdAt": "2026-02-14T10:30:00",
    "updatedAt": "2026-02-14T10:30:00"
  }
]
```

**Error Responses:**

*Missing Type (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Filter type is required. Valid values are: 'income' or 'expense'"
}
```

*Invalid Type (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Invalid filter type 'other'. Valid values are: 'income' or 'expense'"
}
```

*Invalid Sort Field (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'sortField': Invalid sort field 'category'. Valid values are: 'date', 'amount', 'name'"
}
```

*Invalid Date Range (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'startDate': Start date cannot be after end date"
}
```

**Frontend Example:**
```javascript
const filterTransactions = async (filters) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${BASE_URL}/filter`, filters, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Usage
const results = await filterTransactions({
  type: 'expense',
  startDate: '2026-01-01',
  endDate: '2026-02-14',
  keyword: 'groceries',
  sortField: 'amount',
  sortOrder: 'desc'
});
```

---

## 8. Email Reports

### 8.1 Email Income Report

Send income Excel report to user's registered email.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/email/income-excel` |
| **Auth Required** | ✅ Yes |

**Success Response (200 OK):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 200,
  "message": "Income report sent successfully to john.doe@example.com"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 503,
  "error": "Service Unavailable",
  "errorCode": "EMAIL_ERROR",
  "message": "Failed to send email to 'john.doe@example.com'. Please try again later. Error: ..."
}
```

---

### 8.2 Email Expense Report

Send expense Excel report to user's registered email.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/email/expense-excel` |
| **Auth Required** | ✅ Yes |

**Success Response (200 OK):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 200,
  "message": "Expense report sent successfully to john.doe@example.com"
}
```

---

### 8.3 Send Test Email

Send a test email to verify email configuration.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/email/test` |
| **Auth Required** | ✅ Yes |

**Success Response (200 OK):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 200,
  "message": "Test email sent successfully to john.doe@example.com"
}
```

---

## 9. Excel Export

### 9.1 Download Income Excel

Download current month's income as Excel file.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/excel/download/income` |
| **Auth Required** | ✅ Yes |
| **Response Type** | Binary (file download) |

**Response Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=income.xlsx
```

**Frontend Example:**
```javascript
const downloadIncomeExcel = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${BASE_URL}/excel/download/income`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'income.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
```

---

### 9.2 Download Expense Excel

Download current month's expenses as Excel file.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/excel/download/expense` |
| **Auth Required** | ✅ Yes |
| **Response Type** | Binary (file download) |

**Response Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=expense.xlsx
```

---

## 10. Error Handling

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "timestamp": "2026-02-14T10:30:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Successful GET/PUT/POST (when returning data) |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error, invalid input |
| `401` | Unauthorized | Missing/invalid/expired token |
| `403` | Forbidden | No permission for action |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource |
| `503` | Service Unavailable | Email service error |
| `500` | Internal Server Error | Server-side error |

### Error Codes Reference

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AUTH_TOKEN_MISSING` | 401 | No Authorization header provided |
| `AUTH_TOKEN_INVALID` | 401 | Token is malformed, tampered, or invalid format |
| `AUTH_TOKEN_EXPIRED` | 401 | Token has expired, need to login again |
| `AUTHENTICATION_ERROR` | 401 | Login failed (wrong password, account not activated, etc.) |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists (e.g., duplicate email/category name) |
| `UNAUTHORIZED_ACTION` | 403 | Not authorized for action (trying to delete another user's data) |
| `EMAIL_ERROR` | 503 | Email service failed |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `ACCOUNT_NOT_ACTIVATED` | 403 | Account exists but not activated |
| `ACCOUNT_LOCKED` | 403 | Account is locked |
| `USER_NOT_FOUND` | 404 | User not found |
| `MISSING_PARAMETER` | 400 | Required query parameter missing |
| `INVALID_PARAMETER_TYPE` | 400 | Parameter type mismatch |
| `INVALID_ARGUMENT` | 400 | Invalid argument provided |
| `RUNTIME_ERROR` | 400 | Generic runtime error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Frontend Error Handling Example

```javascript
// Axios interceptor for global error handling
import axios from 'axios';
import { toast } from 'react-toastify'; // or your toast library

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    const errorCode = data?.errorCode;
    const message = data?.message || 'An unexpected error occurred';
    
    switch (errorCode) {
      case 'AUTH_TOKEN_MISSING':
      case 'AUTH_TOKEN_INVALID':
      case 'AUTH_TOKEN_EXPIRED':
        // Clear stored auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        break;
        
      case 'ACCOUNT_NOT_ACTIVATED':
        toast.warning('Please activate your account first. Check your email.');
        break;
        
      case 'DUPLICATE_RESOURCE':
        toast.error(message);
        break;
        
      case 'VALIDATION_ERROR':
        toast.error(message);
        break;
        
      case 'RESOURCE_NOT_FOUND':
        toast.error(message);
        break;
        
      case 'UNAUTHORIZED_ACTION':
        toast.error('You are not authorized to perform this action');
        break;
        
      case 'EMAIL_ERROR':
        toast.error('Email service is currently unavailable. Please try again later.');
        break;
        
      default:
        if (status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(message);
        }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 11. TypeScript Interfaces

```typescript
// ==================== Auth ====================
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: Profile;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

// ==================== Profile ====================
interface Profile {
  id: number;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

// ==================== Category ====================
interface Category {
  id: number;
  profileId: number;
  name: string;
  icon: string | null;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}

interface CreateCategoryRequest {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string | null;
}

interface UpdateCategoryRequest {
  name?: string;
  icon?: string | null;
}

// ==================== Income/Expense ====================
interface Transaction {
  id: number;
  name: string;
  icon: string | null;
  categoryName: string;
  categoryId: number;
  amount: number;
  date: string; // ISO 8601 datetime
  createdAt: string;
  updatedAt: string;
}

// Alias for clarity
type Income = Transaction;
type Expense = Transaction;

interface CreateTransactionRequest {
  name: string;
  amount: number;
  categoryId: number;
  date?: string | null; // Optional, accepts 'yyyy-MM-dd' or 'yyyy-MM-ddTHH:mm:ss'
  icon?: string | null;
}

// Alias for clarity
type CreateIncomeRequest = CreateTransactionRequest;
type CreateExpenseRequest = CreateTransactionRequest;

// ==================== Dashboard ====================
interface RecentTransaction {
  id: number;
  profileId: number;
  icon: string | null;
  name: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  type: 'income' | 'expense';
}

interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  recent5Expenses: Expense[];
  recent5Incomes: Income[];
  recentTransactions: RecentTransaction[];
}

// ==================== Filter ====================
interface FilterRequest {
  type: 'income' | 'expense';
  startDate?: string | null; // 'yyyy-MM-dd' or 'yyyy-MM-ddTHH:mm:ss'
  endDate?: string | null;
  keyword?: string | null;
  sortField?: 'date' | 'amount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// ==================== API Response ====================
interface SuccessMessage {
  timestamp: string;
  status: number;
  message: string;
}

interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  errorCode: string;
  message: string;
}
```

---

## 12. API Client Setup

### Recommended Setup (React/Vue/Angular)

```typescript
// api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1.0';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const errorCode = error.response?.data?.errorCode;
    
    // Handle auth errors
    if (
      errorCode === 'AUTH_TOKEN_MISSING' ||
      errorCode === 'AUTH_TOKEN_INVALID' ||
      errorCode === 'AUTH_TOKEN_EXPIRED'
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Service Functions

```typescript
// api/services.ts
import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Profile,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Income,
  Expense,
  CreateIncomeRequest,
  CreateExpenseRequest,
  DashboardData,
  FilterRequest,
  SuccessMessage,
} from './types';

// ==================== Auth ====================
export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<Profile>('/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/login', data),

  activate: (token: string) =>
    apiClient.get<SuccessMessage>('/activate', { params: { token } }),

  checkHealth: () =>
    apiClient.get<string>('/health'),
};

// ==================== Profile ====================
export const profileService = {
  getProfile: () =>
    apiClient.get<Profile>('/profile'),
};

// ==================== Categories ====================
export const categoryService = {
  getAll: () =>
    apiClient.get<Category[]>('/categories'),

  getByType: (type: 'INCOME' | 'EXPENSE') =>
    apiClient.get<Category[]>(`/categories/${type}`),

  create: (data: CreateCategoryRequest) =>
    apiClient.post<Category>('/categories', data),

  update: (id: number, data: UpdateCategoryRequest) =>
    apiClient.put<Category>(`/categories/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};

// ==================== Income ====================
export const incomeService = {
  getCurrentMonth: () =>
    apiClient.get<Income[]>('/incomes'),

  create: (data: CreateIncomeRequest) =>
    apiClient.post<Income>('/incomes', data),

  delete: (id: number) =>
    apiClient.delete(`/incomes/${id}`),
};

// ==================== Expenses ====================
export const expenseService = {
  getCurrentMonth: () =>
    apiClient.get<Expense[]>('/expenses'),

  create: (data: CreateExpenseRequest) =>
    apiClient.post<Expense>('/expenses', data),

  delete: (id: number) =>
    apiClient.delete(`/expenses/${id}`),
};

// ==================== Dashboard ====================
export const dashboardService = {
  getData: () =>
    apiClient.get<DashboardData>('/dashboard'),
};

// ==================== Filter ====================
export const filterService = {
  filter: (data: FilterRequest) =>
    apiClient.post<Income[] | Expense[]>('/filter', data),
};

// ==================== Email ====================
export const emailService = {
  sendIncomeReport: () =>
    apiClient.get<SuccessMessage>('/email/income-excel'),

  sendExpenseReport: () =>
    apiClient.get<SuccessMessage>('/email/expense-excel'),

  sendTestEmail: () =>
    apiClient.get<SuccessMessage>('/email/test'),
};

// ==================== Excel ====================
export const excelService = {
  downloadIncome: async () => {
    const response = await apiClient.get('/excel/download/income', {
      responseType: 'blob',
    });
    downloadBlob(response.data, 'income.xlsx');
  },

  downloadExpense: async () => {
    const response = await apiClient.get('/excel/download/expense', {
      responseType: 'blob',
    });
    downloadBlob(response.data, 'expense.xlsx');
  },
};

// Helper function for downloading blobs
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
```

### Environment Variables

Create a `.env` file in your frontend project:

```bash
# .env.development
VITE_API_URL=http://localhost:8081/api/v1.0

# .env.production
VITE_API_URL=https://money-manager-project-1-6m2s.onrender.com/api/v1.0
```

---

## 📋 Quick Reference - All Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/status` | ❌ | Health check |
| `GET` | `/health` | ❌ | Health check |
| `POST` | `/register` | ❌ | Register new user |
| `GET` | `/activate?token=` | ❌ | Activate account |
| `POST` | `/login` | ❌ | Login |
| `GET` | `/profile` | ✅ | Get current user profile |
| `GET` | `/categories` | ✅ | Get all categories |
| `GET` | `/categories/{type}` | ✅ | Get categories by type |
| `POST` | `/categories` | ✅ | Create category |
| `PUT` | `/categories/{id}` | ✅ | Update category |
| `DELETE` | `/categories/{id}` | ✅ | Delete category |
| `GET` | `/incomes` | ✅ | Get current month incomes |
| `POST` | `/incomes` | ✅ | Add income |
| `DELETE` | `/incomes/{id}` | ✅ | Delete income |
| `GET` | `/expenses` | ✅ | Get current month expenses |
| `POST` | `/expenses` | ✅ | Add expense |
| `DELETE` | `/expenses/{id}` | ✅ | Delete expense |
| `GET` | `/dashboard` | ✅ | Get dashboard data |
| `POST` | `/filter` | ✅ | Filter transactions |
| `GET` | `/email/income-excel` | ✅ | Email income report |
| `GET` | `/email/expense-excel` | ✅ | Email expense report |
| `GET` | `/email/test` | ✅ | Send test email |
| `GET` | `/excel/download/income` | ✅ | Download income Excel |
| `GET` | `/excel/download/expense` | ✅ | Download expense Excel |

---

**Document Version:** 2.0  
**Last Updated:** February 14, 2026  
**Backend Version:** 0.0.1-SNAPSHOT  
**Spring Boot Version:** 3.5.3

