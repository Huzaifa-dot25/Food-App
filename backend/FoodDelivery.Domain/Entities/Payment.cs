using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Domain.Entities;

public class Payment : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }

    /// <summary>External transaction reference for card payments (mock gateway).</summary>
    public string? TransactionReference { get; set; }

    public DateTime? PaidAt { get; set; }
}
