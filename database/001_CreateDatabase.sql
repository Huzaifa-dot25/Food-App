-- ============================================================
-- Food Delivery Application — Database Creation Script
-- Target: SQL Server 2019+
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FoodDeliveryDb')
BEGIN
    CREATE DATABASE FoodDeliveryDb
    COLLATE SQL_Latin1_General_CP1_CI_AS;
END
GO

USE FoodDeliveryDb;
GO

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE Roles (
    Id          INT           IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(50)  NOT NULL,
    CreatedAt   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);

INSERT INTO Roles (Name) VALUES ('Customer'), ('Owner'), ('Rider'), ('Admin');
GO

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE Users (
    Id                  INT             IDENTITY(1,1) PRIMARY KEY,
    FirstName           NVARCHAR(100)   NOT NULL,
    LastName            NVARCHAR(100)   NOT NULL,
    Email               NVARCHAR(256)   NOT NULL,
    PhoneNumber         NVARCHAR(20)    NOT NULL,
    PasswordHash        NVARCHAR(MAX)   NOT NULL,
    ProfileImageUrl     NVARCHAR(500)   NULL,
    FcmToken            NVARCHAR(500)   NULL,
    Status              NVARCHAR(20)    NOT NULL DEFAULT 'Active',
    IsEmailVerified     BIT             NOT NULL DEFAULT 0,
    OtpCode             NVARCHAR(10)    NULL,
    OtpExpiry           DATETIME2       NULL,
    RefreshToken        NVARCHAR(500)   NULL,
    RefreshTokenExpiry  DATETIME2       NULL,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE UNIQUE INDEX IX_Users_Email       ON Users (Email);
CREATE        INDEX IX_Users_PhoneNumber ON Users (PhoneNumber);
GO

-- ============================================================
-- USER ROLES (join table)
-- ============================================================
CREATE TABLE UserRoles (
    UserId  INT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    RoleId  INT NOT NULL REFERENCES Roles(Id) ON DELETE CASCADE,
    PRIMARY KEY (UserId, RoleId)
);
GO

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE Addresses (
    Id          INT             IDENTITY(1,1) PRIMARY KEY,
    UserId      INT             NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Label       NVARCHAR(50)    NOT NULL DEFAULT 'Home',
    Street      NVARCHAR(300)   NOT NULL,
    City        NVARCHAR(100)   NOT NULL,
    State       NVARCHAR(100)   NOT NULL,
    ZipCode     NVARCHAR(20)    NOT NULL,
    Apartment   NVARCHAR(100)   NULL,
    Latitude    FLOAT           NOT NULL DEFAULT 0,
    Longitude   FLOAT           NOT NULL DEFAULT 0,
    IsDefault   BIT             NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Addresses_UserId ON Addresses (UserId);
GO

-- ============================================================
-- RESTAURANT CATEGORIES
-- ============================================================
CREATE TABLE RestaurantCategories (
    Id          INT             IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(100)   NOT NULL,
    IconUrl     NVARCHAR(500)   NULL,
    SortOrder   INT             NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE Restaurants (
    Id                          INT             IDENTITY(1,1) PRIMARY KEY,
    OwnerId                     INT             NOT NULL REFERENCES Users(Id),
    CategoryId                  INT             NOT NULL REFERENCES RestaurantCategories(Id),
    Name                        NVARCHAR(200)   NOT NULL,
    Description                 NVARCHAR(2000)  NULL,
    LogoImageUrl                NVARCHAR(500)   NULL,
    CoverImageUrl               NVARCHAR(500)   NULL,
    Street                      NVARCHAR(300)   NOT NULL,
    City                        NVARCHAR(100)   NOT NULL,
    State                       NVARCHAR(100)   NOT NULL,
    ZipCode                     NVARCHAR(20)    NOT NULL,
    Latitude                    FLOAT           NOT NULL DEFAULT 0,
    Longitude                   FLOAT           NOT NULL DEFAULT 0,
    Phone                       NVARCHAR(20)    NULL,
    Email                       NVARCHAR(256)   NULL,
    AverageRating               DECIMAL(3,2)    NOT NULL DEFAULT 0,
    TotalRatings                INT             NOT NULL DEFAULT 0,
    MinOrderAmount              DECIMAL(10,2)   NOT NULL DEFAULT 0,
    DeliveryFee                 DECIMAL(10,2)   NOT NULL DEFAULT 0,
    EstimatedDeliveryTimeMinutes INT            NOT NULL DEFAULT 30,
    IsCurrentlyOpen             BIT             NOT NULL DEFAULT 0,
    Status                      NVARCHAR(30)    NOT NULL DEFAULT 'PendingApproval',
    CreatedAt                   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt                   DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Restaurants_OwnerId    ON Restaurants (OwnerId);
CREATE INDEX IX_Restaurants_CategoryId ON Restaurants (CategoryId);
CREATE INDEX IX_Restaurants_Status     ON Restaurants (Status);
CREATE INDEX IX_Restaurants_Location   ON Restaurants (Latitude, Longitude);
GO

-- ============================================================
-- BUSINESS HOURS
-- ============================================================
CREATE TABLE BusinessHours (
    Id              INT         IDENTITY(1,1) PRIMARY KEY,
    RestaurantId    INT         NOT NULL REFERENCES Restaurants(Id) ON DELETE CASCADE,
    DayOfWeek       INT         NOT NULL,   -- 0=Sun, 6=Sat
    OpenTime        TIME        NOT NULL,
    CloseTime       TIME        NOT NULL,
    IsClosed        BIT         NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2   NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- FOOD CATEGORIES (per restaurant)
-- ============================================================
CREATE TABLE FoodCategories (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    RestaurantId    INT             NOT NULL REFERENCES Restaurants(Id) ON DELETE CASCADE,
    Name            NVARCHAR(100)   NOT NULL,
    Description     NVARCHAR(500)   NULL,
    SortOrder       INT             NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- FOODS
-- ============================================================
CREATE TABLE Foods (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    RestaurantId    INT             NOT NULL REFERENCES Restaurants(Id) ON DELETE CASCADE,
    CategoryId      INT             NOT NULL REFERENCES FoodCategories(Id),
    Name            NVARCHAR(200)   NOT NULL,
    Description     NVARCHAR(1000)  NULL,
    Price           DECIMAL(10,2)   NOT NULL,
    DiscountPrice   DECIMAL(10,2)   NULL,
    IsBestSeller    BIT             NOT NULL DEFAULT 0,
    IsPopular       BIT             NOT NULL DEFAULT 0,
    IsRecommended   BIT             NOT NULL DEFAULT 0,
    IsAvailable     BIT             NOT NULL DEFAULT 1,
    IsVegetarian    BIT             NOT NULL DEFAULT 0,
    IsSpicy         BIT             NOT NULL DEFAULT 0,
    AverageRating   DECIMAL(3,2)    NOT NULL DEFAULT 0,
    TotalRatings    INT             NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Foods_RestaurantId ON Foods (RestaurantId);
CREATE INDEX IX_Foods_CategoryId   ON Foods (CategoryId);
CREATE INDEX IX_Foods_IsAvailable  ON Foods (IsAvailable);
GO

-- ============================================================
-- FOOD IMAGES
-- ============================================================
CREATE TABLE FoodImages (
    Id          INT             IDENTITY(1,1) PRIMARY KEY,
    FoodId      INT             NOT NULL REFERENCES Foods(Id) ON DELETE CASCADE,
    ImageUrl    NVARCHAR(500)   NOT NULL,
    IsPrimary   BIT             NOT NULL DEFAULT 0,
    SortOrder   INT             NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE Coupons (
    Id                  INT             IDENTITY(1,1) PRIMARY KEY,
    Code                NVARCHAR(30)    NOT NULL,
    Description         NVARCHAR(500)   NULL,
    DiscountType        NVARCHAR(20)    NOT NULL,   -- Percentage | FixedAmount
    DiscountValue       DECIMAL(10,2)   NOT NULL,
    MinOrderAmount      DECIMAL(10,2)   NOT NULL DEFAULT 0,
    MaxDiscountAmount   DECIMAL(10,2)   NULL,
    UsageLimit          INT             NOT NULL DEFAULT 1,
    UsedCount           INT             NOT NULL DEFAULT 0,
    ExpiryDate          DATETIME2       NOT NULL,
    IsActive            BIT             NOT NULL DEFAULT 1,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE UNIQUE INDEX IX_Coupons_Code ON Coupons (Code);
GO

-- ============================================================
-- CARTS
-- ============================================================
CREATE TABLE Carts (
    Id              INT         IDENTITY(1,1) PRIMARY KEY,
    CustomerId      INT         NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    RestaurantId    INT         NULL REFERENCES Restaurants(Id),
    CouponId        INT         NULL REFERENCES Coupons(Id),
    CreatedAt       DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2   NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Carts_CustomerId ON Carts (CustomerId);
GO

-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE CartItems (
    Id          INT             IDENTITY(1,1) PRIMARY KEY,
    CartId      INT             NOT NULL REFERENCES Carts(Id) ON DELETE CASCADE,
    FoodId      INT             NOT NULL REFERENCES Foods(Id),
    Quantity    INT             NOT NULL DEFAULT 1,
    UnitPrice   DECIMAL(10,2)   NOT NULL,
    CreatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE Orders (
    Id                          INT             IDENTITY(1,1) PRIMARY KEY,
    OrderNumber                 NVARCHAR(30)    NOT NULL,
    CustomerId                  INT             NOT NULL REFERENCES Users(Id),
    RestaurantId                INT             NOT NULL REFERENCES Restaurants(Id),
    AddressId                   INT             NOT NULL REFERENCES Addresses(Id),
    CouponId                    INT             NULL REFERENCES Coupons(Id),
    Status                      NVARCHAR(30)    NOT NULL DEFAULT 'Pending',
    SubTotal                    DECIMAL(10,2)   NOT NULL,
    DiscountAmount              DECIMAL(10,2)   NOT NULL DEFAULT 0,
    DeliveryFee                 DECIMAL(10,2)   NOT NULL,
    TotalAmount                 DECIMAL(10,2)   NOT NULL,
    DeliveryInstructions        NVARCHAR(500)   NULL,
    PaymentMethod               NVARCHAR(30)    NOT NULL,
    EstimatedDeliveryMinutes    INT             NOT NULL DEFAULT 30,
    ConfirmedAt                 DATETIME2       NULL,
    DeliveredAt                 DATETIME2       NULL,
    CancelledAt                 DATETIME2       NULL,
    CancellationReason          NVARCHAR(500)   NULL,
    CreatedAt                   DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt                   DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE UNIQUE INDEX IX_Orders_OrderNumber  ON Orders (OrderNumber);
CREATE        INDEX IX_Orders_CustomerId   ON Orders (CustomerId);
CREATE        INDEX IX_Orders_RestaurantId ON Orders (RestaurantId);
CREATE        INDEX IX_Orders_Status       ON Orders (Status);
CREATE        INDEX IX_Orders_CreatedAt    ON Orders (CreatedAt);
GO

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE OrderItems (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    OrderId         INT             NOT NULL REFERENCES Orders(Id) ON DELETE CASCADE,
    FoodId          INT             NOT NULL REFERENCES Foods(Id),
    FoodName        NVARCHAR(200)   NOT NULL,
    FoodImageUrl    NVARCHAR(500)   NULL,
    UnitPrice       DECIMAL(10,2)   NOT NULL,
    Quantity        INT             NOT NULL,
    TotalPrice      DECIMAL(10,2)   NOT NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE Payments (
    Id                      INT             IDENTITY(1,1) PRIMARY KEY,
    OrderId                 INT             NOT NULL REFERENCES Orders(Id) ON DELETE CASCADE,
    Method                  NVARCHAR(30)    NOT NULL,
    Status                  NVARCHAR(20)    NOT NULL DEFAULT 'Pending',
    Amount                  DECIMAL(10,2)   NOT NULL,
    TransactionReference    NVARCHAR(200)   NULL,
    PaidAt                  DATETIME2       NULL,
    CreatedAt               DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt               DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- RIDERS
-- ============================================================
CREATE TABLE Riders (
    Id                  INT             IDENTITY(1,1) PRIMARY KEY,
    UserId              INT             NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    VehicleType         NVARCHAR(20)    NOT NULL,
    VehiclePlate        NVARCHAR(20)    NULL,
    LicenseNumber       NVARCHAR(50)    NULL,
    CurrentLatitude     FLOAT           NULL,
    CurrentLongitude    FLOAT           NULL,
    IsAvailable         BIT             NOT NULL DEFAULT 0,
    Status              NVARCHAR(20)    NOT NULL DEFAULT 'PendingApproval',
    TotalDeliveries     INT             NOT NULL DEFAULT 0,
    TotalEarnings       DECIMAL(12,2)   NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE UNIQUE INDEX IX_Riders_UserId ON Riders (UserId);
GO

-- ============================================================
-- RIDER ASSIGNMENTS
-- ============================================================
CREATE TABLE RiderAssignments (
    Id              INT         IDENTITY(1,1) PRIMARY KEY,
    OrderId         INT         NOT NULL REFERENCES Orders(Id) ON DELETE CASCADE,
    RiderId         INT         NOT NULL REFERENCES Riders(Id),
    AssignedAt      DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    AcceptedAt      DATETIME2   NULL,
    PickedUpAt      DATETIME2   NULL,
    DeliveredAt     DATETIME2   NULL,
    IsAccepted      BIT         NOT NULL DEFAULT 0,
    IsRejected      BIT         NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2   NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_RiderAssignments_OrderId ON RiderAssignments (OrderId);
CREATE INDEX IX_RiderAssignments_RiderId ON RiderAssignments (RiderId);
GO

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE Reviews (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    OrderId         INT             NOT NULL REFERENCES Orders(Id) ON DELETE CASCADE,
    CustomerId      INT             NOT NULL REFERENCES Users(Id),
    RestaurantId    INT             NOT NULL REFERENCES Restaurants(Id),
    Rating          INT             NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment         NVARCHAR(1000)  NULL,
    OwnerReply      NVARCHAR(1000)  NULL,
    OwnerRepliedAt  DATETIME2       NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE UNIQUE INDEX IX_Reviews_OrderId      ON Reviews (OrderId);
CREATE        INDEX IX_Reviews_RestaurantId ON Reviews (RestaurantId);
GO

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE Favorites (
    Id              INT         IDENTITY(1,1) PRIMARY KEY,
    UserId          INT         NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    RestaurantId    INT         NOT NULL REFERENCES Restaurants(Id) ON DELETE CASCADE,
    CreatedAt       DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2   NOT NULL DEFAULT GETUTCDATE()
);

CREATE UNIQUE INDEX IX_Favorites_User_Restaurant ON Favorites (UserId, RestaurantId);
GO

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE Notifications (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    UserId          INT             NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Title           NVARCHAR(200)   NOT NULL,
    Body            NVARCHAR(1000)  NOT NULL,
    Type            NVARCHAR(30)    NOT NULL,
    ReferenceId     INT             NULL,
    IsRead          BIT             NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Notifications_UserId ON Notifications (UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications (IsRead);
GO

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE AuditLogs (
    Id              INT             IDENTITY(1,1) PRIMARY KEY,
    UserId          INT             NULL,
    Action          NVARCHAR(50)    NOT NULL,
    EntityName      NVARCHAR(100)   NOT NULL,
    EntityId        NVARCHAR(50)    NOT NULL,
    OldValues       NVARCHAR(MAX)   NULL,
    NewValues       NVARCHAR(MAX)   NULL,
    IpAddress       NVARCHAR(45)    NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AuditLogs_EntityName ON AuditLogs (EntityName, EntityId);
CREATE INDEX IX_AuditLogs_UserId     ON AuditLogs (UserId);
GO

PRINT 'FoodDeliveryDb schema created successfully.';
