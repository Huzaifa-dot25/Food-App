namespace FoodDelivery.Domain.Entities;

public class Favorite : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;
}
