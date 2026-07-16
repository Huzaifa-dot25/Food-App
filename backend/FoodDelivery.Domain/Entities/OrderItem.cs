namespace FoodDelivery.Domain.Entities;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int FoodId { get; set; }
    public Food Food { get; set; } = null!;

    // Snapshot fields — never change even if the food is edited later
    public string FoodName { get; set; } = string.Empty;
    public string? FoodImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}
