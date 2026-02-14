# TESTING GUIDE - Money Manager API

**Updated: February 14, 2026**

---

## 1. OVERVIEW

### Base URL
```
http://localhost:8081/api/v1.0
```

### Required Headers
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  (for protected endpoints)
```

### Date Format
The API accepts flexible date formats:
- `"2026-02-14"` → Date only (time defaults to 00:00:00)
- `"2026-02-14T14:30:00"` → Date with time
- Not provided → Defaults to current date and time

---

## 2. FIELD REQUIREMENTS SUMMARY

### Registration (`POST /register`)
| Field | Required | Validation |
|-------|----------|------------|
| `fullName` | ✅ Yes | Cannot be empty |
| `email` | ✅ Yes | Valid email format |
| `password` | ✅ Yes | Min 6 characters |
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
| Field | Required | Default Value |
|-------|----------|---------------|
| `type` | ✅ Yes | - |
| `startDate` | ❌ No | Jan 1 of current year |
| `endDate` | ❌ No | Current datetime |
| `keyword` | ❌ No | Empty (matches all) |
| `sortField` | ❌ No | "date" |
| `sortOrder` | ❌ No | "asc" |

---

## 3. REGISTRATION TESTS

### ✅ SUCCESS: Register with All Fields
```
POST /register
Content-Type: application/json
```
**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "profileImageUrl": "https://example.com/avatar.jpg"
}
```
**Response (201 Created):**
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

### ✅ SUCCESS: Register with Mandatory Fields Only
**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "mypassword"
}
```
**Response (201 Created):**
```json
{
  "id": 2,
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "profileImageUrl": null,
  "createdAt": "2026-02-14T10:35:00.123456",
  "updatedAt": "2026-02-14T10:35:00.123456"
}
```

### ❌ ERROR: Missing Email
**Request Body:**
```json
{
  "fullName": "Test User",
  "password": "testpass"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:40:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'email': Email is required"
}
```

### ❌ ERROR: Invalid Email Format
**Request Body:**
```json
{
  "fullName": "Test",
  "email": "invalid-email",
  "password": "testpass"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:40:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'email': Invalid email format. Please provide a valid email address."
}
```

### ❌ ERROR: Missing Full Name
**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "testpass"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:40:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'fullName': Full name is required"
}
```

### ❌ ERROR: Missing Password
**Request Body:**
```json
{
  "fullName": "Test",
  "email": "test@example.com"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:40:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'password': Password is required"
}
```

### ❌ ERROR: Password Too Short
**Request Body:**
```json
{
  "fullName": "Test",
  "email": "test@example.com",
  "password": "12345"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:40:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'password': Password must be at least 6 characters long"
}
```

### ❌ ERROR: Duplicate Email
**Request Body:**
```json
{
  "fullName": "Another User",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (409 Conflict):**
```json
{
  "timestamp": "2026-02-14T10:40:00.123456",
  "status": 409,
  "error": "Conflict",
  "errorCode": "DUPLICATE_RESOURCE",
  "message": "An account with email 'john@example.com' already exists. Please login instead or use a different email."
}
```

---

## 4. ACTIVATION TESTS

### ✅ SUCCESS: Activate with Valid Token
```
GET /activate?token=<valid_activation_token>
```
**Response (200 OK):**
```json
{
  "timestamp": "2026-02-14T10:45:00.123456",
  "status": 200,
  "message": "Profile activated successfully. You can now login to your account."
}
```

### ❌ ERROR: Invalid or Expired Token
```
GET /activate?token=invalid-token-here
```
**Response (404 Not Found):**
```json
{
  "timestamp": "2026-02-14T10:45:00.123456",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Activation token not found or already used. Please request a new activation email."
}
```

---

## 5. LOGIN TESTS

### ✅ SUCCESS: Login with Valid Credentials
```
POST /login
Content-Type: application/json
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (200 OK):**
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

### ❌ ERROR: Missing Email
**Request Body:**
```json
{
  "password": "password123"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:50:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'email': Email is required"
}
```

### ❌ ERROR: Missing Password
**Request Body:**
```json
{
  "email": "john@example.com"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T10:50:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'password': Password is required"
}
```

### ❌ ERROR: Non-existent Email
**Request Body:**
```json
{
  "email": "nonexistent@example.com",
  "password": "anypassword"
}
```
**Response (404 Not Found):**
```json
{
  "timestamp": "2026-02-14T10:50:00.123456",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "No account found with email 'nonexistent@example.com'. Please register first."
}
```

### ❌ ERROR: Account Not Activated
**Request Body:**
```json
{
  "email": "inactive@example.com",
  "password": "password123"
}
```
**Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-02-14T10:50:00.123456",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTHENTICATION_ERROR",
  "message": "Account is not activated. Please check your email for the activation link and activate your account before logging in."
}
```

### ❌ ERROR: Wrong Password
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "wrongpassword"
}
```
**Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-02-14T10:50:00.123456",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTHENTICATION_ERROR",
  "message": "Invalid password. Please check your password and try again."
}
```

---

## 6. PROFILE TESTS

### ✅ SUCCESS: Get Current User Profile
```
GET /profile
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK):**
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

### ❌ ERROR: Missing Authorization Token
```
GET /profile
(No Authorization header)
```
**Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-02-14T10:55:00.123456",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTH_TOKEN_MISSING",
  "message": "Authentication token is missing. Please provide a valid JWT token in the Authorization header."
}
```

### ❌ ERROR: Invalid Token
```
GET /profile
Authorization: Bearer invalid_token_here
```
**Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-02-14T10:55:00.123456",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTH_TOKEN_INVALID",
  "message": "Invalid authentication token. Please login again to get a new token."
}
```

### ❌ ERROR: Expired Token
**Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-02-14T10:55:00.123456",
  "status": 401,
  "error": "Unauthorized",
  "errorCode": "AUTH_TOKEN_EXPIRED",
  "message": "Authentication token has expired. Please login again to get a new token."
}
```

---

## 7. CATEGORY TESTS

### ✅ SUCCESS: Create Category with All Fields
```
POST /categories
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Salary",
  "type": "INCOME",
  "icon": "💰"
}
```
**Response (201 Created):**
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

### ✅ SUCCESS: Create Category with Mandatory Fields Only
**Request Body:**
```json
{
  "name": "Food",
  "type": "EXPENSE"
}
```
**Response (201 Created):**
```json
{
  "id": 2,
  "profileId": 1,
  "name": "Food",
  "icon": null,
  "type": "EXPENSE",
  "createdAt": "2026-02-14T11:05:00.123456",
  "updatedAt": "2026-02-14T11:05:00.123456"
}
```
**Note:** `icon` is set to null when not provided.

### ❌ ERROR: Missing Name
**Request Body:**
```json
{
  "type": "EXPENSE"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:10:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'name': Category name is required"
}
```

### ❌ ERROR: Missing Type
**Request Body:**
```json
{
  "name": "Shopping"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:10:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Category type is required. Valid types are: INCOME, EXPENSE"
}
```

### ❌ ERROR: Invalid Type
**Request Body:**
```json
{
  "name": "Shopping",
  "type": "INVALID"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:10:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Invalid category type 'INVALID'. Valid types are: INCOME, EXPENSE"
}
```

### ❌ ERROR: Duplicate Category Name
**Request Body:**
```json
{
  "name": "Salary",
  "type": "INCOME"
}
```
**Response (409 Conflict):**
```json
{
  "timestamp": "2026-02-14T11:10:00.123456",
  "status": 409,
  "error": "Conflict",
  "errorCode": "DUPLICATE_RESOURCE",
  "message": "Category with name 'Salary' already exists"
}
```

### ✅ SUCCESS: Get All Categories
```
GET /categories
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK):**
```json
[
  {
    "id": 1,
    "profileId": 1,
    "name": "Salary",
    "icon": "💰",
    "type": "INCOME",
    "createdAt": "2026-02-14T11:00:00.123456",
    "updatedAt": "2026-02-14T11:00:00.123456"
  },
  {
    "id": 2,
    "profileId": 1,
    "name": "Food",
    "icon": null,
    "type": "EXPENSE",
    "createdAt": "2026-02-14T11:05:00.123456",
    "updatedAt": "2026-02-14T11:05:00.123456"
  }
]
```

### ✅ SUCCESS: Get Categories by Type
```
GET /categories/income
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK):**
```json
[
  {
    "id": 1,
    "profileId": 1,
    "name": "Salary",
    "icon": "💰",
    "type": "INCOME",
    "createdAt": "2026-02-14T11:00:00.123456",
    "updatedAt": "2026-02-14T11:00:00.123456"
  }
]
```

### ❌ ERROR: Invalid Category Type in Path
```
GET /categories/invalid
Authorization: Bearer <JWT_TOKEN>
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:15:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Invalid category type 'invalid'. Valid types are: INCOME, EXPENSE"
}
```

### ✅ SUCCESS: Update Category
```
PUT /categories/1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Monthly Salary",
  "icon": "💵"
}
```
**Response (200 OK):**
```json
{
  "id": 1,
  "profileId": 1,
  "name": "Monthly Salary",
  "icon": "💵",
  "type": "INCOME",
  "createdAt": "2026-02-14T11:00:00.123456",
  "updatedAt": "2026-02-14T11:20:00.123456"
}
```

### ✅ SUCCESS: Delete Category
```
DELETE /categories/2
Authorization: Bearer <JWT_TOKEN>
```
**Response (204 No Content):** Empty body

### ❌ ERROR: Delete Non-existent Category
```
DELETE /categories/999
Authorization: Bearer <JWT_TOKEN>
```
**Response (404 Not Found):**
```json
{
  "timestamp": "2026-02-14T11:25:00.123456",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Category with ID 999 not found"
}
```

---

## 8. INCOME TESTS

### ✅ SUCCESS: Add Income with All Fields
```
POST /incomes
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "February Salary",
  "amount": 5000.00,
  "categoryId": 1,
  "date": "2026-02-14T09:00:00",
  "icon": "💵"
}
```
**Response (201 Created):**
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

### ✅ SUCCESS: Add Income with Mandatory Fields Only
**Request Body:**
```json
{
  "name": "Bonus",
  "amount": 1000,
  "categoryId": 1
}
```
**Response (201 Created):**
```json
{
  "id": 2,
  "name": "Bonus",
  "icon": null,
  "categoryName": "Salary",
  "categoryId": 1,
  "amount": 1000,
  "date": "2026-02-14T11:35:00.123456",
  "createdAt": "2026-02-14T11:35:00.123456",
  "updatedAt": "2026-02-14T11:35:00.123456"
}
```
**Note:** `date` is automatically set to current datetime when not provided.

### ✅ SUCCESS: Add Income with Date Only (No Time)
**Request Body:**
```json
{
  "name": "Freelance Work",
  "amount": 500,
  "categoryId": 1,
  "date": "2026-02-10"
}
```
**Response (201 Created):** `date` becomes `2026-02-10T00:00:00`

### ❌ ERROR: Missing Name
**Request Body:**
```json
{
  "amount": 500,
  "categoryId": 1
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:45:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'name': Income name is required"
}
```

### ❌ ERROR: Missing Amount
**Request Body:**
```json
{
  "name": "Test Income",
  "categoryId": 1
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:45:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'amount': Amount must be greater than zero"
}
```

### ❌ ERROR: Zero or Negative Amount
**Request Body:**
```json
{
  "name": "Test Income",
  "amount": 0,
  "categoryId": 1
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:45:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'amount': Amount must be greater than zero"
}
```

### ❌ ERROR: Missing Category ID
**Request Body:**
```json
{
  "name": "Test Income",
  "amount": 500
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:45:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'categoryId': Category ID is required. Please select a category for this income."
}
```

### ❌ ERROR: Non-existent Category
**Request Body:**
```json
{
  "name": "Test Income",
  "amount": 500,
  "categoryId": 999
}
```
**Response (404 Not Found):**
```json
{
  "timestamp": "2026-02-14T11:45:00.123456",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Category with ID 999 not found. Please create this category first or use a valid category ID from your categories list."
}
```

### ❌ ERROR: Using Expense Category for Income
**Request Body:**
```json
{
  "name": "Test Income",
  "amount": 500,
  "categoryId": 2
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T11:45:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'categoryId': Category 'Food' is not an income category. Please select a category with type 'INCOME'."
}
```

### ✅ SUCCESS: Get Current Month Incomes
```
GET /incomes
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK):**
```json
[
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
  },
  {
    "id": 2,
    "name": "Bonus",
    "icon": null,
    "categoryName": "Salary",
    "categoryId": 1,
    "amount": 1000,
    "date": "2026-02-14T11:35:00.123456",
    "createdAt": "2026-02-14T11:35:00.123456",
    "updatedAt": "2026-02-14T11:35:00.123456"
  }
]
```

### ✅ SUCCESS: Delete Income
```
DELETE /incomes/2
Authorization: Bearer <JWT_TOKEN>
```
**Response (204 No Content):** Empty body

### ❌ ERROR: Delete Non-existent Income
```
DELETE /incomes/999
Authorization: Bearer <JWT_TOKEN>
```
**Response (404 Not Found):**
```json
{
  "timestamp": "2026-02-14T11:55:00.123456",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Income with ID 999 not found"
}
```

### ❌ ERROR: Delete Another User's Income
**Response (403 Forbidden):**
```json
{
  "timestamp": "2026-02-14T11:55:00.123456",
  "status": 403,
  "error": "Forbidden",
  "errorCode": "UNAUTHORIZED_ACTION",
  "message": "You are not authorized to delete this income. You can only delete your own records."
}
```

---

## 9. EXPENSE TESTS

### ✅ SUCCESS: Add Expense with All Fields
```
POST /expenses
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Lunch",
  "amount": 150.50,
  "categoryId": 2,
  "date": "2026-02-14T12:30:00",
  "icon": "🍕"
}
```
**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Lunch",
  "icon": "🍕",
  "categoryName": "Food",
  "categoryId": 2,
  "amount": 150.50,
  "date": "2026-02-14T12:30:00",
  "createdAt": "2026-02-14T12:35:00.123456",
  "updatedAt": "2026-02-14T12:35:00.123456"
}
```

### ✅ SUCCESS: Add Expense with Mandatory Fields Only
**Request Body:**
```json
{
  "name": "Groceries",
  "amount": 500,
  "categoryId": 2
}
```
**Response (201 Created):**
```json
{
  "id": 2,
  "name": "Groceries",
  "icon": null,
  "categoryName": "Food",
  "categoryId": 2,
  "amount": 500,
  "date": "2026-02-14T12:40:00.123456",
  "createdAt": "2026-02-14T12:40:00.123456",
  "updatedAt": "2026-02-14T12:40:00.123456"
}
```
**Note:** `icon` is set to null when not provided.

### ✅ SUCCESS: Add Expense with Date Only (No Time)
**Request Body:**
```json
{
  "name": "Dinner",
  "amount": 200,
  "categoryId": 2,
  "date": "2026-02-13"
}
```
**Response (201 Created):** `date` becomes `2026-02-13T00:00:00`

### ❌ ERROR: Missing Name
**Request Body:**
```json
{
  "amount": 500,
  "categoryId": 2
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T12:45:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'name': Expense name is required"
}
```

### ❌ ERROR: Using Income Category for Expense
**Request Body:**
```json
{
  "name": "Test Expense",
  "amount": 100,
  "categoryId": 1
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T12:45:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'categoryId': Category 'Salary' is not an expense category. Please select a category with type 'EXPENSE'."
}
```

### ✅ SUCCESS: Get Current Month Expenses
```
GET /expenses
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Lunch",
    "icon": "🍕",
    "categoryName": "Food",
    "categoryId": 2,
    "amount": 150.50,
    "date": "2026-02-14T12:30:00",
    "createdAt": "2026-02-14T12:35:00.123456",
    "updatedAt": "2026-02-14T12:35:00.123456"
  }
]
```

### ✅ SUCCESS: Delete Expense
```
DELETE /expenses/1
Authorization: Bearer <JWT_TOKEN>
```
**Response (204 No Content):** Empty body

---

## 10. FILTER TESTS

### ✅ SUCCESS: Filter with All Fields
```
POST /filter
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Request Body:**
```json
{
  "type": "income",
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "keyword": "salary",
  "sortField": "amount",
  "sortOrder": "desc"
}
```
**Response (200 OK):**
```json
[
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
]
```

### ✅ SUCCESS: Filter with Mandatory Field Only
**Request Body:**
```json
{
  "type": "expense"
}
```
**Response (200 OK):** Returns all expenses from Jan 1 of current year to now, sorted by date ascending.

### ✅ SUCCESS: Filter with DateTime Format
**Request Body:**
```json
{
  "type": "income",
  "startDate": "2026-02-01T00:00:00",
  "endDate": "2026-02-28T23:59:59"
}
```
**Response (200 OK):** Returns incomes within the specified datetime range.

### ❌ ERROR: Missing Type
**Request Body:**
```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-28"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T13:00:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Filter type is required. Valid values are: 'income' or 'expense'"
}
```

### ❌ ERROR: Invalid Type
**Request Body:**
```json
{
  "type": "invalid"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T13:00:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'type': Invalid filter type 'invalid'. Valid values are: 'income' or 'expense'"
}
```

### ❌ ERROR: Start Date After End Date
**Request Body:**
```json
{
  "type": "income",
  "startDate": "2026-02-28",
  "endDate": "2026-02-01"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T13:00:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'startDate': Start date cannot be after end date"
}
```

### ❌ ERROR: Invalid Sort Field
**Request Body:**
```json
{
  "type": "income",
  "sortField": "invalid"
}
```
**Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-14T13:00:00.123456",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'sortField': Invalid sort field 'invalid'. Valid values are: 'date', 'amount', 'name'"
}
```

---

## 11. DASHBOARD TEST

### ✅ SUCCESS: Get Dashboard Data
```
GET /dashboard
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK):**
```json
{
  "totalBalance": 4849.50,
  "totalIncome": 6000.00,
  "totalExpense": 1150.50,
  "recent5Expenses": [
    {
      "id": 1,
      "name": "Lunch",
      "icon": "🍕",
      "amount": 150.50,
      "date": "2026-02-14T12:30:00",
      "type": "expense"
    }
  ],
  "recent5Incomes": [
    {
      "id": 1,
      "name": "February Salary",
      "icon": "💵",
      "amount": 5000.00,
      "date": "2026-02-14T09:00:00",
      "type": "income"
    }
  ],
  "recentTransactions": [
    {
      "id": 1,
      "name": "Lunch",
      "icon": "🍕",
      "amount": 150.50,
      "date": "2026-02-14T12:30:00",
      "type": "expense"
    },
    {
      "id": 1,
      "name": "February Salary",
      "icon": "💵",
      "amount": 5000.00,
      "date": "2026-02-14T09:00:00",
      "type": "income"
    }
  ]
}
```

---

## 12. EMAIL TESTS

### ✅ SUCCESS: Send Income Report Email
```
GET /email/income-excel
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK):**
```json
{
  "timestamp": "2026-02-14T14:00:00.123456",
  "status": 200,
  "message": "Income report sent successfully to john@example.com"
}
```

### ✅ SUCCESS: Send Expense Report Email
```
GET /email/expense-excel
Authorization: Bearer <JWT_TOKEN>
```
**Response (200 OK):**
```json
{
  "timestamp": "2026-02-14T14:00:00.123456",
  "status": 200,
  "message": "Expense report sent successfully to john@example.com"
}
```

---

## 13. EXCEL DOWNLOAD TESTS

### ✅ SUCCESS: Download Income Excel
```
GET /excel/download/income
Authorization: Bearer <JWT_TOKEN>
```
**Response:** Excel file download (`income.xlsx`)

### ✅ SUCCESS: Download Expense Excel
```
GET /excel/download/expense
Authorization: Bearer <JWT_TOKEN>
```
**Response:** Excel file download (`expense.xlsx`)

---

## 14. HEALTH CHECK TEST

### ✅ SUCCESS: Health Check (No Auth Required)
```
GET /status
```
or
```
GET /health
```
**Response (200 OK):**
```
Application is running
```

---

## 15. ERROR CODES REFERENCE

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Field validation failed |
| `AUTHENTICATION_ERROR` | 401 | Login/password incorrect |
| `AUTH_TOKEN_MISSING` | 401 | No JWT token provided |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT token has expired |
| `AUTH_TOKEN_INVALID` | 401 | Invalid JWT token |
| `UNAUTHORIZED_ACTION` | 403 | Not authorized for this action |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists |
| `EMAIL_ERROR` | 503 | Email service unavailable |
| `RUNTIME_ERROR` | 500 | Unexpected server error |

---

## 16. QUICK TEST SEQUENCE

Execute in this order for end-to-end testing:

1. `GET /status` - Verify server is running
2. `POST /register` - Create new account
3. `GET /activate?token=...` - Activate account (get token from email)
4. `POST /login` - Get JWT token
5. `POST /categories` - Create INCOME category (type: "INCOME")
6. `POST /categories` - Create EXPENSE category (type: "EXPENSE")
7. `GET /categories` - Verify categories created
8. `POST /incomes` - Add income (with and without date)
9. `POST /expenses` - Add expense (with and without date)
10. `GET /dashboard` - View dashboard summary
11. `POST /filter` - Filter transactions
12. `GET /excel/download/income` - Download income report
13. `GET /email/expense-excel` - Email expense report

---

## 17. POSTMAN SETUP

### Environment Variables
```
base_url: http://localhost:8081/api/v1.0
jwt_token: <obtained from login>
```

### Pre-request Script (Auto-add Token)
```javascript
if (pm.environment.get("jwt_token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("jwt_token")
    });
}
```

### Post-login Script (Auto-save Token)
```javascript
var jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("jwt_token", jsonData.token);
}
```
