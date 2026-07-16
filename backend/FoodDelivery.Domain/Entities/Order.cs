using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Domain.Entities;

public class Order : BaseEntity
{
    /// <summary>Human-readable unique order number, e.g. ORD-20260716-0001.</summary>
    public string OrderNumber { get; set; } = string.Empty;

    public int CustomerId { get; set; }
    public User Customer { get; set; } = null!;

    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;

    public int AddressId { get; set; }
    public Address Address { get; set; } = null!;

    public int? CouponId { get; set; }
    public Coupon? Coupon { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    // Pricing (all snapshotted at order creation)
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal DeliveryFee { get; set; }
    public decimal TotalAmount { get; set; }

    public string? DeliveryInstructions { get; set; }
    public PaymentMethod PaymentMethod { get; set; }

    /// <summary>Estimated time in minutes from order placement.</summary>
    public int EstimatedDeliveryMinutes { get; set; }

    public DateTime? ConfirmedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }

    // Navigation
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Payment? Payment { get; set; }
    public RiderAssignment? RiderAssignment { get; set; }
    public Review? Review { get; set; }
}
