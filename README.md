# 🍔 Food Delivery Application

A **production-quality, full-stack Food Delivery Mobile Application** built end-to-end following professional software development methodology.

[![GitHub](https://img.shields.io/badge/GitHub-Huzaifa--dot25%2FFood--App-blue)](https://github.com/Huzaifa-dot25/Food-App)

---

## 📋 Project Overview

| Property       | Value                                      |
|----------------|--------------------------------------------|
| Type           | Multi-role food delivery platform          |
| Backend        | ASP.NET Core 8 Web API (Clean Architecture)|
| Mobile         | React Native + Expo + TypeScript           |
| Database       | SQL Server + Entity Framework Core 8       |
| Auth           | JWT + Refresh Tokens + Role-Based Access   |
| Notifications  | Firebase Cloud Messaging (FCM)             |
| Maps           | Google Maps SDK + Haversine GPS            |
| Real-time      | SignalR (order tracking)                   |
| Deployment     | Docker + Docker Compose + Nginx            |

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| **Customer**          | Browse restaurants, order food, track delivery, leave reviews |
| **Restaurant Owner**  | Manage menu, accept/reject orders, view analytics |
| **Delivery Rider**    | Accept deliveries, navigate, confirm pickup/delivery |
| **Administrator**     | Full platform management, analytics, revenue reports |

---

## 🏗️ Project Structure

```
FoodDeliveryApp/
├── backend/                              ← ASP.NET Core 8 API
│   ├── FoodDelivery.API/                 ← Controllers, Middleware, Program.cs
│   │   ├── Controllers/                  ← 9 controllers, 83 endpoints
│   │   ├── Middleware/                   ← Exception handling, logging, security headers
│   │   ├── Extensions/                   ← JWT, Swagger, rate limiting DI
│   │   └── Hubs/                         ← SignalR order tracking hub
│   ├── FoodDelivery.Application/         ← Services, DTOs, Validators, AutoMapper
│   │   ├── Common/                       ← Interfaces, models, mappings
│   │   ├── DTOs/                         ← Request/response contracts
│   │   ├── Validators/                   ← FluentValidation rules
│   │   └── Services/Interfaces/          ← 8 service interfaces
│   ├── FoodDelivery.Domain/              ← Entities, Enums, Exceptions
│   │   ├── Entities/                     ← 23 domain entities
│   │   ├── Enums/                        ← 9 enums
│   │   └── Exceptions/                   ← Domain exceptions
│   ├── FoodDelivery.Infrastructure/      ← EF Core, Repositories, Services
│   │   ├── Persistence/                  ← AppDbContext, configurations, migrations
│   │   ├── Repositories/                 ← Generic + 6 domain repos
│   │   └── Services/                     ← Auth, Email, FCM, Payment, Cache, Audit
│   └── FoodDelivery.Tests/               ← Unit + Integration tests
│       ├── Unit/                         ← 6 test classes, 40+ tests
│       └── Integration/                  ← HTTP pipeline tests
│
├── mobile/                               ← React Native + Expo
│   ├── app/                              ← Expo Router screens
│   │   ├── (auth)/                       ← 6 auth screens
│   │   ├── (customer)/                   ← 14 customer screens
│   │   ├── (owner)/                      ← 4 owner screens
│   │   ├── (rider)/                      ← 3 rider screens
│   │   └── (admin)/                      ← 4 admin screens
│   └── src/
│       ├── api/                          ← Axios client + 7 API modules
│       ├── store/                        ← Redux Toolkit (4 slices)
│       ├── components/                   ← 14 reusable UI components
│       ├── hooks/                        ← useAuth, useCart, useLocation
│       ├── constants/                    ← Colors, Typography, Spacing
│       ├── types/                        ← TypeScript interfaces
│       └── utils/                        ← Formatters, validators, storage
│
├── database/                             ← SQL Server scripts
│   ├── 001_CreateDatabase.sql            ← Full schema (24 tables)
│   ├── 002_SeedData.sql                  ← Seed data (roles, categories, coupons)
│   └── 003_StoredProcedures.sql          ← Stored procs + views
│
├── deployment/                           ← Infrastructure as code
│   └── nginx/nginx.conf                  ← Reverse proxy + SSL + rate limiting
│
├── docs/                                 ← Architecture & design docs
│   ├── 01-requirements.md
│   ├── 02-architecture.md
│   ├── 03-database-design.md
│   └── 04-api-contracts.md
│
├── docker-compose.yml                    ← Full stack (API + DB + Nginx)
├── docker-compose.prod.yml               ← Production overrides
└── .env.example                          ← Environment variable template
```

---

## 🚀 Running Locally (Step by Step)

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| .NET SDK | 8.0+ | https://dotnet.microsoft.com/download |
| SQL Server | 2019+ | https://www.microsoft.com/en-us/sql-server |
| Node.js | 18+ | https://nodejs.org |
| Expo Go | Latest | App Store / Google Play |

---

### 1. Set Up the Database

Open **SQL Server Management Studio**, connect to `localhost`, run these in order:

```sql
-- Run each file in SSMS
FoodDeliveryApp/database/001_CreateDatabase.sql
FoodDeliveryApp/database/002_SeedData.sql
FoodDeliveryApp/database/003_StoredProcedures.sql
```

---

### 2. Start the Backend API

```bash
cd "FoodDeliveryApp/backend"

# Restore packages
dotnet restore

# Run in Development mode
dotnet run --project FoodDelivery.API --launch-profile Development
```

API starts at: **http://localhost:5001**
Swagger UI: **http://localhost:5001** (opens automatically)
Health check: **http://localhost:5001/health**

---

### 3. Start the Mobile App

```bash
cd "FoodDeliveryApp/mobile"

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

Then:
- **Phone**: Scan the QR code with **Expo Go** app
- **Android emulator**: Press `a`
- **iOS simulator** (Mac only): Press `i`
- **Web browser**: Press `w`

> **Important**: Update `mobile/app.json` with your PC's local IP address:
> ```json
> "extra": { "apiBaseUrl": "http://192.168.X.X:5001/api" }
> ```
> Find your IP with `ipconfig` (Windows) and look for the WiFi IPv4 address.

---

### 4. Run Tests

```bash
# Backend tests
cd "FoodDeliveryApp/backend"
dotnet test

# Mobile tests
cd "FoodDeliveryApp/mobile"
npm test
```

---

## 🐳 Running with Docker

```bash
# 1. Copy and fill environment variables
cp .env.example .env

# 2. Start all services
docker compose up --build

# 3. Access the app
# API + Swagger: http://localhost:8080
# Health check:  http://localhost:8080/health
```

**Production deployment:**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📡 API Endpoints Summary

| Module | Endpoints | Auth |
|--------|-----------|------|
| Auth | 15 | Public + Bearer |
| Restaurants | 14 | Public + Owner |
| Foods | 15 | Public + Owner |
| Cart | 7 | Customer |
| Orders | 15 | All roles |
| Payments | 3 | Customer + Rider |
| Reviews | 4 | Public + Customer + Owner |
| Riders | 4 | Rider |
| Notifications | 6 | All + Admin |
| Admin | 15 | Admin only |
| **Total** | **98** | |

Full API contract: see `docs/04-api-contracts.md`

---

## 🔐 Security Features

- JWT access tokens (15 min) + refresh token rotation (7 days)
- BCrypt password hashing (cost factor 12)
- Role-based authorization (Customer / Owner / Rider / Admin)
- FluentValidation on all API inputs
- EF Core parameterized queries (no SQL injection)
- Rate limiting — auth: 5 req/min, global: 100 req/min
- Security headers — CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Audit logging for all sensitive operations
- Secure token storage on mobile (Expo SecureStore / AES-256)

---

## 🗄️ Database Schema

24 tables including:

`Users` · `Roles` · `UserRoles` · `Addresses` · `RestaurantCategories` · `Restaurants` · `BusinessHours` · `FoodCategories` · `Foods` · `FoodImages` · `Coupons` · `Carts` · `CartItems` · `Orders` · `OrderItems` · `Payments` · `Riders` · `RiderAssignments` · `Reviews` · `Favorites` · `Notifications` · `AuditLogs`

---

## 📱 Mobile Screens (29 total)

| Role | Screens |
|------|---------|
| Auth | Welcome, Onboarding, Login, Register, Forgot Password, OTP |
| Customer | Home, Search, Restaurant Details, Food Details, Cart, Checkout, Payment, Order Tracking, Orders, Favorites, Profile, Notifications |
| Owner | Dashboard, Menu, Orders, Analytics |
| Rider | Dashboard, Navigation, Earnings |
| Admin | Dashboard, Users, Restaurants, Reports |

---

## 📊 Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1–5  | Requirements, user stories, functional & non-functional specs | ✅ Done |
| 6    | System architecture design | ✅ Done |
| 7    | Database design — ER diagram, SQL scripts, EF Core models | ✅ Done |
| 8    | API design — REST contracts, DTOs, validators | ✅ Done |
| 9    | Backend project setup — solution, DI, middleware | ✅ Done |
| 10   | Authentication — JWT, refresh tokens, OTP, all services | ✅ Done |
| 11   | All REST API controllers (98 endpoints) | ✅ Done |
| 12   | Mobile project setup — Expo, Redux, Axios, components | ✅ Done |
| 13–17 | All 29 mobile screens (all 4 roles) | ✅ Done |
| 18   | Testing — unit, integration, component, slice tests | ✅ Done |
| 19   | Performance & security hardening | ✅ Done |
| 20   | Deployment — Docker, Nginx, environment config | ✅ Done |

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `DB_SA_PASSWORD` | SQL Server SA password |
| `JWT_SECRET` | JWT signing key (min 32 chars) |
| `SMTP_HOST` | Email server host |
| `SMTP_EMAIL` | Sender email address |
| `SMTP_USERNAME` | SMTP auth username |
| `SMTP_PASSWORD` | SMTP auth password |
| `FIREBASE_PROJECT_ID` | Firebase project ID for FCM |
| `FIREBASE_CREDENTIALS_PATH` | Path to firebase-adminsdk.json |
| `API_BASE_URL` | Public API URL |

---

## 📄 License

MIT — Free to use, modify and distribute.
