# Money Manager Backend

A Spring Boot backend for managing personal finances (categories, expenses, incomes, profiles).

## Features
- User registration, activation, login
- JWT-based authentication
- CRUD for categories, expenses, incomes

## Setup
1. Clone the repo
2. Configure your database in `src/main/resources/application.properties` (see below for secrets)
3. Build: `./mvnw clean install`
4. Run: `./mvnw spring-boot:run`

## API Endpoints
- `POST /register` - Register user
- `GET /activate?token=...` - Activate user
- `POST /login` - Login and get JWT token
- Other endpoints for categories, expenses, incomes

## Testing with Postman
1. Register a user (`POST /register`)
2. Activate via email link (`GET /activate?token=...`)
3. Login (`POST /login`) to get JWT token
4. Use JWT token in `Authorization: Bearer <token>` header for protected endpoints

## Secret Configuration & Security
- All secrets (DB credentials, SMTP, JWT, etc.) are replaced with placeholders in config files.
- Do NOT commit real secrets to version control.
- Use environment variables or local config files for your actual secrets.
- See `.gitignore` for excluded files.

## License
MIT
