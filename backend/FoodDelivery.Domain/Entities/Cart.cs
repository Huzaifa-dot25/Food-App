namespace FoodDelivery.Domain.Entities;

public class Cart : BaseEntity
{
    public int CustomerId { get; set; }
    public User Customer { get; set; } = null!;

    /// <summary>
    /// All items in a cart must belong to the same restaurant.
    /// Null until the first item is added.
    /// </summary>
    public int? RestaurantId { get; set; }
    public Restaurant? Restaurant { get; set; }

    public int? CouponId { get; set; }
    public Coupon? Coupon { get; set; }

    // Navigation
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    /// <summary>Subtotal before coupon discount.</summary>
    public decimal Subtotal => Items.Sum(i => i.UnitPrice * i.Quantity);
}
