namespace FoodDelivery.Domain.Entities;

public class Food : BaseEntity
{
    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;

    public int CategoryId { get; set; }
    public FoodCategory Category { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }         // If on promotion

    // Tags
    public bool IsBestSeller { get; set; } = false;
    public bool IsPopular { get; set; } = false;
    public bool IsRecommended { get; set; } = false;
    public bool IsAvailable { get; set; } = true;
    public bool IsVegetarian { get; set; } = false;
    public bool IsSpicy { get; set; } = false;

    public double AverageRating { get; set; } = 0;
    public int TotalRatings { get; set; } = 0;

    // Navigation
    public ICollection<FoodImage> Images { get; set; } = new List<FoodImage>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    /// <summary>Effective price: discount price when set, otherwise base price.</summary>
    public decimal EffectivePrice => DiscountPrice.HasValue && DiscountPrice < Price
        ? DiscountPrice.Value
        : Price;
}
