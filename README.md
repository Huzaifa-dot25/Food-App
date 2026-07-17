# 🍔 Food Delivery Application

A **production-quality, full-stack Food Delivery Mobile Application** built with:

- **Mobile**: React Native + Expo + TypeScript
- **Backend**: ASP.NET Core 8 Web API (Clean Architecture)
- **Database**: SQL Server + Entity Framework Core
- **Auth**: JWT + Refresh Tokens + Role-Based Authorization
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Maps**: Google Maps SDK

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| **Customer** | Browse restaurants, order food, track delivery, leave reviews |
| **Restaurant Owner** | Manage menu, accept orders, view analytics |
| **Delivery Rider** | Accept deliveries, navigate, confirm pickup/delivery |
| **Administrator** | Full platform management, analytics, reports |

---

## 🏗️ Project Structure

```
FoodDeliveryApp/
├── backend/                          ← ASP.NET Core 8 API
│   ├── FoodDelivery.API/             ← Controllers, Middleware, Program.cs
│   ├── FoodDelivery.Application/     ← Services, DTOs, Validators, AutoMapper
│   ├── FoodDelivery.Domain/          ← Entities, Enums, Exceptions
│   ├── FoodDelivery.Infrastructure/  ← EF Core, Repositories, External Services
│   └── FoodDelivery.Tests/           ← Unit & Integration Tests
├── mobile/                           ← React Native + Expo app (coming)
├── database/                         ← SQL Server scripts
│   ├── 001_CreateDatabase.sql
│   ├── 002_SeedData.sql
│   └── 003_StoredProcedures.sql
└── docs/                             ← Architecture, requirements, API contracts
    ├── 01-requirements.md
    ├── 02-architecture.md
    ├── 03-database-design.md
    └── 04-api-contracts.md
```

---

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- SQL Server 2019+
- Node.js 18+ & npm/yarn
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Restore packages
dotnet restore

# 3. Update appsettings.json with your SQL Server connection string

# 4. Apply database migrations
dotnet ef database update --project FoodDelivery.Infrastructure --startup-project FoodDelivery.API

# 5. Run the API
dotnet run --project FoodDelivery.API
```

### Database Setup (alternative — raw SQL)

```sql
-- Run scripts in order in SQL Server Management Studio
-- 1. database/001_CreateDatabase.sql
-- 2. database/002_SeedData.sql
-- 3. database/003_StoredProcedures.sql
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

---

## 📋 Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1–5   | ✅ Done | Requirements, User Stories, Functional & Non-Functional Specs |
| 6     | ✅ Done | System Architecture Design |
| 7     | ✅ Done | Database Design — ER Diagram, SQL Scripts, EF Core Models |
| 8     | ✅ Done | API Design — REST Contracts, DTOs, Validators |
| 9     | 🔄 Next | Backend Project Setup |
| 10    | ⏳ | Authentication — JWT, Refresh Tokens, Roles |
| 11    | ⏳ | Restaurant & Food APIs |
| 12    | ⏳ | Orders, Cart & Payments |
| 13    | ⏳ | Reviews, Notifications & Admin |
| 14    | ⏳ | Mobile Project Setup |
| 15–21 | ⏳ | All Mobile Screens |
| 22    | ⏳ | Testing, Performance & Security |

---

## 🔐 Security

- JWT Access Token (15 min) + Refresh Token rotation (7 days)
- BCrypt password hashing (cost factor 12)
- Role-based authorization (`Customer`, `Owner`, `Rider`, `Admin`)
- FluentValidation on all inputs
- EF Core parameterized queries (no SQL injection)
- Rate limiting on auth endpoints
- Secure token storage on mobile (Expo SecureStore)

---

## 📄 License

MIT


Test contribution on July 17
