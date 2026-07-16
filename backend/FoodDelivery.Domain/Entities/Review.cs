namespace FoodDelivery.Domain.Entities;

public class Review : BaseEntity
{
    /// <summary>One review per delivered order.</summary>
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int CustomerId { get; set; }
    public User Customer { get; set; } = null!;

    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;

    /// <summary>Rating from 1 (worst) to 5 (best).</summary>
    public int Rating { get; set; }

    public string? Comment { get; set; }
    public string? OwnerReply { get; set; }
    public DateTime? OwnerRepliedAt { get; set; }
}
