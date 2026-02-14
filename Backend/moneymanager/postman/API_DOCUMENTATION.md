# Money Manager - Complete API Documentation

**Updated: February 14, 2026**

---

## TABLE OF CONTENTS

1. [API Overview](#1-api-overview)
2. [Authentication & Account Lifecycle](#2-authentication--account-lifecycle)
3. [Field Requirements Summary](#3-field-requirements-summary)
4. [Complete Endpoint Catalog](#4-complete-endpoint-catalog)
5. [Error Response Format](#5-error-response-format)
6. [Date/Time Handling](#6-datetime-handling)

---

## 1. API OVERVIEW

### Base URL
```
http://localhost:8081/api/v1.0
```

### Authentication Method
**JWT (JSON Web Token) Bearer Authentication**

All protected endpoints require:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Public Endpoints (No JWT Required)
- `GET /status` or `GET /health` - Health check
- `POST /register` - User registration
- `GET /activate?token=...` - Account activation
- `POST /login` - User login

### Protected Endpoints (JWT Required)
All other endpoints require valid JWT token.

---

## 2. AUTHENTICATION & ACCOUNT LIFECYCLE

### Registration → Activation → Login Flow

1. **Register**: `POST /register` - Creates inactive account, sends activation email
2. **Activate**: `GET /activate?token=...` - Activates account (click link in email)
3. **Login**: `POST /login` - Returns JWT token for authenticated requests

---

## 3. FIELD REQUIREMENTS SUMMARY

### Registration (`POST /register`)
| Field | Required | Validation |
|-------|----------|------------|
| `fullName` | ✅ Yes | Cannot be empty |
| `email` | ✅ Yes | Valid email format |
| `password` | ✅ Yes | Minimum 6 characters |
| `profileImageUrl` | ❌ No | Optional URL |

### Login (`POST /login`)
| Field | Required | Validation |
|-------|----------|------------|
| `email` | ✅ Yes | Cannot be empty |
| `password` | ✅ Yes | Cannot be empty |

### Category (`POST /categories`)
| Field | Required | Validation |
|-------|----------|------------|
| `name` | ✅ Yes | Cannot be empty, unique per user |
| `type` | ✅ Yes | "INCOME" or "EXPENSE" |
| `icon` | ❌ No | Optional icon/emoji |

### Income (`POST /incomes`)
| Field | Required | Validation |
|-------|----------|------------|
| `name` | ✅ Yes | Cannot be empty |
| `amount` | ✅ Yes | Must be > 0 |
| `categoryId` | ✅ Yes | Must exist, type must be "INCOME" |
| `date` | ❌ No | Defaults to current datetime |
| `icon` | ❌ No | Optional |

### Expense (`POST /expenses`)
| Field | Required | Validation |
|-------|----------|------------|
| `name` | ✅ Yes | Cannot be empty |
| `amount` | ✅ Yes | Must be > 0 |
| `categoryId` | ✅ Yes | Must exist, type must be "EXPENSE" |
| `date` | ❌ No | Defaults to current datetime |
| `icon` | ❌ No | Optional |

### Filter (`POST /filter`)
| Field | Required | Validation |
|-------|----------|------------|
| `type` | ✅ Yes | "income" or "expense" |
| `startDate` | ❌ No | Defaults to Jan 1 of current year |
| `endDate` | ❌ No | Defaults to current datetime |
| `keyword` | ❌ No | Search term (default: empty) |
| `sortField` | ❌ No | "date", "amount", "name" (default: "date") |
| `sortOrder` | ❌ No | "asc" or "desc" (default: "asc") |

---

## 4. COMPLETE ENDPOINT CATALOG

### 4.1 Health Check
```
GET /status
GET /health
```
**Response**: `Application is running`

---

### 4.2 User Registration
```
POST /register
```
**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "profileImageUrl": "https://example.com/avatar.jpg"  // optional
}
```
**Success Response (201)**:
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "createdAt": "2026-02-14T10:30:00.123456",
  "updatedAt": "2026-02-14T10:30:00.123456"
}
```

---

### 4.3 Account Activation
```
GET /activate?token={activationToken}
```
**Success Response (200)**:
```json
{
  "timestamp": "2026-02-14T10:35:00.123456",
  "status": 200,
  "message": "Profile activated successfully. You can now login to your account."
}
```

---

### 4.4 User Login
```
POST /login
```
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Success Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "profileImageUrl": "https://example.com/avatar.jpg",
    "createdAt": "2026-02-14T10:30:00.123456",
    "updatedAt": "2026-02-14T10:30:00.123456"
  }
}
```

---

### 4.5 Get Profile
```
GET /profile
Authorization: Bearer <token>
```
**Success Response (200)**:
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "createdAt": "2026-02-14T10:30:00.123456",
  "updatedAt": "2026-02-14T10:30:00.123456"
}
```

---

### 4.6 Categories

#### Create Category
```
POST /categories
Authorization: Bearer <token>
```
**Request Body**:
```json
{
  "name": "Salary",
  "type": "INCOME",
  "icon": "💰"  // optional
}
```
**Success Response (201)**:
```json
{
  "id": 1,
  "profileId": 1,
  "name": "Salary",
  "icon": "💰",
  "type": "INCOME",
  "createdAt": "2026-02-14T11:00:00.123456",
  "updatedAt": "2026-02-14T11:00:00.123456"
}
```

#### Get All Categories
```
GET /categories
Authorization: Bearer <token>
```

#### Get Categories by Type
```
GET /categories/{type}
Authorization: Bearer <token>
```
Where `{type}` is `income` or `expense`

#### Update Category
```
PUT /categories/{categoryId}
Authorization: Bearer <token>
```
**Request Body** (all fields optional):
```json
{
  "name": "Monthly Salary",
  "icon": "💵"
}
```

#### Delete Category
```
DELETE /categories/{categoryId}
Authorization: Bearer <token>
```
**Success Response**: 204 No Content

---

### 4.7 Incomes

#### Add Income
```
POST /incomes
Authorization: Bearer <token>
```
**Request Body**:
```json
{
  "name": "February Salary",
  "amount": 5000.00,
  "categoryId": 1,
  "date": "2026-02-14T09:00:00",  // optional - defaults to now
  "icon": "💵"  // optional
}
```
**Success Response (201)**:
```json
{
  "id": 1,
  "name": "February Salary",
  "icon": "💵",
  "categoryName": "Salary",
  "categoryId": 1,
  "amount": 5000.00,
  "date": "2026-02-14T09:00:00",
  "createdAt": "2026-02-14T11:30:00.123456",
  "updatedAt": "2026-02-14T11:30:00.123456"
}
```

#### Get Current Month Incomes
```
GET /incomes
Authorization: Bearer <token>
```

#### Delete Income
```
DELETE /incomes/{id}
Authorization: Bearer <token>
```
**Success Response**: 204 No Content

---

### 4.8 Expenses

#### Add Expense
```
POST /expenses
Authorization: Bearer <token>
```
**Request Body**:
```json
{
  "name": "Lunch",
  "amount": 150.50,
  "categoryId": 2,
  "date": "2026-02-14T12:30:00",  // optional - defaults to now
  "icon": "🍕"  // optional
}
```

#### Get Current Month Expenses
```
GET /expenses
Authorization: Bearer <token>
```

#### Delete Expense
```
DELETE /expenses/{id}
Authorization: Bearer <token>
```

---

### 4.9 Filter Transactions
```
POST /filter
Authorization: Bearer <token>
```
**Request Body**:
```json
{
  "type": "income",  // required: "income" or "expense"
  "startDate": "2026-02-01",  // optional
  "endDate": "2026-02-28",  // optional
  "keyword": "salary",  // optional
  "sortField": "amount",  // optional: "date", "amount", "name"
  "sortOrder": "desc"  // optional: "asc", "desc"
}
```

**Date Format Options**:
- Date only: `"2026-02-14"` → converts to `2026-02-14T00:00:00`
- Date + Time: `"2026-02-14T14:30:00"` → uses as-is

---

### 4.10 Dashboard
```
GET /dashboard
Authorization: Bearer <token>
```
**Success Response (200)**:
```json
{
  "totalBalance": 4849.50,
  "totalIncome": 6000.00,
  "totalExpense": 1150.50,
  "recent5Expenses": [...],
  "recent5Incomes": [...],
  "recentTransactions": [...]
}
```

---

### 4.11 Excel Downloads
```
GET /excel/download/income
GET /excel/download/expense
Authorization: Bearer <token>
```
**Response**: Excel file download (.xlsx)

---

### 4.12 Email Reports
```
GET /email/income-excel
GET /email/expense-excel
Authorization: Bearer <token>
```
**Success Response (200)**:
```json
{
  "timestamp": "2026-02-14T14:00:00.123456",
  "status": 200,
  "message": "Income report sent successfully to john@example.com"
}
```

---

## 5. ERROR RESPONSE FORMAT

All errors follow this consistent JSON format:

```json
{
  "timestamp": "2026-02-14T10:00:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'email': Email is required"
}
```

### Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Field validation failed |
| `AUTHENTICATION_ERROR` | 401 | Login/password incorrect |
| `AUTH_TOKEN_MISSING` | 401 | No JWT token provided |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT token expired |
| `AUTH_TOKEN_INVALID` | 401 | Invalid JWT token |
| `UNAUTHORIZED_ACTION` | 403 | Not authorized for this action |
| `RESOURCE_NOT_FOUND` | 404 | Resource doesn't exist |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists |
| `EMAIL_ERROR` | 503 | Email service unavailable |
| `RUNTIME_ERROR` | 500 | Unexpected server error |

---

## 6. DATE/TIME HANDLING

The API accepts flexible date formats for all date fields:

| Format | Example | Interpreted As |
|--------|---------|----------------|
| Date only | `"2026-02-14"` | `2026-02-14T00:00:00` |
| Date + Time | `"2026-02-14T14:30:00"` | `2026-02-14T14:30:00` |
| Not provided | (omitted) | Current date and time |

**Response Format**: All dates are returned as ISO-8601 datetime: `"2026-02-14T14:30:00.123456"`
