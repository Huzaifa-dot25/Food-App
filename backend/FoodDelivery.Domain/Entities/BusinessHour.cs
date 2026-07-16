namespace FoodDelivery.Domain.Entities;

public class BusinessHour : BaseEntity
{
    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;

    /// <summary>0 = Sunday, 1 = Monday, ..., 6 = Saturday</summary>
    public int DayOfWeek { get; set; }

    public TimeOnly OpenTime { get; set; }
    public TimeOnly CloseTime { get; set; }
    public bool IsClosed { get; set; } = false;
}
