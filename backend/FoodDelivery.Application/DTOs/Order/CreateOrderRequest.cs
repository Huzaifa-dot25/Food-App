using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Application.DTOs.Order;

public class CreateOrderRequest
{
    public int AddressId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? DeliveryInstructions { get; set; }
    // CouponId is taken from the active cart — no need to repeat here
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;  // Owner/Admin use only
}

public class CancelOrderRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class OrderFilterRequest : Common.Models.PaginationRequest
{
    public string? Status { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
