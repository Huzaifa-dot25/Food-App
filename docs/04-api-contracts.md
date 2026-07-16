# Food Delivery Application — REST API Contracts

Base URL: `https://api.fooddelivery.local/api`

All responses follow the envelope:
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "errors": null
}
```
Paginated responses wrap data in:
```json
{
  "items": [...],
  "totalCount": 100,
  "pageNumber": 1,
  "pageSize": 20,
  "totalPages": 5,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

---

## Authentication  `/api/auth`

| Method | Endpoint              | Auth       | Body / Query                | Response          |
|--------|-----------------------|------------|-----------------------------|-------------------|
| POST   | `/register`           | Public     | `RegisterRequest`           | `AuthResponse`    |
| POST   | `/login`              | Public     | `LoginRequest`              | `AuthResponse`    |
| POST   | `/refresh`            | Public     | `RefreshTokenRequest`       | `AuthResponse`    |
| POST   | `/logout`             | Bearer JWT | —                           | 200 OK            |
| POST   | `/verify-otp`         | Public     | `VerifyOtpRequest`          | 200 OK            |
| POST   | `/forgot-password`    | Public     | `ForgotPasswordRequest`     | 200 OK            |
| POST   | `/reset-password`     | Public     | `ResetPasswordRequest`      | 200 OK            |
| GET    | `/profile`            | Bearer JWT | —                           | `UserProfileDto`  |
| PUT    | `/profile`            | Bearer JWT | `UpdateProfileRequest`      | `UserProfileDto`  |
| POST   | `/profile/image`      | Bearer JWT | multipart/form-data         | `{ imageUrl }`    |

### Addresses  `/api/auth/addresses`

| Method | Endpoint              | Auth       | Body                        | Response          |
|--------|-----------------------|------------|-----------------------------|-------------------|
| GET    | `/`                   | Bearer JWT | —                           | `AddressDto[]`    |
| POST   | `/`                   | Bearer JWT | `CreateAddressRequest`      | `AddressDto`      |
| PUT    | `/{id}`               | Bearer JWT | `CreateAddressRequest`      | `AddressDto`      |
| DELETE | `/{id}`               | Bearer JWT | —                           | 204               |
| PATCH  | `/{id}/set-default`   | Bearer JWT | —                           | `AddressDto`      |

---

## Restaurants  `/api/restaurants`

| Method | Endpoint                  | Auth            | Body / Query                    | Response                     |
|--------|---------------------------|-----------------|---------------------------------|------------------------------|
| GET    | `/`                       | Public          | `RestaurantSearchRequest` (qs)  | `PagedResult<RestaurantSummaryDto>` |
| GET    | `/{id}`                   | Public          | —                               | `RestaurantDto`              |
| GET    | `/nearby`                 | Public          | `?lat&lng&radiusKm`             | `RestaurantSummaryDto[]`     |
| GET    | `/featured`               | Public          | —                               | `RestaurantSummaryDto[]`     |
| POST   | `/`                       | Owner           | `CreateRestaurantRequest`       | `RestaurantDto`              |
| PUT    | `/{id}`                   | Owner           | `UpdateRestaurantRequest`       | `RestaurantDto`              |
| DELETE | `/{id}`                   | Owner/Admin     | —                               | 204                          |
| POST   | `/{id}/logo`              | Owner           | multipart/form-data             | `{ imageUrl }`               |
| POST   | `/{id}/cover`             | Owner           | multipart/form-data             | `{ imageUrl }`               |
| PUT    | `/{id}/hours`             | Owner           | `UpsertBusinessHourRequest[]`   | `BusinessHourDto[]`          |
| GET    | `/my`                     | Owner           | —                               | `RestaurantDto`              |
| POST   | `/{id}/favorites`         | Customer        | —                               | 200 OK                       |
| DELETE | `/{id}/favorites`         | Customer        | —                               | 204                          |
| GET    | `/favorites`              | Customer        | pagination qs                   | `PagedResult<RestaurantSummaryDto>` |

### Restaurant Categories  `/api/restaurant-categories`

| Method | Endpoint   | Auth   | Body | Response                         |
|--------|------------|--------|------|----------------------------------|
| GET    | `/`        | Public | —    | `RestaurantCategoryDto[]`        |

---

## Foods  `/api/foods`

| Method | Endpoint                        | Auth    | Body / Query            | Response                    |
|--------|---------------------------------|---------|-------------------------|-----------------------------|
| GET    | `/`                             | Public  | `FoodSearchRequest` qs  | `PagedResult<FoodSummaryDto>` |
| GET    | `/{id}`                         | Public  | —                       | `FoodDto`                   |
| GET    | `/restaurant/{restaurantId}`    | Public  | `?categoryId`           | `FoodSummaryDto[]`          |
| GET    | `/restaurant/{restaurantId}/bestsellers` | Public | —            | `FoodSummaryDto[]`          |
| GET    | `/restaurant/{restaurantId}/popular`     | Public | —            | `FoodSummaryDto[]`          |
| GET    | `/restaurant/{restaurantId}/recommended` | Public | —            | `FoodSummaryDto[]`          |

### Food Categories  `/api/foods/categories`

| Method | Endpoint                                  | Auth  | Body                       | Response           |
|--------|-------------------------------------------|-------|----------------------------|--------------------|
| GET    | `/restaurant/{restaurantId}`              | Public| —                          | `FoodCategoryDto[]`|
| POST   | `/restaurant/{restaurantId}`              | Owner | `CreateFoodCategoryRequest`| `FoodCategoryDto`  |
| PUT    | `/restaurant/{restaurantId}/{categoryId}` | Owner | `CreateFoodCategoryRequest`| `FoodCategoryDto`  |
| DELETE | `/restaurant/{restaurantId}/{categoryId}` | Owner | —                          | 204                |

### Owner Food Management  `/api/restaurants/{restaurantId}/foods`

| Method | Endpoint             | Auth  | Body                | Response        |
|--------|----------------------|-------|---------------------|-----------------|
| POST   | `/`                  | Owner | `CreateFoodRequest` | `FoodDto`       |
| PUT    | `/{foodId}`          | Owner | `UpdateFoodRequest` | `FoodDto`       |
| DELETE | `/{foodId}`          | Owner | —                   | 204             |
| PATCH  | `/{foodId}/toggle`   | Owner | —                   | `FoodDto`       |
| POST   | `/{foodId}/images`   | Owner | multipart/form-data | `FoodImageDto`  |
| DELETE | `/{foodId}/images/{imageId}` | Owner | —           | 204             |

---

## Cart  `/api/cart`

| Method | Endpoint            | Auth     | Body                    | Response   |
|--------|---------------------|----------|-------------------------|------------|
| GET    | `/`                 | Customer | —                       | `CartDto`  |
| POST   | `/items`            | Customer | `AddCartItemRequest`    | `CartDto`  |
| PUT    | `/items/{itemId}`   | Customer | `UpdateCartItemRequest` | `CartDto`  |
| DELETE | `/items/{itemId}`   | Customer | —                       | `CartDto`  |
| POST   | `/coupon`           | Customer | `ApplyCouponRequest`    | `CartDto`  |
| DELETE | `/coupon`           | Customer | —                       | `CartDto`  |
| DELETE | `/`                 | Customer | —                       | 204        |

---

## Orders  `/api/orders`

| Method | Endpoint                    | Auth          | Body                      | Response                        |
|--------|-----------------------------|---------------|---------------------------|---------------------------------|
| POST   | `/`                         | Customer      | `CreateOrderRequest`      | `OrderDto`                      |
| GET    | `/`                         | Customer      | `OrderFilterRequest` qs   | `PagedResult<OrderSummaryDto>`  |
| GET    | `/{id}`                     | Any (own)     | —                         | `OrderDto`                      |
| DELETE | `/{id}/cancel`              | Customer      | `CancelOrderRequest`      | `OrderDto`                      |
| POST   | `/{id}/reorder`             | Customer      | —                         | `OrderDto`                      |
| GET    | `/{id}/track`               | Customer      | —                         | `RiderTrackingDto`              |
| GET    | `/restaurant/{restaurantId}`| Owner         | `OrderFilterRequest` qs   | `PagedResult<OrderSummaryDto>`  |
| PATCH  | `/{id}/status`              | Owner/Admin   | `UpdateOrderStatusRequest`| `OrderDto`                      |
| POST   | `/{id}/assign-rider`        | Owner/Admin   | `{ riderId }`             | `OrderDto`                      |
| GET    | `/rider/active`             | Rider         | —                         | `RiderDeliveryDto[]`            |
| POST   | `/rider/{assignmentId}/accept`  | Rider     | —                         | `RiderDeliveryDto`              |
| POST   | `/rider/{assignmentId}/reject`  | Rider     | —                         | 200 OK                          |
| POST   | `/rider/{assignmentId}/pickup`  | Rider     | —                         | `OrderDto`                      |
| POST   | `/rider/{assignmentId}/deliver` | Rider     | —                         | `OrderDto`                      |
| GET    | `/rider/history`            | Rider         | pagination qs             | `PagedResult<RiderDeliveryDto>` |
| GET    | `/admin/all`                | Admin         | `OrderFilterRequest` qs   | `PagedResult<OrderSummaryDto>`  |

---

## Payments  `/api/payments`

| Method | Endpoint               | Auth      | Body                    | Response      |
|--------|------------------------|-----------|-------------------------|---------------|
| GET    | `/order/{orderId}`     | Any (own) | —                       | `PaymentDto`  |
| POST   | `/card`                | Customer  | `ProcessPaymentRequest` | `PaymentDto`  |
| POST   | `/cod/{orderId}/collect` | Rider   | —                       | `PaymentDto`  |

---

## Reviews  `/api/reviews`

| Method | Endpoint                          | Auth      | Body                    | Response                     |
|--------|-----------------------------------|-----------|-------------------------|------------------------------|
| GET    | `/restaurant/{restaurantId}`      | Public    | pagination qs           | `PagedResult<ReviewDto>`     |
| POST   | `/`                               | Customer  | `CreateReviewRequest`   | `ReviewDto`                  |
| POST   | `/{id}/reply`                     | Owner     | `ReplyToReviewRequest`  | `ReviewDto`                  |
| DELETE | `/{id}`                           | Admin     | —                       | 204                          |

---

## Riders  `/api/riders`

| Method | Endpoint             | Auth   | Body                      | Response      |
|--------|----------------------|--------|---------------------------|---------------|
| POST   | `/register`          | Rider  | `RiderRegistrationRequest`| `RiderDto`    |
| GET    | `/profile`           | Rider  | —                         | `RiderDto`    |
| PATCH  | `/location`          | Rider  | `UpdateRiderLocationRequest` | `RiderDto` |
| PATCH  | `/availability`      | Rider  | —                         | `RiderDto`    |

---

## Notifications  `/api/notifications`

| Method | Endpoint          | Auth      | Body                    | Response                       |
|--------|-------------------|-----------|-------------------------|--------------------------------|
| GET    | `/`               | Bearer    | pagination qs           | `PagedResult<NotificationDto>` |
| GET    | `/unread-count`   | Bearer    | —                       | `{ count: 5 }`                 |
| PATCH  | `/{id}/read`      | Bearer    | —                       | 200 OK                         |
| PATCH  | `/read-all`       | Bearer    | —                       | 200 OK                         |
| POST   | `/send`           | Admin     | `SendNotificationRequest` | 200 OK                       |
| POST   | `/broadcast`      | Admin     | `{ title, body, role }` | 200 OK                         |

---

## Admin  `/api/admin`

| Method | Endpoint                             | Auth  | Body / Query             | Response                          |
|--------|--------------------------------------|-------|--------------------------|-----------------------------------|
| GET    | `/dashboard`                         | Admin | —                        | `DashboardStatsDto`               |
| GET    | `/revenue`                           | Admin | `RevenueReportRequest` qs| `DailyRevenueDto[]`               |
| GET    | `/users`                             | Admin | `?role&status&page&size` | `PagedResult<AdminUserDto>`       |
| GET    | `/users/{id}`                        | Admin | —                        | `AdminUserDto`                    |
| PATCH  | `/users/{id}/suspend`                | Admin | `SuspendRequest`         | `AdminUserDto`                    |
| PATCH  | `/users/{id}/activate`               | Admin | —                        | `AdminUserDto`                    |
| GET    | `/restaurants`                       | Admin | `?status&page&size`      | `PagedResult<AdminRestaurantDto>` |
| PATCH  | `/restaurants/{id}/approve`          | Admin | —                        | `AdminRestaurantDto`              |
| PATCH  | `/restaurants/{id}/suspend`          | Admin | `SuspendRequest`         | `AdminRestaurantDto`              |
| GET    | `/riders`                            | Admin | `?status&page&size`      | `PagedResult<RiderDto>`           |
| PATCH  | `/riders/{id}/approve`               | Admin | —                        | `RiderDto`                        |
| PATCH  | `/riders/{id}/suspend`               | Admin | `SuspendRequest`         | `RiderDto`                        |
| GET    | `/coupons`                           | Admin | —                        | `CouponDto[]`                     |
| POST   | `/coupons`                           | Admin | `CreateCouponRequest`    | `CouponDto`                       |
| PATCH  | `/coupons/{id}/deactivate`           | Admin | —                        | 200 OK                            |

---

## HTTP Status Code Conventions

| Code | Meaning                                         |
|------|-------------------------------------------------|
| 200  | Success with data                               |
| 201  | Resource created                                |
| 204  | Success, no content                             |
| 400  | Validation error — `errors` field populated     |
| 401  | Missing or invalid JWT                          |
| 403  | Authenticated but insufficient role             |
| 404  | Resource not found                              |
| 409  | Conflict (duplicate email, already reviewed, etc.) |
| 422  | Business logic violation (order can't be cancelled) |
| 429  | Rate limit exceeded                             |
| 500  | Unhandled server error — logged, generic message returned |
