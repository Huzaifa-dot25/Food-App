namespace FoodDelivery.Domain.Entities;

/// <summary>Per-restaurant menu category (e.g. Starters, Mains, Desserts).</summary>
public class FoodCategory : BaseEntity
{
    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 0;

    // Navigation
    public ICollection<Food> Foods { get; set; } = new List<Food>();
}
