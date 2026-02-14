# 📘 Money Manager - Frontend API Contract Report

**Version:** 1.0  
**Base URL:** `http://localhost:8081/api/v1.0`  
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

---

## 🔑 Common Headers

### Public Endpoints
```http
Content-Type: application/json
Accept: application/json
```

### Protected Endpoints
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication

### 1.1 Health Check

Check if the API is running.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/status` or `/health` |
| **Auth Required** | No |

**Response:**
```
HTTP 200 OK
"Application is running"
```

**Frontend Example (Axios):**
```javascript
const checkHealth = async () => {
  const response = await axios.get(`${BASE_URL}/health`);
  return response.data; // "Application is running"
};
```

---

### 1.2 Register User

Create a new user account.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/register` |
| **Auth Required** | No |

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
| `email` | Required, valid email format, unique |
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

**Error Responses:**

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

*Validation Error (400 Bad Request):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'password': Password must be at least 6 characters long"
}
```

**Frontend Example (Axios):**
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

Activate user account via email token.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/activate?token={activation_token}` |
| **Auth Required** | No |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Activation token from email |

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
```

---

### 1.4 Login

Authenticate user and receive JWT token.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/login` |
| **Auth Required** | No |

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

*User Not Found (404):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "No account found with email 'john.doe@example.com'. Please register first."
}
```

*Account Not Activated (401):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTHENTICATION_ERROR",
  "message": "Account is not activated. Please check your email for the activation link and activate your account before logging in."
}
```

*Invalid Password (401):*
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTHENTICATION_ERROR",
  "message": "Invalid password. Please check your password and try again."
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
    
    // Store token
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
| **Auth Required** | Yes |

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
| **Auth Required** | Yes |

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
| `name` | Required, unique per user |
| `type` | Required, must be "INCOME" or "EXPENSE" |
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

**Frontend Example:**
```javascript
const createCategory = async (name, type, icon) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${BASE_URL}/categories`, 
    { name, type, icon },
    { headers: { Authorization: `Bearer ${token}` }}
  );
  return response.data;
};
```

---

### 3.2 Get All Categories

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/categories` |
| **Auth Required** | Yes |

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

---

### 3.3 Get Categories by Type

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/categories/{type}` |
| **Auth Required** | Yes |

**Path Parameters:**
| Parameter | Type | Valid Values |
|-----------|------|--------------|
| `type` | string | `INCOME`, `EXPENSE` |

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

**Frontend Example:**
```javascript
const getCategoriesByType = async (type) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${BASE_URL}/categories/${type}`, {
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

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **URL** | `/categories/{categoryId}` |
| **Auth Required** | Yes |

**Request Body:**
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

---

### 3.5 Delete Category

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **URL** | `/categories/{categoryId}` |
| **Auth Required** | Yes |

**Success Response:** `204 No Content`

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
| **Auth Required** | Yes |

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
| `name` | Required, non-empty |
| `amount` | Required, must be > 0 |
| `categoryId` | Required, must exist and be INCOME type |
| `date` | Optional, defaults to current date. Format: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss` |
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

**Frontend Example:**
```javascript
const addIncome = async (name, amount, categoryId, date, icon) => {
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

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/incomes` |
| **Auth Required** | Yes |

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

---

### 4.3 Delete Income

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **URL** | `/incomes/{id}` |
| **Auth Required** | Yes |

**Success Response:** `204 No Content`

**Error Response (403 Forbidden):**
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
| **Auth Required** | Yes |

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

---

### 5.2 Get Current Month Expenses

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/expenses` |
| **Auth Required** | Yes |

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
| **Auth Required** | Yes |

**Success Response:** `204 No Content`

---

## 6. Dashboard

### 6.1 Get Dashboard Data

Get comprehensive financial overview.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/dashboard` |
| **Auth Required** | Yes |

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
      "icon": "🛒",
      "name": "Weekly Groceries",
      "amount": 150.00,
      "date": "2026-02-14T00:00:00",
      "createdAt": "2026-02-14T10:30:00",
      "updatedAt": "2026-02-14T10:30:00",
      "type": "expense"
    },
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
    }
  ]
}
```

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
      <TransactionList transactions={data.recentTransactions} />
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
| **Auth Required** | Yes |

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
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `"income"` or `"expense"` |
| `startDate` | string | No | Start date (default: Jan 1 of current year) |
| `endDate` | string | No | End date (default: current date) |
| `keyword` | string | No | Search keyword for name field |
| `sortField` | string | No | Sort by: `"date"`, `"amount"`, `"name"` (default: `"date"`) |
| `sortOrder` | string | No | `"asc"` or `"desc"` (default: `"asc"`) |

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

**Error Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Filter type is required. Valid values are: 'income' or 'expense'"
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

Send income Excel report to user's email.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/email/income-excel` |
| **Auth Required** | Yes |

**Success Response (200 OK):**
```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 200,
  "message": "Income report sent successfully to john.doe@example.com"
}
```

---

### 8.2 Email Expense Report

Send expense Excel report to user's email.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/email/expense-excel` |
| **Auth Required** | Yes |

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
| **Auth Required** | Yes |

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
| **Auth Required** | Yes |
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
};
```

---

### 9.2 Download Expense Excel

Download current month's expenses as Excel file.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/excel/download/expense` |
| **Auth Required** | Yes |
| **Response Type** | Binary (file download) |

---

## 10. Error Handling

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "timestamp": "2026-02-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Successful GET/PUT |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error, invalid input |
| `401` | Unauthorized | Missing/invalid token, authentication failed |
| `403` | Forbidden | No permission for action |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource |
| `500` | Internal Server Error | Server-side error |

### Error Codes Reference

| Error Code | Description |
|------------|-------------|
| `AUTH_TOKEN_MISSING` | No authorization token provided |
| `AUTH_TOKEN_INVALID` | Token is malformed or tampered |
| `AUTH_TOKEN_EXPIRED` | Token has expired |
| `AUTHENTICATION_ERROR` | Login failed |
| `VALIDATION_ERROR` | Input validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `UNAUTHORIZED_ACTION` | Not authorized for action |
| `INTERNAL_ERROR` | Server error |

### Frontend Error Handling Example

```javascript
// Axios interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    
    switch (status) {
      case 401:
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        // Not authorized
        toast.error('You are not authorized to perform this action');
        break;
      case 404:
        toast.error(data?.message || 'Resource not found');
        break;
      case 409:
        toast.error(data?.message || 'Resource already exists');
        break;
      case 400:
        toast.error(data?.message || 'Invalid request');
        break;
      default:
        toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);
```

---

## 📊 Data Types Reference

### User/Profile
```typescript
interface Profile {
  id: number;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Category
```typescript
interface Category {
  id: number;
  profileId: number;
  name: string;
  icon: string | null;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}
```

### Income/Expense
```typescript
interface Transaction {
  id: number;
  name: string;
  icon: string | null;
  categoryName: string;
  categoryId: number;
  amount: number;
  date: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}
```

### Recent Transaction (Dashboard)
```typescript
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
```

---

## 🔧 API Client Setup (Recommended)

```javascript
// api/client.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/v1.0';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

**Document Version:** 1.0  
**Last Updated:** February 14, 2026

