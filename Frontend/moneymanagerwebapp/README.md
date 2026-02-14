# 💰 Money Manager Web App

A modern, full-featured personal finance management web application built with **React 18**, **Vite**, and **Tailwind CSS**.

Track income and expenses, manage categories, visualize financial trends, and export reports — all within a clean, responsive, and intuitive UI.

---

## 🚀 Features

### 🔐 Authentication & Security
- Secure user registration and login
- JWT-based authentication (Bearer Token)
- Protected routes with token validation
- Standardized backend error handling

### 📊 Dashboard & Insights
- Real-time balance overview
- Total income & expense summary
- Recent transactions snapshot
- Interactive charts for financial trends

### 💵 Income & Expense Management
- Add, view, and delete transactions
- Categorize transactions
- Date-based and keyword filtering
- Sorting and advanced filtering controls

### 🗂 Category Management
- Create custom categories
- Update & manage existing categories
- Clean separation of income/expense categories

### 📈 Data Visualization
- Interactive financial charts (Recharts)
- Category-based spending breakdown
- Time-based income/expense analysis

### 📤 Reports & Export
- Download income/expense data as Excel (CSV)
- Email report generation
- Cleanly formatted export structure

### 👤 Profile Management
- Update user details
- Upload & manage profile image (Cloudinary integration)

### 📱 Responsive UI
- Mobile-first design
- Desktop-optimized layout
- Modern UI powered by Tailwind CSS & Lucide Icons

---

## 🛠 Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| HTTP Client | Axios |
| State Management | React Context API |
| Charts | Recharts |
| Date Handling | Moment.js |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Media Upload | Cloudinary |
| Linting | ESLint |

---

## 📁 Project Structure

moneymanagerwebapp/
├── public/
├── src/
│ ├── assets/ # Static assets
│ ├── components/ # Reusable UI components
│ ├── context/ # Global state (Auth, etc.)
│ ├── hooks/ # Custom React hooks
│ ├── pages/ # Route-based pages
│ ├── util/ # API config & helper utilities
│ ├── App.jsx # Root component
│ ├── main.jsx # Application entry point
│ └── index.css # Global styles
├── package.json
├── vite.config.js
└── README.md

---

## 🔒 API & Backend Integration

- Versioned REST API (`/api/v1.0`)
- Strict API contract compliance
- JWT Authorization header:
Authorization: Bearer <token>
- Consistent error schema:
- {
  "errorCode": "STRING_CODE",
  "message": "Readable error message"
  }
-
The frontend strictly follows the backend API contract to avoid integration drift.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

VITE_API_BASE_URL=http://localhost:8081/api/v1.0

VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name

📊 Core Pages

Landing Page – Product introduction & features overview

Dashboard – Financial summary + charts

Income Page – Manage income records

Expense Page – Manage expense records

Category Page – Category management

Filter Page – Advanced transaction filtering

Login / Signup – Secure authentication

Profile Page – User profile & image management

🧩 Architecture Highlights

Modular component structure

Context-driven authentication state

Centralized API configuration

Strict separation of UI, business logic, and API layer

Scalable folder structure for future growth

📦 Scripts
Command	Description
npm run dev	Start development server
npm run build	Create production build
npm run preview	Preview production build
npm run lint	Run ESLint
📄 License

This project is built for educational and demonstration purposes.

🙌 Acknowledgements

React

Vite

Tailwind CSS

Recharts

Lucide Icons

Cloudinary
## 🧑‍💻 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

Production Build
# Build for production
npm run build

# Preview production build
npm run preview
