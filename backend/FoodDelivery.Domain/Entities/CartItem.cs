namespace FoodDelivery.Domain.Entities;

public class CartItem : BaseEntity
{
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    public int FoodId { get; set; }
    public Food Food { get; set; } = null!;

    public int Quantity { get; set; } = 1;

    /// <summary>Price snapshot at the time the item was added to the cart.</summary>
    public decimal UnitPrice { get; set; }

    public decimal TotalPrice => UnitPrice * Quantity;
}
