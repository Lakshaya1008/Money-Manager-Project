<p align="center">
  <h1 align="center">💰 Money Manager</h1>
  <p align="center">
    A full-stack personal finance management application
    <br />
    <strong>React 18 + Vite</strong> frontend · <strong>Spring Boot 3.5 + Java 21</strong> backend · <strong>PostgreSQL</strong> database
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.3-green?style=for-the-badge&logo=springboot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render" alt="Render" />
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

---

## 🚀 Live Demo

| | URL |
|---|---|
| 🌐 **Frontend** | [money-manager-project-peach.vercel.app](https://money-manager-project-peach.vercel.app) |
| ⚙️ **Backend API** | [money-manager-project-1-6m2s.onrender.com/api/v1.0](https://money-manager-project-1-6m2s.onrender.com/api/v1.0/health) |

> ⚠️ The backend is hosted on Render's free tier and may take 30–60 seconds to wake up from cold start on first request.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🎯 Overview

Money Manager is a comprehensive personal finance management system. Users can register, verify their email, and immediately begin tracking income and expenses across custom categories. The dashboard gives a real-time financial overview with charts, and reports can be downloaded as Excel files or emailed directly.

**Key design goals:**
- Clean separation between frontend (Vercel) and backend (Render)
- JWT-based stateless authentication
- All API errors return a consistent, human-readable schema
- No sensitive data ever exposed in error responses

---

## ✨ Features

### 🔐 Authentication
- Register with email — account must be activated via email link before login
- JWT-based login with automatic token refresh handling on the frontend
- Forgot password → receive reset link by email (token expires in 1 hour)
- Reset password securely via one-time token

### 📊 Dashboard
- Net balance, total income, and total expense summary cards
- Recent transactions list
- Interactive income vs expense line chart
- Category-based finance breakdown pie chart

### 💵 Income & Expense Management
- Add transactions with amount, category, date, and notes
- Delete entries with confirmation
- Download report as `.xlsx` Excel file
- Email report directly to your registered inbox

### 🗂 Category Management
- Create custom `INCOME` and `EXPENSE` categories with emoji icons
- Edit and delete categories

### 🔍 Transaction Filtering
- Filter by type, category, and date range
- Keyword search across transaction notes

### 👤 Profile Management
- Upload profile photo (Cloudinary) or choose a DiceBear avatar
- Update name and change password via modals

### ⏰ Scheduled Reminders
- Automated daily email reminders at 10 PM and 11 PM IST

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Axios | HTTP client with JWT interceptors |
| Recharts | Charts and data visualization |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |
| Cloudinary | Profile image hosting |
| Moment.js | Date formatting |

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Runtime environment |
| Spring Boot 3.5.3 | Application framework |
| Spring Security 6 | Authentication and authorization |
| Spring Data JPA + Hibernate | ORM and data persistence |
| PostgreSQL 15+ | Primary database |
| JWT (jjwt) | Token-based auth |
| BCrypt | Password hashing |
| Apache POI | Excel file generation |
| Brevo HTTP API | Transactional email delivery |
| Docker | Containerization |

> **Why Brevo HTTP API instead of SMTP?** Render's free tier blocks outbound SMTP port 587. All emails go through Brevo's REST API as a workaround.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│        React Frontend (Vercel)          │
│  Axios → JWT interceptors → API calls   │
└────────────────────┬────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────┐
│      Spring Boot Backend (Render)       │
│                                         │
│  ┌──────────┐  ┌───────────────────┐   │
│  │CORS Filter│→ │  JWT Filter       │   │
│  └──────────┘  └────────┬──────────┘   │
│                          ▼              │
│  ┌──────────────────────────────────┐   │
│  │        REST Controllers          │   │
│  │  /register /login /incomes ...   │   │
│  └──────────────┬───────────────────┘   │
│                 ▼                       │
│  ┌──────────────────────────────────┐   │
│  │         Service Layer            │   │
│  │   Business logic & validation    │   │
│  └──────────────┬───────────────────┘   │
│                 ▼                       │
│  ┌──────────────────────────────────┐   │
│  │      Spring Data JPA             │   │
│  └──────────────┬───────────────────┘   │
└─────────────────┼───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│          PostgreSQL Database            │
│  profile │ categories │ incomes │       │
│  expenses                               │
└─────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
Money-Manager-Project/
├── Frontend/
│   └── moneymanagerwebapp/       # React + Vite application
│       ├── src/
│       │   ├── components/       # Reusable UI components
│       │   ├── pages/            # Route-based pages
│       │   ├── context/          # Global auth state (AppContext)
│       │   ├── hooks/            # Custom React hooks
│       │   └── util/             # API endpoints, Axios config, helpers
│       ├── .env.development
│       ├── .env.production
│       ├── vite.config.js
│       └── package.json
│
└── Backend/
    └── moneymanager/             # Spring Boot application
        ├── src/main/java/in/bushansirgur/moneymanager/
        │   ├── config/           # Security, CORS, exception handler
        │   ├── controller/       # REST endpoints
        │   ├── service/          # Business logic
        │   ├── repository/       # JPA repositories
        │   ├── entity/           # DB table mappings
        │   ├── dto/              # Request/response shapes
        │   ├── exception/        # Custom exception classes
        │   ├── security/         # JWT filter, auth entry point
        │   └── util/             # JwtUtil
        ├── src/main/resources/
        │   ├── application.properties
        │   └── application-prod.properties
        ├── Dockerfile
        └── pom.xml
```

---

## ⚙️ Getting Started

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.9+ (or use `./mvnw`)

### 1. Clone

```bash
git clone https://github.com/Lakshaya1008/Money-Manager-Project.git
cd Money-Manager-Project
```

### 2. Database Setup

```sql
CREATE DATABASE moneymanager;
CREATE USER moneymanager_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE moneymanager TO moneymanager_user;
\c moneymanager
GRANT ALL ON SCHEMA public TO moneymanager_user;
```

### 3. Backend

```bash
cd Backend/moneymanager

# Set environment variables (see table below)
# then run:
./mvnw spring-boot:run
```

Backend starts at `http://localhost:8081`

### 4. Frontend

```bash
cd Frontend/moneymanagerwebapp

# Create .env.development
echo "VITE_API_BASE_URL=http://localhost:8081/api/v1.0" > .env.development
echo "VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name" >> .env.development

npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | ✅ | Database username |
| `DATABASE_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | Signing secret (min 32 chars). Generate: `openssl rand -base64 32` |
| `JWT_EXPIRATION_HOURS` | ❌ | Token validity in hours (default: `10`) |
| `BREVO_API_KEY` | ✅ | Brevo REST API key (`xkeysib-...`) |
| `BREVO_SENDER_EMAIL` | ✅ | Verified sender email in Brevo |
| `BREVO_SENDER_NAME` | ❌ | Sender display name (default: `Money Manager`) |
| `EMAIL_USE_API` | ❌ | Set `true` on Render (SMTP is blocked on free tier) |
| `CORS_ALLOWED_ORIGINS` | ✅ | Comma-separated frontend origins |
| `FRONTEND_URL` | ✅ | Frontend URL for email links |
| `ACTIVATION_BASE_URL` | ✅ | Backend base URL for activation and reset links |
| `JPA_DDL_AUTO` | ❌ | Hibernate DDL mode — use `update` locally, `validate` in prod |

### Frontend

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_BASE_URL` | ✅ | Backend API URL ending with `/api/v1.0` |
| `VITE_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name for profile image uploads |

> ⚠️ Never commit `.env` files. Both are already in `.gitignore`.

---

## 📚 API Reference

**Base URL:** `/api/v1.0`

### Public Endpoints

| Method | Endpoint | Description |
|:---:|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/register` | Create account |
| `GET` | `/activate?token=xxx` | Activate account via email |
| `POST` | `/login` | Login and receive JWT |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Reset password with token |

### Protected Endpoints *(Bearer token required)*

| Method | Endpoint | Description |
|:---:|---|---|
| `GET` | `/profile` | Get current user |
| `PUT` | `/profile/update-name` | Update name |
| `PUT` | `/profile/change-password` | Change password |
| `GET/POST/PUT/DELETE` | `/categories` | Manage categories |
| `GET/POST/DELETE` | `/incomes` | Manage income entries |
| `GET/POST/DELETE` | `/expenses` | Manage expense entries |
| `GET` | `/dashboard` | Summary + recent transactions |
| `POST` | `/filter` | Filter transactions |
| `GET` | `/excel/download/income` | Download income as `.xlsx` |
| `GET` | `/excel/download/expense` | Download expenses as `.xlsx` |
| `GET` | `/email/income-excel` | Email income report |
| `GET` | `/email/expense-excel` | Email expense report |

### Error Response Format

All errors follow this consistent structure:

```json
{
  "timestamp": "2026-01-01T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Human-readable description of what went wrong"
}
```

---

## 🔒 Security

| Measure | How |
|---|---|
| Password storage | BCrypt hashing — never returned in any response |
| Authentication | Stateless JWT — no server-side sessions |
| Authorization | All queries scoped to the authenticated user's ID |
| CORS | Configurable allowed origins whitelist |
| SQL injection | Prevented by Spring Data JPA parameterized queries |
| Error exposure | Generic messages only — no stack traces in production |
| Email enumeration | Forgot-password always returns success regardless of email existence |
| Account activation | Email verification required before first login |

---

## 🚢 Deployment

### Backend → Render

1. Push to GitHub — Render auto-redeploys on `main`
2. Set all backend environment variables in Render → Environment
3. Important: set `EMAIL_USE_API=true` (SMTP port 587 is blocked on free tier)
4. Set `JPA_DDL_AUTO=update` to safely apply schema changes without data loss

### Frontend → Vercel

1. Import repository at [vercel.com](https://vercel.com)
2. Set environment variables:
   - `VITE_API_BASE_URL` → `https://your-backend.onrender.com/api/v1.0`
   - `VITE_CLOUDINARY_CLOUD_NAME` → your Cloudinary cloud name
3. Vercel auto-deploys on every push to `main`

### Docker (Backend)

```bash
cd Backend/moneymanager
docker build -t money-manager:latest .
docker run -d -p 8081:8081 --env-file .env money-manager:latest
```

---

## 📄 License

This project is built for educational and demonstration purposes.

---

<p align="center">
  Built with ❤️ using Spring Boot and React
  <br />
  <a href="#-money-manager">Back to Top ↑</a>
</p>
