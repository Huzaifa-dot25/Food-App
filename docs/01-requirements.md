# Food Delivery Application — Requirements Document

## Phase 1: Requirement Analysis

### Business Context

A multi-tenant food delivery platform connecting Customers, Restaurant Owners, Delivery Riders, and Administrators. The system handles the full order lifecycle: discovery → ordering → payment → dispatch → delivery → review.

### Stakeholders

| Stakeholder       | Primary Concern                                          |
|-------------------|----------------------------------------------------------|
| Customer          | Fast ordering, accurate tracking, great UX               |
| Restaurant Owner  | Easy menu management, order visibility, analytics        |
| Delivery Rider    | Clear navigation, fair earnings, simple accept/reject    |
| Administrator     | Platform health, fraud prevention, reporting             |

---

## Phase 2: Feature Planning

### Core Modules

1. **Identity & Access** — Registration, Login, JWT, Roles, OTP
2. **Restaurant Catalog** — CRUD, Categories, Images, Hours, Search
3. **Food Catalog** — Items, Categories, Images, Filters
4. **Cart & Checkout** — Add/Remove, Quantities, Coupons, Summary
5. **Order Management** — Lifecycle, Status, History, Cancel
6. **Payment** — COD, Mock Online, Verification
7. **Delivery & Tracking** — Rider assignment, GPS, Live Status
8. **Reviews & Ratings** — Per order, per restaurant, per food
9. **Notifications** — FCM Push, In-app
10. **Admin Panel** — Full CRUD, Analytics, Reports
11. **Favorites** — Save restaurants & foods
12. **Address Book** — Multiple addresses, GPS

---

## Phase 3: User Stories

### Customer

| ID    | User Story                                                                                           | Priority |
|-------|------------------------------------------------------------------------------------------------------|----------|
| US-01 | As a customer, I can register with email and password so that I can access the platform              | Must     |
| US-02 | As a customer, I can log in and receive a JWT so that my sessions are secure                         | Must     |
| US-03 | As a customer, I can verify my email via OTP so that my account is validated                         | Must     |
| US-04 | As a customer, I can reset my password via email OTP so that I can recover access                    | Must     |
| US-05 | As a customer, I can browse restaurants by location, category, rating so that I find what I want     | Must     |
| US-06 | As a customer, I can search for foods or restaurants by keyword so that I can discover options        | Must     |
| US-07 | As a customer, I can view a restaurant's menu with categories so that I can make selections          | Must     |
| US-08 | As a customer, I can add food to a cart so that I can compile my order                               | Must     |
| US-09 | As a customer, I can apply a coupon at checkout so that I get a discount                             | Should   |
| US-10 | As a customer, I can choose delivery address from my address book so that ordering is faster         | Must     |
| US-11 | As a customer, I can pay with Cash on Delivery or mock card so that I can complete my order          | Must     |
| US-12 | As a customer, I can track my order in real time so that I know when it arrives                      | Must     |
| US-13 | As a customer, I can view my order history and reorder so that repeat orders are easy                | Should   |
| US-14 | As a customer, I can leave a review after delivery so that I can share my experience                 | Should   |
| US-15 | As a customer, I can save favorite restaurants so that I can find them quickly                       | Should   |
| US-16 | As a customer, I receive push notifications on order status so that I stay informed                  | Must     |

### Restaurant Owner

| ID    | User Story                                                                                           | Priority |
|-------|------------------------------------------------------------------------------------------------------|----------|
| US-17 | As an owner, I can register and manage my restaurant profile so that customers can find me           | Must     |
| US-18 | As an owner, I can manage my menu (add/edit/delete items) so that my catalog stays accurate         | Must     |
| US-19 | As an owner, I can accept or reject incoming orders so that I control my workload                   | Must     |
| US-20 | As an owner, I can update order status (preparing → ready → dispatched) so that customers are informed | Must  |
| US-21 | As an owner, I can view sales reports and revenue analytics so that I understand business performance | Should  |
| US-22 | As an owner, I can manage my business hours so that the platform shows accurate availability        | Should   |

### Delivery Rider

| ID    | User Story                                                                                           | Priority |
|-------|------------------------------------------------------------------------------------------------------|----------|
| US-23 | As a rider, I can register and set my availability so that orders are routed to me                  | Must     |
| US-24 | As a rider, I can accept or reject delivery requests so that I manage my workload                   | Must     |
| US-25 | As a rider, I can navigate to the restaurant and customer using Google Maps so that delivery is accurate | Must |
| US-26 | As a rider, I can mark pickup and delivery confirmations so that the order status updates            | Must     |
| US-27 | As a rider, I can view my earnings and delivery history so that I track performance                 | Should   |

### Administrator

| ID    | User Story                                                                                           | Priority |
|-------|------------------------------------------------------------------------------------------------------|----------|
| US-28 | As an admin, I can view platform-wide analytics (users, orders, revenue) so that I monitor health   | Must     |
| US-29 | As an admin, I can approve/suspend restaurants and riders so that I maintain quality                 | Must     |
| US-30 | As an admin, I can manage coupons and promotional codes so that I run campaigns                      | Should   |
| US-31 | As an admin, I can view and respond to complaints so that I maintain customer trust                  | Should   |

---

## Phase 4: Functional Requirements

### FR-AUTH
- FR-01: System shall support user registration with email, password, name, phone
- FR-02: System shall hash passwords using BCrypt (min cost 12)
- FR-03: System shall issue JWT (access 15min) + Refresh Token (7 days) on login
- FR-04: System shall support refresh token rotation
- FR-05: System shall support OTP-based email verification (6-digit, 10-min expiry)
- FR-06: System shall support password reset via OTP
- FR-07: System shall enforce role-based authorization (Customer, Owner, Rider, Admin)

### FR-RESTAURANT
- FR-08: Restaurant owners can create/update/delete their restaurant
- FR-09: Restaurants have name, description, address, lat/lng, category, rating, hours
- FR-10: System calculates distance from customer GPS to restaurant
- FR-11: Restaurants can be searched by name, category, distance, rating
- FR-12: Restaurants have an active/inactive/suspended status

### FR-FOOD
- FR-13: Owners can manage food items (name, price, description, image, category, availability)
- FR-14: Food items belong to food categories within a restaurant
- FR-15: Food can be tagged as Best Seller, Popular, Recommended
- FR-16: Food can be searched globally and filtered by price, rating, category

### FR-CART
- FR-17: Customers can add items from a single restaurant per cart session
- FR-18: Cart persists across sessions (server-side)
- FR-19: Customers can update quantities, remove items
- FR-20: Coupon validation occurs at cart level before checkout

### FR-ORDER
- FR-21: Order is created from cart contents with snapshot pricing
- FR-22: Order statuses: Pending → Confirmed → Preparing → Ready → Dispatched → Delivered → Cancelled
- FR-23: Customers can cancel orders in Pending or Confirmed status only
- FR-24: Order records delivery address, instructions, item snapshot, totals, payment method
- FR-25: Customers can reorder from history (repopulate cart)

### FR-PAYMENT
- FR-26: Cash on Delivery requires no external processing
- FR-27: Mock online payment simulates card authorization (always succeeds in sandbox)
- FR-28: Payment record stores method, amount, status, transaction reference

### FR-DELIVERY
- FR-29: System assigns available rider to confirmed order
- FR-30: Rider receives push notification for new assignment
- FR-31: Rider can update location; customers see live position (polling or SignalR)
- FR-32: Rider confirms pickup and delivery with timestamp

### FR-REVIEW
- FR-33: Customers can leave one review per delivered order
- FR-34: Reviews have star rating (1-5) and comment text
- FR-35: Restaurant average rating recalculates on each new review

### FR-NOTIFICATIONS
- FR-36: FCM push notifications sent on: order confirmed, order ready, rider assigned, delivery confirmed
- FR-37: In-app notification history stored in database

### FR-ADMIN
- FR-38: Admin can view/manage all entities
- FR-39: Admin can generate revenue reports by date range
- FR-40: Admin can create/deactivate coupons

---

## Phase 5: Non-Functional Requirements

### Performance
- NFR-01: API response time < 200ms for 95th percentile under normal load
- NFR-02: Support 1,000 concurrent users without degradation
- NFR-03: Database queries use indexes on foreign keys and search columns
- NFR-04: Image assets served via CDN or static file endpoint with caching headers
- NFR-05: Pagination required on all list endpoints (default 20 items/page)

### Security
- NFR-06: All API endpoints served over HTTPS only
- NFR-07: JWT secrets stored in environment variables, never hardcoded
- NFR-08: Passwords stored as BCrypt hash, never in plaintext
- NFR-09: Input validated on both client and server (FluentValidation)
- NFR-10: SQL injection prevented via EF Core parameterized queries
- NFR-11: XSS prevented via output encoding and CSP headers
- NFR-12: Sensitive tokens stored in SecureStore (mobile) / encrypted storage
- NFR-13: Rate limiting on auth endpoints (max 5 attempts/minute)

### Reliability
- NFR-14: System targets 99.5% uptime
- NFR-15: All unhandled exceptions are caught by global middleware and logged
- NFR-16: Database transactions used for multi-step operations (order creation)

### Scalability
- NFR-17: Stateless API design allows horizontal scaling
- NFR-18: Database connection pooling configured
- NFR-19: Caching layer (in-memory or Redis) for restaurant and food catalog

### Usability
- NFR-20: Mobile app supports iOS and Android via React Native / Expo
- NFR-21: All screens must be responsive across common phone sizes
- NFR-22: App must comply with WCAG 2.1 AA for color contrast and touch targets
- NFR-23: Loading states and error states shown for all async operations

### Maintainability
- NFR-24: Backend follows Clean Architecture with clear layer separation
- NFR-25: All API contracts documented (Swagger/OpenAPI)
- NFR-26: Code coverage target ≥ 70% for backend business logic
- NFR-27: Structured logging (Serilog) with correlation IDs
