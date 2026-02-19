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

The API is designed with security, scalability, and clean architecture principles in mind.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based stateless authentication with email verification |
| 💵 **Income Tracking** | Record, categorize, and analyze all income sources |
| 💳 **Expense Management** | Track expenses with custom categories and icons |
| 📁 **Custom Categories** | Create personalized INCOME/EXPENSE categories |
| 📊 **Dashboard** | Real-time financial overview with recent transactions |
| 🔍 **Advanced Filtering** | Filter by date range, keyword, with sorting options |
| 📧 **Email Reports** | Send Excel reports directly to your inbox |
| 📥 **Excel Export** | Download financial data as Excel spreadsheets |
| ⏰ **Daily Reminders** | Automated email notifications (configurable) |
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
| Jakarta Mail | Email services |

### DevOps
| Technology | Purpose |
|------------|---------|
| Maven | Build automation |
| Docker | Containerization |

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
│  │  (Configurable)  │  │  (Token Valid)   │  │  Point         │   │
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
│    tbl_profiles │ tbl_categories │ tbl_incomes │ tbl_expenses     │
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
-- Connect to PostgreSQL and run:
CREATE DATABASE moneymanager;
CREATE USER moneymanager_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE moneymanager TO moneymanager_user;

-- Connect to the new database and grant schema permissions:
\c moneymanager
GRANT ALL ON SCHEMA public TO moneymanager_user;
```

### 3️⃣ Configure Environment Variables

**Option A: Using .env file (Recommended)**
```bash
cp .env.example .env
# Edit .env with your values
```

**Option B: Export directly**

<details>
<summary>🐧 Linux / macOS</summary>

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/moneymanager
export DATABASE_USERNAME=moneymanager_user
export DATABASE_PASSWORD=your_secure_password
export JWT_SECRET=$(openssl rand -base64 32)
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=your_email@gmail.com
export MAIL_PASSWORD=your_app_password
export MAIL_FROM=noreply@moneymanager.app
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
$env:JWT_SECRET="your_32_character_or_longer_secret_key_here"
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="your_email@gmail.com"
$env:MAIL_PASSWORD="your_app_password"
$env:MAIL_FROM="noreply@moneymanager.app"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
$env:FRONTEND_URL="http://localhost:5173"
$env:ACTIVATION_BASE_URL="http://localhost:8081"
```
</details>

### 4️⃣ Build and Run

```bash
# Build the project
./mvnw clean install -DskipTests

# Run the application
./mvnw spring-boot:run
```

### 5️⃣ Verify Installation

```bash
curl http://localhost:8081/api/v1.0/health
# Expected response: "Application is running"
```

🎉 **The API is now running at `http://localhost:8081/api/v1.0`**

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| **Database** ||||
| `DATABASE_URL` | ✅ | - | PostgreSQL JDBC connection URL |
| `DATABASE_USERNAME` | ✅ | - | Database username |
| `DATABASE_PASSWORD` | ✅ | - | Database password |
| `DB_POOL_SIZE` | ❌ | `10` | Maximum connection pool size |
| `DB_MIN_IDLE` | ❌ | `5` | Minimum idle connections |
| **JWT** ||||
| `JWT_SECRET` | ✅ | - | Secret key (min 32 chars, use `openssl rand -base64 32`) |
| `JWT_EXPIRATION_HOURS` | ❌ | `10` | Token validity in hours |
| **Email (SMTP)** ||||
| `MAIL_HOST` | ✅ | - | SMTP server (e.g., `smtp.gmail.com`) |
| `MAIL_PORT` | ❌ | `587` | SMTP port |
| `MAIL_USERNAME` | ✅ | - | SMTP username/email |
| `MAIL_PASSWORD` | ✅ | - | SMTP password or app password |
| `MAIL_FROM` | ✅ | - | Sender email address |
| **Application** ||||
| `SERVER_PORT` | ❌ | `8081` | Application port |
| `CORS_ALLOWED_ORIGINS` | ✅ | - | Comma-separated allowed origins |
| `FRONTEND_URL` | ✅ | - | Frontend app URL (for email links) |
| `ACTIVATION_BASE_URL` | ✅ | - | Backend URL (for activation links) |
| **Logging** ||||
| `LOG_LEVEL_ROOT` | ❌ | `INFO` | Root logging level |
| `LOG_LEVEL_APP` | ❌ | `INFO` | Application logging level |

---

## 📚 API Reference

**Base URL:** `http://localhost:8081/api/v1.0`

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|:------:|----------|:----:|-------------|
| `GET` | `/health` | ❌ | Health check |
| `POST` | `/register` | ❌ | Register new user |
| `GET` | `/activate?token=xxx` | ❌ | Activate account |
| `POST` | `/login` | ❌ | Login & get JWT |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/profile` | Get current user profile |
| **Categories** ||
| `POST` | `/categories` | Create category |
| `GET` | `/categories` | Get all categories |
| `GET` | `/categories/{type}` | Get by type (INCOME/EXPENSE) |
| `PUT` | `/categories/{id}` | Update category |
| `DELETE` | `/categories/{id}` | Delete category |
| **Income** ||
| `POST` | `/incomes` | Add income |
| `GET` | `/incomes` | Get current month incomes |
| `DELETE` | `/incomes/{id}` | Delete income |
| **Expenses** ||
| `POST` | `/expenses` | Add expense |
| `GET` | `/expenses` | Get current month expenses |
| `DELETE` | `/expenses/{id}` | Delete expense |
| **Dashboard & Reports** ||
| `GET` | `/dashboard` | Get financial overview |
| `POST` | `/filter` | Filter transactions |
| `GET` | `/excel/download/income` | Download income Excel |
| `GET` | `/excel/download/expense` | Download expense Excel |
| `GET` | `/email/income-excel` | Email income report |
| `GET` | `/email/expense-excel` | Email expense report |

### Example Requests

<details>
<summary>📝 Register User</summary>

```bash
curl -X POST http://localhost:8081/api/v1.0/register \
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
curl -X POST http://localhost:8081/api/v1.0/login \
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
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```
</details>

<details>
<summary>💵 Add Income (Authenticated)</summary>

```bash
curl -X POST http://localhost:8081/api/v1.0/incomes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Monthly Salary",
    "amount": 5000.00,
    "categoryId": 1,
    "date": "2026-02-14",
    "icon": "💰"
  }'
```
</details>

<details>
<summary>🔍 Filter Transactions</summary>

```bash
curl -X POST http://localhost:8081/api/v1.0/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "expense",
    "startDate": "2026-01-01",
    "endDate": "2026-02-14",
    "keyword": "grocery",
    "sortField": "amount",
    "sortOrder": "desc"
  }'
```
</details>

> 📖 **Full API Documentation:** See [API_CONTRACT.md](postman/API_CONTRACT.md) for complete request/response examples.

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
  -e MAIL_HOST=smtp.gmail.com \
  -e MAIL_PORT=587 \
  -e MAIL_USERNAME=your_email@gmail.com \
  -e MAIL_PASSWORD=your_app_password \
  -e MAIL_FROM=noreply@yourapp.com \
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

# Check health status
docker inspect --format='{{.State.Health.Status}}' money-manager

# View logs
docker logs -f money-manager
```

### Docker Features

- ✅ Multi-stage build (optimized image size)
- ✅ Alpine-based JRE (minimal attack surface)
- ✅ Non-root user (security best practice)
- ✅ Built-in health checks
- ✅ JVM container optimizations
- ✅ Production profile auto-activated

---

## 📁 Project Structure

```
moneymanager/
├── 📂 src/
│   ├── 📂 main/
│   │   ├── 📂 java/in/bushansirgur/moneymanager/
│   │   │   ├── 📄 MoneymanagerApplication.java    # Entry point
│   │   │   ├── 📂 config/                         # Configuration
│   │   │   │   ├── SecurityConfig.java            # Security settings
│   │   │   │   ├── GlobalExceptionHandler.java    # Error handling
│   │   │   │   └── ...
│   │   │   ├── 📂 controller/                     # REST endpoints
│   │   │   │   ├── ProfileController.java         # Auth endpoints
│   │   │   │   ├── IncomeController.java
│   │   │   │   ├── ExpenseController.java
│   │   │   │   ├── CategoryController.java
│   │   │   │   ├── DashboardController.java
│   │   │   │   └── ...
│   │   │   ├── 📂 dto/                            # Data Transfer Objects
│   │   │   ├── 📂 entity/                         # JPA Entities
│   │   │   ├── 📂 exception/                      # Custom exceptions
│   │   │   ├── 📂 repository/                     # Data access layer
│   │   │   ├── 📂 security/                       # JWT components
│   │   │   ├── 📂 service/                        # Business logic
│   │   │   └── 📂 util/                           # Utilities
│   │   └── 📂 resources/
│   │       ├── 📄 application.properties          # Base config
│   │       └── 📄 application-prod.properties     # Production config
│   └── 📂 test/                                   # Unit tests
├── 📄 Dockerfile                                  # Container config
├── 📄 .env.example                                # Environment template
├── 📄 .dockerignore                               # Docker ignore rules
├── 📄 .gitignore                                  # Git ignore rules
├── 📄 pom.xml                                     # Maven config
├── 📄 API_CONTRACT.md                             # API documentation
└── 📄 README.md                                   # This file
```

---

## 🔒 Security

### Implemented Security Measures

| Measure | Implementation |
|---------|----------------|
| 🔑 Authentication | JWT tokens (stateless) |
| 🔐 Password Storage | BCrypt hashing |
| 🌐 CORS | Configurable origin whitelist |
| 🛡️ SQL Injection | Parameterized queries (JPA) |
| 📝 Input Validation | Server-side validation |
| 🚫 Error Exposure | Generic messages in production |
| 👤 Container Security | Non-root user in Docker |

### Security Recommendations

1. **Generate strong JWT secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Use HTTPS in production** (terminate SSL at reverse proxy)

3. **Never commit secrets** - use environment variables

4. **Rotate credentials regularly**

5. **Use `validate` DDL mode** in production

6. **Enable rate limiting** at reverse proxy level

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ using Spring Boot
  <br />
  <a href="#-money-manager-api">Back to Top ↑</a>
</p>
