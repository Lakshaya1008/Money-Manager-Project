# 💰 Money Manager — Frontend

A modern, full-featured personal finance web application built with **React 18**, **Vite**, and **Tailwind CSS**.

Track income and expenses, manage categories, visualize financial trends, and export reports — all within a clean, responsive, and intuitive UI.

---

## 🚀 Live Demo

[money-manager-project-peach.vercel.app](https://money-manager-project-peach.vercel.app)

---

## ✨ Features

### 🔐 Authentication & Security
- Sign up with first name, last name, email, and password
- Email activation — account must be verified before login
- JWT-based session management with auto-logout on token expiry
- **Forgot Password** — receive a secure reset link via email
- **Reset Password** — token-based password reset (expires in 1 hour)
- Protected routes with automatic redirect to login

### 📊 Dashboard & Insights
- Real-time balance overview with total income, expenses, and net balance
- Recent transactions snapshot
- Interactive income vs expense line chart
- Finance breakdown pie chart by category

### 💵 Income & Expense Management
- Add, view, and delete income and expense entries
- Categorize transactions with custom emoji categories
- Download reports as Excel
- Email reports directly to your registered email

### 🗂 Category Management
- Create custom income and expense categories with emoji icons
- Edit and delete categories with confirmation dialog

### 🔍 Transaction Filters
- Filter by type (income / expense), category, and date range
- Results display with clear visual indicators (color + arrow direction)

### 👤 Profile Management
- View profile with avatar, name, email, and member-since date
- Upload a photo or choose a DiceBear avatar
- Update name and change password via modal popups

### 📱 Responsive UI
- Mobile-first design
- Desktop-optimized sidebar layout
- Modern UI powered by Tailwind CSS and Lucide Icons

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| State Management | React Context API |
| Charts | Recharts |
| Date Handling | Moment.js |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Media Upload | Cloudinary |
| Emoji Picker | emoji-picker-react |

---

## 📁 Project Structure

```
src/
├── assets/               # Static assets (images, icons)
├── components/           # Reusable UI components
│   ├── Dashboard.jsx         # Layout wrapper for protected pages
│   ├── Sidebar.jsx           # Navigation sidebar
│   ├── Header.jsx            # Public page header/navbar
│   ├── Modal.jsx             # Reusable modal wrapper
│   ├── Input.jsx             # Styled input with password toggle
│   ├── InfoCard.jsx          # Summary stat card
│   ├── TransactionInfoCard.jsx
│   ├── IncomeList.jsx / ExpenseList.jsx / CategoryList.jsx
│   ├── RecentTransactions.jsx
│   ├── IncomeOverview.jsx / ExpenseOverview.jsx / FinanceOverview.jsx
│   ├── CustomLineChart.jsx / CustomPieChart.jsx
│   ├── ProfilePhotoSelector.jsx
│   ├── AddIncomeForm.jsx / AddExpenseForm.jsx / AddCategoryForm.jsx
│   └── DeleteAlert.jsx
├── context/
│   └── AppContext.jsx         # Global auth state (user, token, login, logout)
├── hooks/
│   └── useUser.jsx            # Fetches and syncs current user on protected pages
├── pages/
│   ├── LandingPage.jsx        # Public marketing/landing page
│   ├── Login.jsx              # Login form with forgot password link
│   ├── Signup.jsx             # Registration with first + last name fields
│   ├── Activate.jsx           # Email activation handler
│   ├── ForgotPassword.jsx     # Request password reset email
│   ├── ResetPassword.jsx      # Set new password via reset token from email
│   ├── Home.jsx               # Dashboard with charts and summaries
│   ├── Income.jsx             # Income management page
│   ├── Expense.jsx            # Expense management page
│   ├── Category.jsx           # Category management page
│   ├── Filter.jsx             # Transaction filter and search
│   └── Profile.jsx            # Profile view and edit page
├── util/
│   ├── apiEndpoints.js        # All API URL constants (single source of truth)
│   ├── axiosConfig.jsx        # Axios instance with JWT request/response interceptors
│   ├── uploadProfileImage.js  # Cloudinary image upload helper
│   ├── validation.js          # Email and form validation helpers
│   └── backendWakeUp.js       # Render cold-start wake-up utility
├── App.jsx                    # Route definitions (public, auth-only, protected)
└── main.jsx                   # Application entry point
```

---

## 🔒 API & Backend Integration

- Versioned REST API base: `/api/v1.0`
- JWT Authorization header on all protected requests:
  ```
  Authorization: Bearer <token>
  ```
- Consistent backend error response schema:
  ```json
  {
    "status": 400,
    "errorCode": "VALIDATION_ERROR",
    "message": "Readable error message"
  }
  ```
- Token error codes handled automatically by Axios interceptor:
  - `AUTH_TOKEN_MISSING` / `AUTH_TOKEN_INVALID` / `AUTH_TOKEN_EXPIRED` → clears storage and redirects to login

---

## 🔐 Route Protection

| Route | Type | Behaviour |
|---|---|---|
| `/home` | Public | Always accessible |
| `/login`, `/signup` | Auth only | Redirects to dashboard if already logged in |
| `/forgot-password`, `/reset-password` | Public | Always accessible |
| `/activate` | Public | Always accessible |
| `/dashboard`, `/income`, `/expense`, `/category`, `/filter`, `/profile` | Protected | Redirects to login if not authenticated |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- npm
- Backend API running (see [Backend Repository](https://github.com/Lakshaya1008/Money-Manager-Project/tree/main/Backend/moneymanager))

### Installation

```bash
# Clone the repository
git clone https://github.com/Lakshaya1008/Money-Manager-Project.git
cd money-manager-frontend

# Install dependencies
npm install

# Start development server
npm run dev

Production Build
# Build for production
npm run build

# Preview production build
npm run preview
