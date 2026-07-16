-- ============================================================
-- Food Delivery Application — Stored Procedures & Views
-- ============================================================

USE FoodDeliveryDb;
GO

-- ============================================================
-- SP: Update restaurant average rating after a new review
-- ============================================================
CREATE OR ALTER PROCEDURE sp_UpdateRestaurantRating
    @RestaurantId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Restaurants
    SET
        AverageRating = ISNULL((
            SELECT CAST(AVG(CAST(Rating AS FLOAT)) AS DECIMAL(3,2))
            FROM Reviews
            WHERE RestaurantId = @RestaurantId
        ), 0),
        TotalRatings = (
            SELECT COUNT(*) FROM Reviews WHERE RestaurantId = @RestaurantId
        ),
        UpdatedAt = GETUTCDATE()
    WHERE Id = @RestaurantId;
END
GO

-- ============================================================
-- SP: Generate a unique order number
-- ============================================================
CREATE OR ALTER PROCEDURE sp_GenerateOrderNumber
    @OrderNumber NVARCHAR(30) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DatePart NVARCHAR(8) = FORMAT(GETUTCDATE(), 'yyyyMMdd');
    DECLARE @Counter INT;

    SELECT @Counter = COUNT(*) + 1
    FROM Orders
    WHERE CAST(CreatedAt AS DATE) = CAST(GETUTCDATE() AS DATE);

    SET @OrderNumber = 'ORD-' + @DatePart + '-' + RIGHT('0000' + CAST(@Counter AS NVARCHAR), 4);
END
GO

-- ============================================================
-- VIEW: Active restaurants with distance placeholder
-- (Real distance calc done in application layer using Haversine)
-- ============================================================
CREATE OR ALTER VIEW vw_ActiveRestaurants AS
SELECT
    r.Id,
    r.Name,
    r.Description,
    r.LogoImageUrl,
    r.CoverImageUrl,
    r.Street,
    r.City,
    r.Latitude,
    r.Longitude,
    r.AverageRating,
    r.TotalRatings,
    r.DeliveryFee,
    r.EstimatedDeliveryTimeMinutes,
    r.MinOrderAmount,
    r.IsCurrentlyOpen,
    rc.Name AS CategoryName,
    rc.IconUrl AS CategoryIcon
FROM Restaurants r
INNER JOIN RestaurantCategories rc ON r.CategoryId = rc.Id
WHERE r.Status = 'Active';
GO

-- ============================================================
-- VIEW: Admin revenue report by day
-- ============================================================
CREATE OR ALTER VIEW vw_DailyRevenue AS
SELECT
    CAST(o.CreatedAt AS DATE)   AS OrderDate,
    COUNT(o.Id)                 AS TotalOrders,
    SUM(o.TotalAmount)          AS TotalRevenue,
    SUM(o.DeliveryFee)          AS TotalDeliveryFees,
    AVG(o.TotalAmount)          AS AvgOrderValue
FROM Orders o
WHERE o.Status = 'Delivered'
GROUP BY CAST(o.CreatedAt AS DATE);
GO

-- ============================================================
-- VIEW: Rider performance summary
-- ============================================================
CREATE OR ALTER VIEW vw_RiderPerformance AS
SELECT
    r.Id AS RiderId,
    u.FirstName + ' ' + u.LastName AS RiderName,
    r.TotalDeliveries,
    r.TotalEarnings,
    r.IsAvailable,
    r.Status,
    COUNT(ra.Id) AS PendingAssignments
FROM Riders r
INNER JOIN Users u ON r.UserId = u.Id
LEFT JOIN RiderAssignments ra ON ra.RiderId = r.Id AND ra.IsAccepted = 1 AND ra.DeliveredAt IS NULL
GROUP BY r.Id, u.FirstName, u.LastName, r.TotalDeliveries, r.TotalEarnings, r.IsAvailable, r.Status;
GO

PRINT 'Stored procedures and views created successfully.';
