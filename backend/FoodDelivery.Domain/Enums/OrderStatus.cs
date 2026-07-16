namespace FoodDelivery.Domain.Enums;

/// <summary>
/// Represents every state an order can transition through.
/// </summary>
public enum OrderStatus
{
    /// <summary>Order placed by customer, awaiting restaurant confirmation.</summary>
    Pending = 1,

    /// <summary>Restaurant accepted the order.</summary>
    Confirmed = 2,

    /// <summary>Restaurant is preparing the order.</summary>
    Preparing = 3,

    /// <summary>Order is ready for pickup by rider.</summary>
    ReadyForPickup = 4,

    /// <summary>Rider picked up the order and is on the way.</summary>
    OutForDelivery = 5,

    /// <summary>Order delivered to customer.</summary>
    Delivered = 6,

    /// <summary>Order cancelled (by customer, restaurant, or system).</summary>
    Cancelled = 7
}
