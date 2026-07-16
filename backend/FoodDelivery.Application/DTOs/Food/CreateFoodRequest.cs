namespace FoodDelivery.Application.DTOs.Food;

public class CreateFoodRequest
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public bool IsBestSeller { get; set; }
    public bool IsPopular { get; set; }
    public bool IsRecommended { get; set; }
    public bool IsAvailable { get; set; } = true;
    public bool IsVegetarian { get; set; }
    public bool IsSpicy { get; set; }
}

public class UpdateFoodRequest : CreateFoodRequest { }

public class FoodSearchRequest : Common.Models.PaginationRequest
{
    public string? Keyword { get; set; }
    public int? RestaurantId { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinRating { get; set; }
    public bool? IsVegetarian { get; set; }
    public bool? IsBestSeller { get; set; }
    public string? SortBy { get; set; } = "rating"; // rating | price_asc | price_desc
}

public class FoodCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public int FoodCount { get; set; }
}

public class CreateFoodCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 0;
}
