-- ============================================================
-- Food Delivery Application — Seed Data
-- ============================================================

USE FoodDeliveryDb;
GO

-- ============================================================
-- RESTAURANT CATEGORIES
-- ============================================================
INSERT INTO RestaurantCategories (Name, SortOrder) VALUES
    ('Pizza',         1),
    ('Burgers',       2),
    ('Sushi',         3),
    ('Chinese',       4),
    ('Indian',        5),
    ('Mexican',       6),
    ('Italian',       7),
    ('Thai',          8),
    ('Desserts',      9),
    ('Healthy',      10);
GO

-- ============================================================
-- ADMIN USER (Password: Admin@123456)
-- BCrypt hash of 'Admin@123456' — replace with real hash in production
-- ============================================================
INSERT INTO Users (FirstName, LastName, Email, PhoneNumber, PasswordHash, Status, IsEmailVerified)
VALUES ('System', 'Admin', 'admin@fooddelivery.com', '+10000000000',
        '$2a$12$placeholder_replace_with_real_bcrypt_hash', 'Active', 1);

-- Assign Admin role (RoleId=4)
INSERT INTO UserRoles (UserId, RoleId)
SELECT Id, 4 FROM Users WHERE Email = 'admin@fooddelivery.com';
GO

-- ============================================================
-- SAMPLE COUPONS
-- ============================================================
INSERT INTO Coupons (Code, Description, DiscountType, DiscountValue, MinOrderAmount, UsageLimit, ExpiryDate)
VALUES
    ('WELCOME10', 'Welcome discount - 10% off your first order', 'Percentage', 10.00, 5.00, 1000, '2027-12-31'),
    ('SAVE5',     '$5 off orders over $25',                      'FixedAmount',  5.00, 25.00,  500, '2027-12-31'),
    ('FLAT20',    '20% off - maximum $15 discount',              'Percentage',  20.00, 10.00,  200, '2027-06-30');
GO

PRINT 'Seed data inserted successfully.';
