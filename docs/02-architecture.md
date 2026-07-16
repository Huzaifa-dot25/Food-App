# Food Delivery Application — System Architecture

## Architecture Overview

The system follows **Clean Architecture** (also known as Onion Architecture) for the backend,
and a **Feature-Sliced** structure for the React Native mobile frontend.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │          React Native Mobile App (Expo + TypeScript)      │     │
│   │   Customer App │ Owner App │ Rider App │ Admin Panel       │     │
│   └────────────────────────┬─────────────────────────────────┘     │
└────────────────────────────┼────────────────────────────────────────┘
                             │ HTTPS / REST + SignalR (WebSocket)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                            │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │              ASP.NET Core Web API (.NET 8)                │     │
│   │   ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │     │
│   │   │   Auth     │  │ Rate Limit │  │  Global Exception │  │     │
│   │   │ Middleware │  │ Middleware │  │     Handler       │  │     │
│   │   └────────────┘  └────────────┘  └──────────────────┘  │     │
│   └──────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CLEAN ARCHITECTURE LAYERS                       │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │  Presentation Layer (Controllers + Minimal API Endpoints) │     │
│   │  - Request validation (FluentValidation)                  │     │
│   │  - DTO mapping (AutoMapper)                               │     │
│   │  - Route definitions                                      │     │
│   └────────────────────────┬─────────────────────────────────┘     │
│                            │                                        │
│   ┌────────────────────────▼─────────────────────────────────┐     │
│   │           Application Layer (Use Cases / Services)        │     │
│   │  - Business logic                                         │     │
│   │  - Service interfaces                                     │     │
│   │  - DTOs & command/query models                            │     │
│   │  - IRepository abstractions                               │     │
│   └────────────────────────┬─────────────────────────────────┘     │
│                            │                                        │
│   ┌────────────────────────▼─────────────────────────────────┐     │
│   │                Domain Layer (Core Entities)               │     │
│   │  - Entity classes (pure C# with no dependencies)         │     │
│   │  - Domain events                                          │     │
│   │  - Value objects                                          │     │
│   │  - Domain exceptions                                      │     │
│   └────────────────────────┬─────────────────────────────────┘     │
│                            │                                        │
│   ┌────────────────────────▼─────────────────────────────────┐     │
│   │       Infrastructure Layer (Data + External Services)     │     │
│   │  - EF Core DbContext + Migrations                         │     │
│   │  - Repository implementations                             │     │
│   │  - Email / OTP service                                    │     │
│   │  - FCM push notification service                          │     │
│   │  - File/image storage service                             │     │
│   │  - Payment gateway adapter                                │     │
│   └──────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                   │
│                                                                     │
│   ┌──────────────┐   ┌─────────────────┐   ┌──────────────────┐   │
│   │  SQL Server  │   │  In-Memory Cache │   │  File Storage    │   │
│   │  (Primary)   │   │  (IMemoryCache   │   │  (Local / Azure  │   │
│   │              │   │   or Redis)      │   │   Blob Storage)  │   │
│   └──────────────┘   └─────────────────┘   └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                │
│                                                                     │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐  │
│   │ Firebase FCM │   │ Google Maps  │   │   Email Service      │  │
│   │ (Push Notif) │   │ (GPS / Maps) │   │   (SMTP / Mock)      │  │
│   └──────────────┘   └──────────────┘   └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Backend Project Structure (Clean Architecture)

```
FoodDeliveryApp.Backend/
├── FoodDelivery.API/                    ← Presentation Layer
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── RestaurantsController.cs
│   │   ├── FoodsController.cs
│   │   ├── CategoriesController.cs
│   │   ├── CartController.cs
│   │   ├── OrdersController.cs
│   │   ├── PaymentsController.cs
│   │   ├── ReviewsController.cs
│   │   ├── NotificationsController.cs
│   │   ├── RiderController.cs
│   │   └── AdminController.cs
│   ├── Middleware/
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   ├── RequestLoggingMiddleware.cs
│   │   └── RateLimitingMiddleware.cs
│   ├── Extensions/
│   │   ├── ServiceCollectionExtensions.cs
│   │   └── ApplicationBuilderExtensions.cs
│   ├── Hubs/
│   │   └── OrderTrackingHub.cs          ← SignalR real-time tracking
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── Program.cs
│
├── FoodDelivery.Application/            ← Application / Use-Case Layer
│   ├── Common/
│   │   ├── Interfaces/
│   │   │   ├── IUnitOfWork.cs
│   │   │   ├── ICurrentUserService.cs
│   │   │   └── IDateTime.cs
│   │   ├── Models/
│   │   │   ├── Result.cs
│   │   │   ├── PagedResult.cs
│   │   │   └── ApiResponse.cs
│   │   └── Mappings/
│   │       └── AutoMapperProfile.cs
│   ├── DTOs/
│   │   ├── Auth/
│   │   ├── Restaurant/
│   │   ├── Food/
│   │   ├── Cart/
│   │   ├── Order/
│   │   ├── Payment/
│   │   ├── Review/
│   │   ├── Rider/
│   │   └── Notification/
│   ├── Validators/                      ← FluentValidation
│   └── Services/
│       ├── Interfaces/
│       └── Implementations/
│
├── FoodDelivery.Domain/                 ← Domain Layer (no dependencies)
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Role.cs
│   │   ├── Restaurant.cs
│   │   ├── FoodCategory.cs
│   │   ├── Food.cs
│   │   ├── Cart.cs
│   │   ├── CartItem.cs
│   │   ├── Order.cs
│   │   ├── OrderItem.cs
│   │   ├── Payment.cs
│   │   ├── Review.cs
│   │   ├── Rider.cs
│   │   ├── RiderAssignment.cs
│   │   ├── Notification.cs
│   │   ├── Coupon.cs
│   │   ├── Address.cs
│   │   └── AuditLog.cs
│   ├── Enums/
│   │   ├── OrderStatus.cs
│   │   ├── PaymentMethod.cs
│   │   ├── PaymentStatus.cs
│   │   ├── UserStatus.cs
│   │   └── RiderStatus.cs
│   └── Exceptions/
│       ├── DomainException.cs
│       ├── NotFoundException.cs
│       └── UnauthorizedException.cs
│
├── FoodDelivery.Infrastructure/         ← Infrastructure Layer
│   ├── Persistence/
│   │   ├── AppDbContext.cs
│   │   ├── Configurations/              ← EF Core fluent configs
│   │   └── Migrations/
│   ├── Repositories/
│   │   ├── Interfaces/
│   │   └── Implementations/
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── EmailService.cs
│   │   ├── FcmNotificationService.cs
│   │   ├── PaymentService.cs
│   │   ├── FileStorageService.cs
│   │   └── GeoService.cs
│   └── DependencyInjection.cs
│
└── FoodDelivery.Tests/                  ← Test Project
    ├── Unit/
    ├── Integration/
    └── API/
```

---

## Mobile Project Structure (React Native / Expo)

```
FoodDeliveryApp.Mobile/
├── app/                          ← Expo Router file-based routing
│   ├── (auth)/
│   │   ├── splash.tsx
│   │   ├── onboarding.tsx
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── otp.tsx
│   ├── (customer)/
│   │   ├── (tabs)/
│   │   │   ├── home.tsx
│   │   │   ├── search.tsx
│   │   │   ├── orders.tsx
│   │   │   ├── favorites.tsx
│   │   │   └── profile.tsx
│   │   ├── restaurant/[id].tsx
│   │   ├── food/[id].tsx
│   │   ├── cart.tsx
│   │   ├── checkout.tsx
│   │   ├── payment.tsx
│   │   ├── tracking/[orderId].tsx
│   │   └── notifications.tsx
│   ├── (owner)/
│   │   ├── dashboard.tsx
│   │   ├── menu.tsx
│   │   ├── orders.tsx
│   │   └── analytics.tsx
│   ├── (rider)/
│   │   ├── dashboard.tsx
│   │   ├── navigation.tsx
│   │   └── earnings.tsx
│   └── (admin)/
│       ├── dashboard.tsx
│       ├── users.tsx
│       ├── restaurants.tsx
│       └── reports.tsx
│
├── src/
│   ├── api/                      ← Axios instances + API calls
│   │   ├── client.ts
│   │   ├── authApi.ts
│   │   ├── restaurantApi.ts
│   │   ├── foodApi.ts
│   │   ├── cartApi.ts
│   │   ├── orderApi.ts
│   │   ├── paymentApi.ts
│   │   └── notificationApi.ts
│   ├── store/                    ← Redux Toolkit / Zustand
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── cartSlice.ts
│   │   │   ├── orderSlice.ts
│   │   │   └── notificationSlice.ts
│   │   └── hooks.ts
│   ├── components/               ← Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Rating.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   ├── restaurant/
│   │   │   ├── RestaurantCard.tsx
│   │   │   └── RestaurantHeader.tsx
│   │   ├── food/
│   │   │   ├── FoodCard.tsx
│   │   │   └── FoodCategoryTabs.tsx
│   │   └── order/
│   │       ├── OrderCard.tsx
│   │       └── OrderStatusBar.tsx
│   ├── hooks/                    ← Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   ├── useCart.ts
│   │   └── useNotifications.ts
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── routes.ts
│   ├── types/                    ← TypeScript interfaces
│   │   ├── auth.types.ts
│   │   ├── restaurant.types.ts
│   │   ├── food.types.ts
│   │   ├── order.types.ts
│   │   └── api.types.ts
│   └── utils/
│       ├── validators.ts
│       ├── formatters.ts
│       ├── storage.ts
│       └── notifications.ts
│
├── assets/
│   ├── images/
│   └── icons/
├── app.json
├── package.json
└── tsconfig.json
```

---

## Data Flow Diagrams

### Order Creation Flow
```
Customer App
     │
     ├─ 1. POST /api/cart/items          (add to cart)
     ├─ 2. POST /api/orders              (create order from cart)
     │       │
     │       ├─► Validate cart items still available
     │       ├─► Snapshot prices
     │       ├─► Apply coupon if any
     │       ├─► Create Order + OrderItems (transaction)
     │       ├─► Clear Cart
     │       └─► Emit push notification to Restaurant Owner
     │
     ├─ 3. POST /api/payments            (process payment)
     │       │
     │       └─► COD: mark payment pending
     │           Card: call mock gateway → mark paid
     │
     └─ 4. GET /api/orders/{id}/track    (poll status)
            │
            └─► Restaurant updates status
                Rider assigned → FCM to customer
                Rider confirms pickup → status: Dispatched
                Rider confirms delivery → status: Delivered
```

### Authentication Flow
```
Mobile App
     │
     ├─ POST /api/auth/register
     │       └─► Hash password (BCrypt)
     │           Save user, assign Customer role
     │           Send OTP email
     │
     ├─ POST /api/auth/verify-otp
     │       └─► Validate OTP (6-digit, 10-min TTL)
     │           Mark email verified
     │
     ├─ POST /api/auth/login
     │       └─► Validate credentials
     │           Generate JWT (15min) + Refresh Token (7d)
     │           Return both tokens
     │
     ├─ POST /api/auth/refresh
     │       └─► Validate refresh token
     │           Rotate refresh token
     │           Issue new JWT
     │
     └─ POST /api/auth/logout
             └─► Revoke refresh token
```

---

## Technology Decisions & Rationale

| Decision | Choice | Rationale |
|---|---|---|
| Backend Framework | ASP.NET Core 8 | LTS, performance, mature ecosystem |
| Architecture | Clean Architecture | Testability, separation of concerns |
| ORM | Entity Framework Core 8 | Type-safe, migrations, LINQ |
| Database | SQL Server | ACID compliance, JSON support, robust |
| Auth | JWT + Refresh Tokens | Stateless, scalable, standard |
| Real-time | SignalR | Built into ASP.NET, supports polling fallback |
| Validation | FluentValidation | Readable, testable, extensible rules |
| Mapping | AutoMapper | Reduces boilerplate DTO mapping |
| Logging | Serilog | Structured logging, multiple sinks |
| Mobile | React Native + Expo | Cross-platform, fast iteration |
| State | Redux Toolkit | Predictable, DevTools support |
| Navigation | Expo Router | File-based, intuitive, deep links |
| HTTP Client | Axios | Interceptors for JWT refresh |
| Push Notif | Firebase FCM | Free tier, cross-platform |
| Maps | Google Maps SDK | Accurate, rich API |
| Testing | xUnit + Moq (BE), Jest (FE) | Industry standard |

---

## Security Architecture

```
Request Pipeline:
─────────────────────────────────────────────────────────
  Incoming Request
       │
       ▼
  [HTTPS Termination]        ← TLS 1.2+ enforced
       │
       ▼
  [Rate Limiting MW]         ← 5 req/min on /auth/*
       │
       ▼
  [JWT Validation MW]        ← Verify signature, expiry, claims
       │
       ▼
  [Role Authorization]       ← [Authorize(Roles="Customer")] etc.
       │
       ▼
  [Input Validation MW]      ← FluentValidation on all DTOs
       │
       ▼
  [Controller Action]
       │
       ▼
  [EF Core Queries]          ← Parameterized (no raw SQL unless sanitized)
       │
       ▼
  [Response]
─────────────────────────────────────────────────────────
```

---

## Deployment Architecture (Target)

```
┌─────────────────────────────────────────────────────┐
│                  Production Environment              │
│                                                     │
│   ┌───────────────┐      ┌───────────────────────┐  │
│   │  Reverse Proxy │      │   ASP.NET Core API    │  │
│   │  (Nginx/Caddy) │─────▶│   (Docker Container)  │  │
│   └───────────────┘      └───────────┬───────────┘  │
│                                       │               │
│                           ┌───────────▼───────────┐  │
│                           │  SQL Server Container  │  │
│                           └───────────────────────┘  │
│                                                     │
│   ┌───────────────────────────────────────────────┐  │
│   │            Docker Compose                      │  │
│   └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```
