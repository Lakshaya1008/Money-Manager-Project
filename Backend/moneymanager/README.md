<p align="center">
  <h1 align="center">💰 Money Manager API</h1>
  <p align="center">
    A powerful, production-ready RESTful API for personal finance management
    <br />
    Built with Spring Boot 3.5 • Java 21 • PostgreSQL
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.3-green?style=for-the-badge&logo=springboot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render" alt="Render" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Docker Deployment](#-docker-deployment)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [License](#-license)

---

## 🎯 Overview

Money Manager is a comprehensive personal finance management system that helps users:
- Track income and expenses with detailed categorization
- Visualize financial data through a dashboard
- Export reports to Excel
- Receive daily email summaries and reminders
- Reset passwords securely via email

The API is designed with security, scalability, and clean architecture principles in mind.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based stateless auth with email account activation |
| 💵 **Income Tracking** | Record, categorize, and analyze all income sources |
| 💳 **Expense Management** | Track expenses with custom categories and icons |
| 📁 **Custom Categories** | Create personalized `INCOME` / `EXPENSE` categories |
| 📊 **Dashboard** | Real-time financial overview with recent transactions |
| 🔍 **Advanced Filtering** | Filter by date range, keyword, with sorting options |
| 📧 **Email Reports** | Send Excel reports directly to your inbox via Brevo |
| 📥 **Excel Export** | Download financial data as `.xlsx` spreadsheets |
| ⏰ **Daily Reminders** | Automated email notifications at 10 PM & 11 PM IST |
| 🔑 **Password Reset** | Secure forgot/reset password flow via email token |
| 🐳 **Docker Ready** | Production-hardened containerization |

---

## 🛠 Tech Stack

### Core
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 (LTS) | Runtime environment |
| Spring Boot | 3.5.3 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | Data persistence layer |
| Hibernate | 6.x | ORM framework |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| PostgreSQL 15+ | Primary database |
| HikariCP | Connection pooling |

### Security & Auth
| Technology | Purpose |
|------------|---------|
| JWT (jjwt 0.11.5) | Token-based authentication |
| BCrypt | Password hashing |

### Utilities
| Technology | Purpose |
|------------|---------|
| Apache POI 5.2.5 | Excel file generation |
| Lombok | Boilerplate reduction |
| Brevo HTTP API | Transactional email delivery |

### DevOps
| Technology | Purpose |
|------------|---------|
| Maven | Build automation |
| Docker | Containerization |
| Render | Cloud deployment |

> **Note on Email:** This project uses the **Brevo HTTP API** (not SMTP) because Render's free tier blocks outbound SMTP port 587. All transactional emails go through Brevo's REST API.

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                          │
│                    React / Vue / Angular / Mobile                  │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ HTTP/HTTPS
┌────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐   │
│  │  CORS Filter     │→ │  JWT Filter      │→ │  Auth Entry    │   │
│  │  (Configurable)  │  │  (Token Valid.)  │  │  Point         │   │
│  └──────────────────┘  └──────────────────┘  └────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                      REST CONTROLLERS                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │   Home     │ │  Profile   │ │   Income   │ │  Expense   │      │
│  │ /health    │ │ /register  │ │ /incomes   │ │ /expenses  │      │
│  │ /status    │ │ /login     │ │            │ │            │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │  Category  │ │ Dashboard  │ │   Filter   │ │   Email    │      │
│  │/categories │ │ /dashboard │ │  /filter   │ │  /email    │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                                │
│         Business Logic • Validation • Transaction Management       │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                     REPOSITORY LAYER                               │
│                    Spring Data JPA Repositories                    │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL DATABASE                           │
│       profile │ tbl_categories │ tbl_incomes │ tbl_expenses        │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- ☕ Java 21 or higher
- 🐘 PostgreSQL 15+
- 📦 Maven 3.9+ (or use included wrapper)
- 🐳 Docker (optional)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/money-manager.git
cd money-manager/Backend/moneymanager
```

### 2️⃣ Create Database

```sql
CREATE DATABASE moneymanager;
CREATE USER moneymanager_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE moneymanager TO moneymanager_user;
\c moneymanager
GRANT ALL ON SCHEMA public TO moneymanager_user;
```

### 3️⃣ Configure Environment Variables

<details>
<summary>🐧 Linux / macOS</summary>

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/moneymanager
export DATABASE_USERNAME=moneymanager_user
export DATABASE_PASSWORD=your_secure_password
export JWT_SECRET=$(openssl rand -base64 32)
export BREVO_API_KEY=xkeysib-your-brevo-api-key
export BREVO_SENDER_EMAIL=noreply@yourdomain.com
export CORS_ALLOWED_ORIGINS=http://localhost:5173
export FRONTEND_URL=http://localhost:5173
export ACTIVATION_BASE_URL=http://localhost:8081
```
</details>

<details>
<summary>🪟 Windows PowerShell</summary>

```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/moneymanager"
$env:DATABASE_USERNAME="moneymanager_user"
$env:DATABASE_PASSWORD="your_secure_password"
$env:JWT_SECRET="your-32-character-or-longer-secret-key"
$env:BREVO_API_KEY="xkeysib-your-brevo-api-key"
$env:BREVO_SENDER_EMAIL="noreply@yourdomain.com"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
$env:FRONTEND_URL="http://localhost:5173"
$env:ACTIVATION_BASE_URL="http://localhost:8081"
```
</details>

### 4️⃣ Build and Run

```bash
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

### 5️⃣ Verify Installation

```bash
curl http://localhost:8081/api/v1.0/health
# Expected: "Application is running"
```

🎉 **The API is now running at `http://localhost:8081/api/v1.0`**

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| **Database** ||||
| `DATABASE_URL` | ✅ | — | PostgreSQL JDBC connection URL |
| `DATABASE_USERNAME` | ✅ | — | Database username |
| `DATABASE_PASSWORD` | ✅ | — | Database password |
| `DB_POOL_SIZE` | ❌ | `10` | Maximum connection pool size |
| `DB_MIN_IDLE` | ❌ | `5` | Minimum idle connections |
| `JPA_DDL_AUTO` | ❌ | `validate` | Hibernate schema mode — use `validate` in production |
| **JWT** ||||
| `JWT_SECRET` | ✅ | — | Signing secret (min 32 chars). Generate: `openssl rand -base64 32` |
| `JWT_EXPIRATION_HOURS` | ❌ | `10` | Token validity in hours |
| **Email — Brevo HTTP API** ||||
| `BREVO_API_KEY` | ✅ | — | Brevo API key (`xkeysib-...`) from your Brevo dashboard |
| `BREVO_SENDER_EMAIL` | ✅ | — | Verified sender email in Brevo |
| `BREVO_SENDER_NAME` | ❌ | `Money Manager` | Display name on outgoing emails |
| `EMAIL_USE_API` | ❌ | `true` (prod) | Must be `true` on Render (SMTP port 587 is blocked) |
| **Application URLs** ||||
| `CORS_ALLOWED_ORIGINS` | ✅ | — | Comma-separated frontend origins (e.g. `https://yourapp.com`) |
| `FRONTEND_URL` | ✅ | — | Frontend URL used in notification email links |
| `ACTIVATION_BASE_URL` | ✅ | — | Base URL for account activation and password reset links |
| **Server** ||||
| `SERVER_PORT` | ❌ | `8081` | Application port |
| `LOG_LEVEL_ROOT` | ❌ | `INFO` | Root logging level |
| `LOG_LEVEL_APP` | ❌ | `INFO` | Application logging level |

---

## 📚 API Reference

**Base URL:** `https://your-api.render.com/api/v1.0`

### Public Endpoints (no token required)

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/status` | Status check |
| `POST` | `/register` | Register a new account |
| `GET` | `/activate?token=xxx` | Activate account via email link |
| `POST` | `/login` | Login and receive JWT token |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Reset password using token |

### Protected Endpoints (Bearer token required)

| Method | Endpoint | Description |
|:------:|----------|-------------|
| **Profile** |||
| `GET` | `/profile` | Get current user profile |
| `PUT` | `/profile` | Update profile |
| `PUT` | `/profile/update-name` | Update display name |
| `PUT` | `/profile/change-password` | Change password |
| **Categories** |||
| `GET` | `/categories` | Get all categories |
| `GET` | `/categories/{type}` | Get by type (`INCOME` or `EXPENSE`) |
| `POST` | `/categories` | Create category |
| `PUT` | `/categories/{id}` | Update category |
| `DELETE` | `/categories/{id}` | Delete category |
| **Income** |||
| `GET` | `/incomes` | Get current month incomes |
| `POST` | `/incomes` | Add income |
| `DELETE` | `/incomes/{id}` | Delete income |
| **Expenses** |||
| `GET` | `/expenses` | Get current month expenses |
| `POST` | `/expenses` | Add expense |
| `DELETE` | `/expenses/{id}` | Delete expense |
| **Dashboard & Reports** |||
| `GET` | `/dashboard` | Total balance, income, expenses + recent transactions |
| `POST` | `/filter` | Filter transactions by date, keyword, sort |
| `GET` | `/excel/download/income` | Download income as `.xlsx` |
| `GET` | `/excel/download/expense` | Download expenses as `.xlsx` |
| `GET` | `/email/income-excel` | Email income report to logged-in user |
| `GET` | `/email/expense-excel` | Email expense report to logged-in user |
| `GET` | `/email/test` | Send a test email |

### Example Requests

<details>
<summary>📝 Register User</summary>

```bash
curl -X POST https://your-api.render.com/api/v1.0/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securePass123"
  }'
```
</details>

<details>
<summary>🔑 Login</summary>

```bash
curl -X POST https://your-api.render.com/api/v1.0/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePass123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "profileImageUrl": null,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-01T10:00:00"
}
```
</details>

<details>
<summary>💵 Add Income</summary>

```bash
curl -X POST https://your-api.render.com/api/v1.0/incomes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Monthly Salary",
    "amount": 5000.00,
    "categoryId": 1,
    "date": "2026-02-01",
    "icon": "💰"
  }'
```
</details>

<details>
<summary>🔍 Filter Transactions</summary>

```bash
curl -X POST https://your-api.render.com/api/v1.0/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "expense",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "keyword": "food",
    "sortField": "amount",
    "sortOrder": "desc"
  }'
```
</details>

### Error Response Format

All errors follow a consistent structure:

```json
{
  "timestamp": "2026-01-01T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed for field 'email': Email is required"
}
```

---

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t money-manager:latest .
```

### Run Container

```bash
docker run -d \
  --name money-manager \
  -p 8081:8081 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/moneymanager \
  -e DATABASE_USERNAME=your_username \
  -e DATABASE_PASSWORD=your_password \
  -e JWT_SECRET=your_32_char_secret_key_here \
  -e BREVO_API_KEY=xkeysib-your-api-key \
  -e BREVO_SENDER_EMAIL=noreply@yourapp.com \
  -e EMAIL_USE_API=true \
  -e CORS_ALLOWED_ORIGINS=https://your-frontend.com \
  -e FRONTEND_URL=https://your-frontend.com \
  -e ACTIVATION_BASE_URL=https://api.your-domain.com \
  money-manager:latest
```

### Using Environment File

```bash
docker run -d \
  --name money-manager \
  -p 8081:8081 \
  --env-file .env \
  money-manager:latest
```

### Health Check

```bash
# Check container status
docker ps

# Check health
docker inspect --format='{{.State.Health.Status}}' money-manager

# View logs
docker logs -f money-manager
```

---

## 📁 Project Structure

```
moneymanager/
├── src/
│   ├── main/
│   │   ├── java/in/bushansirgur/moneymanager/
│   │   │   ├── MoneymanagerApplication.java    # Entry point
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java         # CORS, JWT filter chain
│   │   │   │   ├── GlobalExceptionHandler.java # Unified error responses
│   │   │   │   └── FlexibleLocalDateTimeDeserializer.java
│   │   │   ├── controller/                     # REST endpoints
│   │   │   │   ├── ProfileController.java      # Auth & profile
│   │   │   │   ├── IncomeController.java
│   │   │   │   ├── ExpenseController.java
│   │   │   │   ├── CategoryController.java
│   │   │   │   ├── DashboardController.java
│   │   │   │   ├── FilterController.java
│   │   │   │   ├── EmailController.java
│   │   │   │   └── ExcelController.java
│   │   │   ├── service/                        # Business logic
│   │   │   ├── repository/                     # DB queries (Spring Data JPA)
│   │   │   ├── entity/                         # JPA table mappings
│   │   │   ├── dto/                            # Request / response shapes
│   │   │   ├── exception/                      # Custom exception classes
│   │   │   ├── security/                       # JWT filter, auth entry point
│   │   │   └── util/                           # JwtUtil
│   │   └── resources/
│   │       ├── application.properties          # Base config
│   │       └── application-prod.properties     # Production overrides
│   └── test/                                   # Unit tests
├── Dockerfile
├── pom.xml
└── README.md
```

---

## 🔒 Security

### Implemented Measures

| Measure | Implementation |
|---------|----------------|
| 🔑 Authentication | JWT tokens (stateless, no server-side sessions) |
| 🔐 Password Storage | BCrypt hashing — never stored or returned in plain text |
| 🌐 CORS | Configurable allowed origins whitelist |
| 🛡️ SQL Injection | Prevented by parameterized JPA queries |
| 📝 Input Validation | Server-side validation on all inputs |
| 🚫 Error Exposure | Generic messages — no stack traces in production |
| 👤 Data Isolation | All queries scoped to the authenticated user's ID |
| 📧 Email Enumeration | Forgot-password never reveals if an email exists |
| ✅ Account Activation | Users must verify email before login is allowed |

### Recommendations

1. **Generate a strong JWT secret:**
   ```bash
   openssl rand -base64 32
   ```
2. **Use HTTPS in production** — terminate SSL at your reverse proxy or Render
3. **Never commit secrets** — use environment variables or a secrets manager
4. **Keep `JPA_DDL_AUTO=validate`** in production to prevent accidental schema changes

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ using Spring Boot
  <br />
  <a href="#-money-manager-api">Back to Top ↑</a>
</p>
