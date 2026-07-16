namespace FoodDelivery.Application.DTOs.Food;

public class FoodDto
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public decimal EffectivePrice { get; set; }

    public bool IsBestSeller { get; set; }
    public bool IsPopular { get; set; }
    public bool IsRecommended { get; set; }
    public bool IsAvailable { get; set; }
    public bool IsVegetarian { get; set; }
    public bool IsSpicy { get; set; }

    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }

    public IReadOnlyList<FoodImageDto> Images { get; set; } = Array.Empty<FoodImageDto>();
    public string? PrimaryImageUrl { get; set; }
}

public class FoodImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class FoodSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PrimaryImageUrl { get; set; }
    public decimal EffectivePrice { get; set; }
    public decimal? DiscountPrice { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public bool IsBestSeller { get; set; }
    public double AverageRating { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}
