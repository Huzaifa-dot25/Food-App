namespace FoodDelivery.Domain.Entities;

/// <summary>Top-level cuisine category (e.g. Pizza, Burgers, Sushi).</summary>
public class RestaurantCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public int SortOrder { get; set; } = 0;

    // Navigation
    public ICollection<Restaurant> Restaurants { get; set; } = new List<Restaurant>();
}
