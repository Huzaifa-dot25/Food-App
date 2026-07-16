namespace FoodDelivery.Application.DTOs.Restaurant;

/// <summary>Full restaurant details returned from GET /api/restaurants/{id}</summary>
public class RestaurantDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LogoImageUrl { get; set; }
    public string? CoverImageUrl { get; set; }

    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string? Phone { get; set; }
    public string? Email { get; set; }

    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public decimal MinOrderAmount { get; set; }
    public decimal DeliveryFee { get; set; }
    public int EstimatedDeliveryTimeMinutes { get; set; }
    public bool IsCurrentlyOpen { get; set; }
    public string Status { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryIcon { get; set; }

    /// <summary>Distance in km from caller's location (set by service).</summary>
    public double? DistanceKm { get; set; }

    public IReadOnlyList<BusinessHourDto> BusinessHours { get; set; } = Array.Empty<BusinessHourDto>();
}

/// <summary>Condensed card for lists — fewer fields to keep payloads small.</summary>
public class RestaurantSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoImageUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string City { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public decimal DeliveryFee { get; set; }
    public int EstimatedDeliveryTimeMinutes { get; set; }
    public bool IsCurrentlyOpen { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public double? DistanceKm { get; set; }
    public bool IsFavorite { get; set; }
}

public class BusinessHourDto
{
    public int DayOfWeek { get; set; }
    public string DayName { get; set; } = string.Empty;
    public string OpenTime { get; set; } = string.Empty;
    public string CloseTime { get; set; } = string.Empty;
    public bool IsClosed { get; set; }
}
