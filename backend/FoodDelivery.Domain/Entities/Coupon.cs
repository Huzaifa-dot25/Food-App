using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;           // e.g. "SAVE20"
    public string Description { get; set; } = string.Empty;

    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }                 // 20 = 20% or $20 off
    public decimal MinOrderAmount { get; set; } = 0;
    public decimal? MaxDiscountAmount { get; set; }            // Cap for percentage coupons

    public int UsageLimit { get; set; } = 1;                   // Per-coupon total uses
    public int UsedCount { get; set; } = 0;

    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();

    /// <summary>Returns true if the coupon can still be applied.</summary>
    public bool IsValid => IsActive && ExpiryDate > DateTime.UtcNow && UsedCount < UsageLimit;
}
