namespace FoodDelivery.Application.DTOs.Cart;

public class CartDto
{
    public int Id { get; set; }
    public int? RestaurantId { get; set; }
    public string? RestaurantName { get; set; }
    public string? RestaurantLogoUrl { get; set; }
    public string? CouponCode { get; set; }
    public decimal? DiscountAmount { get; set; }

    public IReadOnlyList<CartItemDto> Items { get; set; } = Array.Empty<CartItemDto>();

    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal Total { get; set; }
    public int ItemCount { get; set; }
}

public class CartItemDto
{
    public int Id { get; set; }
    public int FoodId { get; set; }
    public string FoodName { get; set; } = string.Empty;
    public string? FoodImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public bool IsAvailable { get; set; }
}

public class AddCartItemRequest
{
    public int FoodId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}

public class ApplyCouponRequest
{
    public string CouponCode { get; set; } = string.Empty;
}
