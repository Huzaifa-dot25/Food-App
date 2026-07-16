# Food Delivery Application — Database Design

## ER Diagram (Text Representation)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│    Users     │────<│  UserRoles   │>────│      Roles       │
│──────────────│     └──────────────┘     └──────────────────┘
│ Id (PK)      │
│ FirstName    │     ┌──────────────────────────────────────────┐
│ LastName     │     │                Addresses                  │
│ Email        │────<│──────────────────────────────────────────│
│ PhoneNumber  │     │ Id (PK)                                   │
│ PasswordHash │     │ UserId (FK→Users)                         │
│ ProfileImage │     │ Label (Home/Work/Other)                   │
│ FcmToken     │     │ Street, City, State, ZipCode              │
│ Status       │     │ Latitude, Longitude                       │
│ IsEmailVerif │     │ IsDefault                                 │
│ OtpCode      │     └──────────────────────────────────────────┘
│ OtpExpiry    │
│ CreatedAt    │     ┌──────────────────────────────────────────┐
│ UpdatedAt    │     │              Restaurants                  │
└──────────────┘     │──────────────────────────────────────────│
        │            │ Id (PK)                                   │
        │            │ OwnerId (FK→Users)                        │
        └───────────>│ Name, Description, LogoImage              │
                     │ Street, City, State, ZipCode              │
                     │ Latitude, Longitude                       │
                     │ Phone, Email                              │
                     │ CategoryId (FK→RestaurantCategories)      │
                     │ AverageRating, TotalRatings               │
                     │ MinOrderAmount, DeliveryFee               │
                     │ EstimatedDeliveryTime                     │
                     │ IsOpen, Status (Active/Suspended)         │
                     │ CreatedAt, UpdatedAt                      │
                     └──────────────┬───────────────────────────┘
                                    │
              ┌─────────────────────┼────────────────────────┐
              │                     │                         │
              ▼                     ▼                         ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌──────────────────────┐
│ RestaurantCategories│ │  BusinessHours       │ │   FoodCategories     │
│─────────────────────│ │─────────────────────│ │──────────────────────│
│ Id (PK)             │ │ Id (PK)             │ │ Id (PK)              │
│ Name, Icon, SortOrder│ │ RestaurantId (FK)   │ │ RestaurantId (FK)    │
└─────────────────────┘ │ DayOfWeek           │ │ Name, Description    │
                        │ OpenTime, CloseTime  │ │ SortOrder            │
                        │ IsClosed            │ └──────────┬───────────┘
                        └─────────────────────┘            │
                                                           ▼
                                               ┌──────────────────────┐
                                               │        Foods         │
                                               │──────────────────────│
                                               │ Id (PK)              │
                                               │ RestaurantId (FK)    │
                                               │ CategoryId (FK)      │
                                               │ Name, Description    │
                                               │ Price, DiscountPrice │
                                               │ IsBestSeller         │
                                               │ IsPopular            │
                                               │ IsRecommended        │
                                               │ IsAvailable          │
                                               │ AverageRating        │
                                               │ CreatedAt, UpdatedAt │
                                               └──────────┬───────────┘
                                                          │
                                               ┌──────────▼───────────┐
                                               │      FoodImages      │
                                               │──────────────────────│
                                               │ Id (PK)              │
                                               │ FoodId (FK)          │
                                               │ ImageUrl             │
                                               │ IsPrimary            │
                                               │ SortOrder            │
                                               └──────────────────────┘

┌──────────────┐      ┌─────────────────────────────────────────────┐
│    Users     │─────>│                   Carts                     │
└──────────────┘      │─────────────────────────────────────────────│
                      │ Id (PK)                                      │
                      │ CustomerId (FK→Users)                        │
                      │ RestaurantId (FK→Restaurants)                │
                      │ CouponId (FK→Coupons, nullable)              │
                      │ UpdatedAt                                    │
                      └──────────────────┬──────────────────────────┘
                                         │
                             ┌───────────▼──────────────┐
                             │        CartItems          │
                             │──────────────────────────│
                             │ Id (PK)                   │
                             │ CartId (FK)               │
                             │ FoodId (FK)               │
                             │ Quantity                  │
                             │ UnitPrice (snapshot)      │
                             └──────────────────────────┘

┌──────────────┐      ┌─────────────────────────────────────────────┐
│    Users     │─────>│                   Orders                    │
└──────────────┘      │─────────────────────────────────────────────│
                      │ Id (PK)                                      │
                      │ OrderNumber (unique, generated)              │
                      │ CustomerId (FK→Users)                        │
                      │ RestaurantId (FK→Restaurants)                │
                      │ AddressId (FK→Addresses)                     │
                      │ CouponId (FK→Coupons, nullable)              │
                      │ Status (enum)                                │
                      │ SubTotal, DiscountAmount                     │
                      │ DeliveryFee, TotalAmount                     │
                      │ DeliveryInstructions                         │
                      │ PaymentMethod (enum)                         │
                      │ EstimatedDeliveryTime                        │
                      │ CreatedAt, UpdatedAt                         │
                      └──────────────────┬──────────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                           │
              ▼                          ▼                           ▼
┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│      OrderItems     │  │       Payments        │  │   RiderAssignments   │
│─────────────────────│  │──────────────────────│  │──────────────────────│
│ Id (PK)             │  │ Id (PK)               │  │ Id (PK)              │
│ OrderId (FK)        │  │ OrderId (FK)          │  │ OrderId (FK)         │
│ FoodId (FK)         │  │ RiderId (FK)          │  │ RiderId (FK→Riders)  │
│ FoodName (snapshot) │  │ Method (enum)         │  │ AssignedAt           │
│ FoodImage (snapshot)│  │ Amount                │  │ PickedUpAt           │
│ UnitPrice (snapshot)│  │ Status (enum)         │  │ DeliveredAt          │
│ Quantity            │  │ TransactionRef        │  │ Status               │
│ TotalPrice          │  │ PaidAt                │  └──────────────────────┘
└─────────────────────┘  │ CreatedAt             │
                         └──────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                            Riders                                │
│──────────────────────────────────────────────────────────────────│
│ Id (PK)                                                          │
│ UserId (FK→Users, unique)                                        │
│ VehicleType (Bicycle/Motorcycle/Car)                             │
│ VehiclePlate                                                     │
│ LicenseNumber                                                    │
│ CurrentLatitude, CurrentLongitude                                │
│ IsAvailable                                                      │
│ Status (Active/Suspended/Pending)                                │
│ TotalDeliveries, TotalEarnings                                   │
│ CreatedAt, UpdatedAt                                             │
└──────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                           Reviews                              │
│────────────────────────────────────────────────────────────────│
│ Id (PK)                                                        │
│ OrderId (FK→Orders, unique)                                    │
│ CustomerId (FK→Users)                                          │
│ RestaurantId (FK→Restaurants)                                  │
│ Rating (1–5)                                                   │
│ Comment                                                        │
│ OwnerReply                                                     │
│ CreatedAt, UpdatedAt                                           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                           Favorites                            │
│────────────────────────────────────────────────────────────────│
│ Id (PK)                                                        │
│ UserId (FK→Users)                                              │
│ RestaurantId (FK→Restaurants)                                  │
│ CreatedAt                                                      │
│ UNIQUE (UserId, RestaurantId)                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                           Coupons                              │
│────────────────────────────────────────────────────────────────│
│ Id (PK)                                                        │
│ Code (unique)                                                  │
│ Description                                                    │
│ DiscountType (Percentage/FixedAmount)                          │
│ DiscountValue                                                  │
│ MinOrderAmount                                                 │
│ MaxDiscountAmount (nullable, for percentage cap)               │
│ UsageLimit                                                     │
│ UsedCount                                                      │
│ ExpiryDate                                                     │
│ IsActive                                                       │
│ CreatedAt                                                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                         Notifications                          │
│────────────────────────────────────────────────────────────────│
│ Id (PK)                                                        │
│ UserId (FK→Users)                                              │
│ Title, Body                                                    │
│ Type (OrderUpdate/Promotion/System)                            │
│ ReferenceId (nullable, e.g. OrderId)                           │
│ IsRead                                                         │
│ CreatedAt                                                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                           AuditLogs                            │
│────────────────────────────────────────────────────────────────│
│ Id (PK)                                                        │
│ UserId (FK→Users, nullable)                                    │
│ Action                                                         │
│ EntityName, EntityId                                           │
│ OldValues, NewValues (JSON)                                    │
│ IpAddress                                                      │
│ CreatedAt                                                      │
└────────────────────────────────────────────────────────────────┘
```

## Table Index Strategy

| Table            | Index Columns                                      |
|------------------|----------------------------------------------------|
| Users            | Email (unique), PhoneNumber                        |
| Restaurants      | OwnerId, CategoryId, Latitude+Longitude, Status    |
| Foods            | RestaurantId, CategoryId, IsAvailable              |
| Orders           | CustomerId, RestaurantId, Status, CreatedAt        |
| RiderAssignments | OrderId, RiderId                                   |
| Reviews          | RestaurantId, CustomerId                           |
| Notifications    | UserId, IsRead                                     |
| Coupons          | Code (unique)                                      |
