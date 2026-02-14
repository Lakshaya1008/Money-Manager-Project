# TESTING GUIDE - Money Manager API

## 1. TESTING OVERVIEW

### Base URL
```
http://localhost:8081/api/v1.0
```

### Required Tools
- **Postman** (recommended) or **curl**
- Email client for activation link verification
- Spreadsheet viewer for Excel validation

### Authentication Mechanism
- **Type**: JWT (JSON Web Token)
- **Token Validity**: Bearer token required for all protected endpoints
- **Token Location**: `Authorization` header

### Required Headers

#### For All Requests (except file downloads)
```
Content-Type: application/json
```

#### For Protected Endpoints (all except `/status`, `/health`, `/register`, `/activate`, `/login`)
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### For Excel Download Endpoints
```
Authorization: Bearer <JWT_TOKEN>
```
(No Content-Type header needed)

### Date Formats
The API accepts flexible date formats:
- **Date only**: `yyyy-MM-dd` (e.g., `2026-02-14`) → Time defaults to `00:00:00`
- **Date + Time**: `yyyy-MM-ddTHH:mm:ss` (e.g., `2026-02-14T14:30:00`) → Uses exact time
- **Not provided**: Defaults to current date and time when the request is made

### Common Assumptions
- PostgreSQL database is running on `localhost:5432`
- Database name: `MoneyManager`
- Server is running on port `8081`
- Email service (Brevo SMTP) is configured
- All monetary amounts use `BigDecimal` (no currency symbol in JSON)

---

## 2. TEST ENVIRONMENT SETUP

### Required Application State
- Application must be running: `mvn spring-boot:run` or via IDE
- Database must be initialized with schema (auto-created via JPA)

### Database Assumptions
- Fresh installation: Tables are empty
- Existing data: User can only access their own data (enforced by JWT)
- No manual database seeding required

### Email Configuration Assumptions
- SMTP server is configured in `application.properties`
- Activation emails are sent to the registered email address
- Email delivery may take 1-5 seconds

### Clean Database vs Existing Data
- **Clean DB**: User must register, activate, and login
- **Existing User**: Skip registration, use existing credentials
- **Data Isolation**: Each user sees only their own categories, expenses, and incomes

### JWT Handling in Tests
1. Obtain JWT from `/login` endpoint
2. Copy the `token` value from login response
3. Add to `Authorization` header as `Bearer <token>`
4. JWT remains valid until server restart or expiration (implementation-dependent)

---

## 3. AUTH & ACCOUNT TESTING (STEP-BY-STEP)

### 3.1 User Registration

**Test Case**: Register New User

**URL**: `http://localhost:8081/api/v1.0/register`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body** (FULL):
```json
{
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "password": "SecurePass123"
}
```

**Required Fields**:
- `fullName` (String)
- `email` (String, must be valid email format)
- `password` (String)

**Optional Fields**:
- `profileImageUrl` (String, URL to profile image)

**Expected Status**: `201 Created`

**Expected Response**:
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "password": null,
  "profileImageUrl": null,
  "createdAt": "2026-02-08T14:30:00",
  "updatedAt": "2026-02-08T14:30:00"
}
```

**Common Failure Cases**:
- **400 Bad Request**: Missing required fields
- **409 Conflict** (assumed): Email already exists
- **500 Internal Server Error**: Email service failure

**Verification**:
- Check email inbox for activation link
- Password should not be returned in response

---

### 3.2 Email Activation

**Test Case**: Activate Account via Token

**URL**: `http://localhost:8081/api/v1.0/activate?token=<ACTIVATION_TOKEN>`

**Method**: `GET`

**Headers**: None required

**Request Body**: None

**Required Query Parameters**:
- `token` (String, received via email)

**Expected Status**: `200 OK`

**Expected Response** (Success):
```
Profile activated successfully
```

**Expected Status** (Failure): `404 Not Found`

**Expected Response** (Failure):
```
Activation token not found or already used
```

**Common Failure Cases**:
- **404**: Invalid token
- **404**: Token already used
- **404**: Token expired (if expiration is implemented)

**Verification**:
- User should now be able to login
- Attempting to activate again with same token should fail

---

### 3.3 Login

**Test Case**: User Login

**URL**: `http://localhost:8081/api/v1.0/login`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body** (FULL):
```json
{
  "email": "johndoe@example.com",
  "password": "SecurePass123"
}
```

**Required Fields**:
- `email` (String)
- `password` (String)

**Expected Status**: `200 OK`

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "profileImageUrl": null
  }
}
```

**Common Failure Cases**:
- **401 Unauthorized**: Account not activated
  ```json
  {
    "timestamp": "2026-02-14T10:50:00.123456",
    "status": 401,
    "error": "Unauthorized",
    "errorCode": "AUTHENTICATION_ERROR",
    "message": "Account is not activated. Please check your email for the activation link and activate your account before logging in."
  }
  ```
- **401 Unauthorized**: Invalid password
  ```json
  {
    "timestamp": "2026-02-14T10:50:00.123456",
    "status": 401,
    "error": "Unauthorized",
    "errorCode": "AUTHENTICATION_ERROR",
    "message": "Invalid password. Please check your password and try again."
  }
  ```
- **404 Not Found**: Email not registered
  ```json
  {
    "timestamp": "2026-02-14T10:50:00.123456",
    "status": 404,
    "error": "Not Found",
    "errorCode": "RESOURCE_NOT_FOUND",
    "message": "No account found with email 'nonexistent@example.com'. Please register first."
  }
  ```
- **400 Bad Request**: Missing fields
  ```json
  {
    "timestamp": "2026-02-14T10:50:00.123456",
    "status": 400,
    "error": "Bad Request",
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation failed for field 'email': Email is required"
  }
  ```

**Verification**:
- Token should be a valid JWT string
- Save token for subsequent requests

---

### 3.4 JWT Validation

**Test Case**: Access Protected Endpoint with Valid JWT

**URL**: `http://localhost:8081/api/v1.0/profile`

**Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**: None

**Expected Status**: `200 OK`

**Expected Response**:
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "password": null,
  "profileImageUrl": null,
  "createdAt": "2026-02-08T14:30:00",
  "updatedAt": "2026-02-08T14:30:00"
}
```

**Common Failure Cases**:
- **401 Unauthorized**: Invalid token
  ```json
  {
    "status": 401,
    "errorCode": "AUTH_TOKEN_INVALID",
    "message": "Invalid authentication token. Please login again to get a new token."
  }
  ```
- **401 Unauthorized**: Expired token
  ```json
  {
    "status": 401,
    "errorCode": "AUTH_TOKEN_EXPIRED",
    "message": "Authentication token has expired. Please login again to get a new token."
  }
  ```
- **401 Unauthorized**: Missing Authorization header
  ```json
  {
    "status": 401,
    "errorCode": "AUTH_TOKEN_MISSING",
    "message": "Authentication token is missing. Please provide a valid JWT token in the Authorization header."
  }
  ```

---

### 3.5 Unauthorized Access Attempts

**Test Case**: Access Protected Endpoint Without JWT

**URL**: `http://localhost:8081/api/v1.0/profile`

**Method**: `GET`

**Headers**:
```
Content-Type: application/json
```
(No Authorization header)

**Request Body**: None

**Expected Status**: `401 Unauthorized`

**Expected Response**:
```json
{
  "status": 401,
  "errorCode": "AUTH_TOKEN_MISSING",
  "message": "Authentication token is missing. Please provide a valid JWT token in the Authorization header."
}
```

**Verification**:
- All endpoints except `/status`, `/health`, `/register`, `/activate`, `/login` should be protected

---

## 4. CRUD TEST CASES (ENDPOINT BY ENDPOINT)

### 4.1 Health Check Endpoint

**Test Case**: Application Health Check

**Preconditions**: None

**Request URL**: `http://localhost:8081/api/v1.0/status`

**HTTP Method**: `GET`

**Headers**: None required

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```
Application is running
```

**Expected Failure Status Codes**: None (always accessible)

**Verification**: Response is plain text, not JSON

**Alternate URL**: `http://localhost:8081/api/v1.0/health` (same behavior)

---

### 4.2 Get User Profile

**Test Case**: Retrieve Current User Profile

**Preconditions**: User must be logged in

**Request URL**: `http://localhost:8081/api/v1.0/profile`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "password": null,
  "profileImageUrl": null,
  "createdAt": "2026-02-08T14:30:00",
  "updatedAt": "2026-02-08T14:30:00"
}
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT

**Verification**: Password is always `null` in response

---

### 4.3 Create Category

**Test Case**: Create New Category

**Preconditions**: User must be logged in

**Request URL**: `http://localhost:8081/api/v1.0/categories`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body** (FULL):
```json
{
  "name": "Groceries",
  "icon": "🛒",
  "type": "expense"
}
```

**Required Fields**:
- `name` (String)
- `type` (String: must be "income" or "expense")

**Optional Fields**:
- `icon` (String, emoji or icon identifier)

**Expected Success Status**: `201 Created`

**Expected Success Response**:
```json
{
  "id": 1,
  "profileId": 1,
  "name": "Groceries",
  "icon": "🛒",
  "type": "expense",
  "createdAt": "2026-02-08T14:30:00",
  "updatedAt": "2026-02-08T14:30:00"
}
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `400`: Missing required fields
- `400`: Invalid `type` value

**Verification**:
- `profileId` matches logged-in user ID
- `id` is auto-generated

---

### 4.4 Get All Categories

**Test Case**: Retrieve All Categories for Current User

**Preconditions**: User must be logged in

**Request URL**: `http://localhost:8081/api/v1.0/categories`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```json
[
  {
    "id": 1,
    "profileId": 1,
    "name": "Groceries",
    "icon": "🛒",
    "type": "expense",
    "createdAt": "2026-02-08T14:30:00",
    "updatedAt": "2026-02-08T14:30:00"
  },
  {
    "id": 2,
    "profileId": 1,
    "name": "Salary",
    "icon": "💰",
    "type": "income",
    "createdAt": "2026-02-08T14:35:00",
    "updatedAt": "2026-02-08T14:35:00"
  }
]
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT

**Verification**:
- Returns empty array `[]` if no categories exist
- Only returns categories belonging to current user

---

### 4.5 Get Categories by Type

**Test Case**: Retrieve Categories Filtered by Type

**Preconditions**: User must be logged in, categories of specified type exist

**Request URL**: `http://localhost:8081/api/v1.0/categories/expense`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**: None

**Path Parameters**:
- `type` (String: "income" or "expense")

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```json
[
  {
    "id": 1,
    "profileId": 1,
    "name": "Groceries",
    "icon": "🛒",
    "type": "expense",
    "createdAt": "2026-02-08T14:30:00",
    "updatedAt": "2026-02-08T14:30:00"
  }
]
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `400`: Invalid type value (assumed)

**Verification**:
- All returned categories have matching `type`
- Returns empty array if no categories of that type

**Alternate Test**: Replace `/expense` with `/income` in URL

---

### 4.6 Update Category

**Test Case**: Update Existing Category

**Preconditions**: User must be logged in, category must exist and belong to user

**Request URL**: `http://localhost:8081/api/v1.0/categories/1`

**HTTP Method**: `PUT`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body** (FULL):
```json
{
  "name": "Grocery Shopping",
  "icon": "🛍️",
  "type": "expense"
}
```

**Required Fields**:
- `name` (String)
- `type` (String: "income" or "expense")

**Optional Fields**:
- `icon` (String)

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```json
{
  "id": 1,
  "profileId": 1,
  "name": "Grocery Shopping",
  "icon": "🛍️",
  "type": "expense",
  "createdAt": "2026-02-08T14:30:00",
  "updatedAt": "2026-02-08T15:00:00"
}
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `404`: Category not found
- `403`: Attempting to update another user's category

**Verification**:
- `updatedAt` timestamp changes
- `createdAt` timestamp remains unchanged
- `id` remains unchanged

---

### 4.7 Create Expense

**Test Case**: Add New Expense

**Preconditions**: User must be logged in, expense category must exist

**Request URL**: `http://localhost:8081/api/v1.0/expenses`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body** (FULL):
```json
{
  "name": "Weekly Groceries",
  "categoryId": 1,
  "amount": 125.50,
  "date": "2026-02-08T14:30:00",
  "icon": "🛒"
}
```

**Request Body** (MINIMAL - date auto-set to current datetime):
```json
{
  "name": "Weekly Groceries",
  "categoryId": 1,
  "amount": 125.50
}
```

**Required Fields**:
- `name` (String)
- `categoryId` (Long, must be valid expense category ID)
- `amount` (Number, must be greater than 0)

**Optional Fields**:
- `date` (String, format: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss`) - Defaults to current datetime if not provided
- `icon` (String, defaults to category icon if not provided)

**Expected Success Status**: `201 Created`

**Expected Success Response**:
```json
{
  "id": 1,
  "name": "Weekly Groceries",
  "icon": "🛒",
  "categoryName": "Groceries",
  "categoryId": 1,
  "amount": 125.50,
  "date": "2026-02-08",
  "createdAt": "2026-02-08T14:30:00",
  "updatedAt": "2026-02-08T14:30:00"
}
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `400`: Missing required fields
- `404`: Category not found
- `400`: Invalid date format

**Verification**:
- `categoryName` is populated from category
- `amount` is stored as decimal

---

### 4.8 Get Current Month Expenses

**Test Case**: Retrieve All Expenses for Current Month

**Preconditions**: User must be logged in

**Request URL**: `http://localhost:8081/api/v1.0/expenses`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```json
[
  {
    "id": 1,
    "name": "Weekly Groceries",
    "icon": "🛒",
    "categoryName": "Groceries",
    "categoryId": 1,
    "amount": 125.50,
    "date": "2026-02-08",
    "createdAt": "2026-02-08T14:30:00",
    "updatedAt": "2026-02-08T14:30:00"
  }
]
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT

**Verification**:
- Returns only expenses from current calendar month
- Returns empty array `[]` if no expenses
- Only returns current user's expenses

---

### 4.9 Delete Expense

**Test Case**: Delete Existing Expense

**Preconditions**: User must be logged in, expense must exist and belong to user

**Request URL**: `http://localhost:8081/api/v1.0/expenses/1`

**HTTP Method**: `DELETE`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Expected Success Status**: `204 No Content`

**Expected Success Response**: Empty body

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `404`: Expense not found
- `403`: Attempting to delete another user's expense

**Verification**:
- Subsequent GET request should not return deleted expense
- Total expense calculation should be updated

---

### 4.10 Create Income

**Test Case**: Add New Income

**Preconditions**: User must be logged in, income category must exist

**Request URL**: `http://localhost:8081/api/v1.0/incomes`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body** (FULL):
```json
{
  "name": "Monthly Salary",
  "categoryId": 2,
  "amount": 5000.00,
  "date": "2026-02-01T09:00:00",
  "icon": "💰"
}
```

**Request Body** (MINIMAL - date auto-set to current datetime):
```json
{
  "name": "Monthly Salary",
  "categoryId": 2,
  "amount": 5000.00
}
```

**Required Fields**:
- `name` (String)
- `categoryId` (Long, must be valid income category ID)
- `amount` (Number, must be greater than 0)

**Optional Fields**:
- `date` (String, format: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss`) - Defaults to current datetime if not provided
- `icon` (String, defaults to category icon if not provided)

**Expected Success Status**: `201 Created`

**Expected Success Response**:
```json
{
  "id": 1,
  "name": "Monthly Salary",
  "icon": "💰",
  "categoryName": "Salary",
  "categoryId": 2,
  "amount": 5000.00,
  "date": "2026-02-01",
  "createdAt": "2026-02-08T14:30:00",
  "updatedAt": "2026-02-08T14:30:00"
}
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `400`: Missing required fields
- `404`: Category not found
- `400`: Invalid date format

**Verification**:
- `categoryName` is populated from category
- `amount` is stored as decimal

---

### 4.11 Get Current Month Incomes

**Test Case**: Retrieve All Incomes for Current Month

**Preconditions**: User must be logged in

**Request URL**: `http://localhost:8081/api/v1.0/incomes`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```json
[
  {
    "id": 1,
    "name": "Monthly Salary",
    "icon": "💰",
    "categoryName": "Salary",
    "categoryId": 2,
    "amount": 5000.00,
    "date": "2026-02-01",
    "createdAt": "2026-02-08T14:30:00",
    "updatedAt": "2026-02-08T14:30:00"
  }
]
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT

**Verification**:
- Returns only incomes from current calendar month
- Returns empty array `[]` if no incomes
- Only returns current user's incomes

---

### 4.12 Delete Income

**Test Case**: Delete Existing Income

**Preconditions**: User must be logged in, income must exist and belong to user

**Request URL**: `http://localhost:8081/api/v1.0/incomes/1`

**HTTP Method**: `DELETE`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Expected Success Status**: `204 No Content`

**Expected Success Response**: Empty body

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `404`: Income not found
- `403`: Attempting to delete another user's income

**Verification**:
- Subsequent GET request should not return deleted income
- Total income calculation should be updated

---

### 4.13 Get Dashboard Data

**Test Case**: Retrieve Dashboard Summary

**Preconditions**: User must be logged in

**Request URL**: `http://localhost:8081/api/v1.0/dashboard`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```json
{
  "totalBalance": 4874.50,
  "totalIncome": 5000.00,
  "totalExpense": 125.50,
  "recent5Expenses": [
    {
      "id": 1,
      "name": "Weekly Groceries",
      "icon": "🛒",
      "categoryName": "Groceries",
      "categoryId": 1,
      "amount": 125.50,
      "date": "2026-02-08",
      "createdAt": "2026-02-08T14:30:00",
      "updatedAt": "2026-02-08T14:30:00"
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
      "date": "2026-02-01",
      "createdAt": "2026-02-08T14:30:00",
      "updatedAt": "2026-02-08T14:30:00"
    }
  ],
  "recentTransactions": [
    {
      "id": 1,
      "profileId": 1,
      "icon": "🛒",
      "name": "Weekly Groceries",
      "amount": 125.50,
      "date": "2026-02-08",
      "createdAt": "2026-02-08T14:30:00",
      "updatedAt": "2026-02-08T14:30:00",
      "type": "expense"
    },
    {
      "id": 1,
      "profileId": 1,
      "icon": "💰",
      "name": "Monthly Salary",
      "amount": 5000.00,
      "date": "2026-02-01",
      "createdAt": "2026-02-08T14:30:00",
      "updatedAt": "2026-02-08T14:30:00",
      "type": "income"
    }
  ]
}
```

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT

**Verification**:
- `totalBalance = totalIncome - totalExpense`
- `recent5Expenses` limited to 5 items
- `recent5Incomes` limited to 5 items
- `recentTransactions` combines both, sorted by date (descending), limited to 10

---

## 5. FILTER & SEARCH TESTING

### 5.1 Minimal Payload Test (Filter Expenses)

**Test Case**: Filter with Only Type Specified

**Preconditions**: User must be logged in, expenses exist

**Request URL**: `http://localhost:8081/api/v1.0/filter`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "expense"
}
```

**Expected Status**: `200 OK`

**Expected Behavior**:
- Returns all expenses for current user
- Date range defaults to: `startDate = January 1st of current year`, `endDate = current datetime`
- Keyword defaults to empty string (matches all)
- Sort defaults to `date` field, ascending order

**Expected Response**: Array of ExpenseDTO objects

---

### 5.2 Full Payload Test (Filter Incomes)

**Test Case**: Filter with All Parameters

**Preconditions**: User must be logged in, incomes exist

**Request URL**: `http://localhost:8081/api/v1.0/filter`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body** (FULL):
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

**Required Fields**:
- `type` (String: "income" or "expense")

**Optional Fields**:
- `startDate` (String, format: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss`) - Defaults to January 1st of current year
- `endDate` (String, format: `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss`) - Defaults to current datetime
- `keyword` (String, searches in `name` field, case-insensitive) - Defaults to empty (matches all)
- `sortField` (String: "date", "amount", or "name") - Defaults to "date"
- `sortOrder` (String: "asc" or "desc") - Defaults to "asc"

**Expected Status**: `200 OK`

**Expected Response**: Array of IncomeDTO objects matching criteria, sorted by amount descending

**Expected Behavior**:
- Only incomes between `2026-02-01` and `2026-02-28`
- Only incomes with "salary" in name (case-insensitive)
- Sorted by amount, highest first

---

### 5.3 Keyword Search Test

**Test Case**: Search by Keyword (Case-Insensitive)

**Request Body**:
```json
{
  "type": "expense",
  "keyword": "GROCERY"
}
```

**Expected Status**: `200 OK`

**Expected Behavior**:
- Matches expenses with "grocery", "Grocery", "GROCERY" in name
- Case-insensitive search

---

### 5.4 Date Range Test

**Test Case**: Filter by Specific Date Range

**Request Body**:
```json
{
  "type": "expense",
  "startDate": "2026-02-01",
  "endDate": "2026-02-07"
}
```

**Expected Status**: `200 OK`

**Expected Behavior**:
- Returns expenses with `date` between Feb 1 and Feb 7 (inclusive)
- Excludes expenses outside this range

---

### 5.5 Sorting Ascending Test

**Test Case**: Sort by Amount Ascending

**Request Body**:
```json
{
  "type": "income",
  "sortField": "amount",
  "sortOrder": "asc"
}
```

**Expected Status**: `200 OK`

**Expected Behavior**:
- Returns incomes sorted from lowest to highest amount

---

### 5.6 Sorting Descending Test

**Test Case**: Sort by Date Descending

**Request Body**:
```json
{
  "type": "expense",
  "sortField": "date",
  "sortOrder": "desc"
}
```

**Expected Status**: `200 OK`

**Expected Behavior**:
- Returns expenses sorted from most recent to oldest

---

### 5.7 Edge Case: Empty Keyword

**Test Case**: Filter with Empty Keyword

**Request Body**:
```json
{
  "type": "expense",
  "keyword": ""
}
```

**Expected Status**: `200 OK`

**Expected Behavior**:
- Returns all expenses (keyword is ignored)

---

### 5.8 Edge Case: Extreme Dates

**Test Case**: Filter with Very Old Start Date

**Request Body**:
```json
{
  "type": "income",
  "startDate": "1900-01-01",
  "endDate": "2026-12-31"
}
```

**Expected Status**: `200 OK`

**Expected Behavior**:
- Returns all incomes within the date range
- No error for historical dates

---

### 5.9 Negative Case: Invalid Type

**Test Case**: Filter with Invalid Type

**Request Body**:
```json
{
  "type": "invalid"
}
```

**Expected Status**: `400 Bad Request`

**Expected Response**:
```json
"Invalid type. Must be 'income' or 'expense'"
```

---

### 5.10 Edge Case: Missing Type

**Test Case**: Filter Without Type

**Request Body**:
```json
{
  "keyword": "test"
}
```

**Expected Status**: `400 Bad Request` (assumed)

**Expected Behavior**: Error indicating type is required

---

## 6. DASHBOARD TESTING

### 6.1 No Data Scenario

**Test Case**: Dashboard with No Transactions

**Preconditions**: User has no incomes or expenses

**Request URL**: `http://localhost:8081/api/v1.0/dashboard`

**Expected Status**: `200 OK`

**Expected Response**:
```json
{
  "totalBalance": 0,
  "totalIncome": 0,
  "totalExpense": 0,
  "recent5Expenses": [],
  "recent5Incomes": [],
  "recentTransactions": []
}
```

---

### 6.2 Only Income Present

**Test Case**: Dashboard with Only Incomes

**Preconditions**: User has incomes but no expenses

**Request URL**: `http://localhost:8081/api/v1.0/dashboard`

**Expected Status**: `200 OK`

**Expected Response**:
```json
{
  "totalBalance": 5000.00,
  "totalIncome": 5000.00,
  "totalExpense": 0,
  "recent5Expenses": [],
  "recent5Incomes": [ /* up to 5 income objects */ ],
  "recentTransactions": [ /* up to 10 income objects with type="income" */ ]
}
```

---

### 6.3 Only Expense Present

**Test Case**: Dashboard with Only Expenses

**Preconditions**: User has expenses but no incomes

**Request URL**: `http://localhost:8081/api/v1.0/dashboard`

**Expected Status**: `200 OK`

**Expected Response**:
```json
{
  "totalBalance": -125.50,
  "totalIncome": 0,
  "totalExpense": 125.50,
  "recent5Expenses": [ /* up to 5 expense objects */ ],
  "recent5Incomes": [],
  "recentTransactions": [ /* up to 10 expense objects with type="expense" */ ]
}
```

**Verification**: `totalBalance` is negative

---

### 6.4 Both Present

**Test Case**: Dashboard with Both Incomes and Expenses

**Preconditions**: User has both incomes and expenses

**Expected Status**: `200 OK`

**Expected Behavior**:
- `totalBalance` calculated correctly
- Both arrays populated
- `recentTransactions` merges both types

---

### 6.5 Balance Calculation Correctness

**Test Case**: Verify Balance Formula

**Verification Steps**:
1. Add up all incomes from `recent5Incomes` (if more exist, check database)
2. Add up all expenses from `recent5Expenses` (if more exist, check database)
3. Calculate: `Expected Balance = Total Income - Total Expense`
4. Compare with `totalBalance` in response

**Expected**: Values match exactly

---

### 6.6 Recent Transaction Ordering

**Test Case**: Verify Transaction Sort Order

**Preconditions**: User has at least 6 transactions (mix of income and expense)

**Expected Behavior**:
- `recentTransactions` sorted by `date` descending
- If dates are equal, sorted by `createdAt` descending
- Contains up to 10 transactions (5 incomes + 5 expenses max)

**Verification**:
- First transaction has most recent date
- Last transaction has oldest date

---

## 7. EXCEL EXPORT TESTING

### 7.1 Download Income Excel

**Test Case**: Download Income Report as Excel

**Preconditions**: User must be logged in, has incomes

**Request URL**: `http://localhost:8081/api/v1.0/excel/download/income`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected MIME Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Expected File Name**: `income.xlsx` (from `Content-Disposition` header)

**Expected Header**:
```
Content-Disposition: attachment; filename=income.xlsx
```

**Validation Steps**:
1. Save file locally
2. Open with Excel/LibreOffice/Google Sheets
3. Verify columns: Name, Icon, Category, Amount, Date, Created At, Updated At
4. Verify data matches current month incomes from GET `/incomes`

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT

---

### 7.2 Download Expense Excel

**Test Case**: Download Expense Report as Excel

**Preconditions**: User must be logged in, has expenses

**Request URL**: `http://localhost:8081/api/v1.0/excel/download/expense`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected MIME Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Expected File Name**: `expense.xlsx` (from `Content-Disposition` header)

**Expected Header**:
```
Content-Disposition: attachment; filename=expense.xlsx
```

**Validation Steps**:
1. Save file locally
2. Open with Excel/LibreOffice/Google Sheets
3. Verify columns: Name, Icon, Category, Amount, Date, Created At, Updated At
4. Verify data matches current month expenses from GET `/expenses`

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT

---

### 7.3 Email Income Excel Attachment

**Test Case**: Email Income Report to Current User

**Preconditions**: User must be logged in, email service configured

**Request URL**: `http://localhost:8081/api/v1.0/email/income-excel`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**: Empty body or `null`

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `500`: Email service failure

**Email Verification Steps**:
1. Check email inbox of logged-in user
2. Email subject: "Your Income Excel Report"
3. Email body: "Please find attached your income report"
4. Attachment: `income.xlsx`
5. Open attachment and verify data

**Note**: Email delivery may take 1-10 seconds

---

### 7.4 Email Expense Excel Attachment

**Test Case**: Email Expense Report to Current User

**Preconditions**: User must be logged in, email service configured

**Request URL**: `http://localhost:8081/api/v1.0/email/expense-excel`

**HTTP Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**: Empty body or `null`

**Expected Failure Status Codes**:
- `403`: Missing or invalid JWT
- `500`: Email service failure

**Email Verification Steps**:
1. Check email inbox of logged-in user
2. Email subject: "Your Expense Excel Report"
3. Email body: "Please find attached your expense report."
4. Attachment: `expenses.xlsx`
5. Open attachment and verify data

---

### 7.5 Test Email Endpoint

**Test Case**: Send Test Email

**Preconditions**: Email service must be configured

**Request URL**: `http://localhost:8081/api/v1.0/email/test`

**HTTP Method**: `GET`

**Headers**: None required (public endpoint, assumed)

**Request Body**: None

**Expected Success Status**: `200 OK`

**Expected Success Response**:
```
Test email sent successfully to: 93d520002@smtp-brevo.com
```

**Expected Failure Status Codes**:
- `500`: Email service failure

**Verification**:
- Check hardcoded email address for test email
- Subject: "Test Email from Money Manager"
- Body: "This is a test email to verify your email configuration."

**Note**: This endpoint uses a hardcoded recipient address for testing purposes.

---

## 8. NEGATIVE & EDGE CASE TESTING

### 8.1 Missing JWT

**Test Case**: Access Protected Endpoint Without Authorization Header

**Request URL**: `http://localhost:8081/api/v1.0/profile`

**HTTP Method**: `GET`

**Headers**:
```
Content-Type: application/json
```
(No Authorization header)

**Expected Status**: `403 Forbidden` or `401 Unauthorized`

**Expected Behavior**: Access denied

---

### 8.2 Expired JWT

**Test Case**: Use Expired JWT Token

**Prerequisites**: Wait for JWT expiration (if implemented) or manually craft expired token

**Request URL**: Any protected endpoint

**Headers**:
```
Authorization: Bearer <EXPIRED_JWT>
Content-Type: application/json
```

**Expected Status**: `403 Forbidden` or `401 Unauthorized`

**Expected Behavior**: Token validation failure

**Note**: If JWT expiration is not implemented, this test will not fail.

---

### 8.3 Invalid JWT

**Test Case**: Use Malformed JWT

**Request URL**: `http://localhost:8081/api/v1.0/profile`

**Headers**:
```
Authorization: Bearer invalid_token_12345
Content-Type: application/json
```

**Expected Status**: `403 Forbidden` or `401 Unauthorized`

**Expected Behavior**: Token parsing failure

---

### 8.4 Accessing Another User's Data

**Test Case**: Attempt to Update Another User's Category

**Preconditions**: 
- Two users registered (User A and User B)
- User A creates a category with ID 1
- User B logs in

**Request URL**: `http://localhost:8081/api/v1.0/categories/1`

**HTTP Method**: `PUT`

**Headers**:
```
Authorization: Bearer <USER_B_JWT>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Hacked Category",
  "type": "expense"
}
```

**Expected Status**: `403 Forbidden` or `404 Not Found`

**Expected Behavior**: User B cannot modify User A's category

---

### 8.5 Deleting Non-Owned Resource

**Test Case**: Attempt to Delete Another User's Expense

**Preconditions**: 
- Two users registered
- User A creates an expense with ID 1
- User B logs in

**Request URL**: `http://localhost:8081/api/v1.0/expenses/1`

**HTTP Method**: `DELETE`

**Headers**:
```
Authorization: Bearer <USER_B_JWT>
```

**Expected Status**: `403 Forbidden` or `404 Not Found`

**Expected Behavior**: User B cannot delete User A's expense

---

### 8.6 Invalid IDs

**Test Case**: Request Resource with Non-Existent ID

**Request URL**: `http://localhost:8081/api/v1.0/categories/99999`

**HTTP Method**: `PUT`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Test",
  "type": "expense"
}
```

**Expected Status**: `404 Not Found`

**Expected Behavior**: Category not found error

---

### 8.7 Empty Payloads

**Test Case**: Create Category with Empty Body

**Request URL**: `http://localhost:8081/api/v1.0/categories`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{}
```

**Expected Status**: `400 Bad Request`

**Expected Behavior**: Validation error for missing required fields

---

### 8.8 Malformed Payloads

**Test Case**: Create Expense with Invalid Date Format

**Request URL**: `http://localhost:8081/api/v1.0/expenses`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Test Expense",
  "categoryId": 1,
  "amount": 100,
  "date": "08-02-2026"
}
```

**Expected Status**: `400 Bad Request`

**Expected Behavior**: Date parsing error (expected format: `yyyy-MM-dd`)

---

### 8.9 Missing Required Fields

**Test Case**: Create Income Without Amount

**Request URL**: `http://localhost:8081/api/v1.0/incomes`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Test Income",
  "categoryId": 2,
  "date": "2026-02-08"
}
```

**Expected Status**: `400 Bad Request`

**Expected Behavior**: Validation error for missing `amount`

---

### 8.10 Invalid Category Type

**Test Case**: Create Category with Invalid Type

**Request URL**: `http://localhost:8081/api/v1.0/categories`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Test Category",
  "type": "invalid_type"
}
```

**Expected Status**: `400 Bad Request` (assumed)

**Expected Behavior**: Validation error (type must be "income" or "expense")

---

### 8.11 Negative Amount

**Test Case**: Create Expense with Negative Amount

**Request URL**: `http://localhost:8081/api/v1.0/expenses`

**HTTP Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Test Expense",
  "categoryId": 1,
  "amount": -100.00,
  "date": "2026-02-08"
}
```

**Expected Status**: `400 Bad Request` (if validation exists) OR `201 Created` (if no validation)

**Expected Behavior**: Depends on backend validation implementation

**Note**: This test reveals whether negative amounts are validated.

---

### 8.12 Login Before Activation

**Test Case**: Attempt Login with Unactivated Account

**Preconditions**: User registered but not activated

**Request URL**: `http://localhost:8081/api/v1.0/login`

**HTTP Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "johndoe@example.com",
  "password": "SecurePass123"
}
```

**Expected Status**: `403 Forbidden`

**Expected Response**:
```json
{
  "message": "Account is not active. Please activate your account first."
}
```

---

### 8.13 Double Activation

**Test Case**: Activate Already Activated Account

**Preconditions**: Account already activated

**Request URL**: `http://localhost:8081/api/v1.0/activate?token=<USED_TOKEN>`

**HTTP Method**: `GET`

**Expected Status**: `404 Not Found`

**Expected Response**:
```
Activation token not found or already used
```

---

### 8.14 Wrong Password

**Test Case**: Login with Incorrect Password

**Request URL**: `http://localhost:8081/api/v1.0/login`

**HTTP Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "johndoe@example.com",
  "password": "WrongPassword"
}
```

**Expected Status**: `400 Bad Request`

**Expected Response**:
```json
{
  "message": "Bad credentials"
}
```

---

### 8.15 Non-Existent User Login

**Test Case**: Login with Email Not in System

**Request URL**: `http://localhost:8081/api/v1.0/login`

**HTTP Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "nonexistent@example.com",
  "password": "AnyPassword"
}
```

**Expected Status**: `400 Bad Request`

**Expected Response**:
```json
{
  "message": "Bad credentials"
}
```

**Note**: For security, same error as wrong password.

---

## 9. FULL HAPPY-PATH TEST SEQUENCE

This sequence assumes a clean database and tests the complete user journey.

### Step 1: Check Application Health

**URL**: `http://localhost:8081/api/v1.0/status`  
**Method**: `GET`  
**Headers**: None  
**Expected**: `200 OK`, response: `Application is running`

---

### Step 2: Register New User

**URL**: `http://localhost:8081/api/v1.0/register`  
**Method**: `POST`  
**Headers**: `Content-Type: application/json`  
**Body**:
```json
{
  "fullName": "Jane Smith",
  "email": "janesmith@example.com",
  "password": "MySecurePass456"
}
```
**Expected**: `201 Created`  
**Action**: Note the user `id` from response

---

### Step 3: Check Email for Activation Link

**Manual Step**: Open email inbox for `janesmith@example.com`  
**Expected**: Email with subject containing "activation" or similar  
**Action**: Copy the activation token from URL

---

### Step 4: Activate Account

**URL**: `http://localhost:8081/api/v1.0/activate?token=<COPIED_TOKEN>`  
**Method**: `GET`  
**Expected**: `200 OK`, response: `Profile activated successfully`

---

### Step 5: Login

**URL**: `http://localhost:8081/api/v1.0/login`  
**Method**: `POST`  
**Headers**: `Content-Type: application/json`  
**Body**:
```json
{
  "email": "janesmith@example.com",
  "password": "MySecurePass456"
}
```
**Expected**: `200 OK`  
**Action**: Copy the `token` value for subsequent requests

---

### Step 6: Verify Profile Access

**URL**: `http://localhost:8081/api/v1.0/profile`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Expected**: `200 OK`, returns user profile

---

### Step 7: Create Expense Category

**URL**: `http://localhost:8081/api/v1.0/categories`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Body**:
```json
{
  "name": "Food",
  "icon": "🍔",
  "type": "expense"
}
```
**Expected**: `201 Created`  
**Action**: Note the category `id` from response

---

### Step 8: Create Income Category

**URL**: `http://localhost:8081/api/v1.0/categories`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Body**:
```json
{
  "name": "Freelance",
  "icon": "💼",
  "type": "income"
}
```
**Expected**: `201 Created`  
**Action**: Note the category `id` from response

---

### Step 9: Add Income

**URL**: `http://localhost:8081/api/v1.0/incomes`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Body**:
```json
{
  "name": "Website Project",
  "categoryId": <INCOME_CATEGORY_ID>,
  "amount": 1500.00,
  "date": "2026-02-05",
  "icon": "💼"
}
```
**Expected**: `201 Created`  
**Action**: Note the income `id`

---

### Step 10: Add Expense

**URL**: `http://localhost:8081/api/v1.0/expenses`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Body**:
```json
{
  "name": "Lunch at Restaurant",
  "categoryId": <EXPENSE_CATEGORY_ID>,
  "amount": 45.50,
  "date": "2026-02-08",
  "icon": "🍔"
}
```
**Expected**: `201 Created`  
**Action**: Note the expense `id`

---

### Step 11: Get All Categories

**URL**: `http://localhost:8081/api/v1.0/categories`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Expected**: `200 OK`, returns array with 2 categories

---

### Step 12: Get Current Month Incomes

**URL**: `http://localhost:8081/api/v1.0/incomes`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Expected**: `200 OK`, returns array with 1 income

---

### Step 13: Get Current Month Expenses

**URL**: `http://localhost:8081/api/v1.0/expenses`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Expected**: `200 OK`, returns array with 1 expense

---

### Step 14: Filter Expenses by Keyword

**URL**: `http://localhost:8081/api/v1.0/filter`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Body**:
```json
{
  "type": "expense",
  "keyword": "lunch"
}
```
**Expected**: `200 OK`, returns array with matching expense

---

### Step 15: View Dashboard

**URL**: `http://localhost:8081/api/v1.0/dashboard`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Expected**: `200 OK`  
**Verification**:
- `totalIncome`: 1500.00
- `totalExpense`: 45.50
- `totalBalance`: 1454.50
- `recentTransactions` contains both entries

---

### Step 16: Update Category

**URL**: `http://localhost:8081/api/v1.0/categories/<EXPENSE_CATEGORY_ID>`  
**Method**: `PUT`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Body**:
```json
{
  "name": "Dining",
  "icon": "🍽️",
  "type": "expense"
}
```
**Expected**: `200 OK`, returns updated category

---

### Step 17: Export Income Excel

**URL**: `http://localhost:8081/api/v1.0/excel/download/income`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`  
**Expected**: `200 OK`, file download starts  
**Verification**: Open file, verify income data present

---

### Step 18: Export Expense Excel

**URL**: `http://localhost:8081/api/v1.0/excel/download/expense`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`  
**Expected**: `200 OK`, file download starts  
**Verification**: Open file, verify expense data present

---

### Step 19: Email Income Excel

**URL**: `http://localhost:8081/api/v1.0/email/income-excel`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`  
**Expected**: `200 OK`  
**Verification**: Check email inbox for attachment

---

### Step 20: Email Expense Excel

**URL**: `http://localhost:8081/api/v1.0/email/expense-excel`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`  
**Expected**: `200 OK`  
**Verification**: Check email inbox for attachment

---

### Step 21: Delete Expense

**URL**: `http://localhost:8081/api/v1.0/expenses/<EXPENSE_ID>`  
**Method**: `DELETE`  
**Headers**: `Authorization: Bearer <TOKEN>`  
**Expected**: `204 No Content`

---

### Step 22: Delete Income

**URL**: `http://localhost:8081/api/v1.0/incomes/<INCOME_ID>`  
**Method**: `DELETE`  
**Headers**: `Authorization: Bearer <TOKEN>`  
**Expected**: `204 No Content`

---

### Step 23: Verify Dashboard Updated

**URL**: `http://localhost:8081/api/v1.0/dashboard`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`  
**Expected**: `200 OK`  
**Verification**:
- `totalIncome`: 0
- `totalExpense`: 0
- `totalBalance`: 0
- Recent arrays empty

---

## 10. STATUS CODE REFERENCE

| Endpoint | Scenario | Expected Status | Expected Outcome |
|----------|----------|-----------------|------------------|
| `/status`, `/health` | Any request | 200 OK | "Application is running" |
| `/register` | Valid payload | 201 Created | User created, password null in response |
| `/register` | Missing fields | 400 Bad Request | Validation error |
| `/register` | Duplicate email | 409 Conflict (assumed) | Email already exists |
| `/activate` | Valid token | 200 OK | "Profile activated successfully" |
| `/activate` | Invalid/used token | 404 Not Found | "Activation token not found or already used" |
| `/login` | Valid credentials, activated | 200 OK | JWT token returned |
| `/login` | Not activated | 403 Forbidden | "Account is not active..." |
| `/login` | Wrong password | 400 Bad Request | "Bad credentials" |
| `/login` | Non-existent user | 400 Bad Request | "Bad credentials" |
| `/profile` | Valid JWT | 200 OK | User profile returned |
| `/profile` | Missing/invalid JWT | 403 Forbidden | Access denied |
| `/categories` (POST) | Valid payload | 201 Created | Category created |
| `/categories` (POST) | Missing JWT | 403 Forbidden | Access denied |
| `/categories` (POST) | Invalid type | 400 Bad Request | Validation error |
| `/categories` (GET) | Valid JWT | 200 OK | Array of categories (or empty) |
| `/categories/{type}` (GET) | Valid JWT, valid type | 200 OK | Filtered categories |
| `/categories/{id}` (PUT) | Valid JWT, own category | 200 OK | Category updated |
| `/categories/{id}` (PUT) | Invalid ID | 404 Not Found | Category not found |
| `/categories/{id}` (PUT) | Another user's category | 403/404 | Access denied |
| `/expenses` (POST) | Valid payload | 201 Created | Expense created |
| `/expenses` (POST) | Missing required fields | 400 Bad Request | Validation error |
| `/expenses` (POST) | Invalid category | 404 Not Found | Category not found |
| `/expenses` (GET) | Valid JWT | 200 OK | Current month expenses |
| `/expenses/{id}` (DELETE) | Valid JWT, own expense | 204 No Content | Expense deleted |
| `/expenses/{id}` (DELETE) | Invalid ID | 404 Not Found | Expense not found |
| `/incomes` (POST) | Valid payload | 201 Created | Income created |
| `/incomes` (GET) | Valid JWT | 200 OK | Current month incomes |
| `/incomes/{id}` (DELETE) | Valid JWT, own income | 204 No Content | Income deleted |
| `/dashboard` | Valid JWT | 200 OK | Dashboard data with calculations |
| `/filter` (POST) | Valid payload | 200 OK | Filtered results |
| `/filter` (POST) | Invalid type | 400 Bad Request | "Invalid type. Must be 'income' or 'expense'" |
| `/excel/download/income` | Valid JWT | 200 OK | Excel file download |
| `/excel/download/expense` | Valid JWT | 200 OK | Excel file download |
| `/email/income-excel` | Valid JWT | 200 OK | Email sent |
| `/email/expense-excel` | Valid JWT | 200 OK | Email sent |
| `/email/test` | Any request | 200 OK | Test email sent |
| `/email/test` | Email service failure | 500 Internal Server Error | Error message |

---

## VALIDATION CHECKLIST

### Endpoint Coverage
- ✅ `/status`, `/health` - Health check
- ✅ `/register` - User registration
- ✅ `/activate` - Account activation
- ✅ `/login` - User login
- ✅ `/profile` - Get profile
- ✅ `/categories` - Create, get all
- ✅ `/categories/{type}` - Get by type
- ✅ `/categories/{id}` - Update category
- ✅ `/expenses` - Create, get all, delete
- ✅ `/incomes` - Create, get all, delete
- ✅ `/dashboard` - Get dashboard data
- ✅ `/filter` - Filter transactions
- ✅ `/excel/download/income` - Download income Excel
- ✅ `/excel/download/expense` - Download expense Excel
- ✅ `/email/income-excel` - Email income Excel
- ✅ `/email/expense-excel` - Email expense Excel
- ✅ `/email/test` - Test email

### Required Fields Documentation
- ✅ All DTOs documented with required vs optional fields
- ✅ Date format specified (`yyyy-MM-dd`)
- ✅ Category type values specified ("income", "expense")
- ✅ Filter sortField values specified ("date", "amount", "name")
- ✅ Filter sortOrder values specified ("asc", "desc")

### Authentication Documentation
- ✅ JWT requirement explicitly marked for each protected endpoint
- ✅ Public endpoints identified (`/status`, `/health`, `/register`, `/activate`, `/login`)
- ✅ Authorization header format documented (`Bearer <token>`)

### Edge Cases & Negative Tests
- ✅ Missing JWT
- ✅ Invalid JWT
- ✅ Expired JWT (noted as dependent on implementation)
- ✅ Accessing another user's data
- ✅ Invalid IDs
- ✅ Empty payloads
- ✅ Malformed payloads
- ✅ Missing required fields
- ✅ Invalid enum values (type)

### Non-Testable via API
All functionality in this application is testable via API. The following are internal behaviors that cannot be directly tested but are verified through side effects:
- **Password Hashing**: Cannot retrieve plain password, verified by `password: null` in responses
- **JWT Secret**: Cannot be retrieved, verified by successful authentication
- **Email Content**: Verified by checking inbox
- **Database Constraints**: Verified through error responses

---

## NOTES FOR QA ENGINEERS

### Using Postman
1. Create a new Collection named "Money Manager API"
2. Create an environment with variable `base_url` = `http://localhost:8081/api/v1.0`
3. Create an environment variable `jwt_token` to store token after login
4. Use `{{base_url}}` and `{{jwt_token}}` in requests
5. After login, add a test script to auto-save token:
   ```javascript
   pm.environment.set("jwt_token", pm.response.json().token);
   ```

### Using curl (PowerShell)
For POST requests with JSON body:
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}
$body = @{
    name = "Test"
    type = "expense"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/api/v1.0/categories" -Method POST -Headers $headers -Body $body
```

### Date Handling
- Always use ISO-8601 format for dates: `YYYY-MM-DD`
- Server timezone may affect "current month" calculations
- Dashboard and default GET endpoints filter by current calendar month

### Common Issues
- **403 Forbidden**: Check JWT token is included and valid
- **404 Not Found**: Verify resource ID exists and belongs to current user
- **400 Bad Request**: Check JSON syntax and required fields
- **500 Internal Server Error**: Check server logs, often email service issues

### Data Isolation
Each user's data is completely isolated. Two users can have:
- Categories with same names
- Transactions with same IDs (in different user contexts)
- No visibility into each other's data

---

**End of Testing Guide**

